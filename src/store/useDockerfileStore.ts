import { create } from 'zustand';

export interface EnvVar {
  key: string;
  value: string;
}

export interface CopyAddItem {
  type: 'COPY' | 'ADD';
  from: string;
  chown: string;
  src: string;
  dest: string;
}

interface DockerfileState {
  appName: string;
  baseImage: string;
  workdir: string;
  port: string;
  startCmd: string;
  entrypoint: string;
  envVars: EnvVar[];
  volumes: string[];
  user: string;
  healthcheck: string;
  args: EnvVar[];
  labels: EnvVar[];
  runCmds: string[];
  copyAddItems: CopyAddItem[];
  useShellWrapper: boolean;

  setAppName: (appName: string) => void;
  setBaseImage: (baseImage: string) => void;
  setWorkdir: (workdir: string) => void;
  setPort: (port: string) => void;
  setStartCmd: (startCmd: string) => void;
  setEntrypoint: (entrypoint: string) => void;
  setEnvVars: (envVars: EnvVar[]) => void;
  setVolumes: (volumes: string[]) => void;
  setUser: (user: string) => void;
  setHealthcheck: (healthcheck: string) => void;
  setArgs: (args: EnvVar[]) => void;
  setLabels: (labels: EnvVar[]) => void;
  setRunCmds: (runCmds: string[]) => void;
  setCopyAddItems: (copyAddItems: CopyAddItem[]) => void;
  setUseShellWrapper: (useShellWrapper: boolean) => void;
  reset: () => void;
}

export const useDockerfileStore = create<DockerfileState>((set) => ({
  appName: "my-awesome-app",
  baseImage: "node:20-alpine",
  workdir: "/app",
  port: "3000",
  startCmd: "",
  entrypoint: "",
  envVars: [{ key: "NODE_ENV", value: "production" }],
  volumes: [],
  user: "",
  healthcheck: "",
  args: [{ key: "", value: "" }],
  labels: [{ key: "", value: "" }],
  runCmds: [],
  copyAddItems: [],
  useShellWrapper: false,

  setAppName: (appName) => set({ appName }),
  setBaseImage: (baseImage) => set({ baseImage }),
  setWorkdir: (workdir) => set({ workdir }),
  setPort: (port) => set({ port }),
  setStartCmd: (startCmd) => set({ startCmd }),
  setEntrypoint: (entrypoint) => set({ entrypoint }),
  setEnvVars: (envVars) => set({ envVars }),
  setVolumes: (volumes) => set({ volumes }),
  setUser: (user) => set({ user }),
  setHealthcheck: (healthcheck) => set({ healthcheck }),
  setArgs: (args) => set({ args }),
  setLabels: (labels) => set({ labels }),
  setRunCmds: (runCmds) => set({ runCmds }),
  setCopyAddItems: (copyAddItems) => set({ copyAddItems }),
  setUseShellWrapper: (useShellWrapper) => set({ useShellWrapper }),
  reset: () => set({
    appName: "",
    baseImage: "",
    workdir: "",
    port: "",
    startCmd: "",
    entrypoint: "",
    envVars: [],
    volumes: [],
    user: "",
    healthcheck: "",
    args: [],
    labels: [],
    runCmds: [],
    copyAddItems: [],
    useShellWrapper: false,
  }),
}));
