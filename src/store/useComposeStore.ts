import { create } from 'zustand';

export type ComposeService = {
  id: string;
  name: string;
  buildMode: "build" | "image";
  image: string;
  dockerfile: string;
  context: string;
  ports: { host: string, container: string }[];
  restart: string;
  envs: { key: string, value: string }[];
  vols: { host: string, container: string }[];
  command: string;
  entrypoint: string;
  user: string;
  privileged: boolean;
  cpus: string;
  memLimit: string;
  extraHosts: { host: string, ip: string }[];
  capAdd: string[];
  envFiles: string[];
  logDriver: string;
  logMaxSize: string;
  logMaxFile: string;
  healthcheck: {
    enabled: boolean;
    test: string;
    interval: string;
    timeout: string;
    retries: string;
    startPeriod: string;
  };
  dependsOn: string[];
  useGpu: boolean;
  labels: { key: string, value: string }[];
  networkMode: string;
  shmSize: string;
  pid: string;
  tty: boolean;
  stdinOpen: boolean;
  customYaml: string;
  useShellWrapper: boolean;
};

interface ComposeAddons {
  redis: boolean;
  postgres: boolean;
  mysql: boolean;
}

interface ComposeState {
  composeServices: ComposeService[];
  activeSvcId: string;
  composeAddons: ComposeAddons;
  composeVersion: string;
  networkName: string;
  useSharedNetwork: boolean;

  setComposeServices: (services: ComposeService[] | ((prev: ComposeService[]) => ComposeService[])) => void;
  setActiveSvcId: (id: string) => void;
  setComposeAddons: (addons: ComposeAddons | ((prev: ComposeAddons) => ComposeAddons)) => void;
  setComposeVersion: (v: string) => void;
  setNetworkName: (name: string) => void;
  setUseSharedNetwork: (use: boolean) => void;
  reset: () => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  composeServices: [{
    id: "svc-1",
    name: "my-awesome-app",
    buildMode: "image",
    image: "node:20-alpine",
    dockerfile: "Dockerfile",
    context: ".",
    ports: [{ host: "3000", container: "3000" }],
    restart: "unless-stopped",
    envs: [{ key: "TZ", value: "Asia/Shanghai" }],
    vols: [{ host: "./data", container: "/app/data" }],
    command: "",
    entrypoint: "",
    user: "",
    privileged: false,
    cpus: "",
    memLimit: "",
    extraHosts: [],
    capAdd: [],
    envFiles: [],
    logDriver: "default",
    logMaxSize: "10m",
    logMaxFile: "3",
    healthcheck: { enabled: false, test: "curl -f http://localhost/ || exit 1", interval: "30s", timeout: "10s", retries: "3", startPeriod: "40s" },
    dependsOn: [],
    useGpu: false,
    labels: [],
    networkMode: "bridge",
    shmSize: "",
    pid: "",
    tty: false,
    stdinOpen: false,
    customYaml: "",
    useShellWrapper: false
  }],
  activeSvcId: "svc-1",
  composeAddons: {
    redis: false,
    postgres: false,
    mysql: false
  },
  composeVersion: '3.8',
  networkName: 'app-net',
  useSharedNetwork: true,

  setComposeServices: (updater) => set((state) => ({
    composeServices: typeof updater === 'function' ? updater(state.composeServices) : updater
  })),
  setActiveSvcId: (id) => set({ activeSvcId: id }),
  setComposeAddons: (updater) => set((state) => ({
    composeAddons: typeof updater === 'function' ? updater(state.composeAddons) : updater
  })),
  setComposeVersion: (v) => set({ composeVersion: v }),
  setNetworkName: (name) => set({ networkName: name }),
  setUseSharedNetwork: (use) => set({ useSharedNetwork: use }),
  reset: () => set({
    composeServices: [],
    activeSvcId: "",
    composeAddons: {
      redis: false,
      postgres: false,
      mysql: false
    },
    composeVersion: '3.8',
    networkName: 'app-net',
    useSharedNetwork: true,
  }),
}));
