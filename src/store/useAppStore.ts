import { create } from 'zustand';

interface AppState {
  activeTab: 'dockerfile' | 'compose' | 'kubernetes';
  activeTooltip: string | null;
  activeMenu: string;
  isFullStack: boolean;

  // Manual Overrides Management
  overrides: {
    dockerfile: { isActive: boolean; code: string };
    compose: { isActive: boolean; code: string };
    kubernetes: { isActive: boolean; code: string };
  };

  setActiveTab: (tab: 'dockerfile' | 'compose' | 'kubernetes') => void;
  setActiveTooltip: (tooltipId: string | null) => void;
  setActiveMenu: (menuId: string) => void;
  setIsFullStack: (is: boolean) => void;
  
  // New actions for tab-specific overrides
  setOverrideActive: (tab: 'dockerfile' | 'compose' | 'kubernetes', active: boolean) => void;
  setOverrideCode: (tab: 'dockerfile' | 'compose' | 'kubernetes', code: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dockerfile',
  activeTooltip: null,
  activeMenu: 'getting-started',
  isFullStack: false,
  
  overrides: {
    dockerfile: { isActive: false, code: '' },
    compose: { isActive: false, code: '' },
    kubernetes: { isActive: false, code: '' },
  },

  setActiveTab: (tab: 'dockerfile' | 'compose' | 'kubernetes') => set({ activeTab: tab }),
  setActiveTooltip: (tooltipId: string | null) => set({ activeTooltip: tooltipId }),
  setActiveMenu: (menuId: string) => set({ activeMenu: menuId }),
  setIsFullStack: (is: boolean) => set({ isFullStack: is }),

  setOverrideActive: (tab: 'dockerfile' | 'compose' | 'kubernetes', active: boolean) => set((s) => ({
    overrides: { ...s.overrides, [tab]: { ...s.overrides[tab], isActive: active } }
  })),
  setOverrideCode: (tab: 'dockerfile' | 'compose' | 'kubernetes', code: string) => set((s) => ({
    overrides: { ...s.overrides, [tab]: { ...s.overrides[tab], code } }
  })),
}));
