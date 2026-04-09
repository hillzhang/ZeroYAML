import { TemplateType } from '@/store/useTemplateStore';

// ================= Formatter helpers =================
export const formatCmd = (cmdStr: string, defaultCmd: string, useShell?: boolean) => {
  if (!cmdStr.trim()) return defaultCmd;
  let finalStr = cmdStr;
  if (useShell) {
    const parts = ["sh", "-ec", finalStr];
    return `[${parts.map(p => `"${p.replace(/"/g, '\\"')}"`).join(', ')}]`;
  }
  const parts = finalStr.split(' ').filter(Boolean).map(s => `"${s.replace(/"/g, '\\"')}"`);
  return `[${parts.join(', ')}]`;
};

// ================= Dockerfile Generator =================
export function generateDockerfile(state: any, t: any) {
  const {
    baseImage, workdir, port, startCmd, entrypoint, envVars, volumes, user,
    healthcheck, args, labels, runCmds, copyAddItems, useShellWrapper
  } = state;

  if (!baseImage && !workdir && !port && !startCmd && envVars.length === 0 && runCmds.length === 0 && copyAddItems.length === 0) {
    return `# ${t.comments.dockerfileEmpty}`;
  }

  const formatVolumes = () => {
    const validVols = volumes.filter(Boolean);
    if (validVols.length === 0) return '';
    return `\n# ${t.comments.volumeNotice}\nVOLUME [${validVols.map((v: string) => `"${v}"`).join(', ')}]`;
  };

  const formatArgs = () => {
    const validArgs = args.filter((a: any) => a.key.trim());
    if (validArgs.length === 0) return '';
    return `\n# ${t.comments.argNotice}\n${validArgs.map((a: any) => `ARG ${a.key}${a.value ? `=${a.value}` : ''}`).join('\n')}`;
  };

  const formatLabels = () => {
    const validLabels = labels.filter((l: any) => l.key.trim());
    if (validLabels.length === 0) return '';
    return `\n# ${t.comments.labelNotice}\n${validLabels.map((l: any) => `LABEL ${l.key}="${l.value}"`).join('\n')}`;
  };

  const formatRunCmds = () => {
    const validRuns = runCmds.filter(Boolean);
    if (!validRuns.length) return '';
    return `\n# ${t.comments.runNotice}\n${validRuns.map((cmd: string) => {
      const indentedCmd = cmd
        .split('\n')
        .map((line, idx) => (idx === 0 ? line : `    ${line.trimStart()}`))
        .join('\n');
      return `RUN ${indentedCmd}`;
    }).join('\n')}`;
  };

  const formatCopyAdd = () => {
    const validItems = copyAddItems.filter((item: any) => item.src.trim() && item.dest.trim());
    if (validItems.length === 0) return '';
    return `\n# ${t.comments.copyAddNotice}\n${validItems.map((item: any) => {
      let fromArg = '';
      let chownArg = '';
      if (item.type === 'COPY' && item.from && item.from.trim() !== '') {
        const val = item.from.trim().replace(/^--from=/, '');
        fromArg = `--from=${val} `;
      }
      if (item.chown && item.chown.trim() !== '') {
        const val = item.chown.trim().replace(/^--chown=/, '');
        chownArg = `--chown=${val} `;
      }
      return `${item.type} ${chownArg}${fromArg}${item.src} ${item.dest}`;
    }).join('\n')}`;
  };

  const formatHealthCheck = () => {
    if (!healthcheck || !healthcheck.trim()) return '';
    const cmdStr = healthcheck.startsWith('CMD') ? healthcheck : `CMD ${healthcheck}`;
    return `\n\n# ${t.comments.healthcheckNotice}\nHEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\\n  ${cmdStr}`;
  };

  const formatEnvVars = () => {
    return envVars
      .filter((env: any) => env.key.trim())
      .map((env: any) => `ENV ${env.key}="${env.value.replace(/"/g, '\\"')}"`)
      .join('\n');
  };

  const formatUser = (defaultUser?: string) => {
    const targetUser = user || defaultUser;
    if (!targetUser) return '';
    return `\n# ${t.comments.userExplain}\nUSER ${targetUser}`;
  };

  const renderStartCommands = () => {
    let result = '';
    const entry = (entrypoint || '').trim();
    const cmd = (startCmd || '').trim();

    if (useShellWrapper) {
      if (entry && cmd) {
        result += `\nENTRYPOINT ["sh", "-ec"]\nCMD ["${entry.replace(/"/g, '\\"')} ${cmd.replace(/"/g, '\\"')}"]`;
      } else if (entry) {
        result += `\nENTRYPOINT ["sh", "-ec", "${entry.replace(/"/g, '\\"')}"]`;
      } else if (cmd) {
        result += `\nCMD ["sh", "-ec", "${cmd.replace(/"/g, '\\"')}"]`;
      }
    } else {
      if (entry) {
        result += `\nENTRYPOINT ${formatCmd(entry, '[]', false)}\n`;
      }
      if (cmd) {
        result += `${!entry ? '\n' : ''}CMD ${formatCmd(cmd, '[]', false)}`;
      }
    }
    return result.trim();
  };

  // Node.js
  if (baseImage === "node:20-alpine") {
    const targetUser = user || "node";
    const chownFlag = targetUser !== "root" ? `--chown=${targetUser}:${targetUser} ` : "";
    return `# =========================================\n# ${t.comments.nodeBestPractice}\n# =========================================\n\n# ${t.comments.builderStage}\nFROM node:20-alpine AS builder\n${formatArgs()}\nWORKDIR ${workdir || '/app'}\nCOPY package*.json ./\nRUN npm ci # ${t.comments.npmCi}\nCOPY . .\nRUN npm run build # ${t.comments.npmBuild}\n\n# ${t.comments.runnerStage}\nFROM node:20-alpine AS runner\n${formatLabels()}\nWORKDIR ${workdir || '/app'}\n${formatEnvVars()}\n${formatRunCmds()}\n# ${t.comments.copyProduction}\nCOPY ${chownFlag}--from=builder ${workdir || '/app'}/package*.json ./\nCOPY ${chownFlag}--from=builder ${workdir || '/app'}/node_modules ./node_modules\nCOPY ${chownFlag}--from=builder ${workdir || '/app'}/. .${formatCopyAdd()}${formatVolumes()}\n\n# ${t.comments.portNotice}\nEXPOSE ${port || '3000'}${formatHealthCheck()}\n\n# ${t.comments.userNotice}\n${formatUser('node')}\n\n${renderStartCommands() || 'CMD ["npm", "start"]'}`;
  }

  // Generic
  let dockerfile = `FROM ${baseImage || 'alpine:latest'}\n`;
  const argsStr = formatArgs(); if (argsStr) dockerfile += argsStr + '\n';
  const labelsStr = formatLabels(); if (labelsStr) dockerfile += labelsStr + '\n';
  if (workdir) dockerfile += `WORKDIR ${workdir}\n`;
  const envsStr = formatEnvVars(); if (envsStr) dockerfile += envsStr + '\n';
  const runsStr = formatRunCmds(); if (runsStr) dockerfile += runsStr + '\n';
  const copyAddStr = formatCopyAdd(); if (copyAddStr) dockerfile += copyAddStr;
  const volumesStr = formatVolumes(); if (volumesStr) dockerfile += `\n` + volumesStr;
  if (port) dockerfile += `\nEXPOSE ${port}`;
  const healthStr = formatHealthCheck(); if (healthStr) dockerfile += healthStr;
  const userStr = formatUser(); if (userStr) dockerfile += userStr;
  const cmdsStr = renderStartCommands();
  if (cmdsStr) dockerfile += `\n\n${cmdsStr}`;

  return dockerfile.trim();
}

// ================= Docker Compose Generator =================
export function generateCompose(state: any, t: any) {
  const { composeServices, composeAddons, composeVersion, networkName, useSharedNetwork } = state;

  if (composeServices.length === 0 && !composeAddons.redis && !composeAddons.postgres && !composeAddons.mysql) {
    return `# ${t.comments.composeEmpty}`;
  }

  let yaml = composeVersion !== 'none' ? `version: '${composeVersion}'\n\n` : ``;
  const netName = (networkName || 'app-net').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  yaml += `services:\n`;

  composeServices.forEach((svc: any, index: number) => {
    const safeName = (svc.name || `service-${index + 1}`).trim().replace(/[^a-zA-Z0-9_-]/g, '-');
    yaml += `  ${safeName}:\n`;
    if (svc.buildMode === 'build') {
      yaml += `    build:\n      context: ${svc.context || '.'}\n      dockerfile: ${svc.dockerfile || 'Dockerfile'}\n`;
      yaml += `    container_name: ${safeName}-container\n`;
    } else {
      yaml += `    image: ${svc.image || 'alpine:latest'}\n`;
      yaml += `    container_name: ${safeName}-container\n`;
    }
    yaml += `    restart: ${svc.restart}\n`;

    if (svc.ports?.length > 0) {
      yaml += `    ports:\n`;
      svc.ports.filter((p: any) => p.container.trim()).forEach((p: any) => {
        const hostPart = p.host.trim() ? `${p.host.trim()}:` : '';
        yaml += `      - "${hostPart}${p.container.trim()}"\n`;
      });
    }

    if (svc.envs?.length > 0) {
      yaml += `    environment:\n`;
      svc.envs.filter((e: any) => e.key.trim()).forEach((e: any) => yaml += `      - ${e.key}=${e.value}\n`);
    }
    
    if (svc.vols?.length > 0) {
      yaml += `    volumes:\n`;
      svc.vols.filter((v: any) => v.host.trim() && v.container.trim()).forEach((v: any) => yaml += `      - ${v.host}:${v.container}\n`);
    }

    if (svc.useShellWrapper) {
      const cmd = (svc.command || '').trim();
      const entry = (svc.entrypoint || '').trim();
      if (entry && cmd) {
        yaml += `    entrypoint: ["sh", "-ec"]\n    command: ["${entry.replace(/"/g, '\\"')} ${cmd.replace(/"/g, '\\"')}"]\n`;
      } else if (entry) {
        yaml += `    entrypoint: ["sh", "-ec", "${entry.replace(/"/g, '\\"')}"]\n`;
      } else if (cmd) {
        yaml += `    command: ["sh", "-ec", "${cmd.replace(/"/g, '\\"')}"]\n`;
      }
    } else {
      if (svc.entrypoint?.trim()) yaml += `    entrypoint: ${svc.entrypoint.trim()}\n`;
      if (svc.command?.trim()) yaml += `    command: ${svc.command.trim()}\n`;
    }

    if (svc.user?.trim()) yaml += `    user: "${svc.user.trim()}"\n`;
    if (svc.privileged) yaml += `    privileged: true\n`;
    if (svc.tty) yaml += `    tty: true\n`;
    if (svc.stdinOpen) yaml += `    stdin_open: true\n`;
    if (svc.pid?.trim()) yaml += `    pid: "${svc.pid.trim()}"\n`;
    if (svc.shmSize?.trim()) yaml += `    shm_size: "${svc.shmSize.trim()}"\n`;
    
    if (svc.extraHosts?.length > 0) {
       yaml += `    extra_hosts:\n`;
       svc.extraHosts.filter((h: any) => h.host.trim() && h.ip.trim()).forEach((h: any) => yaml += `      - "${h.host}:${h.ip}"\n`);
    }

    if (svc.networkMode === "host" || svc.networkMode === "none") {
      yaml += `    network_mode: "${svc.networkMode}"\n`;
    } else if (useSharedNetwork) {
      yaml += `    networks:\n      - ${netName}\n`;
    }

    // Depends on
    const deps: string[] = [];
    if (index === 0) {
      if (composeAddons.redis) deps.push('redis');
      if (composeAddons.postgres) deps.push('postgres');
      if (composeAddons.mysql) deps.push('mysql');
    }
    if (svc.dependsOn?.length > 0) {
      svc.dependsOn.forEach((depId: string) => {
        const dIdx = composeServices.findIndex((s: any) => s.id === depId);
        if (dIdx !== -1) deps.push(composeServices[dIdx].name || `service-${dIdx+1}`);
      });
    }
    if (deps.length > 0) {
      yaml += `    depends_on:\n`;
      deps.forEach(d => yaml += `      - ${d}\n`);
    }
  });

  // Addons
  if (composeAddons.redis) {
     yaml += `\n  redis:\n    image: redis:7-alpine\n    container_name: redis-cache\n    restart: always\n    ports:\n      - "6379:6379"\n`;
     if (useSharedNetwork) yaml += `    networks:\n      - ${netName}\n`;
     yaml += `    volumes:\n      - redis_data:/data\n`;
  }
  if (composeAddons.postgres) {
     yaml += `\n  postgres:\n    image: postgres:15-alpine\n    container_name: postgres-db\n    restart: always\n    environment:\n      - POSTGRES_USER=myuser\n      - POSTGRES_PASSWORD=mypassword\n      - POSTGRES_DB=mydb\n    ports:\n      - "5432:5432"\n`;
     if (useSharedNetwork) yaml += `    networks:\n      - ${netName}\n`;
     yaml += `    volumes:\n      - postgres_data:/var/lib/postgresql/data\n`;
  }
  if (composeAddons.mysql) {
     yaml += `\n  mysql:\n    image: mysql:8.0\n    container_name: mysql-db\n    restart: always\n    environment:\n      - MYSQL_ROOT_PASSWORD=rootpass\n      - MYSQL_DATABASE=mydb\n      - MYSQL_USER=myuser\n      - MYSQL_PASSWORD=mypassword\n    ports:\n      - "3306:3306"\n`;
     if (useSharedNetwork) yaml += `    networks:\n      - ${netName}\n`;
     yaml += `    volumes:\n      - mysql_data:/var/lib/mysql\n`;
  }

  if (composeAddons.redis || composeAddons.postgres || composeAddons.mysql) {
    yaml += `\nvolumes:\n`;
    if (composeAddons.redis) yaml += `  redis_data:\n`;
    if (composeAddons.postgres) yaml += `  postgres_data:\n`;
    if (composeAddons.mysql) yaml += `  mysql_data:\n`;
  }

  if (useSharedNetwork) yaml += `\nnetworks:\n  ${netName}:\n    driver: bridge\n`;
  return yaml;
}

// ================= Kubernetes Generator =================
export function generateKubernetes(state: any, t: any, isFullStack: boolean = false) {
  const {
    workloads = [],
    services = [],
    ingresses = [],
    pvcs = [],
    configMaps = [],
    secrets = [],
    pvs = [],
    storageClasses = [],
    activeSection,
    globalNamespace,
    activeWorkloadId,
    activeServiceId,
    activeIngressId,
    activePvcId,
    activeConfigMapId,
    activeSecretId,
    activePvId,
    activeStorageClassId
  } = state;

  const docs: string[] = [];
  const sn = (txt: string) => (txt || 'unnamed').toLowerCase().replace(/[^a-z0-9-]/g, '-');

  const buildMetadata = (name: string, ns?: string, labels: any[] = [], annos: any[] = [], extraLabels: Record<string, string> = {}) => {
    let s = `metadata:\n  name: ${sn(name)}`;
    const effectiveNs = ns || globalNamespace;
    if (effectiveNs) s += `\n  namespace: ${effectiveNs}`;

    const vLabels = labels?.filter(l => l.key) || [];
    const hasExtra = Object.keys(extraLabels).length > 0;
    if (vLabels.length || hasExtra) {
      s += `\n  labels:`;
      Object.entries(extraLabels).forEach(([k, v]) => { s += `\n    ${k}: ${v}`; });
      vLabels.forEach(l => { s += `\n    ${l.key}: "${l.value}"`; });
    }

    const vAnnos = annos?.filter(a => a.key) || [];
    if (vAnnos.length) {
      s += `\n  annotations:`;
      vAnnos.forEach(a => { s += `\n    ${a.key}: "${a.value}"`; });
    }
    return s;
  };

  const buildProbe = (probe: any, ind: string) => {
    let p = '';
    if (probe.type === 'httpGet') p += `\n${ind}  httpGet:\n${ind}    path: ${probe.path}\n${ind}    port: ${probe.port}`;
    if (probe.type === 'tcpSocket') p += `\n${ind}  tcpSocket:\n${ind}    port: ${probe.port}`;
    if (probe.type === 'grpc') p += `\n${ind}  grpc:\n${ind}    port: ${Number(probe.port)}`;
    if (probe.type === 'exec') { p += `\n${ind}  exec:\n${ind}    command:`; (probe.command || '').trim().split(/\s+/).forEach((c: string) => { p += `\n${ind}    - ${c}`; }); }
    p += `\n${ind}  initialDelaySeconds: ${probe.initialDelaySeconds}`;
    p += `\n${ind}  periodSeconds: ${probe.periodSeconds}`;
    p += `\n${ind}  timeoutSeconds: ${probe.timeoutSeconds}`;
    p += `\n${ind}  failureThreshold: ${probe.failureThreshold}`;
    p += `\n${ind}  successThreshold: ${probe.successThreshold}`;
    return p;
  };

  const buildContainer = (c: any, ind: string) => {
    let yaml = `${ind}- name: ${sn(c.name)}\n${ind}  image: ${c.image || 'nginx:alpine'}\n${ind}  imagePullPolicy: ${c.imagePullPolicy || 'IfNotPresent'}`;
    if (c.containerPort) yaml += `\n${ind}  ports:\n${ind}  - containerPort: ${Number(c.containerPort) || 80}`;

    if (c.useShellWrapper) {
      const cmd = (c.command || '').trim();
      const args = (c.args || '').trim();
      if (cmd && args) {
        yaml += `\n${ind}  command: ["sh", "-ec"]\n${ind}  args: ["${cmd.replace(/"/g, '\\"')} ${args.replace(/"/g, '\\"')}"]`;
      } else if (cmd) {
        yaml += `\n${ind}  command: ["sh", "-ec", "${cmd.replace(/"/g, '\\"')}"]`;
      } else if (args) {
        yaml += `\n${ind}  command: ["sh", "-ec"]\n${ind}  args: ["${args.replace(/"/g, '\\"')}"]`;
      }
    } else {
      if (c.command?.trim()) {
        const parts = c.command.trim().split(/\s+/).filter(Boolean);
        yaml += `\n${ind}  command: [${parts.map((p: string) => `"${p.replace(/"/g, '\\"')}"`).join(', ')}]`;
      }
      if (c.args?.trim()) {
        const parts = c.args.trim().split(/\s+/).filter(Boolean);
        yaml += `\n${ind}  args: [${parts.map((p: string) => `"${p.replace(/"/g, '\\"')}"`).join(', ')}]`;
      }
    }

    const venvs = c.envs?.filter((e: any) => e.name) || [];
    if (venvs.length) {
      yaml += `\n${ind}  env:`;
      venvs.forEach((e: any) => {
        yaml += `\n${ind}  - name: ${e.name}`;
        if (e.type === 'value') yaml += `\n${ind}    value: "${e.value}"`;
        else yaml += `\n${ind}    valueFrom:\n${ind}      ${e.type}KeyRef:\n${ind}        name: ${e.refName}\n${ind}        key: ${e.refKey}`;
      });
    }

    return yaml;
  };

  const buildPodSpec = (w: any, ind: string) => {
    const si = ind + '  ';
    let s = `${ind}metadata:\n${si}labels:\n${si}  app: ${sn(w.appName)}`;
    s += `\n${ind}spec:\n${si}containers:`;
    (w.containers || []).forEach((c: any) => {
      s += `\n${buildContainer(c, si)}`;
    });
    return s;
  };



  // Workloads
  workloads.forEach((w: any) => {
    if (!isFullStack && activeSection !== 'workload') return;
    
    const name = sn(w.appName);
    docs.push(`apiVersion: apps/v1\nkind: Deployment\n${buildMetadata(name, w.namespace, w.labels, w.annotations, { app: name })}\nspec:\n  replicas: ${w.replicas || 1}\n  selector:\n    matchLabels:\n      app: ${name}\n  template:\n${buildPodSpec(w, '    ')}`);
  });

  // Services
  services.forEach((svc: any) => {
    if (!isFullStack && activeSection !== 'network') return;

    docs.push(`apiVersion: v1\nkind: Service\n${buildMetadata(svc.name, svc.namespace, svc.labels, svc.annotations)}\nspec:\n  type: ${svc.type || 'ClusterIP'}\n  selector:\n    app: ${sn(svc.selectorApp)}\n  ports:\n  - port: ${svc.port || 80}\n    targetPort: ${svc.targetPort || 80}`);
  });

  // Ingresses
  ingresses?.forEach((ing: any) => {
    if (!isFullStack && activeSection !== 'network') return;

    let yaml = `apiVersion: networking.k8s.io/v1\nkind: Ingress\n${buildMetadata(ing.name, ing.namespace, ing.labels, ing.annotations)}\nspec:`;
    if (ing.ingressClassName) yaml += `\n  ingressClassName: ${ing.ingressClassName}`;
    if (ing.tls) {
      yaml += `\n  tls:\n  - secretName: ${ing.tlsSecret || (sn(ing.name) + '-tls')}\n    hosts:\n    - ${ing.rules[0]?.host || 'example.com'}`;
    }
    yaml += `\n  rules:`;
    ing.rules.forEach((r: any) => {
      yaml += `\n  - host: ${r.host}\n    http:\n      paths:\n      - path: ${r.path}\n        pathType: Prefix\n        backend:\n          service:\n            name: ${sn(r.serviceName)}\n            port:\n              number: ${r.servicePort}`;
    });
    docs.push(yaml);
  });

  // StorageClasses
  (storageClasses || []).forEach((sc: any) => {
    if (!isFullStack && activeSection !== 'storage') return;

    let yaml = `apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: ${sn(sc.name)}\nprovisioner: ${sc.provisioner || 'kubernetes.io/no-provisioner'}`;
    if (sc.reclaimPolicy) yaml += `\nreclaimPolicy: ${sc.reclaimPolicy}`;
    if (sc.volumeBindingMode) yaml += `\nvolumeBindingMode: ${sc.volumeBindingMode}`;
    if (sc.allowVolumeExpansion) yaml += `\nallowVolumeExpansion: true`;
    if (sc.parameters?.length > 0) {
      yaml += `\nparameters:`;
      sc.parameters.filter((p: any) => p.key).forEach((p: any) => {
        yaml += `\n  ${p.key}: "${p.value}"`;
      });
    }
    docs.push(yaml);
  });

  // PVs
  (pvs || []).forEach((pv: any) => {
    if (!isFullStack && activeSection !== 'storage') return;

    let yaml = `apiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: ${sn(pv.name)}\nspec:\n  capacity:\n    storage: ${pv.capacity || '10Gi'}\n  accessModes:\n  - ${pv.accessMode || 'ReadWriteOnce'}\n  persistentVolumeReclaimPolicy: ${pv.reclaimPolicy || 'Retain'}`;
    if (pv.storageClass) yaml += `\n  storageClassName: ${pv.storageClass}`;
    
    if (pv.sourceType === 'nfs') {
      yaml += `\n  nfs:\n    server: ${pv.nfsServer || '10.0.0.1'}\n    path: ${pv.nfsPath || '/'}`;
    } else if (pv.sourceType === 'hostPath' || pv.sourceType === 'local') {
      yaml += `\n  ${pv.sourceType === 'local' ? 'local' : 'hostPath'}:\n    path: ${pv.hostPath || '/tmp/data'}`;
    } else if (pv.sourceType === 'csi') {
      yaml += `\n  csi:\n    driver: ${pv.csiDriver}\n    volumeHandle: ${pv.csiHandle}`;
    }
    docs.push(yaml);
  });

  // PVCs
  (pvcs || []).forEach((pvc: any) => {
    if (!isFullStack && activeSection !== 'storage') return;

    let yaml = `apiVersion: v1\nkind: PersistentVolumeClaim\n${buildMetadata(pvc.name, pvc.namespace, pvc.labels, pvc.annotations)}\nspec:\n  accessModes:\n  - ${pvc.accessMode || 'ReadWriteOnce'}\n  resources:\n    requests:\n      storage: ${pvc.storage || '1Gi'}`;
    if (pvc.storageClass) yaml += `\n  storageClassName: ${pvc.storageClass}`;
    if (pvc.volumeName) yaml += `\n  volumeName: ${pvc.volumeName}`;
    docs.push(yaml);
  });

  // ConfigMaps
  (configMaps || []).forEach((cm: any) => {
    if (!isFullStack && activeSection !== 'storage') return;

    const dataLines = (cm.data || []).map((d: any) => d.key ? `  ${d.key}: |-\n${(d.value || '').split('\n').map((l: string) => `    ${l}`).join('\n')}` : '').filter(Boolean).join('\n');
    docs.push(`apiVersion: v1\nkind: ConfigMap\n${buildMetadata(cm.name, cm.namespace, cm.labels, cm.annotations)}\ndata:\n${dataLines || '  {}'}`);
  });

  // Secrets
  (secrets || []).forEach((sec: any) => {
    if (!isFullStack && activeSection !== 'storage') return;

    let yaml = `apiVersion: v1\nkind: Secret\n${buildMetadata(sec.name, sec.namespace, sec.labels, sec.annotations)}\ntype: ${sec.secretType || 'Opaque'}\ndata:`;
    const validData = (sec.data || []).filter((d: any) => d.key);
    if (validData.length === 0) yaml += ` {}`;
    else {
      validData.forEach((d: any) => {
        try {
          // Fallback to direct btoa if encoded version fails
          const encoded = btoa(unescape(encodeURIComponent(d.value || '')));
          yaml += `\n  ${d.key}: ${encoded}`;
        } catch (e) {
          yaml += `\n  ${d.key}: ${btoa('error')}`;
        }
      });
    }
    docs.push(yaml);
  });

  return docs.join('\n---\n') || `# ${t.preview.empty}`;
}
