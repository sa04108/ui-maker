import { useState, useCallback } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useProjectStore, useGeneratorStore, useUiStore } from '@/store';
import { ProjectCard } from './ProjectCard';
import { IconGallery } from './IconGallery';
import { SpecificationView } from '@/components/generator';
import { ALL_MODELS } from '@/types/settings';

export function LibraryPanel() {
  const {
    projects,
    currentProject,
    setCurrentProject,
    clearCurrentProject,
    deleteProject,
    deleteIconFromProject,
    updateProject,
  } = useProjectStore();
  const {
    activeProjectId,
    setActiveProject,
    clearActiveProject,
    setGeneratedSvgs,
    setSelectedSvgIndex,
    setGenerationError,
    setAnalysisError,
    setSubject,
    reset,
  } = useGeneratorStore();
  const { setActiveTab } = useUiStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // LLM 모델의 표시 이름 가져오기
  const getModelDisplayName = (modelId: string | undefined) => {
    if (!modelId) return null;
    const modelInfo = ALL_MODELS.find((m) => m.id === modelId);
    return modelInfo?.name || modelId;
  };

  const handleStartEdit = useCallback(() => {
    if (currentProject) {
      setEditedName(currentProject.name);
      setIsEditingName(true);
    }
  }, [currentProject]);

  const handleSaveEdit = useCallback(async () => {
    if (currentProject && editedName.trim()) {
      await updateProject({ ...currentProject, name: editedName.trim() });
      setIsEditingName(false);
    }
  }, [currentProject, editedName, updateProject]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingName(false);
    setEditedName('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  // 프로젝트 선택/해제 토글
  const handleSelectProject = useCallback(
    (project: typeof currentProject) => {
      if (currentProject?.id === project?.id) {
        // 이미 선택된 프로젝트 클릭 시 선택 해제
        clearCurrentProject();
      } else {
        setCurrentProject(project);
      }
    },
    [currentProject, clearCurrentProject, setCurrentProject]
  );

  const handleViewInGenerator = useCallback(
    (project: typeof currentProject) => {
      if (!project) return;
      if (activeProjectId !== project.id) {
        const shouldReset = window.confirm('This will reset your progress. Continue?');
        if (!shouldReset) return;
        reset();
      }
      setGeneratedSvgs([]);
      setSelectedSvgIndex(null);
      setGenerationError(null);
      setAnalysisError(null);
      setSubject(project.iconSubject ?? '');
      setActiveProject(project.id, 'library');
      setActiveTab('generator');
    },
    [
      reset,
      setGeneratedSvgs,
      setSelectedSvgIndex,
      setGenerationError,
      setAnalysisError,
      setSubject,
      setActiveProject,
      setActiveTab,
    ]
  );

  // 프로젝트 삭제 시 Generator에서 보고 있던 경우만 해제
  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      const isCurrentProject = currentProject?.id === projectId;
      const isActiveInGenerator = activeProjectId === projectId;
      await deleteProject(projectId);
      if (isCurrentProject) {
        clearCurrentProject();
      }
      if (isActiveInGenerator) {
        clearActiveProject();
      }
    },
    [currentProject, activeProjectId, deleteProject, clearCurrentProject, clearActiveProject]
  );

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Projects List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300">Saved Projects</h3>
        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            No projects yet. Create one in the Generator tab.
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={currentProject?.id === project.id}
                onSelect={() => handleSelectProject(project)}
                onViewInGenerator={() => handleViewInGenerator(project)}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Details */}
      <div className="col-span-2 space-y-4">
        {currentProject ? (
          <>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-lg font-medium text-gray-200 focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1.5 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-200 truncate max-w-[calc(100%-40px)]">
                      {currentProject.name}
                    </h3>
                    <button
                      onClick={handleStartEdit}
                      className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                  </>
                )}
              </div>
              {currentProject.llmModel && (
                <div className="mb-1">
                  <span className="inline-block px-2 py-0.5 bg-purple-900/40 border border-purple-700/50 rounded text-xs text-purple-300">
                    {getModelDisplayName(currentProject.llmModel)}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Created: {currentProject.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Design Specification
                </h4>
                <SpecificationView specification={currentProject.specification} />
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Saved Icons ({currentProject.generatedIcons.length})
                </h4>
                <IconGallery
                  icons={currentProject.generatedIcons}
                  onDelete={(iconId) =>
                    deleteIconFromProject(currentProject.id, iconId)
                  }
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a project to view details
          </div>
        )}
      </div>
    </div>
  );
}
