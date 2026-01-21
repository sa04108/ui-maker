import { create } from 'zustand';
import type { LLMProvider, LLMModel } from '@/types';
import { getDefaultModelForProvider } from '@/types/settings';
import { db } from '@/db/database';

const SETTINGS_ID = 'user-settings';

interface SettingsState {
  apiKey: string;
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
  provider: 'openai',
  model: 'gpt-4o',
  isLoaded: false,

  setApiKey: async (apiKey: string) => {
    set({ apiKey });
    const state = get();
    await db.settings.put({
      id: SETTINGS_ID,
      apiKey,
      provider: state.provider,
      model: state.model,
    });
  },

  setProvider: async (provider: LLMProvider) => {
    const newModel = getDefaultModelForProvider(provider);
    set({ provider, model: newModel });
    await db.settings.put({
      id: SETTINGS_ID,
      apiKey: get().apiKey,
      provider,
      model: newModel,
    });
  },

  setModel: async (model: LLMModel) => {
    set({ model });
    const state = get();
    await db.settings.put({
      id: SETTINGS_ID,
      apiKey: state.apiKey,
      provider: state.provider,
      model,
    });
  },

  loadSettings: async () => {
    const settings = await db.settings.get(SETTINGS_ID);
    if (settings) {
      set({
        apiKey: settings.apiKey,
        provider: settings.provider,
        model: settings.model || getDefaultModelForProvider(settings.provider),
        isLoaded: true,
      });
    } else {
      set({ isLoaded: true });
    }
  },
}));
