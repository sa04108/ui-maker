import { useState, useCallback, useEffect, useMemo } from 'react';
import { Sparkles, Loader2, Pencil, Check } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { ImageUploader } from '@/components/upload';
import { useGeneratorStore, useSettingsStore, useProjectStore } from '@/store';
import { analyzeImage } from '@/services/llm';
import { generateSvgs, normalizeSvg } from '@/services/svg';
import type { DesignSpecification, DesignProject, GeneratedIcon } from '@/types';
import { getModelDisplayName } from '@/types/settings';
import { generateId, removeExtension } from '@/utils';
import { SvgPreview } from './SvgPreview';
import { ExportPanel } from './ExportPanel';
import { SpecificationEditor } from './SpecificationEditor';
import { SpecificationView } from './SpecificationView';

type GeneratorPhase = 'upload' | 'analyze' | 'generate';

export function GeneratorPanel() {
  const { apiKey, provider, model } = useSettingsStore();
  const requiresApiKey = provider !== 'ollama';
  const { projects, createProject, updateProject } = useProjectStore();
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
    lastSubject,
    lastGeneratedSvgs,
    setLastGeneration,
    activeProjectId,
    setActiveProject,
    clearActiveProject,
    resetKey,
  } = useGeneratorStore();

  const [specification, setSpecification] = useState<DesignSpecification | null>(null);
  const [projectImageUrl, setProjectImageUrl] = useState<string | null>(null);
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [draftSpecification, setDraftSpecification] = useState<DesignSpecification | null>(null);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  useEffect(() => {
    if (activeProjectId && !activeProject) {
      clearActiveProject();
    }
  }, [activeProjectId, activeProject, clearActiveProject]);

  useEffect(() => {
    setIsEditingSpec(false);
    setDraftSpecification(null);
  }, [activeProjectId]);

  useEffect(() => {
    setSpecification(null);
    setIsEditingSpec(false);
    setDraftSpecification(null);
  }, [resetKey]);

  // 프로젝트의 referenceImage URL 생성
  useEffect(() => {
    if (activeProject?.referenceImage) {
      const url = URL.createObjectURL(activeProject.referenceImage);
      setProjectImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProjectImageUrl(null);
    }
  }, [activeProject?.referenceImage]);

  // 현재 표시할 이미지 URL (업로드된 이미지 또는 프로젝트 이미지)
  const displayImageUrl = activeProject ? projectImageUrl : uploadedImageUrl;

  // 현재 단계 결정: 프로젝트가 선택된 경우 프로젝트 상태에 따라 결정
  const getPhase = (): GeneratorPhase => {
    // 방금 생성된 SVG가 있으면 generate 단계
    if (generatedSvgs.length > 0) return 'generate';

    // 프로젝트가 선택된 경우
    if (activeProject) {
      // 저장된 아이콘이 있으면 generate 단계
      if (activeProject.generatedIcons.length > 0) return 'generate';
      // specification이 있으면 analyze 단계
      if (activeProject.specification) return 'analyze';
    }

    // 새로 분석한 specification이 있으면 analyze 단계
    if (specification) return 'analyze';

    return 'upload';
  };

  const phase = getPhase();
  const activeSpec = activeProject?.specification || specification;
  const commitSpecificationChange = useCallback(
    (updatedSpec: DesignSpecification) => {
      const nextSpec = { ...updatedSpec, updatedAt: new Date() };
      setSpecification(nextSpec);
      if (activeProject) {
        void updateProject({ ...activeProject, specification: nextSpec });
      }
    },
    [activeProject, updateProject]
  );

  const toggleSpecEditing = useCallback(() => {
    setIsEditingSpec((prev) => {
      const next = !prev;
      if (!prev && activeSpec) {
        setDraftSpecification(activeSpec);
      }
      if (prev && draftSpecification) {
        commitSpecificationChange(draftSpecification);
        setDraftSpecification(null);
      }
      return next;
    });
  }, [activeSpec, draftSpecification, commitSpecificationChange]);

  // 표시할 아이콘들: 방금 생성된 것 또는 프로젝트에 저장된 것
  // 생성 중에는 빈 배열 반환 (이전 저장된 아이콘이 깜빡이는 것 방지)
  const displaySvgs = useMemo(() => {
    if (isGenerating) return [];
    if (generatedSvgs.length > 0) return generatedSvgs;
    if (activeProject?.generatedIcons) {
      return activeProject.generatedIcons.map(icon => icon.svgCode);
    }
    return [];
  }, [isGenerating, generatedSvgs, activeProject?.generatedIcons]);

  const handleAnalyze = useCallback(async () => {
    if (!uploadedImage || (requiresApiKey && !apiKey)) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const spec = await analyzeImage(uploadedImage, apiKey, provider, model);
      setSpecification(spec);

      // 새 프로젝트 생성
      const project: DesignProject = {
        id: generateId('proj'),
        name: removeExtension(uploadedImage.name),
        referenceImage: uploadedImage,
        specification: spec,
        generatedIcons: [],
        iconSubject: '',
        llmModel: model,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createProject(project);
      setActiveProject(project.id, 'analysis');
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, apiKey, provider, model, requiresApiKey, setIsAnalyzing, setAnalysisError, createProject, setActiveProject]);

  const handleGenerate = useCallback(async () => {
    const spec = activeProject?.specification || specification;
    const baseProject = activeProject;
    const projectId = baseProject?.id || null;
    const referenceImage = baseProject?.referenceImage || uploadedImage;
    if (!spec || !subject || (requiresApiKey && !apiKey) || (!projectId && !referenceImage)) return;

    setIsGenerating(true);
    setGenerationError(null);
    // Clear generated SVGs but don't show old saved icons during generation
    setGeneratedSvgs([]);

    try {
      const svgs = await generateSvgs(
        spec,
        subject,
        apiKey,
        provider,
        model,
        lastSubject,
        lastGeneratedSvgs
      );
      const normalizedSvgs = svgs.map(normalizeSvg);
      setGeneratedSvgs(normalizedSvgs);
      setLastGeneration(subject, normalizedSvgs);

      // Determine if we should create a new project or update existing one
      // Create new project if: no project exists OR subject changed from original
      const subjectChanged = baseProject && baseProject.iconSubject !== subject;
      const shouldCreateNew = !projectId || subjectChanged;
      const iconProjectId = shouldCreateNew ? generateId('proj') : projectId;

      const generatedIcons: GeneratedIcon[] = normalizedSvgs
        .map((svgCode) => ({
          id: generateId('icon'),
          projectId: iconProjectId,
          subject,
          svgCode,
          llmModel: model,
          createdAt: new Date(),
        }))
        .filter((icon) => icon.svgCode);

      const projectName = `${subject}(${getModelDisplayName(model)})`;

      if (shouldCreateNew) {
        const newProject: DesignProject = {
          id: iconProjectId,
          name: projectName,
          referenceImage: referenceImage as Blob,
          specification: spec,
          generatedIcons: generatedIcons,
          iconSubject: subject,
          llmModel: model,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await createProject(newProject);
        setActiveProject(iconProjectId, 'analysis');
      } else if (baseProject) {
        await updateProject({
          ...baseProject,
          name: projectName,
          iconSubject: subject,
          generatedIcons: [...baseProject.generatedIcons, ...generatedIcons],
        });
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [
    specification,
    activeProject,
    subject,
    apiKey,
    provider,
    model,
    uploadedImage,
    requiresApiKey,
    setIsGenerating,
    setGenerationError,
    setGeneratedSvgs,
    lastSubject,
    lastGeneratedSvgs,
    setLastGeneration,
    updateProject,
    createProject,
    setActiveProject,
  ]);

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
              disabled={isAnalyzing || (requiresApiKey && !apiKey)}
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

          <div className="bg-gray-800 rounded-lg p-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Design Specification</h3>
              <button
                type="button"
                onClick={toggleSpecEditing}
                className="text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={isEditingSpec ? 'Done editing specification' : 'Edit specification'}
              >
                {isEditingSpec ? <Check size={14} /> : <Pencil size={14} />}
              </button>
            </div>
            {isEditingSpec ? (
              <SpecificationEditor
                specification={draftSpecification || activeSpec || null}
                onChange={setDraftSpecification}
              />
            ) : (
              <SpecificationView specification={activeSpec || null} />
            )}
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
                disabled={isGenerating || !activeSpec || !subject || (requiresApiKey && !apiKey)}
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

        <div className="bg-gray-800 rounded-lg p-4 group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Design Specification</h3>
            <button
              type="button"
              onClick={toggleSpecEditing}
              className="text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={isEditingSpec ? 'Done editing specification' : 'Edit specification'}
            >
              {isEditingSpec ? <Check size={14} /> : <Pencil size={14} />}
            </button>
          </div>
          {isEditingSpec ? (
            <SpecificationEditor
              specification={draftSpecification || activeSpec || null}
              onChange={setDraftSpecification}
            />
          ) : (
            <SpecificationView specification={activeSpec || null} />
          )}
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
              disabled={isGenerating || !activeSpec || !subject || (requiresApiKey && !apiKey)}
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
            {activeProject?.generatedIcons && activeProject.generatedIcons.length > 0 && generatedSvgs.length === 0
              ? `Saved Icons (${activeProject.generatedIcons.length})`
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
