import { create } from 'zustand';

interface AppState {
  activeTab: 'dockerfile' | 'compose' | 'kubernetes' | 'templates' | 'containers';
  activeTooltip: string | null;
  activeMenu: string;
  isFullStack: boolean;
  language: 'zh' | 'en';
  dockerSocket: string;
  kubeconfig: string;
  containerRuntime: 'docker' | 'kubernetes';
  containerNamespace: string;
  isDashboardEnabled: boolean;

  // Manual Overrides Management
  overrides: {
    dockerfile: { isEnabled: boolean; isEditing: boolean; code: string };
    compose: { isEnabled: boolean; isEditing: boolean; code: string };
    kubernetes: { isEnabled: boolean; isEditing: boolean; code: string };
  };

  setActiveTab: (tab: 'dockerfile' | 'compose' | 'kubernetes' | 'templates' | 'containers') => void;
  setActiveTooltip: (tooltipId: string | null) => void;
  setActiveMenu: (menuId: string) => void;
  setIsFullStack: (is: boolean) => void;
  
  // New actions for tab-specific overrides
  setOverrideEnabled: (tab: 'dockerfile' | 'compose' | 'kubernetes', enabled: boolean) => void;
  setOverrideEditing: (tab: 'dockerfile' | 'compose' | 'kubernetes', editing: boolean) => void;
  setOverrideCode: (tab: 'dockerfile' | 'compose' | 'kubernetes', code: string) => void;
  resetOverride: (tab: 'dockerfile' | 'compose' | 'kubernetes') => void;
  setLanguage: (lang: 'zh' | 'en') => void;
  setDockerSocket: (path: string) => void;
  setKubeconfig: (config: string) => void;
  setContainerRuntime: (runtime: 'docker' | 'kubernetes') => void;
  setContainerNamespace: (ns: string) => void;
  setIsDashboardEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dockerfile',
  activeTooltip: null,
  activeMenu: 'getting-started',
  isFullStack: false,
  language: 'zh',
  dockerSocket: '',
  kubeconfig: '',
  containerRuntime: 'docker',
  containerNamespace: 'default',
  isDashboardEnabled: false,
  
  overrides: {
    dockerfile: { isEnabled: false, isEditing: false, code: '' },
    compose: { isEnabled: false, isEditing: false, code: '' },
    kubernetes: { isEnabled: false, isEditing: false, code: '' },
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
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
  setDockerSocket: (path: string) => set({ dockerSocket: path }),
  setKubeconfig: (config: string) => set({ kubeconfig: config }),
  setContainerRuntime: (runtime) => set({ containerRuntime: runtime }),
  setContainerNamespace: (ns) => set({ containerNamespace: ns }),
  setIsDashboardEnabled: (enabled: boolean) => set({ isDashboardEnabled: enabled }),
}));
