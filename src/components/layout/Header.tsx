import { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { SettingsModal } from '@/components/settings';
import { useSettingsStore } from '@/store';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { apiKey } = useSettingsStore();

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-100">UI Maker</h1>
          <span className="text-xs text-gray-500">Button Icon Generator</span>
        </div>

        <div className="flex items-center gap-3">
          {!apiKey && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/30 border border-yellow-700 rounded text-sm text-yellow-400">
              <AlertCircle size={14} />
              <span>API key required</span>
            </div>
          )}
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
