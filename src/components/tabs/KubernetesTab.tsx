"use client";

import { useState } from 'react';
import {
  useKubernetesStore, K8sWorkload, K8sProbe, K8sWorkloadEnv, K8sEnvFrom, K8sEnv,
} from '@/store/useKubernetesStore';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Layers, Server, RefreshCw, Clock, Database, Network, Box, Terminal,
  ChevronDown, Plus, Trash2, Globe, Shield, Cpu, Tag, Activity, KeyRound, FileText, ListTree,
  HardDrive, Link, Check, ShieldCheck, UserCheck, Settings2, Zap,
} from 'lucide-react';

// ── Shared styles ────────────────────────────────────────────────────────────
const inp = "w-full bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/5 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-700";
const inpSm = "w-full bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded py-1.5 px-2 text-[13px] focus:outline-none focus:border-blue-400 transition-all";
const btnSm = "flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border transition-all font-black uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-900";
const card = "p-4 border border-gray-200 dark:border-gray-800 rounded-[1.5rem] cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-all bg-white dark:bg-[#0D1117] shadow-sm";
const cardActive = "p-4 border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 rounded-[1.5rem] shadow-lg shadow-blue-500/10";

// ── Collapsible Section ──────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mb-4 shadow-sm bg-white dark:bg-[#0D1117] transition-all">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-[#161B22] hover:bg-gray-100 dark:hover:bg-[#1C2128] transition-all text-left select-none group">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <p className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wide">{title}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-5 bg-white dark:bg-[#0E1117] animate-in fade-in slide-in-from-top-1 duration-300">{children}</div>}
    </div>
  );
}

// ── Probe editor ─────────────────────────────────────────────────────────────
function ProbeEditor({ label, probe, onChange }: { label: string; probe: K8sProbe; onChange: (f: keyof K8sProbe, v: any) => void }) {
  return (
    <div className={`p-3 border rounded-xl ${probe.enabled ? 'border-blue-200 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-800'}`}>
      <Checkbox checked={probe.enabled} onChange={v => onChange('enabled', v)} label={label.toUpperCase()} className="tracking-wide" />
      {probe.enabled && (
        <div className="mt-3 pl-4 border-l-2 border-blue-300 dark:border-blue-800 space-y-2">
          <div className="flex gap-1.5">
            {(['httpGet', 'tcpSocket', 'exec', 'grpc'] as const).map(t => (
              <button key={t} onClick={() => onChange('type', t)} className={`px-2 py-0.5 text-xs rounded border font-mono transition ${probe.type === t ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:border-gray-400'}`}>{t}</button>
            ))}
          </div>
          {probe.type === 'httpGet' && <div className="flex gap-2"><div className="flex-1"><p className="text-xs text-gray-400 mb-0.5">路径</p><input type="text" value={probe.path} onChange={e => onChange('path', e.target.value)} className={inpSm} /></div><div className="w-20"><p className="text-xs text-gray-400 mb-0.5">端口</p><input type="text" value={probe.port} onChange={e => onChange('port', e.target.value)} className={inpSm} /></div></div>}
          {probe.type === 'tcpSocket' && <div className="w-24"><p className="text-xs text-gray-400 mb-0.5">端口</p><input type="text" value={probe.port} onChange={e => onChange('port', e.target.value)} className={inpSm} /></div>}
          {probe.type === 'exec' && <div><p className="text-xs text-gray-400 mb-0.5">命令</p><input type="text" value={probe.command} onChange={e => onChange('command', e.target.value)} className={`${inpSm} font-mono`} /></div>}
          {probe.type === 'grpc' && <div className="w-24"><p className="text-xs text-gray-400 mb-0.5">端口</p><input type="text" value={probe.port} onChange={e => onChange('port', e.target.value)} className={inpSm} /></div>}
          <div className="grid grid-cols-3 gap-2">
            {[['initialDelaySeconds', '初始延迟(s)'], ['periodSeconds', '间隔(s)'], ['timeoutSeconds', '超时(s)'], ['failureThreshold', '失败阈值'], ['successThreshold', '成功阈值']].map(([k, l]) => (
              <div key={k}><p className="text-xs text-gray-400 mb-0.5">{l}</p><input type="number" min="1" value={(probe as any)[k]} onChange={e => onChange(k as keyof K8sProbe, parseInt(e.target.value) || 1)} className={inpSm} /></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Resource Selector (Select + Manual Input Toggle) ─────────────────────────
function ResourceSelector({
  label, value, onChange, options, placeholder = "-- 请选择 --", manualPlaceholder = "输入已有资源名称...", className = ""
}: {
  label: string; value: string; onChange: (v: string) => void; options: { id: string; name: string; info?: string }[];
  placeholder?: string; manualPlaceholder?: string; className?: string;
}) {
  const [isManual, setIsManual] = useState(() => {
    if (!value) return false;
    return !options.some(o => o.name === value);
  });

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] text-gray-500 font-medium">{label}</p>
        <button
          type="button"
          onClick={() => setIsManual(!isManual)}
          className="text-[9px] text-blue-500 hover:text-blue-400 font-medium flex items-center gap-0.5 transition-colors"
        >
          {isManual ? <ListTree className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
          {isManual ? '列表选择' : '手动输入'}
        </button>
      </div>
      {isManual ? (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={manualPlaceholder} className={inpSm} />
      ) : (
        <select value={value} onChange={e => onChange(e.target.value)} className={inpSm}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.id} value={o.name}>{o.name}{o.info ? ` (${o.info})` : ''}</option>)}
        </select>
      )}
    </div>
  );
}

// ── Metadata Editor ──────────────────────────────────────────────────────────
interface MetadataEditorProps {
  labels: K8sEnv[];
  annotations: K8sEnv[];
  onUpdateLabels: (v: K8sEnv[]) => void;
  onUpdateAnnotations: (v: K8sEnv[]) => void;
  podLabels?: K8sEnv[];
  podAnnotations?: K8sEnv[];
  onUpdatePodLabels?: (v: K8sEnv[]) => void;
  onUpdatePodAnnotations?: (v: K8sEnv[]) => void;
}

function MetadataEditorContent({
  labels = [], annotations = [], onUpdateLabels, onUpdateAnnotations,
  podLabels, podAnnotations, onUpdatePodLabels, onUpdatePodAnnotations,
  theme = 'blue'
}: MetadataEditorProps & { theme?: string }) {
  const Group = ({ title, items, onAdd, onUpdate, onRemove, colorTheme = "blue", labelPrefix = "Label", icon: Icon }: any) => {
    const themeConfigs: Record<string, string> = {
      blue: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-500",
      teal: "text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10 border-l-teal-500",
      indigo: "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 border-l-indigo-500",
      purple: "text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10 border-l-purple-500",
      green: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 border-l-green-500",
      orange: "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 border-l-orange-500",
      amber: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 border-l-amber-500",
      slate: "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 border-l-slate-500",
    };

    const config = themeConfigs[colorTheme] || themeConfigs.blue;
    const textColor = config.split(' ')[0];

    return (
      <div className={`p-4 rounded-2xl border border-l-4 ${config} transition-all duration-300 shadow-sm hover:shadow-md`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
              <Icon className={`w-3.5 h-3.5 ${textColor} ${labelPrefix.includes('Pod') ? 'animate-pulse' : ''}`} />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>{title}</p>
          </div>
          <span className="text-[10px] bg-white/60 dark:bg-black/40 text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-full font-black border border-gray-100 dark:border-gray-800">{items.length}</span>
        </div>

        <div className="space-y-2.5">
          {items.map((it: any, i: number) => (
            <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
              <input type="text" placeholder="KEY..." value={it.key}
                onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, key: e.target.value } : x))}
                className={`${inpSm} font-mono !bg-white dark:!bg-[#1C2128] border-gray-100 dark:border-gray-700 shadow-inner rounded-xl`} />
              <input type="text" placeholder="VALUE..." value={it.value}
                onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, value: e.target.value } : x))}
                className={`${inpSm} font-mono !bg-white dark:!bg-[#1C2128] border-gray-100 dark:border-gray-700 shadow-inner rounded-xl`} />
              <button onClick={() => onRemove(items.filter((_: any, idx: number) => idx !== i))}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={() => onAdd([...items, { key: '', value: '' }])}
            className={`w-full py-2 border-2 border-dashed rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 mt-2
              ${colorTheme === 'blue' ? 'border-blue-100 dark:border-blue-900/50 text-blue-500 hover:bg-blue-50/50' :
                colorTheme === 'teal' ? 'border-teal-100 dark:border-teal-900/50 text-teal-500 hover:bg-teal-50/50' :
                  colorTheme === 'indigo' ? 'border-indigo-100 dark:border-indigo-900/50 text-indigo-500 hover:bg-indigo-50/50' :
                    'border-purple-100 dark:border-purple-900/50 text-purple-500 hover:bg-purple-50/50'}`}>
            <Plus className="w-3.5 h-3.5" /> ADD NEW {labelPrefix}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Group title="资源 Labels (选择器)" items={labels} onAdd={onUpdateLabels} onUpdate={onUpdateLabels} onRemove={onUpdateLabels} colorTheme="blue" labelPrefix="Label" icon={Tag} />
        <Group title="资源 Annotations (元数据)" items={annotations} onAdd={onUpdateAnnotations} onUpdate={onUpdateAnnotations} onRemove={onUpdateAnnotations} colorTheme="teal" labelPrefix="Annotation" icon={FileText} />
      </div>

      {(onUpdatePodLabels || onUpdatePodAnnotations) && (
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Group title="Pod 级 Labels (模板)" items={podLabels || []} onAdd={onUpdatePodLabels} onUpdate={onUpdatePodLabels} onRemove={onUpdatePodLabels} colorTheme="indigo" labelPrefix="Pod Label" icon={Activity} />
            <Group title="Pod 级 Annotations (模板)" items={podAnnotations || []} onAdd={onUpdatePodAnnotations} onUpdate={onUpdatePodAnnotations} onRemove={onUpdatePodAnnotations} colorTheme="purple" labelPrefix="Pod Annotation" icon={Globe} />
          </div>
        </div>
      )}
    </div>
  );
}

function MetadataEditor(props: MetadataEditorProps & { theme?: string }) {
  const [open, setOpen] = useState(false);
  const { theme = 'blue' } = props;

  const themes: Record<string, { bg: string, border: string, text: string, dot: string, icon: string, activeBg: string }> = {
    blue: { bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', icon: 'text-blue-500', activeBg: 'bg-blue-100 dark:bg-blue-800/40' },
    green: { bg: 'bg-green-50/50 dark:bg-green-900/10', border: 'border-green-100 dark:border-green-800', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', icon: 'text-green-500', activeBg: 'bg-green-100 dark:bg-green-800/40' },
    purple: { bg: 'bg-purple-50/50 dark:bg-purple-900/10', border: 'border-purple-100 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', icon: 'text-purple-500', activeBg: 'bg-purple-100 dark:bg-purple-800/40' },
    orange: { bg: 'bg-orange-50/50 dark:bg-orange-900/10', border: 'border-orange-100 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', icon: 'text-orange-500', activeBg: 'bg-orange-100 dark:bg-orange-800/40' },
    indigo: { bg: 'bg-indigo-50/50 dark:bg-indigo-900/10', border: 'border-indigo-100 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500', icon: 'text-indigo-500', activeBg: 'bg-indigo-100 dark:bg-indigo-800/40' },
    teal: { bg: 'bg-teal-50/50 dark:bg-teal-900/10', border: 'border-teal-100 dark:border-teal-800', text: 'text-teal-700 dark:text-teal-400', dot: 'bg-teal-500', icon: 'text-teal-500', activeBg: 'bg-teal-100 dark:bg-teal-800/40' },
    amber: { bg: 'bg-amber-50/50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', icon: 'text-amber-500', activeBg: 'bg-amber-100 dark:bg-amber-800/40' },
    slate: { bg: 'bg-slate-50/50 dark:bg-slate-900/10', border: 'border-slate-100 dark:border-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500', icon: 'text-slate-500', activeBg: 'bg-slate-100 dark:bg-slate-800/40' },
  };

  const t = themes[theme] || themes.blue;
  const itemCount = (props.labels?.length || 0) + (props.annotations?.length || 0) + (props.podLabels?.length || 0) + (props.podAnnotations?.length || 0);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md ${open ? `${t.activeBg} ${t.border} scale-[1.01]` : `${t.bg} border-transparent hover:border-gray-200 dark:hover:border-gray-700`
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg bg-white dark:bg-gray-900 shadow-sm ${open ? 'animate-bounce-subtle' : ''}`}>
            <Tag className={`w-4 h-4 ${t.icon}`} />
          </div>
          <span className={`text-xs font-black uppercase tracking-widest ${open ? t.text : 'text-gray-600 dark:text-gray-400'}`}>
            元数据管理 (METADATA)
          </span>
          {itemCount > 0 && (
            <span className={`${t.dot} text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm`}>
              {itemCount}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-white dark:bg-[#0D1117] p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30 shadow-xl shadow-blue-500/5">
          <MetadataEditorContent {...props} />
        </div>
      )}
    </div>
  );
}


// ── Workload Editor ──────────────────────────────────────────────────────────
function WorkloadEditor({ wl }: { wl: K8sWorkload }) {
  const {
    pvcs, configMaps, secrets,
    updateWorkload, updateWorkloadProbe,
    addWorkloadEnv, removeWorkloadEnv, updateWorkloadEnv,
    addWorkloadEnvFrom, removeWorkloadEnvFrom, updateWorkloadEnvFrom,
    addWorkloadVol, removeWorkloadVol, updateWorkloadVol,
    addWorkloadNS, removeWorkloadNS, updateWorkloadNS,
    addWorkloadTol, removeWorkloadTol, updateWorkloadTol,
    services, updateService, ingresses,
  } = useKubernetesStore();
  const up = (patch: Partial<K8sWorkload>) => updateWorkload(wl.id, patch);
  const isCronJob = wl.workloadType === 'CronJob';
  const isDaemon = wl.workloadType === 'DaemonSet';
  const isSts = wl.workloadType === 'StatefulSet';

  const WORKLOAD_ICONS: Record<string, React.ReactNode> = {
    Deployment: <Layers className="w-4 h-4" />, StatefulSet: <Server className="w-4 h-4" />,
    DaemonSet: <RefreshCw className="w-4 h-4" />, CronJob: <Clock className="w-4 h-4" />,
  };

  return (
    <div className="space-y-4 py-3">
      {/* Workload Editor Card */}
      <div className="border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 space-y-6 bg-white dark:bg-[#0E1117] shadow-xl shadow-blue-500/5 transition-all animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-blue-50 dark:border-blue-900/20">
          <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <Settings2 className="w-4 h-4 ml-1" /> 编辑工作负载: {wl.appName || '(未命名)'}
          </p>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
          </div>
        </div>

        {/* Workload Type */}
        <div className="grid grid-cols-4 gap-2">
          {(['Deployment', 'StatefulSet', 'DaemonSet', 'CronJob'] as const).map(t => (
            <button key={t} onClick={() => up({ workloadType: t })}
              className={`flex flex-col items-center gap-1 p-2 border-2 rounded-xl text-xs font-medium transition ${wl.workloadType === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
              {WORKLOAD_ICONS[t]}{t}
            </button>
          ))}
        </div>

        {/* Basic */}
        <Section title="基础配置" icon={<Box className="w-4 h-4 text-blue-500" />}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">应用名称 (遵循 K8s 规范)</p>
              <input type="text" value={wl.appName}
                onChange={e => up({ appName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                className={inp} placeholder="my-app" />
            </div>
            <div><p className="text-xs text-gray-500 mb-1">命名空间</p><input type="text" value={wl.namespace} onChange={e => up({ namespace: e.target.value })} className={inp} /></div>
            <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">镜像 (Image)</p><input type="text" value={wl.image} onChange={e => up({ image: e.target.value })} className={inp} /></div>
            {!isDaemon && !isCronJob && (
              <div className="grid grid-cols-2 gap-2 col-span-2">
                <div><p className="text-xs text-gray-500 mb-0.5">副本数</p><input type="number" min="1" value={wl.replicas} onChange={e => up({ replicas: parseInt(e.target.value) || 1 })} className={inpSm} /></div>
                <div>
                  <ResourceSelector
                    label="镜像拉取密钥 (imagePullSecrets)"
                    value={wl.imagePullSecrets?.[0]?.name || ''}
                    onChange={val => up({ imagePullSecrets: val ? [{ name: val }] : [] })}
                    options={[
                      ...secrets.filter(s => s.secretType === 'kubernetes.io/dockerconfigjson').map(s => ({ id: s.id, name: s.name, info: '私有镜像仓库密钥' })),
                      ...secrets.filter(s => s.secretType !== 'kubernetes.io/dockerconfigjson').map(s => ({ id: s.id, name: s.name }))
                    ]}
                    placeholder="-- 无 / 不使用密钥 --"
                    manualPlaceholder="输入 Secret 名称"
                  />
                </div>
              </div>
            )}
            <div><p className="text-xs text-gray-500 mb-1">容器端口</p><input type="text" value={wl.containerPort} onChange={e => up({ containerPort: e.target.value })} className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">拉取策略</p><select value={wl.imagePullPolicy} onChange={e => up({ imagePullPolicy: e.target.value as any })} className={inp}><option value="IfNotPresent">IfNotPresent (推荐)</option><option value="Always">Always</option><option value="Never">Never</option></select></div>
          </div>

          <div className="mt-4 p-3 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">执行配置</span>
                </div>

                <label className="flex items-center gap-2 px-2 py-1 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-800/30 rounded-full cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group">
                  <div
                    onClick={() => up({ useShellWrapper: !wl.useShellWrapper })}
                    className={`w-3 h-3 rounded border transition-all flex items-center justify-center cursor-pointer ${wl.useShellWrapper ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-yellow-400/60 shadow-inner'}`}
                  >
                    {wl.useShellWrapper && <Check className="w-2 h-2 text-white stroke-[4]" />}
                  </div>
                  <span className="text-[9px] font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-yellow-500" /> 安全 Shell 模式 (sh -ec)
                  </span>
                </label>
              </div>

              <div className="text-[9px] font-mono bg-white/50 dark:bg-black/30 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm">
                <span className="opacity-40">Pods:</span> {wl.useShellWrapper ? 'sh -ec "' : ''}{wl.command || '<ENTRYPOINT>'} {wl.args || '<ARGS>'}{wl.useShellWrapper ? '"' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {/* Connecting Plus Icon */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-[31px] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 shadow-lg flex items-center justify-center ring-4 ring-blue-500/5 transition-transform hover:scale-110">
                  <Plus className="w-3 h-3 text-blue-500 font-bold" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">入口指令 (command)</span>
                  </div>
                  <span className="text-[9px] font-black text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800/60 px-1.5 py-0.5 rounded shadow-sm scale-90">固定执行体</span>
                </div>
                <input
                  type="text"
                  value={wl.command}
                  onChange={e => up({ command: e.target.value })}
                  placeholder="如: /usr/bin/python3"
                  className={inpSm + " font-mono !bg-white dark:!bg-[#1C2128] border-blue-200 dark:border-blue-800"}
                />
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 pl-1 italic font-medium">对应 Docker Entrypoint</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">运行参数 (args)</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-800/60 px-1.5 py-0.5 rounded shadow-sm scale-90">默认参数集</span>
                </div>
                <input
                  type="text"
                  value={wl.args}
                  onChange={e => up({ args: e.target.value })}
                  placeholder="如: app.py --port 80"
                  className={inpSm + " font-mono !bg-white dark:!bg-[#1C2128] border-emerald-200 dark:border-emerald-800"}
                />
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5 pl-1 italic font-medium">对应 Docker CMD</p>
              </div>
            </div>
          </div>

          {isSts && (
            <div className="mt-2"><p className="text-xs text-gray-500 mb-1">Headless Service 名称</p><input type="text" value={wl.serviceName} onChange={e => up({ serviceName: e.target.value })} className={inp} /></div>
          )}
          {isCronJob && (
            <div className="space-y-2 mt-2">
              <div><p className="text-xs text-gray-500 mb-1">调度表达式</p><input type="text" value={wl.schedule} onChange={e => up({ schedule: e.target.value })} className={`${inp} font-mono`} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-xs text-gray-500 mb-1">并发策略</p><select value={wl.concurrencyPolicy} onChange={e => up({ concurrencyPolicy: e.target.value as any })} className={inp}><option value="Forbid">Forbid</option><option value="Allow">Allow</option><option value="Replace">Replace</option></select></div>
                <div><p className="text-xs text-gray-500 mb-1">重启策略</p><select value={wl.restartPolicy} onChange={e => up({ restartPolicy: e.target.value as any })} className={inp}><option value="OnFailure">OnFailure</option><option value="Never">Never</option></select></div>
              </div>
            </div>
          )}
        </Section>

        {/* Metadata */}
        <MetadataEditor
          labels={wl.labels} annotations={wl.annotations}
          onUpdateLabels={(v: any) => up({ labels: v })}
          onUpdateAnnotations={(v: any) => up({ annotations: v })}
          podLabels={wl.podLabels} podAnnotations={wl.podAnnotations}
          onUpdatePodLabels={(v: any) => up({ podLabels: v })}
          onUpdatePodAnnotations={(v: any) => up({ podAnnotations: v })}
          theme="blue"
        />

        {/* Resources */}
        <Section title="资源限制" icon={<Cpu className="w-4 h-4 text-yellow-500" />} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'CPU Request', val: wl.cpuReq, key: 'cpuReq', hints: ['100m', '500m', '1'] },
              { label: 'CPU Limit', val: wl.cpuLimit, key: 'cpuLimit', hints: ['500m', '1', '2'] },
              { label: 'Mem Request', val: wl.memReq, key: 'memReq', hints: ['128Mi', '512Mi', '1Gi'] },
              { label: 'Mem Limit', val: wl.memLimit, key: 'memLimit', hints: ['512Mi', '1Gi', '2Gi'] },
            ].map(field => (
              <div key={field.key}>
                <p className="text-xs text-gray-500 mb-1">{field.label}</p>
                <input type="text" value={field.val} onChange={e => up({ [field.key]: e.target.value })} className={inp} />
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {field.hints.map(h => (
                    <button key={h} onClick={() => up({ [field.key]: h })}
                      className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-[10px] text-gray-400 hover:text-blue-500 hover:border-blue-500 transition">
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Env Vars */}
        <Section title="环境变量" icon={<Tag className="w-4 h-4 text-teal-500" />} defaultOpen={true}>
          <div className="space-y-2">
            {wl.envs.map((e, i) => {
              const upE = (patch: Partial<typeof e>) => updateWorkloadEnv(wl.id, i, patch);
              const colors: Record<string, string> = {
                value: 'border-gray-200 dark:border-gray-700',
                configMapKeyRef: 'border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10',
                secretKeyRef: 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10',
              };
              return (
                <div key={e.id} className={`p-2.5 border rounded-lg space-y-1.5 ${colors[e.type]}`}>
                  <div className="flex gap-2 items-center">
                    <input type="text" placeholder="ENV_NAME" value={e.name}
                      onChange={ev => upE({ name: ev.target.value })}
                      className="min-w-0 flex-1 bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-xs font-mono focus:outline-none focus:border-blue-400" />
                    <select value={e.type} onChange={ev => upE({ type: ev.target.value as any, value: '', refName: '', refKey: '' })}
                      className="shrink-0 w-36 bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-xs focus:outline-none focus:border-blue-400">
                      <option value="value">直接值</option>
                      <option value="configMapKeyRef">ConfigMap Key</option>
                      <option value="secretKeyRef">Secret Key</option>
                    </select>
                    <button onClick={() => removeWorkloadEnv(wl.id, i)} className="shrink-0 text-gray-400 hover:text-red-400 text-sm px-1">×</button>
                  </div>

                  {e.type === 'value' ? (
                    <input type="text" placeholder="value" value={e.value}
                      onChange={ev => upE({ value: ev.target.value })} className={inpSm} />
                  ) : (
                    <div className="flex gap-1.5 flex-wrap">
                      <select value={e.refName} onChange={ev => upE({ refName: ev.target.value, refKey: '' })} className={`flex-1 min-w-28 ${inpSm}`}>
                        <option value="">-- 选择{e.type === 'configMapKeyRef' ? 'ConfigMap' : 'Secret'} --</option>
                        {(e.type === 'configMapKeyRef' ? configMaps : secrets).map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>

                      {(() => {
                        const resource = (e.type === 'configMapKeyRef' ? configMaps : secrets).find(r => r.name === e.refName);
                        const keys = resource?.data.map(d => d.key) || [];

                        if (keys.length > 0) {
                          return (
                            <select value={e.refKey} onChange={ev => upE({ refKey: ev.target.value })} className={`w-36 ${inpSm} font-mono`}>
                              <option value="">-- 选择 Key --</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          );
                        }
                        return (
                          <input type="text" placeholder="key" value={e.refKey}
                            onChange={ev => upE({ refKey: ev.target.value })} className={`w-36 ${inpSm} font-mono`} />
                        );
                      })()}

                      <Checkbox checked={e.optional} onChange={v => upE({ optional: v })} label="optional" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={() => addWorkloadEnv(wl.id)} className="text-xs text-teal-600 hover:text-teal-500 font-medium my-2">+ 添加环境变量</button>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 font-bold uppercase tracking-wider">envFrom（整体注入）</p>
            <div className="space-y-2">
              {(wl.envFrom || []).map((ef, i) => (
                <div key={ef.id} className="p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase">
                    <div className="flex items-center gap-1.5"><ListTree className="w-3.5 h-3.5" />envFrom</div>
                    <button onClick={() => removeWorkloadEnvFrom(wl.id, i)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex gap-2">
                    <select value={ef.type}
                      onChange={ev => updateWorkloadEnvFrom(wl.id, i, { type: ev.target.value as any, name: '' })}
                      className="w-32 shrink-0 bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-xs focus:outline-none focus:border-blue-400">
                      <option value="configMap">ConfigMap</option>
                      <option value="secret">Secret</option>
                    </select>
                    <select value={ef.name}
                      onChange={ev => updateWorkloadEnvFrom(wl.id, i, { name: ev.target.value })}
                      className="flex-1 min-w-0 bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-xs focus:outline-none focus:border-blue-400">
                      <option value="">-- 选择由「存储」定义的资源 --</option>
                      {(ef.type === 'configMap' ? configMaps : secrets).map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                    <input type="text" placeholder="Prefix (可选)" value={ef.prefix}
                      onChange={ev => updateWorkloadEnvFrom(wl.id, i, { prefix: ev.target.value })}
                      className="w-32 shrink-0 bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-xs focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => addWorkloadEnvFrom(wl.id)} className="text-xs text-indigo-500 hover:text-indigo-400 font-medium py-1 mt-1 font-bold">+ envFrom 注入</button>
          </div>
        </Section>

        {/* Volumes */}
        <Section title="数据卷挂载" icon={<Database className="w-4 h-4 text-indigo-500" />} defaultOpen={false}>
          <div className="space-y-3">
            {wl.volumeMounts.map(v => (
              <div key={v.id} className="p-3 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-lg space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase">
                  <div className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5" />挂载配置 (Volume Mount)</div>
                  <button onClick={() => removeWorkloadVol(wl.id, v.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1 ml-1 font-medium">卷名称 (Volume Name)</p>
                    <input type="text" placeholder="data-vol" value={v.name} onChange={e => updateWorkloadVol(wl.id, v.id, { name: e.target.value })} className={inpSm} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1 ml-1 font-medium">挂载路径 (Mount Path)</p>
                    <input type="text" placeholder="/data" value={v.mountPath} onChange={e => updateWorkloadVol(wl.id, v.id, { mountPath: e.target.value })} className={inpSm} />
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 mb-1 ml-1 font-medium">存储后端 (Storage Source)</p>
                    <select value={v.sourceType}
                      onChange={e => updateWorkloadVol(wl.id, v.id, { sourceType: e.target.value as any, resourceRef: '' })}
                      className={inpSm}>
                      <option value="pvc">PersistentVolumeClaim</option>
                      <option value="configMap">ConfigMap</option>
                      <option value="secret">Secret</option>
                      <option value="hostPath">HostPath</option>
                      <option value="emptyDir">EmptyDir (临时占位)</option>
                    </select>
                  </div>

                  <div>
                    {['pvc', 'configMap', 'secret'].includes(v.sourceType) ? (
                      <ResourceSelector
                        label="选择资源 (Select Resource)"
                        value={v.resourceRef}
                        onChange={val => updateWorkloadVol(wl.id, v.id, { resourceRef: val })}
                        options={(v.sourceType === 'pvc' ? pvcs : v.sourceType === 'configMap' ? configMaps : secrets).map(r => ({ id: r.id, name: r.name }))}
                        placeholder="-- 选择在此处创建的资源 --"
                        manualPlaceholder={`输入已有 ${v.sourceType} 名称`}
                      />
                    ) : (
                      <>
                        <p className="text-[10px] text-gray-500 mb-1 ml-1 font-medium">资源路径 (Path)</p>
                        <input type="text"
                          placeholder={v.sourceType === 'hostPath' ? "宿主机绝对路径 (如 /var/data)" : "无需配置资源引用"}
                          disabled={v.sourceType === 'emptyDir'}
                          value={v.hostPathValue || ''}
                          onChange={e => updateWorkloadVol(wl.id, v.id, { hostPathValue: e.target.value })}
                          className={inpSm} />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <Checkbox checked={v.readOnly} onChange={val => updateWorkloadVol(wl.id, v.id, { readOnly: val })} label="只读 (ReadOnly)" className="shrink-0" />

                  {(v.sourceType === 'configMap' || v.sourceType === 'secret') && (
                    <div className="flex-1 flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800 overflow-hidden">
                      <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">SUBPATH / KEY:</span>
                      {(() => {
                        const res = (v.sourceType === 'configMap' ? configMaps : secrets).find(r => r.name === v.resourceRef);
                        const keys = res?.data.map(d => d.key) || [];
                        if (keys.length > 0) {
                          return (
                            <select value={v.subPath} onChange={e => updateWorkloadVol(wl.id, v.id, { subPath: e.target.value })}
                              className="flex-1 min-w-0 bg-transparent text-xs py-0.5 border-b border-dashed border-gray-400 dark:border-gray-600 focus:outline-none focus:border-blue-400 h-6">
                              <option value="">-- 全部挂载 (默认) --</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          );
                        }
                        return <input type="text" placeholder="指定 Key 挂载为文件 (可选)" value={v.subPath}
                          onChange={e => updateWorkloadVol(wl.id, v.id, { subPath: e.target.value })}
                          className="flex-1 border-b border-gray-200 dark:border-gray-700 bg-transparent text-xs py-0.5 px-1 focus:outline-none focus:border-blue-400" />;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => addWorkloadVol(wl.id)} className="text-xs text-indigo-500 hover:text-indigo-400 font-bold py-1 mt-2">+ 添加挂载卷</button>
        </Section>

        {/* Probes */}
        <Section title="健康检查 (Probes)" icon={<Activity className="w-4 h-4 text-rose-500" />} defaultOpen={false}>
          <ProbeEditor label="存活探针 (Liveness)" probe={wl.livenessProbe} onChange={(f, v) => updateWorkloadProbe(wl.id, 'livenessProbe', f, v)} />
          <ProbeEditor label="就绪探针 (Readiness)" probe={wl.readinessProbe} onChange={(f, v) => updateWorkloadProbe(wl.id, 'readinessProbe', f, v)} />
          <ProbeEditor label="启动检查 (startupProbe)" probe={wl.startupProbe} onChange={(f, v) => updateWorkloadProbe(wl.id, 'startupProbe', f, v)} />
        </Section>

        {/* Security */}
        <Section title="安全上下文" icon={<Shield className="w-4 h-4 text-amber-500" />} defaultOpen={false}>
          <div className="grid grid-cols-3 gap-2">
            <div><p className="text-xs text-gray-500 mb-0.5">runAsUser</p><input type="number" placeholder="1000" value={wl.runAsUser} onChange={e => up({ runAsUser: e.target.value })} className={inpSm} /></div>
            <div><p className="text-xs text-gray-500 mb-0.5">runAsGroup</p><input type="number" placeholder="3000" value={wl.runAsGroup} onChange={e => up({ runAsGroup: e.target.value })} className={inpSm} /></div>
            <div><p className="text-xs text-gray-500 mb-0.5">fsGroup</p><input type="number" placeholder="2000" value={wl.fsGroup} onChange={e => up({ fsGroup: e.target.value })} className={inpSm} /></div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            <Checkbox checked={wl.runAsNonRoot} onChange={v => up({ runAsNonRoot: v })} label="runAsNonRoot" />
            <Checkbox checked={wl.readOnlyRootFilesystem} onChange={v => up({ readOnlyRootFilesystem: v })} label="readOnlyRootFilesystem" />
            <Checkbox checked={wl.allowPrivilegeEscalation} onChange={v => up({ allowPrivilegeEscalation: v })} label="allowPrivilegeEscalation" />
          </div>
        </Section>

        {/* Update Strategy */}
        {!isDaemon && !isCronJob && (
          <Section title="更新策略" icon={<RefreshCw className="w-4 h-4 text-cyan-500" />} defaultOpen={false}>
            <div className="flex gap-3">
              <div className="flex-1"><p className="text-xs text-gray-500 mb-1">策略</p>
                <select value={wl.updateStrategy} onChange={e => up({ updateStrategy: e.target.value as any })} className={inp}>
                  <option value="RollingUpdate">RollingUpdate</option><option value="Recreate">Recreate</option>
                </select></div>
              {wl.updateStrategy === 'RollingUpdate' && <>
                <div className="flex-1"><p className="text-xs text-gray-500 mb-1">maxSurge</p><input type="text" value={wl.maxSurge} onChange={e => up({ maxSurge: e.target.value })} className={inp} /></div>
                <div className="flex-1"><p className="text-xs text-gray-500 mb-1">maxUnavailable</p><input type="text" value={wl.maxUnavailable} onChange={e => up({ maxUnavailable: e.target.value })} className={inp} /></div>
              </>}
            </div>
          </Section>
        )}

        {/* Node Scheduling */}
        <Section title="节点调度" icon={<Globe className="w-4 h-4 text-slate-500" />} defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Node Selector (节点选择器)</p>
              <div className="space-y-2">
                {wl.nodeSelector.map((ns, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input type="text" placeholder="key (如 disktype)" value={ns.key} onChange={e => updateWorkloadNS(wl.id, i, 'key', e.target.value)} className={inpSm} />
                    <input type="text" placeholder="value (如 ssd)" value={ns.value} onChange={e => updateWorkloadNS(wl.id, i, 'value', e.target.value)} className={inpSm} />
                    <button onClick={() => removeWorkloadNS(wl.id, i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => addWorkloadNS(wl.id)} className="text-[10px] text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" />添加标签选择
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Tolerations (污点容忍)</p>
              <div className="space-y-3">
                {wl.tolerations.map((t, i) => (
                  <div key={i} className="p-2.5 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-lg relative group">
                    <button onClick={() => removeWorkloadTol(wl.id, i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1 ml-0.5">Key</p>
                        <input type="text" placeholder="key" value={t.key} onChange={e => updateWorkloadTol(wl.id, i, { key: e.target.value })} className={inpSm} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1 ml-0.5">Operator</p>
                        <select value={t.operator} onChange={e => updateWorkloadTol(wl.id, i, { operator: e.target.value as any })} className={inpSm}>
                          <option>Equal</option>
                          <option>Exists</option>
                        </select>
                      </div>
                      {t.operator === 'Equal' && (
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1 ml-0.5">Value</p>
                          <input type="text" placeholder="value" value={t.value} onChange={e => updateWorkloadTol(wl.id, i, { value: e.target.value })} className={inpSm} />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1 ml-0.5">Effect</p>
                        <select value={t.effect} onChange={e => updateWorkloadTol(wl.id, i, { effect: e.target.value as any })} className={inpSm}>
                          <option value="">(任意)</option>
                          <option>NoSchedule</option>
                          <option>PreferNoSchedule</option>
                          <option>NoExecute</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addWorkloadTol(wl.id)} className="text-[10px] text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" />添加容忍策略
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-6 gap-y-3">
              <Checkbox checked={wl.hostNetwork} onChange={v => up({ hostNetwork: v })} label="使用宿主机网络 (hostNetwork)" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase">dnsPolicy:</span>
                <select value={wl.dnsPolicy} onChange={e => up({ dnsPolicy: e.target.value })} className="bg-transparent text-xs border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-400 pb-0.5">
                  <option value="ClusterFirst">ClusterFirst</option>
                  <option value="ClusterFirstWithHostNet">ClusterFirstWithHostNet</option>
                  <option value="Default">Default</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>
        </Section>
        <Section title="网络暴露 (关联 Service & Ingress)" icon={<Network className="w-4 h-4 text-green-500" />} defaultOpen={true}>
          <div className="space-y-6">
            {/* 1. Services Section */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Layers className="w-3 h-3" />关联 Service</p>
              {services.length === 0 && <p className="text-xs text-gray-400 italic">暂无可选 Service，请在「网络」标签页创建</p>}
              <div className="space-y-2">
                {services.map(s => {
                  const isBound = s.selectorApp === wl.appName;
                  return (
                    <div key={s.id} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${isBound ? 'border-green-200 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100'}`}>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isBound} onChange={val => updateService(s.id, { selectorApp: val ? wl.appName : '' })} />
                        <div>
                          <p className="text-xs font-medium">{s.name} <span className="text-[9px] text-gray-400 font-normal">({s.type})</span></p>
                          <p className="text-[9px] text-gray-400">Port {s.port} → {s.targetPort}</p>
                        </div>
                      </div>
                      {isBound && <span className="text-[9px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1 rounded">已挂载</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Ingress Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Globe className="w-3 h-3" />流量入口 (Ingress)</p>
              {ingresses.length === 0 && <p className="text-xs text-gray-400 italic">暂无 Ingress</p>}
              <div className="space-y-2">
                {ingresses.map(ing => {
                  const mySvcs = services.filter(s => s.selectorApp === wl.appName).map(s => s.name);
                  const isPointing = ing.rules.some(r => mySvcs.includes(r.serviceName));

                  return (
                    <div key={ing.id} className={`p-2 rounded-lg border transition-all ${isPointing ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-800 opacity-80'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{ing.name}</p>
                          <p className="text-[9px] text-gray-500 font-medium">Class: {ing.ingressClassName || 'default'}</p>
                        </div>
                        {isPointing ?
                          <span className="text-[9px] font-black text-white bg-purple-600 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse-subtle">指向此应用 <Activity className="w-2.5 h-2.5" /></span> :
                          <span className="text-[9px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">未关联</span>
                        }
                      </div>

                      <div className="space-y-1.5">
                        {ing.rules.map(r => {
                          const pointsToMe = mySvcs.includes(r.serviceName);
                          return (
                            <div key={r.id} className={`text-[10px] flex items-center justify-between p-2 rounded transition-all ${pointsToMe ? 'bg-white dark:bg-[#1C2128] border border-purple-300 dark:border-purple-700 shadow-sm text-purple-800 dark:text-purple-200' : 'bg-gray-50/50 dark:bg-gray-800/50 border border-transparent text-gray-600'}`}>
                              <span className="truncate mr-2 font-mono flex-1">
                                <span className="text-gray-400">{r.host || '*'}{r.path}</span>
                                <span className="mx-1 text-gray-300">→</span>
                                <span className={pointsToMe ? 'font-bold' : 'text-gray-400'}>{r.serviceName || '(未指定)'}</span>
                              </span>
                              {pointsToMe ? (
                                <button
                                  onClick={() => {
                                    const { updateIngressRule } = useKubernetesStore.getState();
                                    updateIngressRule(ing.id, r.id, { serviceName: '' });
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-all font-bold shadow-sm whitespace-nowrap">
                                  <Trash2 className="w-2.5 h-2.5" />取消
                                </button>
                              ) : (
                                mySvcs.length > 0 && (
                                  <button
                                    onClick={() => {
                                      const { updateIngressRule } = useKubernetesStore.getState();
                                      updateIngressRule(ing.id, r.id, { serviceName: mySvcs[0] });
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-700 text-white hover:bg-blue-800 transition-all font-bold shadow-sm whitespace-nowrap">
                                    <Link className="w-2.5 h-2.5" />关联到此
                                  </button>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── Resource list row ─────────────────────────────────────────────────────────
function ResRow({ label, sub, active, onClick, onDelete, theme = "blue" }: { label: string; sub?: string; active: boolean; onClick: () => void; onDelete: () => void; theme?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50/50 dark:bg-blue-900/10 border-blue-400",
    green: "bg-green-50/50 dark:bg-green-900/10 border-green-400",
    purple: "bg-purple-50/50 dark:bg-purple-900/10 border-purple-400",
    orange: "bg-orange-50/50 dark:bg-orange-900/10 border-orange-400",
    indigo: "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-400",
    teal: "bg-teal-50/50 dark:bg-teal-900/10 border-teal-400",
    amber: "bg-amber-50/50 dark:bg-amber-900/10 border-amber-400",
    slate: "bg-slate-50/50 dark:bg-slate-900/10 border-slate-400",
  };
  const activeClass = colors[theme] || colors.blue;

  return (
    <div onClick={onClick} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border-2 mb-2 ${active ? activeClass : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0D1117]'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'animate-pulse bg-current' : 'bg-gray-300'}`} style={{ backgroundColor: active ? undefined : '#cbd5e1' }}></div>
        <div>
          <p className={`text-sm font-bold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{label}</p>
          {sub && <p className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">{sub}</p>}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-gray-300 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Network Section ──────────────────────────────────────────────────────────
function NetworkSection() {
  const { services, ingresses, workloads, activeServiceId, activeIngressId, setActiveServiceId, setActiveIngressId, addService, removeService, updateService, addIngress, removeIngress, updateIngress, addIngressRule, removeIngressRule, updateIngressRule } = useKubernetesStore();
  const svc = services.find(s => s.id === activeServiceId);
  const ing = ingresses.find(i => i.id === activeIngressId);

  return (
    <div className="space-y-4">
      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Network className="w-4 h-4 text-green-500" />Service</p>
          <button onClick={addService} className={`${btnSm} border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20`}><Plus className="w-3 h-3" />新建</button>
        </div>
        {services.length === 0 && <p className="text-xs text-gray-400 italic px-1">暂无 Service，点击「新建」添加</p>}
        {services.map(s => <ResRow key={s.id} label={s.name} sub={`${s.type} · ${s.port}→${s.targetPort}`} theme="green" active={s.id === activeServiceId} onClick={() => { setActiveServiceId(s.id); setActiveIngressId(null); }} onDelete={() => removeService(s.id)} />)}
      </div>

      {svc && (
        <div className="border-2 border-green-100 dark:border-green-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] shadow-xl shadow-green-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest">编辑 Service</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-3">
              <div><p className="text-xs text-gray-500 mb-1">Service 名称</p><input type="text" value={svc.name} onChange={e => updateService(svc.id, { name: e.target.value })} className={inp} /></div>
              <div><p className="text-xs text-gray-500 mb-1">命名空间</p><input type="text" value={svc.namespace} onChange={e => updateService(svc.id, { namespace: e.target.value })} className={inp} /></div>
            </div>

            <div className="col-span-2 mt-1">
              <MetadataEditor
                labels={svc.labels} annotations={svc.annotations}
                onUpdateLabels={(v: any) => updateService(svc.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateService(svc.id, { annotations: v })}
                theme="green"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">类型</p>
              <select value={svc.type} onChange={e => updateService(svc.id, { type: e.target.value as any })} className={inp}>
                <option value="ClusterIP">ClusterIP</option>
                <option value="NodePort">NodePort</option>
                <option value="LoadBalancer">LoadBalancer</option>
                <option value="Headless">Headless (None)</option>
              </select>
            </div>
            <div>
              <ResourceSelector
                label="选择关联工作负载"
                value={svc.selectorApp}
                onChange={v => updateService(svc.id, { selectorApp: v })}
                options={workloads.map(w => ({ id: w.id, name: w.appName }))}
                placeholder="-- 默认无 --"
              />
            </div>
            <div className="grid grid-cols-3 col-span-2 gap-2">
              <div><p className="text-xs text-gray-500 mb-1">Port</p><input type="text" placeholder="80" value={svc.port} onChange={e => updateService(svc.id, { port: e.target.value })} className={inp} /></div>
              <div><p className="text-xs text-gray-500 mb-1">TargetPort</p><input type="text" placeholder="80" value={svc.targetPort} onChange={e => updateService(svc.id, { targetPort: e.target.value })} className={inp} /></div>
              {svc.type === 'NodePort' && <div><p className="text-xs text-gray-500 mb-1">NodePort</p><input type="text" placeholder="30000" value={svc.nodePort} onChange={e => updateService(svc.id, { nodePort: e.target.value })} className={inp} /></div>}
            </div>
          </div>


        </div>
      )}

      {/* Ingresses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-500" />Ingress</p>
          <button onClick={addIngress} className={`${btnSm} border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20`}><Plus className="w-3 h-3" />新建</button>
        </div>
        {ingresses.length === 0 && <p className="text-xs text-gray-400 italic px-1">暂无 Ingress，点击「新建」添加</p>}
        {ingresses.map(i => <ResRow key={i.id} label={i.name} sub={`${i.rules.length} 条路由规则`} theme="purple" active={i.id === activeIngressId} onClick={() => { setActiveIngressId(i.id); setActiveServiceId(null); }} onDelete={() => removeIngress(i.id)} />)}
      </div>

      {ing && (
        <div className="border-2 border-purple-100 dark:border-purple-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] shadow-xl shadow-purple-500/5 duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">编辑 Ingress</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">名称</p><input type="text" value={ing.name} onChange={e => updateIngress(ing.id, { name: e.target.value })} className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">ingressClassName</p><input type="text" value={ing.ingressClassName} onChange={e => updateIngress(ing.id, { ingressClassName: e.target.value })} className={inp} /></div>
            <div className="col-span-2">
              <MetadataEditor
                labels={ing.labels} annotations={ing.annotations}
                onUpdateLabels={(v: any) => updateIngress(ing.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateIngress(ing.id, { annotations: v })}
                theme="purple"
              />
            </div>
          </div>
          <Checkbox checked={ing.tls} onChange={v => updateIngress(ing.id, { tls: v })} label="启用 TLS (HTTPS)" />
          {ing.tls && <div><p className="text-xs text-gray-500 mb-1">TLS Secret 名称</p><input type="text" value={ing.tlsSecret} onChange={e => updateIngress(ing.id, { tlsSecret: e.target.value })} className={inp} /></div>}
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">路由规则</p>
          {ing.rules.map(r => (
            <div key={r.id} className="flex gap-2 flex-wrap items-end p-2 bg-gray-50 dark:bg-[#161B22] rounded-lg">
              <div className="flex-1 min-w-28"><p className="text-xs text-gray-400 mb-0.5">域名</p><input type="text" placeholder="example.com" value={r.host} onChange={e => updateIngressRule(ing.id, r.id, { host: e.target.value })} className={inpSm} /></div>
              <div className="w-16"><p className="text-xs text-gray-400 mb-0.5">路径</p><input type="text" value={r.path} onChange={e => updateIngressRule(ing.id, r.id, { path: e.target.value })} className={inpSm} /></div>
              <div className="flex-1 min-w-44">
                <ResourceSelector
                  label="关联 Service"
                  value={r.serviceName}
                  onChange={val => {
                    const targetSvc = services.find(s => s.name === val);
                    const patch: any = { serviceName: val };
                    if (targetSvc) patch.servicePort = targetSvc.port;
                    updateIngressRule(ing.id, r.id, patch);
                  }}
                  options={services.map(s => ({ id: s.id, name: s.name }))}
                  placeholder="-- 选择 Service --"
                  manualPlaceholder="输入 Service 名称"
                />
              </div>
              <div className="w-16"><p className="text-xs text-gray-400 mb-0.5">端口</p><input type="text" placeholder="80" value={r.servicePort} onChange={e => updateIngressRule(ing.id, r.id, { servicePort: e.target.value })} className={inpSm} /></div>
              <button onClick={() => removeIngressRule(ing.id, r.id)} className="text-gray-400 hover:text-red-400 pb-0.5 text-sm">×</button>
            </div>
          ))}
          <button onClick={() => addIngressRule(ing.id)} className="text-xs text-purple-500 font-medium">+ 添加路由规则</button>


        </div>
      )}
    </div>
  );
}

// ── Storage Section ──────────────────────────────────────────────────────────
function StorageSection() {
  const {
    pvcs, configMaps, secrets, pvs,
    activePvcId, activeConfigMapId, activeSecretId, activePvId,
    setActivePvcId, setActiveConfigMapId, setActiveSecretId, setActivePvId,
    addPvc, removePvc, updatePvc,
    addConfigMap, removeConfigMap, updateConfigMap, addConfigMapData, removeConfigMapData, updateConfigMapData,
    addSecret, removeSecret, updateSecret, addSecretData, removeSecretData, updateSecretData,
    addPv, removePv, updatePv,
    storageClasses, activeStorageClassId, setActiveStorageClassId, addStorageClass, removeStorageClass, updateStorageClass, addStorageClassParam, removeStorageClassParam, updateStorageClassParam
  } = useKubernetesStore();

  const sc = storageClasses.find(s => s.id === activeStorageClassId);
  const pvc = pvcs.find(p => p.id === activePvcId);
  const cm = configMaps.find(c => c.id === activeConfigMapId);
  const sec = secrets.find(s => s.id === activeSecretId);
  const pv = pvs.find(p => p.id === activePvId);

  return (
    <div className="space-y-5">
      {/* StorageClasses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Box className="w-4 h-4 text-orange-500" />StorageClass</p>
          <button onClick={addStorageClass} className={`${btnSm} border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20`}><Plus className="w-3 h-3" />新建</button>
        </div>
        {storageClasses.length === 0 && <p className="text-xs text-gray-400 italic px-1">暂无 StorageClass</p>}
        {storageClasses.map(item => (
          <ResRow
            key={item.id}
            label={item.name}
            sub={item.provisioner}
            active={item.id === activeStorageClassId}
            onClick={() => {
              setActiveStorageClassId(item.id);
              setActivePvcId(null); setActiveConfigMapId(null); setActiveSecretId(null); setActivePvId(null);
            }}
            onDelete={() => removeStorageClass(item.id)}
            theme="orange"
          />
        ))}
      </div>
      {sc && (
        <div className="border-2 border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] shadow-xl shadow-orange-500/5 duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">编辑 StorageClass</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">SC 名称</p><input type="text" value={sc.name} onChange={e => updateStorageClass(sc.id, { name: e.target.value })} className={inp} /></div>

            <div className="col-span-2 mb-2">
              <MetadataEditor
                labels={sc.labels} annotations={sc.annotations}
                onUpdateLabels={(v: any) => updateStorageClass(sc.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateStorageClass(sc.id, { annotations: v })}
                theme="orange"
              />
            </div>

            <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Provisioner (供应者)</p><input type="text" placeholder="kubernetes.io/aws-ebs" value={sc.provisioner} onChange={e => updateStorageClass(sc.id, { provisioner: e.target.value })} className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">回收策略</p><select value={sc.reclaimPolicy} onChange={e => updateStorageClass(sc.id, { reclaimPolicy: e.target.value as any })} className={inp}><option value="Delete">Delete</option><option value="Retain">Retain</option></select></div>
            <div><p className="text-xs text-gray-500 mb-1">绑定模式</p><select value={sc.volumeBindingMode} onChange={e => updateStorageClass(sc.id, { volumeBindingMode: e.target.value as any })} className={inp}><option value="Immediate">Immediate</option><option value="WaitForFirstConsumer">WaitForFirstConsumer</option></select></div>
            <div className="col-span-2"><Checkbox checked={sc.allowVolumeExpansion} onChange={v => updateStorageClass(sc.id, { allowVolumeExpansion: v })} label="允许卷扩容 (allowVolumeExpansion)" /></div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Parameters (驱动参数)</p>
            <div className="space-y-2">
              {sc.parameters.map((p, i) => (
                <div key={p.id} className="flex gap-2 items-center">
                  <input type="text" placeholder="key" value={p.key} onChange={e => updateStorageClassParam(sc.id, i, 'key', e.target.value)} className={inpSm} />
                  <input type="text" placeholder="value" value={p.value} onChange={e => updateStorageClassParam(sc.id, i, 'value', e.target.value)} className={inpSm} />
                  <button onClick={() => removeStorageClassParam(sc.id, i)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => addStorageClassParam(sc.id)} className="text-[10px] text-blue-500 hover:text-blue-400 font-bold">+ 添加参数</button>
            </div>
          </div>


        </div>
      )}
      {/* PVs (Cluster-wide) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-slate-500" />PersistentVolume (集群级)</p>
          <button onClick={addPv} className={`${btnSm} border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400`}><Plus className="w-3 h-3" />新建</button>
        </div>
        {pvs.length === 0 && <p className="text-xs text-gray-400 italic px-1">暂无 PV</p>}
        {pvs.map(p => <ResRow key={p.id} label={p.name} sub={`${p.capacity} · ${p.accessMode}`} theme="slate" active={p.id === activePvId} onClick={() => { setActivePvId(p.id); setActivePvcId(null); setActiveConfigMapId(null); setActiveSecretId(null); setActiveStorageClassId(null); }} onDelete={() => removePv(p.id)} />)}
      </div>
      {pv && (
        <div className="border-2 border-slate-100 dark:border-slate-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] duration-300 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-slate-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">编辑 PersistentVolume</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">PV 名称</p><input type="text" value={pv.name} onChange={e => updatePv(pv.id, { name: e.target.value })} className={inp} /></div>
            <div className="col-span-2">
              <MetadataEditor
                labels={pv.labels} annotations={pv.annotations}
                onUpdateLabels={(v: any) => updatePv(pv.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updatePv(pv.id, { annotations: v })}
                theme="slate"
              />
            </div>
            <div><p className="text-xs text-gray-500 mb-1">容量</p><input type="text" placeholder="10Gi" value={pv.capacity} onChange={e => updatePv(pv.id, { capacity: e.target.value })} className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">AccessMode</p><select value={pv.accessMode} onChange={e => updatePv(pv.id, { accessMode: e.target.value as any })} className={inp}><option value="ReadWriteOnce">ReadWriteOnce</option><option value="ReadWriteMany">ReadWriteMany</option><option value="ReadOnlyMany">ReadOnlyMany</option></select></div>
            <div><p className="text-xs text-gray-500 mb-1">回收策略</p><select value={pv.reclaimPolicy} onChange={e => updatePv(pv.id, { reclaimPolicy: e.target.value as any })} className={inp}><option value="Retain">Retain</option><option value="Delete">Delete</option><option value="Recycle">Recycle</option></select></div>
            <div>
              <p className="text-xs text-gray-500 mb-1">StorageClass</p>
              <select value={pv.storageClass} onChange={e => updatePv(pv.id, { storageClass: e.target.value })} className={inp}>
                <option value="">-- 无 (标准模式) --</option>
                {storageClasses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>



          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 mb-2">存储后端配置</p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select value={pv.sourceType} onChange={e => updatePv(pv.id, { sourceType: e.target.value as any })} className={`w-32 shrink-0 ${inpSm}`}>
                  <option value="hostPath">HostPath</option>
                  <option value="nfs">NFS</option>
                  <option value="local">Local</option>
                  <option value="csi">CSI</option>
                </select>
                {pv.sourceType === 'hostPath' && <input type="text" placeholder="路径 (如 /mnt/data)" value={pv.hostPath} onChange={e => updatePv(pv.id, { hostPath: e.target.value })} className={inpSm} />}
                {pv.sourceType === 'local' && <input type="text" placeholder="本地磁盘路径" value={pv.hostPath} onChange={e => updatePv(pv.id, { hostPath: e.target.value })} className={inpSm} />}
                {pv.sourceType === 'nfs' && (
                  <div className="flex-1 flex gap-2">
                    <input type="text" placeholder="NFS 服务器" value={pv.nfsServer} onChange={e => updatePv(pv.id, { nfsServer: e.target.value })} className={inpSm} />
                    <input type="text" placeholder="共享路径" value={pv.nfsPath} onChange={e => updatePv(pv.id, { nfsPath: e.target.value })} className={inpSm} />
                  </div>
                )}
                {pv.sourceType === 'csi' && (
                  <div className="flex-1 flex gap-2">
                    <input type="text" placeholder="Driver (如 hostpath.csi.k8s.io)" value={pv.csiDriver} onChange={e => updatePv(pv.id, { csiDriver: e.target.value })} className={inpSm} />
                    <input type="text" placeholder="VolumeHandle" value={pv.csiHandle} onChange={e => updatePv(pv.id, { csiHandle: e.target.value })} className={inpSm} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PVCs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Database className="w-4 h-4 text-indigo-500" />PersistentVolumeClaim</p>
          <button onClick={addPvc} className={`${btnSm} border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400`}><Plus className="w-3 h-3" />新建</button>
        </div>
        {pvcs.length === 0 && <p className="text-xs text-gray-400 italic px-1">暂无 PVC</p>}
        {pvcs.map(p => <ResRow key={p.id} label={p.name} sub={`${p.storage} · ${p.accessMode}`} theme="indigo" active={p.id === activePvcId} onClick={() => { setActivePvcId(p.id); setActiveConfigMapId(null); setActiveSecretId(null); setActiveStorageClassId(null); }} onDelete={() => removePvc(p.id)} />)}
      </div>
      {pvc && (
        <div className="border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] duration-300 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">编辑 PVC</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">名称</p><input type="text" value={pvc.name} onChange={e => updatePvc(pvc.id, { name: e.target.value })} className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">命名空间</p><input type="text" value={pvc.namespace} onChange={e => updatePvc(pvc.id, { namespace: e.target.value })} className={inp} /></div>
            <div className="col-span-2">
              <MetadataEditor
                labels={pvc.labels} annotations={pvc.annotations}
                onUpdateLabels={(v: any) => updatePvc(pvc.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updatePvc(pvc.id, { annotations: v })}
                theme="indigo"
              />
            </div>
            <div><p className="text-xs text-gray-500 mb-1">存储大小</p><input type="text" placeholder="1Gi" value={pvc.storage} onChange={e => updatePvc(pvc.id, { storage: e.target.value })} className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">AccessMode</p><select value={pvc.accessMode} onChange={e => updatePvc(pvc.id, { accessMode: e.target.value as any })} className={inp}><option value="ReadWriteOnce">ReadWriteOnce</option><option value="ReadWriteMany">ReadWriteMany</option><option value="ReadOnlyMany">ReadOnlyMany</option></select></div>
            <div className="">
              <p className="text-xs text-gray-500 mb-1">StorageClass</p>
              <select value={pvc.storageClass} onChange={e => updatePvc(pvc.id, { storageClass: e.target.value })} className={inp}>
                <option value="">-- 集群默认 SC --</option>
                {storageClasses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="">
              <ResourceSelector
                label="绑定指定 PV (可选)"
                value={pvc.volumeName}
                onChange={val => {
                  const selectedPv = pvs.find(p => p.name === val);
                  if (selectedPv) {
                    updatePvc(pvc.id, { volumeName: val, storage: selectedPv.capacity, accessMode: selectedPv.accessMode, storageClass: selectedPv.storageClass });
                  } else {
                    updatePvc(pvc.id, { volumeName: val });
                  }
                }}
                options={pvs.map(p => ({ id: p.id, name: p.name, info: p.capacity }))}
                placeholder="-- 动态制备 (不指定) --"
                manualPlaceholder="输入 PV 名称"
              />
            </div>
          </div>

        </div>
      )}

      {/* ConfigMaps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Tag className="w-4 h-4 text-teal-500" />ConfigMap</p>
          <button onClick={addConfigMap} className={`${btnSm} border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400`}><Plus className="w-3 h-3" />新建</button>
        </div>
        {configMaps.length === 0 && <p className="text-xs text-gray-400 italic px-1">暂无 ConfigMap</p>}
        {configMaps.map(c => <ResRow key={c.id} label={c.name} sub={`data: ${c.data.length} 项`} theme="teal" active={c.id === activeConfigMapId} onClick={() => { setActiveConfigMapId(c.id); setActivePvcId(null); setActiveSecretId(null); setActiveStorageClassId(null); }} onDelete={() => removeConfigMap(c.id)} />)}
      </div>
      {cm && (
        <div className="border-2 border-teal-100 dark:border-teal-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] duration-300 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-teal-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">编辑 ConfigMap</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">名称</p><input type="text" value={cm.name} onChange={e => updateConfigMap(cm.id, { name: e.target.value })} className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">命名空间</p><input type="text" value={cm.namespace} onChange={e => updateConfigMap(cm.id, { namespace: e.target.value })} className={inp} /></div>
            <div className="col-span-2">
              <MetadataEditor
                labels={cm.labels} annotations={cm.annotations}
                onUpdateLabels={(v: any) => updateConfigMap(cm.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateConfigMap(cm.id, { annotations: v })}
                theme="teal"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Data</p>
          <div className="space-y-3">
            {cm.data.map((d, i) => (
              <div key={i} className="p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-tight">
                  <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Key / 文件名</div>
                  <button onClick={() => removeConfigMapData(cm.id, i)} className="text-gray-400 hover:text-red-400 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input type="text" placeholder="config.yaml / db_host..." value={d.key}
                  onChange={e => updateConfigMapData(cm.id, i, 'key', e.target.value)}
                  className={inpSm} />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Content / 值</div>
                <textarea placeholder="Paste configuration or value here..." value={d.value}
                  onChange={e => updateConfigMapData(cm.id, i, 'value', e.target.value)}
                  className={`w-full block min-h-[100px] max-h-[400px] bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-teal-500 font-mono transition`} />
              </div>
            ))}
          </div>
          <button onClick={() => addConfigMapData(cm.id)} className="text-[10px] text-blue-500 font-bold">+ 添加配置项</button>
        </div>
      )}

      {/* Secrets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Shield className="w-4 h-4 text-amber-500" />Secret</p>
          <button onClick={addSecret} className={`${btnSm} border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400`}><Plus className="w-3 h-3" />新建</button>
        </div>
        {secrets.length === 0 && <p className="text-xs text-gray-400 italic px-1">暂无 Secret</p>}
        {secrets.map(s => <ResRow key={s.id} label={s.name} sub={`type: ${s.secretType} · ${s.data.length} 项`} active={s.id === activeSecretId} onClick={() => { setActiveSecretId(s.id); setActivePvcId(null); setActiveConfigMapId(null); }} onDelete={() => removeSecret(s.id)} />)}
      </div>
      {sec && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3 bg-white dark:bg-[#0E1117]">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">编辑 Secret</p>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">名称</p><input type="text" value={sec.name} onChange={e => updateSecret(sec.id, { name: e.target.value })} className={inp} /></div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <select value={sec.secretType} onChange={e => updateSecret(sec.id, { secretType: e.target.value })} className={inp}>
                <option value="Opaque">Opaque (自定义/通用)</option>
                <option value="kubernetes.io/dockerconfigjson">kubernetes.io/dockerconfigjson (私有镜像仓库密钥)</option>
                <option value="kubernetes.io/tls">kubernetes.io/tls (SSL/TLS 证书)</option>
                <option value="kubernetes.io/basic-auth">kubernetes.io/basic-auth (基础认证)</option>
                <option value="kubernetes.io/ssh-auth">kubernetes.io/ssh-auth (SSH 密钥)</option>
                <option value="kubernetes.io/service-account-token">service-account-token</option>
              </select>
            </div>
            <div className="col-span-2">
              <MetadataEditor
                labels={sec.labels} annotations={sec.annotations}
                onUpdateLabels={(v: any) => updateSecret(sec.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateSecret(sec.id, { annotations: v })}
                theme="amber"
              />
            </div>
          </div>
          {/* Specialized UI Helpers for different Secret Types */}
          {(() => {
            if (sec.secretType === 'kubernetes.io/dockerconfigjson') {
              return (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />私有仓库凭据助手 (.dockerconfigjson)</p>
                  <div><p className="text-[10px] text-gray-500 mb-0.5">仓库地址 (Registry URL)</p><input type="text" placeholder="https://index.docker.io/v1/" defaultValue="https://index.docker.io/v1/" id="docker-registry" className={inpSm} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-[10px] text-gray-500 mb-0.5">用户名 (Username)</p><input type="text" placeholder="admin" id="docker-user" className={inpSm} /></div>
                    <div><p className="text-[10px] text-gray-500 mb-0.5">密码 (Password)</p><input type="password" placeholder="******" id="docker-pass" className={inpSm} /></div>
                  </div>
                  <button onClick={() => {
                    const reg = (document.getElementById('docker-registry') as HTMLInputElement).value || 'https://index.docker.io/v1/';
                    const user = (document.getElementById('docker-user') as HTMLInputElement).value;
                    const pass = (document.getElementById('docker-pass') as HTMLInputElement).value;
                    if (!user || !pass) return;
                    const auth = btoa(`${user}:${pass}`);
                    const config = JSON.stringify({ auths: { [reg]: { auth: btoa(`${user}:${pass}`) } } }, null, 2);
                    updateSecret(sec.id, { data: [{ key: '.dockerconfigjson', value: config }] });
                    alert('凭据已自动生成！');
                  }} className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all">生成并应用</button>
                </div>
              );
            }
            if (sec.secretType === 'kubernetes.io/tls') {
              return (
                <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />TLS 证书助手 (tls.crt / tls.key)</p>
                  <div><p className="text-[10px] text-gray-500 mb-0.5">公钥证书内容 (tls.crt)</p><textarea id="tls-crt" className={`${inpSm} h-24 font-mono text-[10px]`} placeholder="-----BEGIN CERTIFICATE-----" /></div>
                  <div><p className="text-[10px] text-gray-500 mb-0.5">私钥内容 (tls.key)</p><textarea id="tls-key" className={`${inpSm} h-24 font-mono text-[10px]`} placeholder="-----BEGIN PRIVATE KEY-----" /></div>
                  <button onClick={() => {
                    const crt = (document.getElementById('tls-crt') as HTMLTextAreaElement).value;
                    const key = (document.getElementById('tls-key') as HTMLTextAreaElement).value;
                    if (!crt || !key) return;
                    updateSecret(sec.id, { data: [{ key: 'tls.crt', value: crt }, { key: 'tls.key', value: key }] });
                    alert('TLS 证书已填充！');
                  }} className="w-full py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 shadow-sm transition-all">应用证书</button>
                </div>
              );
            }
            if (sec.secretType === 'kubernetes.io/basic-auth') {
              return (
                <div className="p-4 bg-teal-50/50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" />基础认证助手 (Basic Auth)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-[10px] text-gray-500 mb-0.5">Username</p><input type="text" id="ba-user" className={inpSm} placeholder="admin" /></div>
                    <div><p className="text-[10px] text-gray-500 mb-0.5">Password</p><input type="password" id="ba-pass" className={inpSm} placeholder="******" /></div>
                  </div>
                  <button onClick={() => {
                    const user = (document.getElementById('ba-user') as HTMLInputElement).value;
                    const pass = (document.getElementById('ba-pass') as HTMLInputElement).value;
                    if (!user || !pass) return;
                    updateSecret(sec.id, { data: [{ key: 'username', value: user }, { key: 'password', value: pass }] });
                    alert('基础认证已应用！');
                  }} className="w-full py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 shadow-sm transition-all">应用凭据</button>
                </div>
              );
            }
            if (sec.secretType === 'kubernetes.io/ssh-auth') {
              return (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />SSH 密钥助手 (ssh-privatekey)</p>
                  <div><p className="text-[10px] text-gray-500 mb-0.5">SSH 私钥 (Private Key)</p><textarea id="ssh-key" className={`${inpSm} h-32 font-mono text-[10px]`} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" /></div>
                  <button onClick={() => {
                    const key = (document.getElementById('ssh-key') as HTMLTextAreaElement).value;
                    if (!key) return;
                    updateSecret(sec.id, { data: [{ key: 'ssh-privatekey', value: key }] });
                    alert('SSH 密钥已应用！');
                  }} className="w-full py-1.5 bg-slate-600 text-white text-xs font-bold rounded-lg hover:bg-slate-700 shadow-sm transition-all">应用 SSH 密钥</button>
                </div>
              );
            }

            // Opaque or Other: Default Key-Value UI
            return (
              <>
                <p className="text-xs text-gray-500">数据列表 (Data Items)</p>
                <div className="space-y-3">
                  {sec.data.map((d, i) => (
                    <div key={i} className="p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-tight">
                        <div className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" />Key</div>
                        <button onClick={() => removeSecretData(sec.id, i)} className="text-gray-400 hover:text-red-400 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <input type="text" placeholder="key..." value={d.key} onChange={e => updateSecretData(sec.id, i, 'key', e.target.value)} className={inpSm} />
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-tight">Value (明文)</div>
                      <textarea placeholder="Value..." value={d.value} onChange={e => updateSecretData(sec.id, i, 'value', e.target.value)} className={`${inpSm} h-16 font-mono text-[11px]`} />
                    </div>
                  ))}
                </div>
                <button onClick={() => addSecretData(sec.id)} className="text-xs text-amber-500 font-medium py-1.5 hover:underline">+ 添加数据项</button>
              </>
            );
          })()}


        </div>
      )}
    </div>
  );
}

// ── Main Tab ─────────────────────────────────────────────────────────────────
export function KubernetesTab() {
  const {
    activeSection, setSection, workloads, activeWorkloadId, setActiveWorkloadId, addWorkload, removeWorkload,
    globalNamespace, setNamespace,
    updateWorkload, services, updateService, ingresses, updateIngress, pvcs, updatePvc, configMaps, updateConfigMap, secrets, updateSecret
  } = useKubernetesStore();

  const syncAllNamespaces = () => {
    workloads.forEach(w => updateWorkload(w.id, { namespace: globalNamespace }));
    services.forEach(s => updateService(s.id, { namespace: globalNamespace }));
    ingresses.forEach(i => updateIngress(i.id, { namespace: globalNamespace }));
    pvcs.forEach(p => updatePvc(p.id, { namespace: globalNamespace }));
    configMaps.forEach(c => updateConfigMap(c.id, { namespace: globalNamespace }));
    secrets.forEach(s => updateSecret(s.id, { namespace: globalNamespace }));
  };

  const SECTIONS = [
    { id: 'workload' as const, label: '工作负载', icon: <Layers className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { id: 'network' as const, label: '网络', icon: <Network className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400 border-green-500 bg-green-50 dark:bg-green-900/20' },
    { id: 'storage' as const, label: '存储', icon: <Database className="w-4 h-4" />, color: 'text-indigo-600 dark:text-indigo-400 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const activeWl = workloads.find(w => w.id === activeWorkloadId);

  return (
    <div className="animate-in fade-in flex flex-col pb-10">
      {/* ── Global Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-4 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-2xl gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 items-center flex gap-1.5"><Globe className="w-3 h-3" />全局配置</span>
          <div className="flex items-center gap-2">
            <input type="text" value={globalNamespace}
              onChange={e => setNamespace(e.target.value)}
              placeholder="命名空间 (如 prod)"
              className="bg-white dark:bg-[#0E1117] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-40" />
            <button onClick={syncAllNamespaces}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95">
              <RefreshCw className="w-3.5 h-3.5" />一键同步所有资源
            </button>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">统计统计</p>
          <p className="text-xs text-gray-500 font-medium">
            {workloads.length} Wloads · {services.length + ingresses.length} Net · {pvcs.length + configMaps.length + secrets.length} Store
          </p>
        </div>
      </div>

      {/* ── Main Tab Bar ── */}
      <div className="flex gap-2 mb-6">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all flex-1 justify-center ${activeSection === s.id ? s.color : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400'}`}>
            {s.icon}{s.label}
          </button>
        ))}
      </div>

      {/* ── Workload Section ── */}
      {activeSection === 'workload' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">工作负载列表</p>
            <button onClick={addWorkload} className={`${btnSm} border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20`}><Plus className="w-3 h-3" />新建工作负载</button>
          </div>

          <div className="space-y-2 mb-4">
            {workloads.map(w => {
              const ICONS: Record<string, React.ReactNode> = { Deployment: <Layers className="w-3.5 h-3.5" />, StatefulSet: <Server className="w-3.5 h-3.5" />, DaemonSet: <RefreshCw className="w-3.5 h-3.5" />, CronJob: <Clock className="w-3.5 h-3.5" /> };
              return (
                <div key={w.id} onClick={() => setActiveWorkloadId(w.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${w.id === activeWorkloadId ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={w.id === activeWorkloadId ? 'text-blue-500' : 'text-gray-400'}>{ICONS[w.workloadType]}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{w.appName}</p>
                      <p className="text-xs text-gray-400">{w.workloadType} · {w.image}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {w.id === activeWorkloadId && <ChevronDown className="w-4 h-4 text-blue-400" />}
                    <button onClick={e => { e.stopPropagation(); removeWorkload(w.id); }} className="text-gray-300 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {activeWl && <WorkloadEditor wl={activeWl} />}
          {!activeWl && workloads.length > 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">选择一个工作负载进行编辑</div>
          )}
        </div>
      )}

      {/* ── Network Section ── */}
      {activeSection === 'network' && <NetworkSection />}

      {/* ── Storage Section ── */}
      {activeSection === 'storage' && <StorageSection />}
    </div>
  );
}
