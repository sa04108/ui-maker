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

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'generator' ? <GeneratorPanel /> : <LibraryPanel />}
        </div>
      </div>
    </div>
  );
}

export default App;
