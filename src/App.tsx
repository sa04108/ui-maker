import { useEffect, useState } from 'react';
import { Header } from '@/components/layout';
import { GeneratorPanel } from '@/components/generator';
import { LibraryPanel } from '@/components/library';
import { useSettingsStore, useProjectStore } from '@/store';

type Tab = 'generator' | 'library';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generator');
  const { loadSettings, isLoaded: settingsLoaded } = useSettingsStore();
  const { loadProjects } = useProjectStore();

  useEffect(() => {
    loadSettings();
    loadProjects();
  }, [loadSettings, loadProjects]);

  if (!settingsLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'generator'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'library'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Library
            </button>
          </div>
        </div>

        {/* Content - 두 패널을 모두 렌더링하고 CSS로 숨김 처리하여 깜빡임 방지 */}
        <div className="flex-1 p-6 relative">
          <div className={activeTab === 'generator' ? 'h-full' : 'hidden'}>
            <GeneratorPanel />
          </div>
          <div className={activeTab === 'library' ? 'h-full' : 'hidden'}>
            <LibraryPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
