"use client";

import { useMemo } from 'react';
import { useDockerfileStore } from '@/store/useDockerfileStore';
import { useComposeStore } from '@/store/useComposeStore';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { useAppStore } from '@/store/useAppStore';

export function useCodeGenerators() {
  const {
    baseImage, workdir, port, startCmd, entrypoint, envVars, volumes, user,
    healthcheck, args, labels, runCmds, copyAddItems, useShellWrapper
  } = useDockerfileStore();

  const { composeServices, composeAddons, composeVersion, networkName, useSharedNetwork } = useComposeStore();
  const k8sState = useKubernetesStore();
  const { isFullStack } = useAppStore();

  // ================= Formatter helpers =================
  const formatCmd = (cmdStr: string, defaultCmd: string, useShell?: boolean) => {
    if (!cmdStr.trim()) return defaultCmd;
    let finalStr = cmdStr;
    if (useShell) {
      const parts = ["sh", "-ec", finalStr];
      return `[${parts.map(p => `"${p.replace(/"/g, '\\"')}"`).join(', ')}]`;
    }
    const parts = finalStr.split(' ').filter(Boolean).map(s => `"${s.replace(/"/g, '\\"')}"`);
    return `[${parts.join(', ')}]`;
  };

  const formatVolumes = () => {
    const validVols = volumes.filter(Boolean);
    if (validVols.length === 0) return '';
    return `\n# 挂载数据卷(持久化目录)\nVOLUME [${validVols.map(v => `"${v}"`).join(', ')}]`;
  };

  const formatArgs = () => {
    const validArgs = args.filter(a => a.key.trim());
    if (validArgs.length === 0) return '';
    return `\n# 定义构建参数(仅在 build 时有效)\n${validArgs.map(a => `ARG ${a.key}${a.value ? `=${a.value}` : ''}`).join('\n')}`;
  };

  const formatLabels = () => {
    const validLabels = labels.filter(l => l.key.trim());
    if (validLabels.length === 0) return '';
    return `\n# 设置镜像元数据\n${validLabels.map(l => `LABEL ${l.key}="${l.value}"`).join('\n')}`;
  };

  const formatRunCmds = () => {
    const validRuns = runCmds.filter(Boolean);
    if (!validRuns.length) return '';
    return `\n# 执行环境安装/配置命令\n${validRuns.map(cmd => {
      const indentedCmd = cmd
        .split('\n')
        .map((line, idx) => (idx === 0 ? line : `    ${line.trimStart()}`))
        .join('\n');
      return `RUN ${indentedCmd}`;
    }).join('\n')}`;
  };

  const formatCopyAdd = () => {
    const validItems = copyAddItems.filter(item => item.src.trim() && item.dest.trim());
    if (validItems.length === 0) return '';
    return `\n# 【科普：文件传输】COPY 负责普通拷贝，ADD 支持解压和外部 URL 下载\n${validItems.map(item => {
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
    if (!healthcheck.trim()) return '';
    const cmdStr = healthcheck.startsWith('CMD') ? healthcheck : `CMD ${healthcheck}`;
    return `\n\n# 【科普：健康检查】供容器服务(如K8s/Compose)确认应用是否存活\nHEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\\n  ${cmdStr}`;
  };

  const formatEnvVars = () => {
    return envVars
      .filter(env => env.key.trim())
      .map(env => `ENV ${env.key}="${env.value.replace(/"/g, '\\"')}"`)
      .join('\n');
  };

  const formatUser = (defaultUser?: string) => {
    const targetUser = user || defaultUser;
    if (!targetUser) return '';
    return `\n# 指定运行镜像的非特权用户\nUSER ${targetUser}`;
  };

  const renderStartCommands = () => {
    let result = '';

    if (entrypoint.trim()) {
      result += `\nENTRYPOINT ${formatCmd(entrypoint, '[]', useShellWrapper)}\n`;
    }

    if (startCmd.trim()) {
      result += `${!entrypoint.trim() ? '\n' : ''}CMD ${formatCmd(startCmd, '[]', !entrypoint.trim() && useShellWrapper)}`;
    }

    return result.trim();
  };

  // ================= 生成 YAML: Docker Compose =================
  const composeYamlContent = useMemo(() => {
    if (composeServices.length === 0 && !composeAddons.redis && !composeAddons.postgres && !composeAddons.mysql) {
      return `# Docker Compose 暂无配置
# 请在左侧添加服务以开始编排。
# (Please add a service on the left to generate docker-compose config.)
`;
    }

    let yaml = composeVersion !== 'none' ? `version: '${composeVersion}'\n\n` : ``;

    const netName = (networkName || 'app-net').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    yaml += `services:\n`;

    composeServices.forEach((svc, index) => {
      const safeName = (svc.name || `service-${index + 1}`).trim().replace(/[^a-zA-Z0-9_-]/g, '-');
      yaml += `  ${safeName}:\n`;
      if (svc.buildMode === 'build') {
        const contextPath = (svc.context || '.').trim();
        const dfName = (svc.dockerfile || 'Dockerfile').trim();
        yaml += `    build:\n      context: ${contextPath}\n      dockerfile: ${dfName}\n`;
        yaml += `    container_name: ${safeName}-container\n`;
      } else {
        yaml += `    image: ${svc.image || 'alpine:latest'}\n`;
        yaml += `    container_name: ${safeName}-container\n`;
      }
      yaml += `    restart: ${svc.restart}\n`;

      const vPorts = (svc.ports || []).filter(p => p.container.trim());
      if (vPorts.length > 0) {
        yaml += `    ports:\n`;
        vPorts.forEach(p => {
          const hostPart = p.host.trim() ? `${p.host.trim()}:` : '';
          yaml += `      - "${hostPart}${p.container.trim()}"\n`;
        });
      }

      const vEnvs = svc.envs.filter(e => e.key.trim());
      if (vEnvs.length > 0) {
        yaml += `    environment:\n`;
        vEnvs.forEach(e => yaml += `      - ${e.key}=${e.value}\n`);
      }
      const vVols = svc.vols.filter(v => v.host.trim() && v.container.trim());
      if (vVols.length > 0) {
        yaml += `    volumes:\n`;
        vVols.forEach(v => yaml += `      - ${v.host}:${v.container}\n`);
      }

      if (svc.useShellWrapper && svc.command.trim()) {
        yaml += `    command: ["sh", "-ec", "${svc.command.trim().replace(/"/g, '\\"') || ''}"]\n`;
      } else if (svc.command.trim()) {
        yaml += `    command: ${svc.command.trim()}\n`;
      }

      if (svc.useShellWrapper && svc.entrypoint.trim()) {
        yaml += `    entrypoint: ["sh", "-ec", "${svc.entrypoint.trim().replace(/"/g, '\\"') || ''}"]\n`;
      } else if (svc.entrypoint.trim()) {
        yaml += `    entrypoint: ${svc.entrypoint.trim()}\n`;
      }
      if (svc.user.trim()) yaml += `    user: "${svc.user.trim()}"\n`;
      if (svc.privileged) yaml += `    privileged: true\n`;
      if (svc.tty) yaml += `    tty: true\n`;
      if (svc.stdinOpen) yaml += `    stdin_open: true\n`;
      if (svc.pid?.trim()) yaml += `    pid: "${svc.pid.trim()}"\n`;
      if (svc.shmSize?.trim()) yaml += `    shm_size: "${svc.shmSize.trim()}"\n`;
      const vHosts = svc.extraHosts.filter(h => h.host.trim() && h.ip.trim());
      if (vHosts.length > 0) {
        yaml += `    extra_hosts:\n`;
        vHosts.forEach(h => yaml += `      - "${h.host}:${h.ip}"\n`);
      }
      const vCaps = svc.capAdd.filter(Boolean);
      if (vCaps.length > 0) {
        yaml += `    cap_add:\n`;
        vCaps.forEach(c => yaml += `      - ${c}\n`);
      }
      const vEnvFiles = svc.envFiles?.filter(Boolean) || [];
      if (vEnvFiles.length > 0) {
        yaml += `    env_file:\n`;
        vEnvFiles.forEach(f => yaml += `      - ${f}\n`);
      }
      const vLabels = svc.labels?.filter(l => l.key.trim() && l.value.trim()) || [];
      if (vLabels.length > 0) {
        yaml += `    labels:\n`;
        vLabels.forEach(l => yaml += `      - "${l.key}=${l.value}"\n`);
      }
      if (svc.healthcheck?.enabled) {
        yaml += `    healthcheck:\n`;
        yaml += `      test: ["CMD-SHELL", "${svc.healthcheck.test}"]\n`;
        yaml += `      interval: ${svc.healthcheck.interval}\n`;
        yaml += `      timeout: ${svc.healthcheck.timeout}\n`;
        yaml += `      retries: ${svc.healthcheck.retries}\n`;
        yaml += `      start_period: ${svc.healthcheck.startPeriod}\n`;
      }
      if (svc.cpus?.trim() || svc.memLimit?.trim() || svc.useGpu) {
        yaml += `    deploy:\n`;
        if (svc.cpus?.trim() || svc.memLimit?.trim()) {
          yaml += `      resources:\n        limits:\n`;
          if (svc.cpus?.trim()) yaml += `          cpus: '${svc.cpus.trim()}'\n`;
          if (svc.memLimit?.trim()) yaml += `          memory: ${svc.memLimit.trim()}\n`;
        }
        if (svc.useGpu) {
          if (!svc.cpus?.trim() && !svc.memLimit?.trim()) yaml += `      resources:\n`;
          yaml += `        reservations:\n          devices:\n            - driver: nvidia\n              count: 1\n              capabilities: [gpu]\n`;
        }
      }
      if (svc.logDriver !== "default") {
        yaml += `    logging:\n      driver: "${svc.logDriver}"\n`;
        if (svc.logDriver === 'json-file' || svc.logDriver === 'local') {
          if (svc.logMaxSize.trim() || svc.logMaxFile.trim()) {
            yaml += `      options:\n`;
            if (svc.logMaxSize.trim()) yaml += `        max-size: "${svc.logMaxSize.trim()}"\n`;
            if (svc.logMaxFile.trim()) yaml += `        max-file: "${svc.logMaxFile.trim()}"\n`;
          }
        }
      }

      if (svc.networkMode === "host" || svc.networkMode === "none") {
        yaml += `    network_mode: "${svc.networkMode}"\n`;
      } else if (useSharedNetwork) {
        yaml += `    networks:\n      - ${netName}\n`;
      }

      const dependsOn = [];
      if (index === 0) {
        if (composeAddons.redis) dependsOn.push('redis');
        if (composeAddons.postgres) dependsOn.push('postgres');
        if (composeAddons.mysql) dependsOn.push('mysql');
      }
      if (svc.dependsOn && svc.dependsOn.length > 0) {
        svc.dependsOn.forEach(depId => {
          const dIdx = composeServices.findIndex(s => s.id === depId);
          const depSvc = composeServices[dIdx];
          if (depSvc) {
            const safeDep = (depSvc.name || `service-${dIdx + 1}`).trim().replace(/[^a-zA-Z0-9_-]/g, '-');
            dependsOn.push(safeDep);
          }
        });
      }
      if (dependsOn.length > 0) {
        yaml += `    depends_on:\n`;
        dependsOn.forEach(dep => yaml += `      - ${dep}\n`);
      }

      if (svc.customYaml?.trim()) {
        const lines = svc.customYaml.split('\n');
        lines.forEach(l => {
          if (l.trim()) yaml += `    ${l}\n`;
        });
      }
    });

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

    if (useSharedNetwork) {
      yaml += `\nnetworks:\n  ${netName}:\n    driver: bridge\n`;
    }

    return yaml;
  }, [composeServices, composeAddons, composeVersion, networkName, useSharedNetwork, isFullStack]);

  // ================= 生成 Dockerfile =================
  const dockerfileContent = useMemo(() => {
    // 1. 如果完全为空（重置后的状态），显示空白引导
    if (!baseImage && !workdir && !port && !startCmd && envVars.length === 0 && runCmds.length === 0 && copyAddItems.length === 0) {
      return `# Dockerfile 处于空白状态
# 请在左侧选择基础镜像 (FROM) 开始配置...
`;
    }

    // 2. 特殊模板: Node.js (最佳实践示例)
    if (baseImage === "node:20-alpine") {
      const targetUser = user || "node";
      const chownFlag = targetUser !== "root" ? `--chown=${targetUser}:${targetUser} ` : "";

      return `# =========================================
# 【Node.js 最佳实践】多阶段构建，极致减小体积
# =========================================

# 第一阶段：构建 (Builder)
FROM node:20-alpine AS builder
${formatArgs()}
WORKDIR ${workdir || '/app'}
COPY package*.json ./
RUN npm ci # 相比 npm install 更快、更稳定
COPY . .
RUN npm run build # 如果没有构建脚本可忽略

# 第二阶段：运行 (Runner)
FROM node:20-alpine AS runner
${formatLabels()}
WORKDIR ${workdir || '/app'}
${formatEnvVars()}
${formatRunCmds()}
# 仅从前一阶段拷贝生产环境必要的运行产物
COPY ${chownFlag}--from=builder ${workdir || '/app'}/package*.json ./
COPY ${chownFlag}--from=builder ${workdir || '/app'}/node_modules ./node_modules
COPY ${chownFlag}--from=builder ${workdir || '/app'}/. .${formatCopyAdd()}${formatVolumes()}

# 【注意】声明容器内部监听的端口
EXPOSE ${port || '3000'}${formatHealthCheck()}

# 【建议】以非 root 用户运行，增强安全性
${formatUser('node')}

${renderStartCommands() || 'CMD ["npm", "start"]'}`;
    }

    // 3. 特殊模板: Python
    if (baseImage === "python:3.11-slim") {
      return `# =========================================
# 【Python 最佳实践】
# =========================================
FROM python:3.11-slim
${formatArgs()}${formatLabels()}
WORKDIR ${workdir || '/app'}

# 禁止 Python 生成 .pyc 且 stdout 不缓冲
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

${formatEnvVars()}
${formatRunCmds()}
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .${formatCopyAdd()}${formatVolumes()}

EXPOSE ${port || '8000'}${formatHealthCheck()}${formatUser()}

${renderStartCommands() || 'CMD ["python", "app.py"]'}`;
    }

    // 4. 特殊模板: Go
    if (baseImage === "golang:1.22-alpine") {
      return `# =========================================
# 【Golang 最佳实践】静态编译与小体积运行环境
# =========================================
FROM golang:1.22-alpine AS builder
${formatArgs()}
WORKDIR ${workdir || '/app'}
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# 禁用 CGO 以便构建完全静态的二进制文件
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest  
RUN apk --no-cache add ca-certificates
${formatLabels()}
WORKDIR ${workdir || '/app'}
${formatEnvVars()}
${formatRunCmds()}
COPY --from=builder ${workdir || '/app'}/main .${formatCopyAdd()}${formatVolumes()}

EXPOSE ${port || '8080'}${formatHealthCheck()}${formatUser()}

${renderStartCommands() || 'CMD ["./main"]'}`;
    }

    // 5. 通用/从零开始模式 (极致纯净)
    let dockerfile = `FROM ${baseImage || 'alpine:latest'}\n`;
    const argsStr = formatArgs(); if (argsStr) dockerfile += argsStr + '\n';
    const labelsStr = formatLabels(); if (labelsStr) dockerfile += labelsStr + '\n';
    if (workdir) dockerfile += `WORKDIR ${workdir}\n`;
    const envsStr = formatEnvVars(); if (envsStr) dockerfile += envsStr + '\n';
    const runsStr = formatRunCmds(); if (runsStr) dockerfile += runsStr + '\n';
    
    const copyAddStr = formatCopyAdd(); 
    if (copyAddStr) {
      dockerfile += `\n# 文件同步\nCOPY . .${copyAddStr}`;
    }

    const volumesStr = formatVolumes(); if (volumesStr) dockerfile += `\n` + volumesStr;

    if (port) dockerfile += `\nEXPOSE ${port}`;
    const healthStr = formatHealthCheck(); if (healthStr) dockerfile += healthStr;
    const userStr = formatUser(); if (userStr) dockerfile += userStr;
    
    const cmdsStr = renderStartCommands();
    if (cmdsStr) dockerfile += `\n\n${cmdsStr}`;

    return dockerfile.trim();
  }, [
    baseImage, workdir, port, startCmd, entrypoint, envVars, volumes, user,
    healthcheck, args, labels, runCmds, copyAddItems, useShellWrapper, isFullStack
  ]);

  // ================= 生成 Kubernetes YAML =================
  const kubernetesYamlContent = useMemo(() => {
    const {
      workloads, services, ingresses,
      pvcs, configMaps, secrets, pvs, storageClasses
    } = k8sState;
    const sn = (txt: string) => (txt || 'unnamed').toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const workloadDocs: string[] = [];
    const serviceDocs: string[] = [];
    const ingressDocs: string[] = [];
    const storageDocs: string[] = [];

    const buildMetadata = (name: string, ns?: string, labels: any[] = [], annos: any[] = [], extraLabels: Record<string, string> = {}) => {
      let s = `metadata:\n  name: ${sn(name)}`;
      if (ns) s += `\n  namespace: ${ns}`;

      const vLabels = labels.filter(l => l.key);
      const hasExtra = Object.keys(extraLabels).length > 0;
      if (vLabels.length || hasExtra) {
        s += `\n  labels:`;
        Object.entries(extraLabels).forEach(([k, v]) => { s += `\n    ${k}: ${v}`; });
        vLabels.forEach(l => { s += `\n    ${l.key}: "${l.value}"`; });
      }

      const vAnnos = annos.filter(a => a.key);
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
      if (probe.type === 'exec') { p += `\n${ind}  exec:\n${ind}    command:`; probe.command.trim().split(/\s+/).forEach((c: string) => { p += `\n${ind}    - ${c}`; }); }
      p += `\n${ind}  initialDelaySeconds: ${probe.initialDelaySeconds}`;
      p += `\n${ind}  periodSeconds: ${probe.periodSeconds}`;
      p += `\n${ind}  timeoutSeconds: ${probe.timeoutSeconds}`;
      p += `\n${ind}  failureThreshold: ${probe.failureThreshold}`;
      p += `\n${ind}  successThreshold: ${probe.successThreshold}`;
      return p;
    };

    const buildContainer = (w: any, ind: string) => {
      let c = `${ind}- name: ${sn(w.appName)}-container\n${ind}  image: ${w.image || 'nginx:alpine'}\n${ind}  imagePullPolicy: ${w.imagePullPolicy}`;
      if (w.containerPort) c += `\n${ind}  ports:\n${ind}  - containerPort: ${w.containerPort || 80}`;

      if (w.command?.trim()) {
        if (w.useShellWrapper) {
          c += `\n${ind}  command: ["sh", "-ec", "${w.command.trim().replace(/"/g, '\\"')}"]`;
        } else {
          const parts = w.command.trim().split(/\s+/).filter(Boolean);
          if (parts.length) {
            c += `\n${ind}  command:`;
            parts.forEach((p: string) => c += `\n${ind}  - ${p}`);
          }
        }
      }

      if (w.args?.trim()) {
        if (w.useShellWrapper && !w.command?.trim()) {
          // 如果没有 command 但开启了 wrapper，则在 args 处包裹 sh -ec
          c += `\n${ind}  args: ["sh", "-ec", "${w.args.trim().replace(/"/g, '\\"')}"]`;
        } else {
          const parts = w.args.trim().split(/\s+/).filter(Boolean);
          if (parts.length) {
            c += `\n${ind}  args:`;
            parts.forEach((p: string) => c += `\n${ind}  - ${p}`);
          }
        }
      }

      const venvs = w.envs.filter((e: any) => e.name);
      if (venvs.length) {
        c += `\n${ind}  env:`;
        venvs.forEach((e: any) => {
          c += `\n${ind}  - name: ${e.name}`;
          if (e.type === 'value') c += `\n${ind}    value: "${e.value}"`;
          else c += `\n${ind}    valueFrom:\n${ind}      ${e.type}:\n${ind}        name: ${e.refName}\n${ind}        key: ${e.refKey}`;
        });
      }

      if (w.envFrom?.length) {
        c += `\n${ind}  envFrom:`;
        w.envFrom.forEach((ef: any) => {
          c += `\n${ind}  - ${ef.type}Ref:\n${ind}      name: ${ef.name}`;
          if (ef.prefix) c += `\n${ind}    prefix: ${ef.prefix}`;
        });
      }

      const vvols = w.volumeMounts.filter((v: any) => v.name && v.mountPath);
      if (vvols.length) {
        c += `\n${ind}  volumeMounts:`;
        vvols.forEach((v: any) => {
          c += `\n${ind}  - name: ${v.name}\n${ind}    mountPath: ${v.mountPath}${v.subPath ? `\n${ind}    subPath: ${v.subPath}` : ''}${v.readOnly ? `\n${ind}    readOnly: true` : ''}`;
        });
      }

      if (w.cpuReq || w.memReq || w.cpuLimit || w.memLimit) {
        c += `\n${ind}  resources:\n${ind}    requests:`;
        if (w.cpuReq) c += `\n${ind}      cpu: "${w.cpuReq}"`;
        if (w.memReq) c += `\n${ind}      memory: "${w.memReq}"`;
        c += `\n${ind}    limits:`;
        if (w.cpuLimit) c += `\n${ind}      cpu: "${w.cpuLimit}"`;
        if (w.memLimit) c += `\n${ind}      memory: "${w.memLimit}"`;
      }

      const hasSec = w.runAsUser || w.runAsGroup || w.runAsNonRoot || w.readOnlyRootFilesystem || !w.allowPrivilegeEscalation;
      if (hasSec) {
        c += `\n${ind}  securityContext:`;
        if (w.runAsUser) c += `\n${ind}    runAsUser: ${w.runAsUser}`;
        if (w.runAsGroup) c += `\n${ind}    runAsGroup: ${w.runAsGroup}`;
        if (w.runAsNonRoot) c += `\n${ind}    runAsNonRoot: true`;
        if (w.readOnlyRootFilesystem) c += `\n${ind}    readOnlyRootFilesystem: true`;
        if (!w.allowPrivilegeEscalation) c += `\n${ind}    allowPrivilegeEscalation: false`;
      }

      const pi = `${ind}  `;
      if (w.livenessProbe.enabled) c += `\n${pi}livenessProbe:${buildProbe(w.livenessProbe, pi)}`;
      if (w.readinessProbe.enabled) c += `\n${pi}readinessProbe:${buildProbe(w.readinessProbe, pi)}`;
      if (w.startupProbe.enabled) c += `\n${pi}startupProbe:${buildProbe(w.startupProbe, pi)}`;

      return c;
    };

    const buildPodSpec = (w: any, ind: string) => {
      const si = ind + '  ';
      let meta = `${ind}metadata:`;
      const pl = w.podLabels?.filter((l: any) => l.key) || [];
      meta += `\n${si}labels:\n${si}  app: ${sn(w.appName)}`;
      pl.forEach((l: any) => { meta += `\n${si}  ${l.key}: "${l.value}"`; });

      const pa = w.podAnnotations?.filter((a: any) => a.key) || [];
      if (pa.length) {
        meta += `\n${si}annotations:`;
        pa.forEach((a: any) => { meta += `\n${si}  ${a.key}: "${a.value}"`; });
      }

      let s = `${meta}\n${ind}spec:`;
      if (w.hostNetwork) s += `\n${si}hostNetwork: true`;
      if (w.dnsPolicy !== 'ClusterFirst') s += `\n${si}dnsPolicy: ${w.dnsPolicy}`;
      if (w.imagePullSecrets?.length) {
        s += `\n${si}imagePullSecrets:`;
        w.imagePullSecrets.forEach((ps: any) => { if (ps.name) s += `\n${si}- name: ${ps.name}`; });
      }
      const vns = w.nodeSelector.filter((n: any) => n.key);
      if (vns.length) { s += `\n${si}nodeSelector:`; vns.forEach((n: any) => { s += `\n${si}  ${n.key}: "${n.value}"`; }); }
      const vtols = w.tolerations.filter((t: any) => t.key);
      if (vtols.length) { s += `\n${si}tolerations:`; vtols.forEach((t: any) => { s += `\n${si}- key: ${t.key}\n${si}  operator: ${t.operator}`; if (t.operator === 'Equal') s += `\n${si}  value: "${t.value}"`; if (t.effect) s += `\n${si}  effect: ${t.effect}`; }); }
      if (w.fsGroup || w.runAsNonRoot) { s += `\n${si}securityContext:`; if (w.fsGroup) s += `\n${si}  fsGroup: ${w.fsGroup}`; if (w.runAsNonRoot) s += `\n${si}  runAsNonRoot: true`; }
      if (w.workloadType === 'CronJob') s += `\n${si}restartPolicy: ${w.restartPolicy}`;
      s += `\n${si}containers:\n${buildContainer(w, si)}`;
      const vvols = w.volumeMounts.filter((v: any) => v.name && v.mountPath);
      if (vvols.length) {
        s += `\n${si}volumes:`;
        vvols.forEach((v: any) => {
          s += `\n${si}- name: ${v.name}`;
          if (v.sourceType === 'emptyDir') s += `\n${si}  emptyDir: {}`;
          if (v.sourceType === 'hostPath') s += `\n${si}  hostPath:\n${si}    path: ${v.hostPathValue || '/tmp'}`;
          if (v.sourceType === 'pvc') s += `\n${si}  persistentVolumeClaim:\n${si}    claimName: ${v.resourceRef}`;
          if (v.sourceType === 'configMap') s += `\n${si}  configMap:\n${si}    name: ${v.resourceRef}`;
          if (v.sourceType === 'secret') s += `\n${si}  secret:\n${si}    secretName: ${v.resourceRef}`;
        });
      }
      return s;
    };

    // 0. StorageClasses
    storageClasses.forEach(sc => {
      if (!sc.name) return;
      let doc = `apiVersion: storage.k8s.io/v1\nkind: StorageClass\n${buildMetadata(sc.name, undefined, sc.labels, sc.annotations)}\nprovisioner: ${sc.provisioner || 'kubernetes.io/no-provisioner'}\nreclaimPolicy: ${sc.reclaimPolicy}\nvolumeBindingMode: ${sc.volumeBindingMode}\nallowVolumeExpansion: ${sc.allowVolumeExpansion}`;
      const params = sc.parameters.filter(p => p.key);
      if (params.length) {
        doc += `\nparameters:`;
        params.forEach(p => { doc += `\n  ${p.key}: "${p.value}"`; });
      }
      storageDocs.push(doc);
    });

    // 1. Storage
    pvs.forEach(pv => {
      if (!pv.name) return;
      let doc = `apiVersion: v1\nkind: PersistentVolume\n${buildMetadata(pv.name, undefined, pv.labels, pv.annotations)}\nspec:\n  capacity:\n    storage: ${pv.capacity}\n  accessModes:\n  - ${pv.accessMode}\n  persistentVolumeReclaimPolicy: ${pv.reclaimPolicy}`;
      if (pv.storageClass) doc += `\n  storageClassName: ${pv.storageClass}`;
      if (pv.sourceType === 'hostPath') doc += `\n  hostPath:\n    path: ${pv.hostPath || '/mnt/data'}`;
      if (pv.sourceType === 'nfs') doc += `\n  nfs:\n    server: ${pv.nfsServer || '10.0.0.1'}\n    path: ${pv.nfsPath || '/export'}`;
      if (pv.sourceType === 'local') doc += `\n  local:\n    path: ${pv.hostPath || '/mnt/data'}`;
      if (pv.sourceType === 'csi') doc += `\n  csi:\n    driver: ${pv.csiDriver}\n    volumeHandle: ${pv.csiHandle}`;
      storageDocs.push(doc);
    });
    pvcs.forEach(p => {
      if (!p.name) return;
      let doc = `apiVersion: v1\nkind: PersistentVolumeClaim\n${buildMetadata(p.name, p.namespace, p.labels, p.annotations)}\nspec:\n  accessModes:\n  - ${p.accessMode}\n  resources:\n    requests:\n      storage: ${p.storage}`;
      if (p.storageClass) doc += `\n  storageClassName: ${p.storageClass}`;
      if (p.volumeName) doc += `\n  volumeName: ${p.volumeName}`;
      storageDocs.push(doc);
    });
    configMaps.forEach(cm => {
      if (!cm.name) return;
      const valid = cm.data.filter(d => d.key);
      let doc = `apiVersion: v1\nkind: ConfigMap\n${buildMetadata(cm.name, cm.namespace, cm.labels, cm.annotations)}`;
      if (valid.length) {
        doc += `\ndata:`;
        valid.forEach(d => {
          const val = d.value.includes('\n') ? `|-\n    ${d.value.split('\n').join('\n    ')}` : `"${d.value.replace(/"/g, '\\"')}"`;
          doc += `\n  ${d.key}: ${val}`;
        });
      }
      storageDocs.push(doc);
    });
    secrets.forEach(sec => {
      if (!sec.name) return;
      const valid = sec.data.filter(d => d.key);
      let doc = `apiVersion: v1\nkind: Secret\n${buildMetadata(sec.name, sec.namespace, sec.labels, sec.annotations)}\ntype: ${sec.secretType || 'Opaque'}`;
      if (valid.length) {
        doc += `\nstringData:`;
        valid.forEach(d => {
          const val = d.value.includes('\n') ? `|-\n    ${d.value.split('\n').join('\n    ')}` : `"${d.value.replace(/"/g, '\\"')}"`;
          doc += `\n  ${d.key}: ${val}`;
        });
      }
      storageDocs.push(doc);
    });

    // 2. Services
    services.forEach(svc => {
      if (!svc.name) return;
      const isHeadless = svc.type === 'Headless';
      let doc = `apiVersion: v1\nkind: Service\n${buildMetadata(svc.name, svc.namespace, svc.labels, svc.annotations)}\nspec:`;
      doc += isHeadless ? `\n  clusterIP: None` : `\n  type: ${svc.type}`;
      if (svc.selectorApp) doc += `\n  selector:\n    app: ${sn(svc.selectorApp)}`;
      doc += `\n  ports:\n  - port: ${svc.port || 80}\n    targetPort: ${svc.targetPort || 80}`;
      if (svc.type === 'NodePort' && svc.nodePort) doc += `\n    nodePort: ${svc.nodePort}`;
      serviceDocs.push(doc);
    });

    // 3. Workloads
    workloads.forEach(w => {
      const name = sn(w.appName);
      const ns = w.namespace || 'default';
      const wt = w.workloadType;
      let doc = '';
      if (wt === 'Deployment') {
        doc = `apiVersion: apps/v1\nkind: Deployment\n${buildMetadata(name + '-deployment', ns, w.labels, w.annotations, { app: name })}\nspec:\n  replicas: ${w.replicas || 1}\n  selector:\n    matchLabels:\n      app: ${name}\n  strategy:\n    type: ${w.updateStrategy}`;
        if (w.updateStrategy === 'RollingUpdate') doc += `\n    rollingUpdate:\n      maxSurge: ${w.maxSurge || 1}\n      maxUnavailable: ${w.maxUnavailable || 0}`;
        doc += `\n  template:\n${buildPodSpec(w, '    ')}`;
      } else if (wt === 'StatefulSet') {
        doc = `apiVersion: apps/v1\nkind: StatefulSet\n${buildMetadata(name, ns, w.labels, w.annotations, { app: name })}\nspec:\n  serviceName: "${w.serviceName || name + '-headless'}"\n  replicas: ${w.replicas || 1}\n  selector:\n    matchLabels:\n      app: ${name}\n  updateStrategy:\n    type: ${w.updateStrategy}\n  template:\n${buildPodSpec(w, '    ')}`;
      } else if (wt === 'DaemonSet') {
        doc = `apiVersion: apps/v1\nkind: DaemonSet\n${buildMetadata(name + '-ds', ns, w.labels, w.annotations, { app: name })}\nspec:\n  selector:\n    matchLabels:\n      app: ${name}\n  updateStrategy:\n    type: ${w.daemonSetUpdateStrategy}\n  template:\n${buildPodSpec(w, '    ')}`;
      } else if (wt === 'CronJob') {
        doc = `apiVersion: batch/v1\nkind: CronJob\n${buildMetadata(name + '-cronjob', ns, w.labels, w.annotations, { app: name })}\nspec:\n  schedule: "${w.schedule}"\n  concurrencyPolicy: ${w.concurrencyPolicy}\n  successfulJobsHistoryLimit: ${w.successfulJobsHistoryLimit}\n  failedJobsHistoryLimit: ${w.failedJobsHistoryLimit}`;
        if (w.activeDeadlineSeconds) doc += `\n  jobTemplate:\n    spec:\n      activeDeadlineSeconds: ${w.activeDeadlineSeconds}\n      template:\n${buildPodSpec(w, '        ')}`;
        else doc += `\n  jobTemplate:\n    spec:\n      template:\n${buildPodSpec(w, '        ')}`;
      }
      if (doc) workloadDocs.push(doc);
    });

    // 4. Ingresses
    ingresses.forEach(ing => {
      if (!ing.name) return;
      let doc = `apiVersion: networking.k8s.io/v1\nkind: Ingress\n${buildMetadata(ing.name, ing.namespace, ing.labels, ing.annotations)}\nspec:`;
      if (ing.ingressClassName) doc += `\n  annotations:\n    kubernetes.io/ingress.class: "${ing.ingressClassName}"`;
      doc += `\nspec:`;
      if (ing.tls) {
        const hosts = ing.rules.map(r => r.host).filter(Boolean);
        if (hosts.length) { doc += `\n  tls:\n  - hosts:`; hosts.forEach(h => { doc += `\n    - ${h}`; }); if (ing.tlsSecret) doc += `\n    secretName: ${ing.tlsSecret}`; }
      }
      const vr = ing.rules.filter(r => r.host || r.serviceName);
      if (vr.length) { doc += `\n  rules:`; vr.forEach(r => { doc += `\n  - host: ${r.host || ''}\n    http:\n      paths:\n      - path: ${r.path || '/'}\n        pathType: ${r.pathType}\n        backend:\n          service:\n            name: ${sn(r.serviceName) || 'undefined'}\n            port:\n              number: ${r.servicePort || 80}`; }); }
      ingressDocs.push(doc);
    });

    if (isFullStack) {
      return [...storageDocs, ...serviceDocs, ...workloadDocs, ...ingressDocs].join('\n---\n') || '# 暂无全局资源';
    }

    const { activeSection } = k8sState;
    if (activeSection === 'workload') {
      const workloadNames = new Set(workloads.map(w => sn(w.appName)));
      const associatedSvcNames = new Set(services.filter(s => workloadNames.has(sn(s.selectorApp))).map(s => sn(s.name)));
      const associatedIngs = ingresses.filter(ing => ing.rules.some(r => associatedSvcNames.has(sn(r.serviceName))));

      const fSvcDocs = serviceDocs.filter(d => { const match = d.match(/name:\s+([^\n]+)/); return match && associatedSvcNames.has(match[1].trim()); });
      const fIngDocs = ingressDocs.filter(d => { const match = d.match(/name:\s+([^\n]+)/); return match && associatedIngs.some(ing => sn(ing.name) === match[1].trim()); });
      return [...workloadDocs, ...fSvcDocs, ...fIngDocs].join('\n---\n') || '# 暂无工作负载关联资源';
    } else if (activeSection === 'network') {
      return [...serviceDocs, ...ingressDocs].join('\n---\n') || '# 暂无网络资源';
    } else if (activeSection === 'storage') {
      return storageDocs.join('\n---\n') || '# 暂无存储资源';
    }

    return '# 暂无资源';
  }, [
    k8sState.workloads, k8sState.services, k8sState.ingresses,
    k8sState.pvcs, k8sState.configMaps, k8sState.secrets,
    k8sState.pvs, k8sState.storageClasses, k8sState.activeSection, isFullStack
  ]);

  return { dockerfileContent, composeYamlContent, kubernetesYamlContent };
}
