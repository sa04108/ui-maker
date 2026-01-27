import { create } from 'zustand';
import type { LLMProvider, LLMModel } from '@/types';
import { getDefaultModelForProvider } from '@/types/settings';
import { db } from '@/db/database';

const SETTINGS_ID = 'user-settings';

interface SettingsState {
  apiKey: string;
  apiKeys: Record<LLMProvider, string>;
  provider: LLMProvider;
  model: LLMModel;
  isLoaded: boolean;
  setApiKey: (apiKey: string) => Promise<void>;
  setProvider: (provider: LLMProvider) => Promise<void>;
  setModel: (model: LLMModel) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: '',
  apiKeys: {
    openai: '',
    anthropic: '',
    google: '',
    ollama: '',
  },
  provider: 'openai',
  model: getDefaultModelForProvider('openai'),
  isLoaded: false,

  setApiKey: async (apiKey: string) => {
    const state = get();
    const nextApiKeys = { ...state.apiKeys, [state.provider]: apiKey };
    set({ apiKey, apiKeys: nextApiKeys });
    await db.settings.put({
      id: SETTINGS_ID,
      apiKeys: nextApiKeys,
      provider: state.provider,
      model: state.model,
    });
  },

  setProvider: async (provider: LLMProvider) => {
    const newModel = getDefaultModelForProvider(provider);
    const state = get();
    const nextApiKey = state.apiKeys[provider] || '';
    set({ provider, model: newModel, apiKey: nextApiKey });
    await db.settings.put({
      id: SETTINGS_ID,
      apiKeys: get().apiKeys,
      provider,
      model: newModel,
    });
  },

  setModel: async (model: LLMModel) => {
    set({ model });
    const state = get();
    await db.settings.put({
      id: SETTINGS_ID,
      apiKeys: state.apiKeys,
      provider: state.provider,
      model,
    });
  },

  loadSettings: async () => {
    const settings = await db.settings.get(SETTINGS_ID);
    if (settings) {
      const hasApiKeys = 'apiKeys' in settings && !!settings.apiKeys;
      const legacyApiKey = (settings as { apiKey?: string }).apiKey || '';
      const storedApiKeys = hasApiKeys
        ? settings.apiKeys
        : {
            openai: legacyApiKey,
            anthropic: '',
            google: '',
            ollama: '',
          };
      const normalizedApiKeys = {
        openai: '',
        anthropic: '',
        google: '',
        ollama: '',
        ...storedApiKeys,
      };
      const activeApiKey = normalizedApiKeys[settings.provider] || '';
      set({
        apiKey: activeApiKey,
        apiKeys: normalizedApiKeys,
        provider: settings.provider,
        model: settings.model || getDefaultModelForProvider(settings.provider),
        isLoaded: true,
      });
    } else {
      set({ isLoaded: true });
    }
  },
}));
