import { useState, useCallback, useEffect, useMemo } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { ImageUploader } from '@/components/upload';
import { useGeneratorStore, useSettingsStore, useProjectStore } from '@/store';
import { analyzeImage } from '@/services/llm';
import { generateSvgs, normalizeSvg } from '@/services/svg';
import type { DesignSpecification, DesignProject, GeneratedIcon } from '@/types';
import { SvgPreview } from './SvgPreview';
import { ExportPanel } from './ExportPanel';
import { SpecificationView } from './SpecificationView';

type GeneratorPhase = 'upload' | 'analyze' | 'generate';

export function GeneratorPanel() {
  const { apiKey, provider, model } = useSettingsStore();
  const { createProject, currentProject, addIconToProject, updateProject } = useProjectStore();
  const {
    uploadedImage,
    uploadedImageUrl,
    subject,
    setSubject,
    isAnalyzing,
    setIsAnalyzing,
    analysisError,
    setAnalysisError,
    isGenerating,
    setIsGenerating,
    generatedSvgs,
    setGeneratedSvgs,
    selectedSvgIndex,
    setSelectedSvgIndex,
    generationError,
    setGenerationError,
  } = useGeneratorStore();

  const [specification, setSpecification] = useState<DesignSpecification | null>(null);
  const [projectImageUrl, setProjectImageUrl] = useState<string | null>(null);

  // 프로젝트의 referenceImage URL 생성
  useEffect(() => {
    if (currentProject?.referenceImage) {
      const url = URL.createObjectURL(currentProject.referenceImage);
      setProjectImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProjectImageUrl(null);
    }
  }, [currentProject?.referenceImage]);

  // 현재 표시할 이미지 URL (업로드된 이미지 또는 프로젝트 이미지)
  const displayImageUrl = uploadedImageUrl || projectImageUrl;

  // 현재 단계 결정: 프로젝트가 선택된 경우 프로젝트 상태에 따라 결정
  const getPhase = (): GeneratorPhase => {
    // 방금 생성된 SVG가 있으면 generate 단계
    if (generatedSvgs.length > 0) return 'generate';

    // 프로젝트가 선택된 경우
    if (currentProject) {
      // 저장된 아이콘이 있으면 generate 단계
      if (currentProject.generatedIcons.length > 0) return 'generate';
      // specification이 있으면 analyze 단계
      if (currentProject.specification) return 'analyze';
    }

    // 새로 분석한 specification이 있으면 analyze 단계
    if (specification) return 'analyze';

    return 'upload';
  };

  const phase = getPhase();
  const activeSpec = specification || currentProject?.specification;

  // 표시할 아이콘들: 방금 생성된 것 또는 프로젝트에 저장된 것
  const displaySvgs = useMemo(() => {
    if (generatedSvgs.length > 0) return generatedSvgs;
    if (currentProject?.generatedIcons) {
      return currentProject.generatedIcons.map(icon => icon.svgCode);
    }
    return [];
  }, [generatedSvgs, currentProject?.generatedIcons]);

  const handleAnalyze = useCallback(async () => {
    if (!uploadedImage || !apiKey) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const spec = await analyzeImage(uploadedImage, apiKey, provider, model);
      setSpecification(spec);

      // 프로젝트 이름: {이미지명}
      const imageName = uploadedImage.name.replace(/\.[^/.]+$/, '');

      // 새 프로젝트 생성
      const project: DesignProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: imageName,
        referenceImage: uploadedImage,
        specification: spec,
        generatedIcons: [],
        llmModel: model,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createProject(project);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, apiKey, provider, model, setIsAnalyzing, setAnalysisError, createProject]);

  const handleGenerate = useCallback(async () => {
    const spec = specification || currentProject?.specification;
    const projectId = currentProject?.id;
    if (!spec || !subject || !apiKey || !projectId) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedSvgs([]);

    try {
      const svgs = await generateSvgs(spec, subject, apiKey, provider, model);
      const normalizedSvgs = svgs.map(normalizeSvg);
      setGeneratedSvgs(normalizedSvgs);

      // 모든 생성된 아이콘을 자동으로 프로젝트에 저장
      for (let i = 0; i < normalizedSvgs.length; i++) {
        const svgCode = normalizedSvgs[i];
        if (!svgCode) continue;
        const icon: GeneratedIcon = {
          id: `icon_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 9)}`,
          projectId,
          subject,
          svgCode,
          llmModel: model,
          createdAt: new Date(),
        };
        await addIconToProject(projectId, icon);
      }

      // 프로젝트 이름 업데이트: {이미지명} - {Subject}({모델명})
      if (currentProject) {
        const imageName = currentProject.name.split(' - ')[0]; // 기존 이미지명 추출
        const modelShortName = getModelShortName(model);
        const newName = `${imageName} - ${subject}(${modelShortName})`;
        await updateProject({ ...currentProject, name: newName });
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [specification, currentProject, subject, apiKey, provider, model, setIsGenerating, setGenerationError, setGeneratedSvgs, updateProject, addIconToProject]);

  const selectedSvg = selectedSvgIndex !== null ? displaySvgs[selectedSvgIndex] : null;

  // 레퍼런스 이미지 표시 컴포넌트
  const ReferenceImageDisplay = () => {
    if (displayImageUrl) {
      return (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ maxWidth: '300px', maxHeight: '300px' }}>
          <img
            src={displayImageUrl}
            alt="Reference"
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    return <ImageUploader />;
  };

  // Phase 1: 업로드 단계 - Reference Image 영역만 가운데에 표시
  if (phase === 'upload') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-1/3 max-w-md space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Reference Image</h3>
            <ImageUploader />
          </div>

          {uploadedImage && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !apiKey}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Analyze Design
                </>
              )}
            </Button>
          )}

          {analysisError && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
              {analysisError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Phase 2: 분석 완료 - Reference Image + Design Specification + Icon Subject 영역 가운데
  if (phase === 'analyze') {
    return (
      <div className="h-full flex items-start justify-center pt-8 overflow-auto">
        <div className="w-1/2 max-w-2xl space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Reference Image</h3>
            <ReferenceImageDisplay />
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Design Specification</h3>
            <SpecificationView specification={activeSpec || null} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Icon Subject</h3>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Save, Delete, Settings..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !activeSpec || !subject || !apiKey}
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {generationError && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
              {generationError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Phase 3: 생성 완료 - 좌우 분할 레이아웃
  return (
    <div className="grid grid-cols-2 gap-6 h-full overflow-auto">
      {/* Left Column - Reference Image + Design Specification */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Reference Image</h3>
          <ReferenceImageDisplay />
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Design Specification</h3>
          <SpecificationView specification={activeSpec || null} />
        </div>
      </div>

      {/* Right Column - Icon Subject + Generated Icons */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Icon Subject</h3>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Save, Delete, Settings..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !activeSpec || !subject || !apiKey}
            >
              {isGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
            </Button>
          </div>
        </div>

        {generationError && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
            {generationError}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            {currentProject?.generatedIcons && currentProject.generatedIcons.length > 0 && generatedSvgs.length === 0
              ? `Saved Icons (${currentProject.generatedIcons.length})`
              : 'Generated Icons (Select One)'}
          </h3>
          <SvgPreview
            svgs={displaySvgs}
            selectedIndex={selectedSvgIndex}
            onSelect={setSelectedSvgIndex}
          />
        </div>

        {selectedSvg && (
          <>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Selected Icon</h3>
              <div className="flex justify-center">
                <div
                  className="w-24 h-24 p-2 bg-gray-900 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: selectedSvg }}
                />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <ExportPanel svg={selectedSvg} subject={subject} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 모델명을 짧은 이름으로 변환
function getModelShortName(model: string): string {
  const modelMap: Record<string, string> = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o-mini',
    'o4-mini': 'o4-mini',
    'gpt-4.1': 'GPT-4.1',
    'claude-sonnet-4-20250514': 'Sonnet 4',
    'claude-opus-4-20250514': 'Opus 4',
  };
  return modelMap[model] || model;
}
