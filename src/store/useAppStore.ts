import { create } from 'zustand';

interface AppState {
  activeTab: 'dockerfile' | 'compose' | 'kubernetes' | 'templates';
  activeTooltip: string | null;
  activeMenu: string;
  isFullStack: boolean;
  language: 'zh' | 'en';

  // Manual Overrides Management
  overrides: {
    dockerfile: { isEnabled: boolean; isEditing: boolean; code: string };
    compose: { isEnabled: boolean; isEditing: boolean; code: string };
    kubernetes: { isEnabled: boolean; isEditing: boolean; code: string };
  };

  setActiveTab: (tab: 'dockerfile' | 'compose' | 'kubernetes') => void;
  setActiveTooltip: (tooltipId: string | null) => void;
  setActiveMenu: (menuId: string) => void;
  setIsFullStack: (is: boolean) => void;
  
  // New actions for tab-specific overrides
  setOverrideEnabled: (tab: 'dockerfile' | 'compose' | 'kubernetes', enabled: boolean) => void;
  setOverrideEditing: (tab: 'dockerfile' | 'compose' | 'kubernetes', editing: boolean) => void;
  setOverrideCode: (tab: 'dockerfile' | 'compose' | 'kubernetes', code: string) => void;
  resetOverride: (tab: 'dockerfile' | 'compose' | 'kubernetes') => void;
  setLanguage: (lang: 'zh' | 'en') => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dockerfile',
  activeTooltip: null,
  activeMenu: 'getting-started',
  isFullStack: false,
  language: 'zh',
  
  overrides: {
    dockerfile: { isEnabled: false, isEditing: false, code: '' },
    compose: { isEnabled: false, isEditing: false, code: '' },
    kubernetes: { isEnabled: false, isEditing: false, code: '' },
  },

  setActiveTab: (tab: 'dockerfile' | 'compose' | 'kubernetes') => set({ activeTab: tab }),
  setActiveTooltip: (tooltipId: string | null) => set({ activeTooltip: tooltipId }),
  setActiveMenu: (menuId: string) => set({ activeMenu: menuId }),
  setIsFullStack: (is: boolean) => set({ isFullStack: is }),

  setOverrideEnabled: (tab: 'dockerfile' | 'compose' | 'kubernetes', enabled: boolean) => set((s) => ({
    overrides: { ...s.overrides, [tab]: { ...s.overrides[tab], isEnabled: enabled } }
  })),
  setOverrideEditing: (tab: 'dockerfile' | 'compose' | 'kubernetes', editing: boolean) => set((s) => ({
    overrides: { ...s.overrides, [tab]: { ...s.overrides[tab], isEditing: editing } }
  })),
  setOverrideCode: (tab: 'dockerfile' | 'compose' | 'kubernetes', code: string) => set((s) => ({
    overrides: { ...s.overrides, [tab]: { ...s.overrides[tab], code } }
  })),
  resetOverride: (tab) => set((s) => ({
    overrides: { ...s.overrides, [tab]: { isEnabled: false, isEditing: false, code: '' } }
  })),
  setLanguage: (lang: 'zh' | 'en') => set({ language: lang }),
}));
