import { useState, useCallback } from 'react';
import { Sparkles, Loader2, Save } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { ImageUploader } from '@/components/upload';
import { useGeneratorStore, useSettingsStore, useProjectStore } from '@/store';
import { analyzeImage } from '@/services/llm';
import { generateSvgs, normalizeSvg } from '@/services/svg';
import type { DesignSpecification, DesignProject, GeneratedIcon } from '@/types';
import { SvgPreview } from './SvgPreview';
import { ExportPanel } from './ExportPanel';
import { SpecificationView } from './SpecificationView';

export function GeneratorPanel() {
  const { apiKey, provider, model } = useSettingsStore();
  const { createProject, currentProject, addIconToProject } = useProjectStore();
  const {
    uploadedImage,
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

  const handleAnalyze = useCallback(async () => {
    if (!uploadedImage || !apiKey) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const spec = await analyzeImage(uploadedImage, apiKey, provider, model);
      setSpecification(spec);

      // 새 프로젝트 생성
      const project: DesignProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: spec.name,
        referenceImage: uploadedImage,
        specification: spec,
        generatedIcons: [],
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
    if (!spec || !subject || !apiKey) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedSvgs([]);

    try {
      const svgs = await generateSvgs(spec, subject, apiKey, provider, model);
      const normalizedSvgs = svgs.map(normalizeSvg);
      setGeneratedSvgs(normalizedSvgs);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [specification, currentProject, subject, apiKey, provider, model, setIsGenerating, setGenerationError, setGeneratedSvgs]);

  const handleSaveIcon = useCallback(async () => {
    const projectId = currentProject?.id;
    if (selectedSvgIndex === null || !projectId || !generatedSvgs[selectedSvgIndex]) return;

    const icon: GeneratedIcon = {
      id: `icon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      projectId,
      subject,
      svgCode: generatedSvgs[selectedSvgIndex],
      createdAt: new Date(),
    };

    await addIconToProject(projectId, icon);
  }, [currentProject, selectedSvgIndex, generatedSvgs, subject, addIconToProject]);

  const activeSpec = specification || currentProject?.specification;
  const selectedSvg = selectedSvgIndex !== null ? generatedSvgs[selectedSvgIndex] : null;

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left Column */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Reference Image</h3>
          <ImageUploader />
        </div>

        {uploadedImage && !activeSpec && (
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

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Design Specification</h3>
          <SpecificationView specification={activeSpec || null} />
        </div>
      </div>

      {/* Right Column */}
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
          <h3 className="text-sm font-medium text-gray-300 mb-3">Generated Icons (Select One)</h3>
          <SvgPreview
            svgs={generatedSvgs}
            selectedIndex={selectedSvgIndex}
            onSelect={setSelectedSvgIndex}
          />
        </div>

        {selectedSvg && (
          <>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Selected Icon</h3>
                <Button size="sm" variant="secondary" onClick={handleSaveIcon}>
                  <Save size={14} className="mr-1" />
                  Save to Project
                </Button>
              </div>
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
