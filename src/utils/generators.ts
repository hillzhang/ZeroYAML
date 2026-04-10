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
    yaml += `  # [ANCHOR: ${svc.id}]\n`;
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

    const vEnvs = (svc.envs || []).filter((e: any) => e?.key?.trim());
    if (vEnvs.length > 0) {
      yaml += `    environment:\n`;
      vEnvs.forEach((e: any) => {
        const val = (e.value || "").includes(' ') || (e.value || "").includes('"') || (e.value || "").includes('$') ? `"${(e.value || "").replace(/"/g, '\\"')}"` : (e.value || "");
        yaml += `      - ${e.key.trim()}=${val}\n`;
      });
    }

    const vLabels = (svc.labels || []).filter((l: any) => l?.key?.trim());
    if (vLabels.length > 0) {
      yaml += `    labels:\n`;
      vLabels.forEach((l: any) => {
        const val = (l.value || "").includes(' ') || (l.value || "").includes('"') ? `"${(l.value || "").replace(/"/g, '\\"')}"` : (l.value || "");
        yaml += `      - "${l.key.trim()}=${val}"\n`;
      });
    }

    if (svc.envFiles?.length > 0) {
      yaml += `    env_file:\n`;
      svc.envFiles.filter((f: any) => f.trim()).forEach((f: any) => yaml += `      - ${f.trim()}\n`);
    }

    if (svc.vols?.length > 0) {
      yaml += `    volumes:\n`;
      svc.vols.filter((v: any) => v.host.trim() && v.container.trim()).forEach((v: any) => yaml += `      - ${v.host}:${v.container}\n`);
    }

    if (svc.capAdd?.length > 0) {
      yaml += `    cap_add:\n`;
      svc.capAdd.filter((c: any) => c.trim()).forEach((c: any) => yaml += `      - ${c.trim()}\n`);
    }

    if (svc.logDriver && svc.logDriver !== 'default') {
      yaml += `    logging:\n      driver: ${svc.logDriver}\n`;
      if (svc.logMaxSize || svc.logMaxFile) {
        yaml += `      options:\n`;
        if (svc.logMaxSize) yaml += `        max-size: "${svc.logMaxSize}"\n`;
        if (svc.logMaxFile) yaml += `        max-file: "${svc.logMaxFile}"\n`;
      }
    }

    if (svc.healthcheck?.enabled) {
      yaml += `    healthcheck:\n`;
      yaml += `      test: ["CMD-SHELL", "${svc.healthcheck.test.replace(/"/g, '\\"')}"]\n`;
      yaml += `      interval: ${svc.healthcheck.interval || '30s'}\n`;
      yaml += `      timeout: ${svc.healthcheck.timeout || '10s'}\n`;
      yaml += `      retries: ${svc.healthcheck.retries || 3}\n`;
      if (svc.healthcheck.startPeriod) yaml += `      start_period: ${svc.healthcheck.startPeriod}\n`;
    }

    const hasCpus = svc.cpus && /[0-9]/.test(svc.cpus);
    const hasMem = svc.memLimit && /[0-9]/.test(svc.memLimit);
    const hasLimits = hasCpus || hasMem || svc.useGpu;
    if (hasLimits) {
      yaml += `    deploy:\n      resources:\n`;
      if (hasCpus || hasMem) {
        yaml += `        limits:\n`;
        if (hasCpus) yaml += `          cpus: '${svc.cpus}'\n`;
        if (hasMem) yaml += `          memory: ${svc.memLimit}\n`;
      }
      if (svc.useGpu) {
        yaml += `        reservations:\n          devices:\n            - driver: nvidia\n              count: 1\n              capabilities: [gpu]\n`;
      }
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
    if (svc.shmSize?.trim() && /[0-9]/.test(svc.shmSize)) yaml += `    shm_size: "${svc.shmSize.trim()}"\n`;

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
        if (dIdx !== -1) deps.push(composeServices[dIdx].name || `service-${dIdx + 1}`);
      });
    }
    if (deps.length > 0) {
      yaml += `    depends_on:\n`;
      deps.forEach(d => yaml += `      - ${d}\n`);
    }
    
    // Custom YAML (if any provided by user via manual override or special field)
    if (svc.customYaml?.trim()) {
      const lines = svc.customYaml.trim().split('\n');
      lines.forEach(line => yaml += `    ${line}\n`);
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

    const vLabels = (labels || []).filter(l => (l?.key || "").trim());
    const hasExtra = Object.keys(extraLabels).length > 0;
    if (vLabels.length || hasExtra) {
      s += `\n  labels:`;
      Object.entries(extraLabels).forEach(([k, v]) => { s += `\n    ${k}: ${v}`; });
      vLabels.forEach(l => { s += `\n    ${l.key}: "${l.value || ''}"`; });
    }

    const vAnnos = (annos || []).filter(a => (a?.key || "").trim());
    if (vAnnos.length) {
      s += `\n  annotations:`;
      vAnnos.forEach(a => { s += `\n    ${a.key}: "${a.value || ''}"`; });
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

    if (c.runAsUser || c.runAsGroup || typeof c.runAsNonRoot === 'boolean' || typeof c.readOnlyRootFilesystem === 'boolean' || typeof c.allowPrivilegeEscalation === 'boolean') {
      yaml += `\n${ind}  securityContext:`;
      if (c.runAsUser) yaml += `\n${ind}    runAsUser: ${c.runAsUser}`;
      if (c.runAsGroup) yaml += `\n${ind}    runAsGroup: ${c.runAsGroup}`;
      if (typeof c.runAsNonRoot === 'boolean') yaml += `\n${ind}    runAsNonRoot: ${c.runAsNonRoot}`;
      if (typeof c.readOnlyRootFilesystem === 'boolean') yaml += `\n${ind}    readOnlyRootFileSystem: ${c.readOnlyRootFilesystem}`;
      if (typeof c.allowPrivilegeEscalation === 'boolean') yaml += `\n${ind}    allowPrivilegeEscalation: ${c.allowPrivilegeEscalation}`;
    }

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

    if (c.envFrom?.length) {
      yaml += `\n${ind}  envFrom:`;
      c.envFrom.forEach((ef: any) => {
        yaml += `\n${ind}  - ${ef.type === 'configMap' ? 'configMapRef' : 'secretRef'}:\n${ind}      name: ${ef.name}`;
        if (ef.prefix) yaml += `\n${ind}    prefix: ${ef.prefix}`;
      });
    }

    if (c.cpuReq || c.cpuLimit || c.memReq || c.memLimit) {
      yaml += `\n${ind}  resources:\n${ind}    requests:`;
      if (c.cpuReq) yaml += `\n${ind}      cpu: ${c.cpuReq}`;
      if (c.memReq) yaml += `\n${ind}      memory: ${c.memReq}`;
      yaml += `\n${ind}    limits:`;
      if (c.cpuLimit) yaml += `\n${ind}      cpu: ${c.cpuLimit}`;
      if (c.memLimit) yaml += `\n${ind}      memory: ${c.memLimit}`;
    }

    if (c.volumeMounts?.length) {
      yaml += `\n${ind}  volumeMounts:`;
      c.volumeMounts.forEach((vm: any) => {
        yaml += `\n${ind}  - name: ${vm.name}\n${ind}    mountPath: ${vm.mountPath}`;
        if (vm.subPath) yaml += `\n${ind}    subPath: ${vm.subPath}`;
        if (vm.readOnly) yaml += `\n${ind}    readOnly: true`;
      });
    }

    if (c.livenessProbe?.enabled) yaml += `\n${ind}  livenessProbe:${buildProbe(c.livenessProbe, ind + '  ')}`;
    if (c.readinessProbe?.enabled) yaml += `\n${ind}  readinessProbe:${buildProbe(c.readinessProbe, ind + '  ')}`;
    if (c.startupProbe?.enabled) yaml += `\n${ind}  startupProbe:${buildProbe(c.startupProbe, ind + '  ')}`;

    return yaml;
  };

  const buildPodSpec = (w: any, ind: string) => {
    const si = ind + '  ';
    const ssi = si + '  ';
    
    let s = `${ind}metadata:`;
    const vPodLabels = (w.podLabels || []).filter((l: any) => (l?.key || "").trim());
    const vPodAnnos = (w.podAnnotations || []).filter((a: any) => (a?.key || "").trim());
    
    if (vPodLabels.length > 0 || vPodAnnos.length > 0 || w.appName) {
      if (vPodLabels.length > 0 || w.appName) {
        s += `\n${si}labels:\n${si}  app: ${sn(w.appName)}`;
        vPodLabels.forEach((l: any) => { s += `\n${si}  ${l.key}: "${l.value || ''}"`; });
      }
      if (vPodAnnos.length > 0) {
        s += `\n${si}annotations:`;
        vPodAnnos.forEach((a: any) => { s += `\n${si}  ${a.key}: "${a.value || ''}"`; });
      }
    }
    
    s += `\n${ind}spec:`;
    if (w.imagePullSecrets?.length > 0) {
      s += `\n${si}imagePullSecrets:`;
      w.imagePullSecrets.forEach((sec: any) => {
        if (sec.name) s += `\n${si}- name: ${sec.name}`;
      });
    }

    if (w.serviceAccountName) s += `\n${si}serviceAccountName: ${w.serviceAccountName}`;
    if (w.hostNetwork) s += `\n${si}hostNetwork: true`;
    if (w.dnsPolicy && w.dnsPolicy !== 'ClusterFirst') s += `\n${si}dnsPolicy: ${w.dnsPolicy}`;
    
    if (w.fsGroup) {
      s += `\n${si}securityContext:\n${si}  fsGroup: ${w.fsGroup}`;
    }

    if (w.nodeSelector?.length) {
      const vNS = w.nodeSelector.filter((ns: any) => (ns?.key || "").trim());
      if (vNS.length > 0) {
        s += `\n${si}nodeSelector:`;
        vNS.forEach((ns: any) => {
          s+= `\n${si}  ${ns.key}: "${ns.value || ''}"`;
        });
      }
    }

    if (w.tolerations?.length) {
      s += `\n${si}tolerations:`;
      w.tolerations.forEach((t: any) => {
        s += `\n${si}- key: "${t.key}"\n${si}  operator: "${t.operator || 'Equal'}"\n${si}  value: "${t.value || ''}"\n${si}  effect: "${t.effect || 'NoSchedule'}"`;
      });
    }

    if (w.initContainers?.length > 0) {
      s += `\n${si}initContainers:`;
      w.initContainers.forEach((ic: any) => {
        s += `\n${buildContainer(ic, si)}`;
      });
    }

    s += `\n${si}containers:`;
    (w.containers || []).forEach((c: any) => {
      s += `\n${buildContainer(c, si)}`;
    });

    // Volumes
    const allMounts: any[] = [];
    (w.containers || []).forEach((c: any) => {
      (c.volumeMounts || []).forEach((m: any) => allMounts.push(m));
    });

    if (allMounts.length) {
      s += `\n${si}volumes:`;
      const uniqueVols = Array.from(new Set(allMounts.map(m => m.name)));
      uniqueVols.forEach(vname => {
        const m = allMounts.find(am => am.name === vname);
        s += `\n${si}- name: ${vname}`;
        if (m.sourceType === 'pvc') s += `\n${si}  persistentVolumeClaim:\n${si}    claimName: ${m.resourceRef || vname}`;
        else if (m.sourceType === 'configMap') s += `\n${si}  configMap:\n${si}    name: ${m.resourceRef || vname}`;
        else if (m.sourceType === 'secret') s += `\n${si}  secret:\n${si}    secretName: ${m.resourceRef || vname}`;
        else if (m.sourceType === 'hostPath') s += `\n${si}  hostPath:\n${si}    path: ${m.hostPathValue || '/data'}`;
        else s += `\n${si}  emptyDir: {}`;
      });
    }

    return s;
  };



  // Workloads
  workloads.forEach((w: any) => {
    if (!isFullStack && activeSection !== 'workload') return;

    const name = sn(w.appName);
    const type = w.workloadType || 'Deployment';
    const apiVersion = (type === 'CronJob' || type === 'Job') ? 'batch/v1' : 'apps/v1';

    let yaml = `apiVersion: ${apiVersion}\nkind: ${type}\n${buildMetadata(name, w.namespace, w.labels, w.annotations, { app: name })}\nspec:`;

    if (type === 'CronJob') {
      yaml += `\n  schedule: "${w.schedule || '0 * * * *'}"\n  jobTemplate:\n    spec:\n      template:\n${buildPodSpec(w, '        ')}`;
    } else if (type === 'Job') {
      yaml += `\n  template:\n${buildPodSpec(w, '    ')}`;
    } else {
      // Deployment, StatefulSet, DaemonSet
      if (type !== 'DaemonSet') {
        yaml += `\n  replicas: ${w.replicas || 1}`;
      }
      
      const strategyKey = type === 'Deployment' ? 'strategy' : 'updateStrategy';
      if (w.updateStrategy) {
        yaml += `\n  ${strategyKey}:\n    type: ${w.updateStrategy}`;
        if (w.updateStrategy === 'RollingUpdate' && (w.maxSurge || w.maxUnavailable)) {
          yaml += `\n    rollingUpdate:`;
          if (w.maxSurge) yaml += `\n      maxSurge: ${w.maxSurge}`;
          if (w.maxUnavailable) yaml += `\n      maxUnavailable: ${w.maxUnavailable}`;
        }
      }

      if (type === 'StatefulSet') {
        yaml += `\n  serviceName: "${name}"`;
      }
      yaml += `\n  selector:\n    matchLabels:\n      app: ${name}\n  template:\n${buildPodSpec(w, '    ')}`;
    }

    docs.push(`# [ANCHOR: ${w.id}]\n` + yaml);
  });

  // Services
  services.forEach((svc: any) => {
    if (!isFullStack && activeSection !== 'network') {
      if (activeSection !== 'workload') return;
      // In workload mode, only show services that target one of our workloads
      const activeW = workloads.find((w: any) => w.id === activeWorkloadId);
      if (!activeW || sn(svc.selectorApp) !== sn(activeW.appName)) return;
    }

    let svcYaml = `apiVersion: v1\nkind: Service\n${buildMetadata(svc.name, svc.namespace, svc.labels, svc.annotations)}\nspec:\n  type: ${svc.type || 'ClusterIP'}\n  selector:\n    app: ${sn(svc.selectorApp)}\n  ports:\n  - port: ${svc.port || 80}\n    targetPort: ${svc.targetPort || 80}`;
    if (svc.type === 'NodePort' && svc.nodePort) {
      svcYaml += `\n    nodePort: ${svc.nodePort}`;
    }
    docs.push(`# [ANCHOR: ${svc.id}]\n` + svcYaml);
  });

  // Ingresses
  ingresses?.forEach((ing: any) => {
    if (!isFullStack && activeSection !== 'network') {
      if (activeSection !== 'workload') return;
      // In workload mode, only show ingresses that target one of our workloads via rules
      const activeW = workloads.find((w: any) => w.id === activeWorkloadId);
      if (!activeW) return;
      const appName = sn(activeW.appName);
      const isTargeting = ing.rules.some((r: any) => {
        const targetSvc = services.find((s: any) => s.name === r.serviceName);
        return targetSvc && sn(targetSvc.selectorApp) === appName;
      });
      if (!isTargeting) return;
    }

    let yaml = `apiVersion: networking.k8s.io/v1\nkind: Ingress\n${buildMetadata(ing.name, ing.namespace, ing.labels, ing.annotations)}\nspec:`;
    if (ing.ingressClassName) yaml += `\n  ingressClassName: ${ing.ingressClassName}`;
    if (ing.tls) {
      yaml += `\n  tls:\n  - secretName: ${ing.tlsSecret || (sn(ing.name) + '-tls')}\n    hosts:\n    - ${ing.rules[0]?.host || 'example.com'}`;
    }
    yaml += `\n  rules:`;
    ing.rules.forEach((r: any) => {
      yaml += `\n  - host: ${r.host}\n    http:\n      paths:\n      - path: ${r.path}\n        pathType: Prefix\n        backend:\n          service:\n            name: ${sn(r.serviceName)}\n            port:\n              number: ${r.servicePort}`;
    });
    docs.push(`# [ANCHOR: ${ing.id}]\n` + yaml);
  });

  // StorageClasses
  (storageClasses || []).forEach((sc: any) => {
    if (!isFullStack && activeSection !== 'storage' && activeSection !== 'workload') return;

    let yaml = `apiVersion: storage.k8s.io/v1\nkind: StorageClass\n${buildMetadata(sc.name, undefined, sc.labels, sc.annotations)}\nprovisioner: ${sc.provisioner || 'kubernetes.io/no-provisioner'}`;
    if (sc.reclaimPolicy) yaml += `\nreclaimPolicy: ${sc.reclaimPolicy}`;
    if (sc.volumeBindingMode) yaml += `\nvolumeBindingMode: ${sc.volumeBindingMode}`;
    if (sc.allowVolumeExpansion) yaml += `\nallowVolumeExpansion: true`;
    if (sc.parameters?.length > 0) {
      yaml += `\nparameters:`;
      sc.parameters.filter((p: any) => p.key).forEach((p: any) => {
        yaml += `\n  ${p.key}: "${p.value}"`;
      });
    }
    docs.push(`# [ANCHOR: ${sc.id}]\n` + yaml);
  });

  // PVs
  (pvs || []).forEach((pv: any) => {
    if (!isFullStack && activeSection !== 'storage' && activeSection !== 'workload') return;

    let yaml = `apiVersion: v1\nkind: PersistentVolume\n${buildMetadata(pv.name, undefined, pv.labels, pv.annotations)}\nspec:\n  capacity:\n    storage: ${pv.capacity || '10Gi'}\n  accessModes:\n  - ${pv.accessMode || 'ReadWriteOnce'}\n  persistentVolumeReclaimPolicy: ${pv.reclaimPolicy || 'Retain'}`;
    if (pv.storageClass) yaml += `\n  storageClassName: ${pv.storageClass}`;

    if (pv.sourceType === 'nfs') {
      yaml += `\n  nfs:\n    server: ${pv.nfsServer || '10.0.0.1'}\n    path: ${pv.nfsPath || '/'}`;
    } else if (pv.sourceType === 'hostPath' || pv.sourceType === 'local') {
      yaml += `\n  ${pv.sourceType === 'local' ? 'local' : 'hostPath'}:\n    path: ${pv.hostPath || '/tmp/data'}`;
    } else if (pv.sourceType === 'csi') {
      yaml += `\n  csi:\n    driver: ${pv.csiDriver}\n    volumeHandle: ${pv.csiHandle}`;
    }
    docs.push(`# [ANCHOR: ${pv.id}]\n` + yaml);
  });

  // PVCs
  (pvcs || []).forEach((pvc: any) => {
    if (!isFullStack && activeSection !== 'storage') return;

    let yaml = `apiVersion: v1\nkind: PersistentVolumeClaim\n${buildMetadata(pvc.name, pvc.namespace, pvc.labels, pvc.annotations)}\nspec:\n  accessModes:\n  - ${pvc.accessMode || 'ReadWriteOnce'}\n  resources:\n    requests:\n      storage: ${pvc.storage || '1Gi'}`;
    if (pvc.storageClass) yaml += `\n  storageClassName: ${pvc.storageClass}`;
    if (pvc.volumeName) yaml += `\n  volumeName: ${pvc.volumeName}`;
    docs.push(`# [ANCHOR: ${pvc.id}]\n` + yaml);
  });

  // ConfigMaps
  (configMaps || []).forEach((cm: any) => {
    if (!isFullStack && activeSection !== 'storage') return;

    const dataLines = (cm.data || []).map((d: any) => d.key ? `  ${d.key}: |-\n${(d.value || '').split('\n').map((l: string) => `    ${l}`).join('\n')}` : '').filter(Boolean).join('\n');
    docs.push(`# [ANCHOR: ${cm.id}]\n` + `apiVersion: v1\nkind: ConfigMap\n${buildMetadata(cm.name, cm.namespace, cm.labels, cm.annotations)}\ndata:\n${dataLines || '  {}'}`);
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
    docs.push(`# [ANCHOR: ${sec.id}]\n` + yaml);
  });

  return docs.join('\n---\n') || `# ${t.preview.empty}`;
}
