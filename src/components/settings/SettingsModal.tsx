import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '@/components/common';
import { useSettingsStore } from '@/store';
import type { LLMProvider } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const providerOptions = [
  { value: 'openai', label: 'OpenAI (GPT-4o)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiKey, provider, setApiKey, setProvider } = useSettingsStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localProvider, setLocalProvider] = useState<LLMProvider>(provider);

  useEffect(() => {
    setLocalApiKey(apiKey);
    setLocalProvider(provider);
  }, [apiKey, provider, isOpen]);

  const handleSave = async () => {
    await setApiKey(localApiKey);
    await setProvider(localProvider);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <Select
          label="LLM Provider"
          options={providerOptions}
          value={localProvider}
          onChange={(e) => setLocalProvider(e.target.value as LLMProvider)}
        />
        <Input
          label="API Key"
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          placeholder={localProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
        />
        <p className="text-xs text-gray-500">
          Your API key is stored locally in your browser and never sent to our servers.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
