import { create } from 'zustand';

export const uid = () => Math.random().toString(36).slice(2, 8);

// ── Primitives ──────────────────────────────────────────────────────────────
export type WorkloadType = 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'CronJob' | 'Job';
export type ProbeType = 'httpGet' | 'tcpSocket' | 'exec' | 'grpc';
export type K8sSection = 'workload' | 'network' | 'storage';
export type K8sAccessMode = 'ReadWriteOnce' | 'ReadWriteMany' | 'ReadOnlyMany';

export interface K8sEnv { key: string; value: string; }

// Env var with optional valueFrom support
export type K8sEnvType = 'value' | 'configMapKeyRef' | 'secretKeyRef';
export interface K8sWorkloadEnv {
  id: string;
  name: string;       // env var name
  type: K8sEnvType;   // how the value is sourced
  value: string;      // literal value (type === 'value')
  refName: string;    // configmap/secret name
  refKey: string;     // key inside the configmap/secret
  optional: boolean;  // make the ref optional
}

// envFrom: mount entire ConfigMap or Secret as env vars
export interface K8sEnvFrom {
  id: string;
  type: 'configMap' | 'secret';
  name: string;
  prefix: string;   // optional prefix for keys
}
export interface K8sToleration {
  key: string; operator: 'Exists' | 'Equal'; value: string;
  effect: '' | 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
}
export interface K8sProbe {
  enabled: boolean; type: ProbeType; path: string; port: string; command: string;
  initialDelaySeconds: number; periodSeconds: number; timeoutSeconds: number;
  successThreshold: number; failureThreshold: number;
}

const defaultProbe = (): K8sProbe => ({
  enabled: false, type: 'httpGet', path: '/healthz', port: '80', command: 'cat /tmp/healthy',
  initialDelaySeconds: 15, periodSeconds: 10, timeoutSeconds: 5,
  successThreshold: 1, failureThreshold: 3,
});

// ── Volume mount (references a storage resource by name) ────────────────────
export interface K8sVolumeMount {
  id: string; name: string; mountPath: string; subPath: string; readOnly: boolean;
  sourceType: 'emptyDir' | 'hostPath' | 'pvc' | 'configMap' | 'secret';
  hostPathValue: string;
  resourceRef: string; // name of PVC / ConfigMap / Secret
}

// ── Container ────────────────────────────────────────────────────────────────
export interface K8sContainer {
  id: string;
  name: string;
  image: string;
  imagePullPolicy: 'Always' | 'Never' | 'IfNotPresent';
  containerPort: string;
  command: string;
  args: string;
  useShellWrapper: boolean;
  cpuReq: string; cpuLimit: string; memReq: string; memLimit: string;
  envs: K8sWorkloadEnv[];
  envFrom: K8sEnvFrom[];
  volumeMounts: K8sVolumeMount[];
  livenessProbe: K8sProbe;
  readinessProbe: K8sProbe;
  startupProbe: K8sProbe;
  runAsUser: string; runAsGroup: string;
  runAsNonRoot: boolean;
  readOnlyRootFilesystem: boolean;
  allowPrivilegeEscalation: boolean;
}

const defaultContainer = (name: string): K8sContainer => ({
  id: uid(),
  name,
  image: 'nginx:alpine',
  imagePullPolicy: 'IfNotPresent',
  containerPort: '80',
  command: '',
  args: '',
  useShellWrapper: false,
  cpuReq: '100m', cpuLimit: '500m', memReq: '128Mi', memLimit: '512Mi',
  envs: [],
  envFrom: [],
  volumeMounts: [],
  livenessProbe: defaultProbe(),
  readinessProbe: defaultProbe(),
  startupProbe: defaultProbe(),
  runAsUser: '',
  runAsGroup: '',
  runAsNonRoot: false,
  readOnlyRootFilesystem: false,
  allowPrivilegeEscalation: true,
});

// ── Workload ────────────────────────────────────────────────────────────────
export interface K8sWorkload {
  id: string; workloadType: WorkloadType;
  appName: string; namespace: string;
  imagePullSecrets: { name: string }[];
  containers: K8sContainer[];
  initContainers: K8sContainer[];
  fsGroup: string;
  replicas: number; updateStrategy: 'RollingUpdate' | 'Recreate';
  maxSurge: string; maxUnavailable: string;
  serviceName: string; // StatefulSet headless service
  daemonSetUpdateStrategy: 'RollingUpdate' | 'OnDelete';
  schedule: string; concurrencyPolicy: 'Allow' | 'Forbid' | 'Replace';
  restartPolicy: 'OnFailure' | 'Never';
  successfulJobsHistoryLimit: number; failedJobsHistoryLimit: number;
  activeDeadlineSeconds: string;
  nodeSelector: K8sEnv[]; tolerations: K8sToleration[];
  labels: K8sEnv[]; annotations: K8sEnv[];
  podLabels: K8sEnv[]; podAnnotations: K8sEnv[];
  hostNetwork: boolean; dnsPolicy: string;
}

const defaultWorkload = (): K8sWorkload => {
  const appName = 'my-app';
  return {
    id: uid(), workloadType: 'Deployment',
    appName, namespace: 'default',
    imagePullSecrets: [],
    containers: [defaultContainer('main')],
    initContainers: [],
    fsGroup: '',
    replicas: 1, updateStrategy: 'RollingUpdate', maxSurge: '1', maxUnavailable: '0',
    serviceName: appName + '-headless', daemonSetUpdateStrategy: 'RollingUpdate',
    schedule: '0 * * * *', concurrencyPolicy: 'Forbid', restartPolicy: 'OnFailure',
    successfulJobsHistoryLimit: 3, failedJobsHistoryLimit: 1, activeDeadlineSeconds: '',
    nodeSelector: [], tolerations: [], labels: [], annotations: [],
    podLabels: [], podAnnotations: [], hostNetwork: false, dnsPolicy: 'ClusterFirst',
  };
};

// ── Network: Service ────────────────────────────────────────────────────────
export interface K8sServiceDef {
  id: string; name: string; namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'Headless';
  port: string; targetPort: string; nodePort: string;
  selectorApp: string; // references workload.appName
  labels: K8sEnv[]; annotations: K8sEnv[];
}

const defaultService = (): K8sServiceDef => ({
  id: uid(), name: 'my-svc', namespace: 'default',
  type: 'ClusterIP', port: '80', targetPort: '80', nodePort: '',
  selectorApp: '',
  labels: [], annotations: [],
});

// ── Network: Ingress ────────────────────────────────────────────────────────
export interface K8sIngressRule {
  id: string; host: string; path: string; pathType: 'Prefix' | 'Exact';
  serviceName: string; servicePort: string;
}

export interface K8sIngressDef {
  id: string; name: string; namespace: string;
  ingressClassName: string; tls: boolean; tlsSecret: string;
  rules: K8sIngressRule[];
  labels: K8sEnv[]; annotations: K8sEnv[];
}

const defaultIngress = (): K8sIngressDef => ({
  id: uid(), name: 'my-ingress', namespace: 'default',
  ingressClassName: 'nginx', tls: false, tlsSecret: '',
  rules: [{ id: uid(), host: 'example.com', path: '/', pathType: 'Prefix', serviceName: '', servicePort: '80' }],
  labels: [], annotations: [],
});

// ── Storage: PVC ────────────────────────────────────────────────────────────
export interface K8sPvcDef {
  id: string; name: string; namespace: string;
  accessMode: K8sAccessMode;
  storage: string; storageClass: string;
  volumeName: string; // Explicitly bind to a PV
  labels: K8sEnv[]; annotations: K8sEnv[];
}

const defaultPvc = (): K8sPvcDef => ({
  id: uid(), name: 'my-pvc', namespace: 'default',
  accessMode: 'ReadWriteOnce', storage: '1Gi', storageClass: '', volumeName: '',
  labels: [], annotations: [],
});

// ── Storage: ConfigMap ───────────────────────────────────────────────────────
export interface K8sConfigMapDef {
  id: string; name: string; namespace: string; data: K8sEnv[];
  labels: K8sEnv[]; annotations: K8sEnv[];
}

const defaultConfigMap = (): K8sConfigMapDef => ({
  id: uid(), name: 'my-config', namespace: 'default', data: [{ key: '', value: '' }],
  labels: [], annotations: [],
});

// ── Storage: PV ─────────────────────────────────────────────────────────────
export interface K8sPvDef {
  id: string; name: string; capacity: string; accessMode: K8sAccessMode; storageClass: string;
  reclaimPolicy: 'Retain' | 'Delete' | 'Recycle';
  sourceType: 'nfs' | 'hostPath' | 'local' | 'csi';
  nfsServer: string; nfsPath: string; hostPath: string;
  csiDriver: string; csiHandle: string;
  labels: K8sEnv[]; annotations: K8sEnv[];
}

export interface K8sStorageClass {
  id: string; name: string;
  provisioner: string; // e.g., kubernetes.io/no-provisioner, rancher.io/local-path
  reclaimPolicy: 'Delete' | 'Retain';
  volumeBindingMode: 'Immediate' | 'WaitForFirstConsumer';
  allowVolumeExpansion: boolean;
  parameters: { id: string; key: string; value: string }[];
  labels: K8sEnv[]; annotations: K8sEnv[];
}

const defaultPv = (): K8sPvDef => ({
  id: uid(), name: 'my-pv',
  capacity: '10Gi', accessMode: 'ReadWriteOnce', reclaimPolicy: 'Retain',
  storageClass: 'standard', sourceType: 'hostPath',
  hostPath: '/mnt/data', nfsServer: '10.0.0.1', nfsPath: '/export/pv1',
  csiDriver: 'hostpath.csi.k8s.io', csiHandle: 'vol-12345',
  labels: [], annotations: [],
});

const defaultStorageClass = (): K8sStorageClass => ({
  id: uid(), name: 'standard', provisioner: 'k8s.io/minikube-hostpath',
  reclaimPolicy: 'Delete', volumeBindingMode: 'Immediate', allowVolumeExpansion: true,
  parameters: [], labels: [], annotations: [],
});

// ── Storage: Secret ──────────────────────────────────────────────────────────
export interface K8sSecretDef {
  id: string; name: string; namespace: string; secretType: string; data: K8sEnv[];
  labels: K8sEnv[]; annotations: K8sEnv[];
}

const defaultSecret = (): K8sSecretDef => ({
  id: uid(), name: 'my-secret', namespace: 'default', secretType: 'Opaque', data: [{ key: '', value: '' }],
  labels: [], annotations: [],
});

// ── State ────────────────────────────────────────────────────────────────────
export interface KubernetesState {
  globalNamespace: string;
  workloads: K8sWorkload[];
  services: K8sServiceDef[];
  ingresses: K8sIngressDef[];
  pvcs: K8sPvcDef[];
  configMaps: K8sConfigMapDef[];
  secrets: K8sSecretDef[];
  pvs: K8sPvDef[];
  storageClasses: K8sStorageClass[];

  activeSection: K8sSection;
  activeWorkloadId: string | null;
  activeServiceId: string | null;
  activeIngressId: string | null;
  activePvcId: string | null;
  activeConfigMapId: string | null;
  activeSecretId: string | null;
  activePvId: string | null;
  activeStorageClassId: string | null;

  // UI
  setSection: (s: K8sSection) => void;
  setNamespace: (ns: string) => void;
  setActiveWorkloadId: (id: string | null) => void;
  setActiveServiceId: (id: string | null) => void;
  setActiveIngressId: (id: string | null) => void;
  setActivePvcId: (id: string | null) => void;
  setActiveConfigMapId: (id: string | null) => void;
  setActiveSecretId: (id: string | null) => void;
  setActivePvId: (id: string | null) => void;
  setActiveStorageClassId: (id: string | null) => void;

  // Workload CRUD
  addWorkload: () => void;
  removeWorkload: (id: string) => void;
  updateWorkload: (id: string, patch: Partial<K8sWorkload>) => void;
  
  // Container CRUD
  addContainer: (workloadId: string, isInit: boolean) => void;
  removeContainer: (workloadId: string, containerId: string, isInit: boolean) => void;
  updateContainer: (workloadId: string, containerId: string, isInit: boolean, patch: Partial<K8sContainer>) => void;
  updateContainerProbe: (workloadId: string, containerId: string, isInit: boolean, pk: 'livenessProbe' | 'readinessProbe' | 'startupProbe', field: keyof K8sProbe, value: any) => void;
  addContainerEnv: (workloadId: string, containerId: string, isInit: boolean) => void;
  removeContainerEnv: (workloadId: string, containerId: string, isInit: boolean, idx: number) => void;
  updateContainerEnv: (workloadId: string, containerId: string, isInit: boolean, idx: number, patch: Partial<K8sWorkloadEnv>) => void;
  addContainerEnvFrom: (workloadId: string, containerId: string, isInit: boolean) => void;
  removeContainerEnvFrom: (workloadId: string, containerId: string, isInit: boolean, idx: number) => void;
  updateContainerEnvFrom: (workloadId: string, containerId: string, isInit: boolean, idx: number, patch: Partial<K8sEnvFrom>) => void;
  addContainerVol: (workloadId: string, containerId: string, isInit: boolean) => void;
  removeContainerVol: (workloadId: string, containerId: string, isInit: boolean, volId: string) => void;
  updateContainerVol: (workloadId: string, containerId: string, isInit: boolean, volId: string, patch: Partial<K8sVolumeMount>) => void;

  // Workload Resource CRUD (Pod level)
  addWorkloadNS: (id: string) => void;
  removeWorkloadNS: (id: string, idx: number) => void;
  updateWorkloadNS: (id: string, idx: number, field: 'key' | 'value', value: string) => void;
  addWorkloadTol: (id: string) => void;
  removeWorkloadTol: (id: string, idx: number) => void;
  updateWorkloadTol: (id: string, idx: number, patch: Partial<K8sToleration>) => void;

  // Service CRUD
  addService: () => void;
  removeService: (id: string) => void;
  updateService: (id: string, patch: Partial<K8sServiceDef>) => void;

  // Ingress CRUD
  addIngress: () => void;
  removeIngress: (id: string) => void;
  updateIngress: (id: string, patch: Partial<K8sIngressDef>) => void;
  addIngressRule: (ingressId: string) => void;
  removeIngressRule: (ingressId: string, ruleId: string) => void;
  updateIngressRule: (ingressId: string, ruleId: string, patch: Partial<K8sIngressRule>) => void;

  // PVC CRUD
  addPvc: () => void;
  removePvc: (id: string) => void;
  updatePvc: (id: string, patch: Partial<K8sPvcDef>) => void;

  // ConfigMap CRUD
  addConfigMap: () => void;
  removeConfigMap: (id: string) => void;
  updateConfigMap: (id: string, patch: Partial<K8sConfigMapDef>) => void;
  addConfigMapData: (id: string) => void;
  removeConfigMapData: (id: string, idx: number) => void;
  updateConfigMapData: (id: string, idx: number, field: 'key' | 'value', value: string) => void;

  // Secret CRUD
  addSecret: () => void;
  removeSecret: (id: string) => void;
  updateSecret: (id: string, patch: Partial<K8sSecretDef>) => void;
  addSecretData: (id: string) => void;
  removeSecretData: (id: string, idx: number) => void;
  updateSecretData: (id: string, idx: number, field: 'key' | 'value', value: string) => void;

  // PV CRUD
  addPv: () => void;
  removePv: (id: string) => void;
  updatePv: (id: string, patch: Partial<K8sPvDef>) => void;

  // StorageClass CRUD
  addStorageClass: () => void;
  removeStorageClass: (id: string) => void;
  updateStorageClass: (id: string, patch: Partial<K8sStorageClass>) => void;
  addStorageClassParam: (id: string) => void;
  removeStorageClassParam: (id: string, idx: number) => void;
  updateStorageClassParam: (id: string, idx: number, field: 'key' | 'value', value: string) => void;
  batchLoadResources: (patch: { 
    workloads?: K8sWorkload[], 
    services?: K8sServiceDef[], 
    ingresses?: K8sIngressDef[], 
    pvcs?: K8sPvcDef[], 
    configMaps?: K8sConfigMapDef[], 
    secrets?: K8sSecretDef[], 
    pvs?: K8sPvDef[] 
  }) => void;
  reset: () => void;
}

// ── Store ────────────────────────────────────────────────────────────────────
const firstWorkload = defaultWorkload();

export const useKubernetesStore = create<KubernetesState>()((set) => ({
  globalNamespace: 'default',
  workloads: [firstWorkload],
  services: [], ingresses: [], pvcs: [], configMaps: [], secrets: [], pvs: [], storageClasses: [],

  activeSection: 'workload',
  activeWorkloadId: firstWorkload.id,
  activeServiceId: null, activeIngressId: null,
  activePvcId: null, activeConfigMapId: null, activeSecretId: null, activePvId: null, activeStorageClassId: null,

  setSection: (s: K8sSection) => set({ activeSection: s }),
  setNamespace: (ns: string) => set({ globalNamespace: ns }),
  setActiveWorkloadId: (id: string | null) => set({ activeWorkloadId: id }),
  setActiveServiceId: (id: string | null) => set({ activeServiceId: id }),
  setActiveIngressId: (id: string | null) => set({ activeIngressId: id }),
  setActivePvcId: (id: string | null) => set({ activePvcId: id }),
  setActiveConfigMapId: (id: string | null) => set({ activeConfigMapId: id }),
  setActiveSecretId: (id: string | null) => set({ activeSecretId: id }),
  setActivePvId: (id: string | null) => set({ activePvId: id }),
  setActiveStorageClassId: (id: string | null) => set({ activeStorageClassId: id }),

  // ── Workload ──
  addWorkload: () => set((s) => { const w = defaultWorkload(); return { workloads: [...s.workloads, w], activeWorkloadId: w.id }; }),
  removeWorkload: (id: string) => set((s) => ({ workloads: s.workloads.filter(w => w.id !== id), activeWorkloadId: s.activeWorkloadId === id ? (s.workloads[0]?.id ?? null) : s.activeWorkloadId })),
  updateWorkload: (id: string, patch: Partial<K8sWorkload>) => set((s) => ({ workloads: s.workloads.map(w => w.id === id ? { ...w, ...patch } : w) })),
  
  // ── Container CRUD ──
  addContainer: (wid: string, isInit: boolean) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const newList = isInit ? [...w.initContainers, defaultContainer(`init-${w.initContainers.length + 1}`)] : [...w.containers, defaultContainer(`container-${w.containers.length + 1}`)];
      return isInit ? { ...w, initContainers: newList } : { ...w, containers: newList };
    })
  })),
  removeContainer: (wid: string, cid: string, isInit: boolean) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      const filtered = w[key].filter(c => c.id !== cid);
      if (filtered.length === 0 && !isInit) return w; // Keep at least one main container
      return { ...w, [key]: filtered };
    })
  })),
  updateContainer: (wid: string, cid: string, isInit: boolean, patch: Partial<K8sContainer>) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, ...patch } : c) };
    })
  })),
  updateContainerProbe: (wid: string, cid: string, isInit: boolean, pk: 'livenessProbe' | 'readinessProbe' | 'startupProbe', field: keyof K8sProbe, value: any) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, [pk]: { ...(c[pk] as K8sProbe), [field]: value } } : c) };
    })
  })),
  addContainerEnv: (wid: string, cid: string, isInit: boolean) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, envs: [...c.envs, { id: uid(), name: '', type: 'value', value: '', refName: '', refKey: '', optional: false }] } : c) };
    })
  })),
  removeContainerEnv: (wid: string, cid: string, isInit: boolean, idx: number) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, envs: c.envs.filter((_, i) => i !== idx) } : c) };
    })
  })),
  updateContainerEnv: (wid: string, cid: string, isInit: boolean, idx: number, patch: Partial<K8sWorkloadEnv>) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, envs: c.envs.map((e, i) => i === idx ? { ...e, ...patch } : e) } : c) };
    })
  })),
  addContainerEnvFrom: (wid: string, cid: string, isInit: boolean) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, envFrom: [...(c.envFrom || []), { id: uid(), type: 'configMap', name: '', prefix: '' }] } : c) };
    })
  })),
  removeContainerEnvFrom: (wid: string, cid: string, isInit: boolean, idx: number) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, envFrom: (c.envFrom || []).filter((_, i) => i !== idx) } : c) };
    })
  })),
  updateContainerEnvFrom: (wid: string, cid: string, isInit: boolean, idx: number, patch: Partial<K8sEnvFrom>) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, envFrom: (c.envFrom || []).map((e, i) => i === idx ? { ...e, ...patch } : e) } : c) };
    })
  })),
  addContainerVol: (wid: string, cid: string, isInit: boolean) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, volumeMounts: [...c.volumeMounts, { id: uid(), name: '', mountPath: '', subPath: '', readOnly: false, sourceType: 'emptyDir', hostPathValue: '', resourceRef: '' }] } : c) };
    })
  })),
  removeContainerVol: (wid: string, cid: string, isInit: boolean, volId: string) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, volumeMounts: c.volumeMounts.filter(v => v.id !== volId) } : c) };
    })
  })),
  updateContainerVol: (wid: string, cid: string, isInit: boolean, volId: string, patch: Partial<K8sVolumeMount>) => set((s) => ({
    workloads: s.workloads.map(w => {
      if (w.id !== wid) return w;
      const key = isInit ? 'initContainers' : 'containers';
      return { ...w, [key]: w[key].map(c => c.id === cid ? { ...c, volumeMounts: c.volumeMounts.map(v => v.id === volId ? { ...v, ...patch } : v) } : c) };
    })
  })),

  // ── Pod-level Resource CRUD ──
  addWorkloadNS: (id: string) => set((s) => ({ workloads: s.workloads.map(w => w.id === id ? { ...w, nodeSelector: [...w.nodeSelector, { key: '', value: '' }] } : w) })),
  removeWorkloadNS: (id: string, idx: number) => set((s) => ({ workloads: s.workloads.map(w => w.id === id ? { ...w, nodeSelector: w.nodeSelector.filter((_, i) => i !== idx) } : w) })),
  updateWorkloadNS: (id: string, idx: number, field: 'key' | 'value', value: string) => set((s) => ({ workloads: s.workloads.map(w => w.id === id ? { ...w, nodeSelector: w.nodeSelector.map((e, i) => i === idx ? { ...e, [field]: value } : e) } : w) })),
  addWorkloadTol: (id: string) => set((s) => ({ workloads: s.workloads.map(w => w.id === id ? { ...w, tolerations: [...w.tolerations, { key: '', operator: 'Equal', value: '', effect: '' }] } : w) })),
  removeWorkloadTol: (id: string, idx: number) => set((s) => ({ workloads: s.workloads.map(w => w.id === id ? { ...w, tolerations: w.tolerations.filter((_, i) => i !== idx) } : w) })),
  updateWorkloadTol: (id: string, idx: number, patch: Partial<K8sToleration>) => set((s) => ({ workloads: s.workloads.map(w => w.id === id ? { ...w, tolerations: w.tolerations.map((t, i) => i === idx ? { ...t, ...patch } : t) } : w) })),

  // ── Service ──
  addService: () => set((s) => { const svc = defaultService(); return { services: [...s.services, svc], activeServiceId: svc.id }; }),
  removeService: (id: string) => set((s) => ({ services: s.services.filter(v => v.id !== id), activeServiceId: s.activeServiceId === id ? null : s.activeServiceId })),
  updateService: (id: string, patch: Partial<K8sServiceDef>) => set((s) => ({ services: s.services.map(v => v.id === id ? { ...v, ...patch } : v) })),

  // ── Ingress ──
  addIngress: () => set((s) => { const ing = defaultIngress(); return { ingresses: [...s.ingresses, ing], activeIngressId: ing.id }; }),
  removeIngress: (id: string) => set((s) => ({ ingresses: s.ingresses.filter(v => v.id !== id), activeIngressId: s.activeIngressId === id ? null : s.activeIngressId })),
  updateIngress: (id: string, patch: Partial<K8sIngressDef>) => set((s) => ({ ingresses: s.ingresses.map(v => v.id === id ? { ...v, ...patch } : v) })),
  addIngressRule: (ingressId: string) => set((s) => ({ ingresses: s.ingresses.map(ing => ing.id === ingressId ? { ...ing, rules: [...ing.rules, { id: uid(), host: '', path: '/', pathType: 'Prefix', serviceName: '', servicePort: '80' }] } : ing) })),
  removeIngressRule: (ingressId: string, ruleId: string) => set((s) => ({ ingresses: s.ingresses.map(ing => ing.id === ingressId ? { ...ing, rules: ing.rules.filter(r => r.id !== ruleId) } : ing) })),
  updateIngressRule: (ingressId: string, ruleId: string, patch: Partial<K8sIngressRule>) => set((s) => ({ ingresses: s.ingresses.map(ing => ing.id === ingressId ? { ...ing, rules: ing.rules.map(r => r.id === ruleId ? { ...r, ...patch } : r) } : ing) })),

  // ── PVC ──
  addPvc: () => set((s) => { const p = defaultPvc(); return { pvcs: [...s.pvcs, p], activePvcId: p.id }; }),
  removePvc: (id: string) => set((s) => ({ pvcs: s.pvcs.filter(v => v.id !== id), activePvcId: s.activePvcId === id ? null : s.activePvcId })),
  updatePvc: (id: string, patch: Partial<K8sPvcDef>) => set((s) => ({ pvcs: s.pvcs.map(v => v.id === id ? { ...v, ...patch } : v) })),

  // ── ConfigMap ──
  addConfigMap: () => set((s) => { const c = defaultConfigMap(); return { configMaps: [...s.configMaps, c], activeConfigMapId: c.id }; }),
  removeConfigMap: (id: string) => set((s) => ({ configMaps: s.configMaps.filter(v => v.id !== id), activeConfigMapId: s.activeConfigMapId === id ? null : s.activeConfigMapId })),
  updateConfigMap: (id: string, patch: Partial<K8sConfigMapDef>) => set((s) => ({ configMaps: s.configMaps.map(v => v.id === id ? { ...v, ...patch } : v) })),
  addConfigMapData: (id: string) => set((s) => ({ configMaps: s.configMaps.map(v => v.id === id ? { ...v, data: [...v.data, { key: '', value: '' }] } : v) })),
  removeConfigMapData: (id: string, idx: number) => set((s) => ({ configMaps: s.configMaps.map(v => v.id === id ? { ...v, data: v.data.filter((_, i) => i !== idx) } : v) })),
  updateConfigMapData: (id: string, idx: number, field: 'key' | 'value', value: string) => set((s) => ({ configMaps: s.configMaps.map(v => v.id === id ? { ...v, data: v.data.map((d, i) => i === idx ? { ...d, [field]: value } : d) } : v) })),

  // ── Secret ──
  addSecret: () => set((s) => { const sec = defaultSecret(); return { secrets: [...s.secrets, sec], activeSecretId: sec.id }; }),
  removeSecret: (id: string) => set((s) => ({ secrets: s.secrets.filter(v => v.id !== id), activeSecretId: s.activeSecretId === id ? null : s.activeSecretId })),
  updateSecret: (id: string, patch: Partial<K8sSecretDef>) => set((s) => ({ secrets: s.secrets.map(v => v.id === id ? { ...v, ...patch } : v) })),
  addSecretData: (id: string) => set((s) => ({ secrets: s.secrets.map(v => v.id === id ? { ...v, data: [...v.data, { key: '', value: '' }] } : v) })),
  removeSecretData: (id: string, idx: number) => set((s) => ({ secrets: s.secrets.map(v => v.id === id ? { ...v, data: v.data.filter((_, i) => i !== idx) } : v) })),
  updateSecretData: (id: string, idx: number, field: 'key' | 'value', value: string) => set((s) => ({ secrets: s.secrets.map(v => v.id === id ? { ...v, data: v.data.map((d, i) => i === idx ? { ...d, [field]: value } : d) } : v) })),

  // ── PV ──
  addPv: () => set((s) => { const pv = defaultPv(); return { pvs: [...s.pvs, pv], activePvId: pv.id }; }),
  removePv: (id: string) => set((s) => ({ pvs: s.pvs.filter(p => p.id !== id), activePvId: s.activePvId === id ? null : s.activePvId })),
  updatePv: (id: string, patch: Partial<K8sPvDef>) => set((s) => ({ pvs: s.pvs.map(p => p.id === id ? { ...p, ...patch } : p) })),

  // ── StorageClass ──
  addStorageClass: () => set((s) => { const sc = defaultStorageClass(); return { storageClasses: [...s.storageClasses, sc], activeStorageClassId: sc.id }; }),
  removeStorageClass: (id: string) => set((s) => ({ storageClasses: s.storageClasses.filter(v => v.id !== id), activeStorageClassId: s.activeStorageClassId === id ? null : s.activeStorageClassId })),
  updateStorageClass: (id: string, patch: Partial<K8sStorageClass>) => set((s) => ({ storageClasses: s.storageClasses.map(v => v.id === id ? { ...v, ...patch } : v) })),
  addStorageClassParam: (id: string) => set((s) => {
    return { storageClasses: s.storageClasses.map(v => v.id === id ? { ...v, parameters: [...v.parameters, { id: uid(), key: '', value: '' }] } : v) };
  }),
  removeStorageClassParam: (id: string, idx: number) => set((s) => ({ storageClasses: s.storageClasses.map(v => v.id === id ? { ...v, parameters: v.parameters.filter((_, i) => i !== idx) } : v) })),
  updateStorageClassParam: (id: string, idx: number, field: 'key' | 'value', value: string) => set((s) => ({ storageClasses: s.storageClasses.map(v => v.id === id ? { ...v, parameters: v.parameters.map((p, i) => i === idx ? { ...p, [field]: value } : p) } : v) })),
  batchLoadResources: (patch) => set((s) => ({
    workloads: [...s.workloads, ...(patch.workloads || [])],
    services: [...s.services, ...(patch.services || [])],
    ingresses: [...s.ingresses, ...(patch.ingresses || [])],
    pvcs: [...s.pvcs, ...(patch.pvcs || [])],
    configMaps: [...s.configMaps, ...(patch.configMaps || [])],
    secrets: [...s.secrets, ...(patch.secrets || [])],
    pvs: [...s.pvs, ...(patch.pvs || [])],
    activeWorkloadId: patch.workloads?.[0]?.id ?? s.activeWorkloadId,
  })),
  reset: () => set({
    workloads: [],
    services: [],
    ingresses: [],
    pvcs: [],
    configMaps: [],
    secrets: [],
    pvs: [],
    storageClasses: [],
    globalNamespace: 'default',
    activeSection: 'workload',
    activeWorkloadId: null,
    activeServiceId: null,
    activeIngressId: null,
    activePvcId: null,
    activeConfigMapId: null,
    activeSecretId: null,
    activePvId: null,
    activeStorageClassId: null,
  }),
}));
