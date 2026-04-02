import { create } from 'zustand';

interface AppState {
  activeTab: 'dockerfile' | 'compose' | 'kubernetes';
  activeTooltip: string | null;
  activeMenu: string;
  isFullStack: boolean;
  isEditingMode: boolean;
  manualCode: string;

  setActiveTab: (tab: 'dockerfile' | 'compose' | 'kubernetes') => void;
  setActiveTooltip: (tooltipId: string | null) => void;
  setActiveMenu: (menuId: string) => void;
  setIsFullStack: (is: boolean) => void;
  setIsEditingMode: (is: boolean) => void;
  setManualCode: (code: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dockerfile',
  activeTooltip: null,
  activeMenu: 'getting-started',
  isFullStack: false,
  isEditingMode: false,
  manualCode: '',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTooltip: (tooltipId) => set({ activeTooltip: tooltipId }),
  setActiveMenu: (menuId) => set({ activeMenu: menuId }),
  setIsFullStack: (is) => set({ isFullStack: is }),
  setIsEditingMode: (is) => set({ isEditingMode: is }),
  setManualCode: (code) => set({ manualCode: code }),
}));
