import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '@/components/common';
import { useSettingsStore } from '@/store';
import type { LLMProvider, LLMModel } from '@/types';
import { getModelsForProvider, getDefaultModelForProvider } from '@/types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google Gemini' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiKey, provider, model, setApiKey, setProvider, setModel } = useSettingsStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localProvider, setLocalProvider] = useState<LLMProvider>(provider);
  const [localModel, setLocalModel] = useState<LLMModel>(model);

  useEffect(() => {
    setLocalApiKey(apiKey);
    setLocalProvider(provider);
    setLocalModel(model);
  }, [apiKey, provider, model, isOpen]);

  const handleProviderChange = (newProvider: LLMProvider) => {
    setLocalProvider(newProvider);
    setLocalModel(getDefaultModelForProvider(newProvider));
  };

  const handleSave = async () => {
    await setApiKey(localApiKey);
    if (localProvider !== provider) {
      await setProvider(localProvider);
    }
    await setModel(localModel);
    onClose();
  };

  const modelOptions = getModelsForProvider(localProvider).map((m) => ({
    value: m.id,
    label: `${m.name}${m.tier === 'premium' ? ' (Premium)' : ''}`,
  }));

  const selectedModelInfo = getModelsForProvider(localProvider).find((m) => m.id === localModel);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <Select
          label="LLM Provider"
          options={providerOptions}
          value={localProvider}
          onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
        />
        <Select
          label="Model"
          options={modelOptions}
          value={localModel}
          onChange={(e) => setLocalModel(e.target.value as LLMModel)}
        />
        {selectedModelInfo && (
          <p className="text-xs text-gray-500 -mt-2">
            {selectedModelInfo.description}
          </p>
        )}
        <Input
          label="API Key"
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          placeholder={
            localProvider === 'openai'
              ? 'sk-...'
              : localProvider === 'anthropic'
                ? 'sk-ant-...'
                : 'AIza...'
          }
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
