import yaml from 'js-yaml';
import { 
  K8sWorkload, K8sServiceDef, K8sIngressDef, K8sPvcDef, 
  K8sConfigMapDef, K8sSecretDef, WorkloadType, uid 
} from '@/store/useKubernetesStore';

export function parseKubernetesYaml(yamlStr: string) {
  const docs = yaml.loadAll(yamlStr) as any[];
  
  const workloads: K8sWorkload[] = [];
  const services: K8sServiceDef[] = [];
  const ingresses: K8sIngressDef[] = [];
  const pvcs: K8sPvcDef[] = [];
  const configMaps: K8sConfigMapDef[] = [];
  const secrets: K8sSecretDef[] = [];

  docs.forEach(doc => {
    if (!doc || !doc.kind) return;

    const kind = doc.kind;
    const metadata = doc.metadata || {};
    const spec = doc.spec || {};

    // Helper to map labels/ans
    const mapToEnv = (obj: any) => Object.entries(obj || {}).map(([key, value]) => ({ key, value: String(value) }));

    if (['Deployment', 'StatefulSet', 'DaemonSet', 'CronJob', 'Job'].includes(kind)) {
      const workloadType = kind as WorkloadType;
      const podSpec = kind === 'CronJob' ? spec.jobTemplate?.spec?.template?.spec : (kind === 'Job' ? spec.template?.spec : spec.template?.spec);
      const podMeta = kind === 'CronJob' ? spec.jobTemplate?.spec?.template?.metadata : (kind === 'Job' ? spec.template?.metadata : spec.template?.metadata);

      if (!podSpec) return;

      const workload: K8sWorkload = {
        id: uid(),
        workloadType,
        appName: metadata.name || 'unnamed',
        namespace: metadata.namespace || 'default',
        replicas: spec.replicas || 1,
        containers: (podSpec.containers || []).map((c: any) => ({
          id: uid(),
          name: c.name,
          image: c.image || '',
          containerPort: (c.ports?.[0]?.containerPort || '80').toString(),
          imagePullPolicy: c.imagePullPolicy || 'IfNotPresent',
          command: Array.isArray(c.command) ? c.command.join(' ') : (c.command || ''),
          args: Array.isArray(c.args) ? c.args.join(' ') : (c.args || ''),
          cpuReq: c.resources?.requests?.cpu || '100m',
          cpuLimit: c.resources?.limits?.cpu || '500m',
          memReq: c.resources?.requests?.memory || '128Mi',
          memLimit: c.resources?.limits?.memory || '512Mi',
          envs: (c.env || []).map((e: any) => ({
             id: uid(), name: e.name, type: e.valueFrom ? (e.valueFrom.configMapKeyRef ? 'configMapKeyRef' : 'secretKeyRef') : 'value',
             value: e.value || '', refName: e.valueFrom?.configMapKeyRef?.name || e.valueFrom?.secretKeyRef?.name || '',
             refKey: e.valueFrom?.configMapKeyRef?.key || e.valueFrom?.secretKeyRef?.key || '', optional: false
          })),
          envFrom: (c.envFrom || []).map((ef: any) => ({
             id: uid(), type: ef.configMapRef ? 'configMap' : 'secret', name: ef.configMapRef?.name || ef.secretRef?.name || '', prefix: ef.prefix || ''
          })),
          volumeMounts: (c.volumeMounts || []).map((vm: any) => {
             const vol = podSpec.volumes?.find((v: any) => v.name === vm.name);
             return {
                id: uid(), name: vm.name, mountPath: vm.mountPath, subPath: vm.subPath || '', readOnly: !!vm.readOnly,
                sourceType: vol?.persistentVolumeClaim ? 'pvc' : (vol?.configMap ? 'configMap' : (vol?.secret ? 'secret' : 'emptyDir')),
                resourceRef: vol?.persistentVolumeClaim?.claimName || vol?.configMap?.name || vol?.secret?.name || '',
                hostPathValue: vol?.hostPath?.path || ''
             }
          }),
          // Probes, etc. (skipping for brevity but could be added)
          livenessProbe: { enabled: false, type: 'httpGet', path: '', port: '', command: '', initialDelaySeconds: 0, periodSeconds: 0, timeoutSeconds: 0, successThreshold: 0, failureThreshold: 0 },
          readinessProbe: { enabled: false, type: 'httpGet', path: '', port: '', command: '', initialDelaySeconds: 0, periodSeconds: 0, timeoutSeconds: 0, successThreshold: 0, failureThreshold: 0 },
          startupProbe: { enabled: false, type: 'httpGet', path: '', port: '', command: '', initialDelaySeconds: 0, periodSeconds: 0, timeoutSeconds: 0, successThreshold: 0, failureThreshold: 0 },
        })),
        initContainers: [],
        labels: mapToEnv(metadata.labels),
        annotations: mapToEnv(metadata.annotations),
        podLabels: mapToEnv(podMeta?.labels),
        podAnnotations: mapToEnv(podMeta?.annotations),
        nodeSelector: mapToEnv(podSpec.nodeSelector),
        tolerations: (podSpec.tolerations || []).map((t: any) => ({
           key: t.key || '', operator: t.operator || 'Equal', value: t.value || '', effect: t.effect || ''
        })),
        imagePullSecrets: (podSpec.imagePullSecrets || []).map((s: any) => ({ name: s.name })),
        updateStrategy: spec.strategy?.type || 'RollingUpdate',
        maxSurge: spec.strategy?.rollingUpdate?.maxSurge?.toString() || '1',
        maxUnavailable: spec.strategy?.rollingUpdate?.maxUnavailable?.toString() || '0',
        serviceName: spec.serviceName || '',
        daemonSetUpdateStrategy: spec.updateStrategy?.type || 'RollingUpdate',
        schedule: spec.schedule || '0 * * * *',
        concurrencyPolicy: spec.concurrencyPolicy || 'Forbid',
        restartPolicy: podSpec.restartPolicy || 'OnFailure',
        successfulJobsHistoryLimit: spec.successfulJobsHistoryLimit || 3,
        failedJobsHistoryLimit: spec.failedJobsHistoryLimit || 1,
        activeDeadlineSeconds: (spec.activeDeadlineSeconds || '').toString(),
        hostNetwork: !!podSpec.hostNetwork,
        dnsPolicy: podSpec.dnsPolicy || 'ClusterFirst',
        fsGroup: (podSpec.securityContext?.fsGroup || '').toString(),
      };
      workloads.push(workload);
    }

    if (kind === 'Service') {
      services.push({
        id: uid(), name: metadata.name, namespace: metadata.namespace || 'default',
        type: spec.type || 'ClusterIP', port: (spec.ports?.[0]?.port || '80').toString(),
        targetPort: (spec.ports?.[0]?.targetPort || '80').toString(),
        selectorApp: spec.selector?.app || spec.selector?.['app.kubernetes.io/name'] || '',
        labels: mapToEnv(metadata.labels), annotations: mapToEnv(metadata.annotations)
      });
    }

    if (kind === 'Ingress') {
      ingresses.push({
        id: uid(), name: metadata.name, namespace: metadata.namespace || 'default',
        ingressClassName: spec.ingressClassName || '', tls: !!spec.tls,
        tlsSecret: spec.tls?.[0]?.secretName || '',
        rules: (spec.rules || []).flatMap((r: any) => (r.http?.paths || []).map((p: any) => ({
           id: uid(), host: r.host || '', path: p.path || '/', pathType: p.pathType || 'Prefix',
           serviceName: p.backend?.service?.name || '', servicePort: (p.backend?.service?.port?.number || '80').toString()
        }))),
        labels: mapToEnv(metadata.labels), annotations: mapToEnv(metadata.annotations)
      });
    }

    if (kind === 'PersistentVolumeClaim') {
       pvcs.push({
          id: uid(), name: metadata.name, namespace: metadata.namespace || 'default',
          accessMode: spec.accessModes?.[0] || 'ReadWriteOnce',
          storage: spec.resources?.requests?.storage || '1Gi',
          storageClass: spec.storageClassName || '',
          volumeName: spec.volumeName || '',
          labels: mapToEnv(metadata.labels), annotations: mapToEnv(metadata.annotations)
       });
    }

    if (kind === 'ConfigMap') {
       configMaps.push({
          id: uid(), name: metadata.name, namespace: metadata.namespace || 'default',
          data: Object.entries(doc.data || {}).map(([key, value]) => ({ key, value: String(value) })),
          labels: mapToEnv(metadata.labels), annotations: mapToEnv(metadata.annotations)
       });
    }

    if (kind === 'Secret') {
       secrets.push({
          id: uid(), name: metadata.name, namespace: metadata.namespace || 'default',
          secretType: doc.type || 'Opaque',
          data: Object.entries(doc.data || doc.stringData || {}).map(([key, value]) => ({ key, value: String(value) })),
          labels: mapToEnv(metadata.labels), annotations: mapToEnv(metadata.annotations)
       });
    }
  });

  // Post-process to link relationships correctly
  services.forEach(svc => {
    const rawDoc = docs.find(d => d && d.kind === 'Service' && d.metadata?.name === svc.name);
    const selectorEntries = rawDoc?.spec?.selector || {};
    if (Object.keys(selectorEntries).length > 0) {
      const match = workloads.find(w => {
        return Object.entries(selectorEntries).every(([sk, sv]) => {
           return (w.podLabels || []).some(l => l.key === sk && l.value === String(sv));
        });
      });
      if (match) svc.selectorApp = match.appName;
    }
  });

  return { workloads, services, ingresses, pvcs, configMaps, secrets };
}
