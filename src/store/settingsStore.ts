import { create } from 'zustand';
import type { LLMProvider } from '@/types';
import { db } from '@/db/database';

const SETTINGS_ID = 'user-settings';

interface SettingsState {
  apiKey: string;
  provider: LLMProvider;
  isLoaded: boolean;
  setApiKey: (apiKey: string) => Promise<void>;
  setProvider: (provider: LLMProvider) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: '',
  provider: 'openai',
  isLoaded: false,

  setApiKey: async (apiKey: string) => {
    set({ apiKey });
    await db.settings.put({
      id: SETTINGS_ID,
      apiKey,
      provider: get().provider,
    });
  },

  setProvider: async (provider: LLMProvider) => {
    set({ provider });
    await db.settings.put({
      id: SETTINGS_ID,
      apiKey: get().apiKey,
      provider,
    });
  },

  loadSettings: async () => {
    const settings = await db.settings.get(SETTINGS_ID);
    if (settings) {
      set({
        apiKey: settings.apiKey,
        provider: settings.provider,
        isLoaded: true,
      });
    } else {
      set({ isLoaded: true });
    }
  },
}));
