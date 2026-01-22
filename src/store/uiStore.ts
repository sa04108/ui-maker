import { create } from 'zustand';

export type AppTab = 'generator' | 'library';

interface UiState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'generator',
  setActiveTab: (tab: AppTab) => set({ activeTab: tab }),
}));
