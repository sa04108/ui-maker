import { useState } from 'react';
import { Settings, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/common';
import { SettingsModal } from '@/components/settings';
import { useSettingsStore, useProjectStore, useGeneratorStore } from '@/store';
import { ALL_MODELS } from '@/types/settings';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHoveringProject, setIsHoveringProject] = useState(false);
  const { apiKey, model } = useSettingsStore();
  const { currentProject, clearCurrentProject } = useProjectStore();
  const { activeProjectId, clearActiveProject } = useGeneratorStore();

  // 현재 모델의 표시 이름 가져오기
  const currentModelInfo = ALL_MODELS.find((m) => m.id === model);
  const modelDisplayName = currentModelInfo?.name || model;

  const handleClearProject = () => {
    if (activeProjectId && currentProject?.id === activeProjectId) {
      clearActiveProject();
    }
    clearCurrentProject();
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-100">UI Maker</h1>
          <span className="text-xs text-gray-500">Button Icon Generator</span>
          {currentProject && (
            <div
              className="group flex items-center gap-2 px-3 py-1.5 bg-blue-900/40 border border-blue-700/50 rounded text-sm text-blue-300"
              onMouseEnter={() => setIsHoveringProject(true)}
              onMouseLeave={() => setIsHoveringProject(false)}
            >
              <span className="text-gray-400">Selected Project:</span>
              <span className="font-medium truncate max-w-[200px]">{currentProject.name}</span>
              {isHoveringProject && (
                <button
                  onClick={handleClearProject}
                  className="p-0.5 text-blue-300 hover:text-white hover:bg-blue-700/50 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!apiKey && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/30 border border-yellow-700 rounded text-sm text-yellow-400">
              <AlertCircle size={14} />
              <span>API key required</span>
            </div>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 transition-colors"
          >
            <span className="font-medium">{modelDisplayName}</span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={18} />
          </Button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
