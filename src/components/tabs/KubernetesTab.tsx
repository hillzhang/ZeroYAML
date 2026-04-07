"use client";

import { useState } from 'react';
import {
  useKubernetesStore, K8sWorkload, K8sProbe, K8sWorkloadEnv, K8sEnvFrom, K8sEnv,
} from '@/store/useKubernetesStore';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Layers, Server, RefreshCw, Clock, Database, Network, Box, Terminal,
  ChevronDown, Plus, Trash2, Globe, Shield, Cpu, Tag, Activity, KeyRound, FileText, ListTree,
  HardDrive, Link, Check, ShieldCheck, UserCheck, Settings2, Zap, ArrowRightLeft,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';

// ── Shared styles ────────────────────────────────────────────────────────────
const inp = "w-full bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-4 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/5 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 h-[42px]";
const inpSm = "w-full bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl py-1.5 px-3 text-[13px] font-bold focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/5 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 h-[36px]";
const btnSm = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all font-bold uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-900";
const card = "p-4 border border-gray-200 dark:border-gray-800 rounded-[1.5rem] cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-all bg-white dark:bg-[#0D1117] shadow-sm";
const cardActive = "p-4 border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 rounded-[1.5rem] shadow-lg shadow-blue-500/10";

// ── Collapsible Section ──────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false, theme = "blue", badge }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; theme?: string; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const themes: Record<string, { icon: string; bg: string; border: string; badge: string }> = {
    blue: { icon: "text-blue-500", bg: "bg-blue-50/30 dark:bg-blue-900/10", border: "border-blue-500/20", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    teal: { icon: "text-teal-500", bg: "bg-teal-50/30 dark:bg-teal-900/10", border: "border-teal-500/20", badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800" },
    orange: { icon: "text-orange-500", bg: "bg-orange-50/30 dark:bg-orange-900/10", border: "border-orange-500/20", badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
    amber: { icon: "text-amber-500", bg: "bg-amber-50/30 dark:bg-amber-900/10", border: "border-amber-500/20", badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    indigo: { icon: "text-indigo-500", bg: "bg-indigo-50/30 dark:bg-indigo-900/10", border: "border-indigo-500/20", badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
    purple: { icon: "text-purple-500", bg: "bg-purple-50/30 dark:bg-purple-900/10", border: "border-purple-500/20", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
    emerald: { icon: "text-emerald-500", bg: "bg-emerald-50/30 dark:bg-emerald-900/10", border: "border-emerald-500/20", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
    cyan: { icon: "text-cyan-500", bg: "bg-cyan-50/30 dark:bg-cyan-900/10", border: "border-cyan-500/20", badge: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800" },
    slate: { icon: "text-slate-500", bg: "bg-slate-50/30 dark:bg-slate-900/10", border: "border-slate-500/20", badge: "bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800" },
    green: { icon: "text-green-500", bg: "bg-green-50/30 dark:bg-green-900/10", border: "border-green-500/20", badge: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" },
  };
  const th = themes[theme] || themes.blue;

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden mb-8 shadow-sm bg-white dark:bg-[#0D1117] transition-all hover:border-gray-300 dark:hover:border-gray-700">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-6 py-5 ${th.bg} hover:opacity-95 transition-all text-left select-none group border-b ${th.border}`}>
        <div className="flex items-center gap-5">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <div className={th.icon}>{icon}</div>
          </div>
          <div>
            <p className="text-base font-black text-gray-800 dark:text-gray-100 uppercase tracking-[0.15em]">{title}</p>
            {badge && <span className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${th.badge}`}>{badge}</span>}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-500 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-8 bg-white dark:bg-[#0D1117] animate-in fade-in slide-in-from-top-2 duration-500">{children}</div>}
    </div>
  );
}

// ── Probe editor ─────────────────────────────────────────────────────────────
function ProbeEditor({ label, probe, onChange }: { label: string; probe: K8sProbe; onChange: (f: keyof K8sProbe, v: any) => void }) {
  const { t } = useTranslation();
  return (
    <div className={`p-4 border rounded-[1.2rem] transition-all duration-300 shadow-sm ${probe.enabled ? 'border-blue-500/30 dark:border-blue-500/40 bg-blue-50/40 dark:bg-blue-900/10 shadow-blue-500/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 hover:border-gray-200 dark:hover:border-gray-700'}`}>
      <Checkbox checked={probe.enabled} onChange={v => onChange('enabled', v)} label={label.toUpperCase()} className="tracking-widest font-black" />
      {probe.enabled && (
        <div className="mt-4 pl-4 border-l-2 border-blue-500/20 dark:border-blue-500/30 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['httpGet', 'tcpSocket', 'exec', 'grpc'] as const).map(t => {
              const isActive = probe.type === t;
              return (
                <button
                  key={t}
                  onClick={() => onChange('type', t)}
                  className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-wider transition-all duration-300 shadow-sm
                    ${isActive
                      ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500'}`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="bg-white/50 dark:bg-black/10 p-3 rounded-xl border border-gray-100/50 dark:border-gray-800/50">
            {probe.type === 'httpGet' && (
              <div className="flex gap-3">
                <div className="flex-[3]">
                  <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">Path</p>
                  <input type="text" value={probe.path} onChange={e => onChange('path', e.target.value)} className={`${inpSm} font-mono`} placeholder="/healthz" />
                </div>
                <div className="flex-1 min-w-[80px]">
                  <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">Port</p>
                  <input type="text" value={probe.port} onChange={e => onChange('port', e.target.value)} className={`${inpSm} font-mono`} placeholder="8080" />
                </div>
              </div>
            )}
            {probe.type === 'tcpSocket' && (
              <div className="w-32">
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">Port</p>
                <input type="text" value={probe.port} onChange={e => onChange('port', e.target.value)} className={`${inpSm} font-mono`} placeholder="3000" />
              </div>
            )}
            {probe.type === 'exec' && (
              <div>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">Command</p>
                <input type="text" value={probe.command} onChange={e => onChange('command', e.target.value)} className={`${inpSm} font-mono`} placeholder="cat /tmp/ready" />
              </div>
            )}
            {probe.type === 'grpc' && (
              <div className="w-32">
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">Port</p>
                <input type="text" value={probe.port} onChange={e => onChange('port', e.target.value)} className={`${inpSm} font-mono`} placeholder="50051" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              ['initialDelaySeconds', t.k8s.initialDelay],
              ['periodSeconds', t.k8s.period],
              ['timeoutSeconds', t.k8s.timeout],
              ['failureThreshold', t.k8s.failureThreshold],
              ['successThreshold', t.k8s.successThreshold]
            ].map(([k, l]) => (
              <div key={k}>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{l}</p>
                <input
                  type="number"
                  min="1"
                  value={(probe as any)[k]}
                  onChange={e => onChange(k as keyof K8sProbe, parseInt(e.target.value) || 1)}
                  className={`${inpSm} font-mono h-8 text-center`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Resource Selector (Select + Manual Input Toggle) ─────────────────────────
function ResourceSelector({
  label, value, onChange, options, placeholder, manualPlaceholder, className = "", inputClassName = inpSm
}: {
  label: string; value: string; onChange: (v: string) => void; options: { id: string; name: string; info?: string }[];
  placeholder?: string; manualPlaceholder?: string; className?: string; inputClassName?: string;
}) {
  const { t } = useTranslation();
  const [isManual, setIsManual] = useState(() => {
    if (!value) return false;
    return !options.some(o => o.name === value);
  });

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center px-1 h-5">
        <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1">{label}</p>
        <button
          type="button"
          onClick={() => setIsManual(!isManual)}
          className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 transition-all hover:translate-x-0.5 active:scale-95"
        >
          {isManual ? <ListTree className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
          {isManual ? t.k8s.listSelect.toUpperCase() : t.k8s.manualInput.toUpperCase()}
        </button>
      </div>
      <div className="relative group">
        {isManual ? (
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={manualPlaceholder || t.k8s.manualPlaceholder} className={`${inputClassName} font-mono`} />
        ) : (
          <>
            <select value={value} onChange={e => onChange(e.target.value)} className={`${inputClassName} font-bold appearance-none pr-8`}>
              <option value="">{placeholder || t.common.selectPlaceholder}</option>
              {options.map(o => <option key={o.id} value={o.name}>{o.name}{o.info ? ` (${o.info})` : ''}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
          </>
        )}
      </div>
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

const MetadataGroup = ({ title, items, onAdd, onUpdate, onRemove, colorTheme = "blue", labelPrefix = "Label", icon: Icon, inpSm, t }: any) => {
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
          <p className={`text-[12px] font-black uppercase tracking-[0.2em] ml-1 text-gray-600 dark:text-gray-300`}>{title}</p>
        </div>
        <span className="text-xs bg-white dark:bg-black/40 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full font-black border border-gray-200 dark:border-gray-800 shadow-sm">{items.length}</span>
      </div>

      <div className="space-y-2.5">
        {items.map((it: any, i: number) => (
          <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
            <input type="text" placeholder="KEY..." value={it.key}
              onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, key: e.target.value } : x))}
              className={`${inpSm} font-mono !bg-white dark:!bg-[#161B22] border-gray-100 dark:border-gray-800 shadow-inner`} />
            <input type="text" placeholder="VALUE..." value={it.value}
              onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, value: e.target.value } : x))}
              className={`${inpSm} font-mono !bg-white dark:!bg-[#161B22] border-gray-100 dark:border-gray-800 shadow-inner`} />
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
          <Plus className="w-3.5 h-3.5" /> {t.common.add} {labelPrefix}
        </button>
      </div>
    </div>
  );
};

function MetadataEditorContent({
  labels = [], annotations = [], onUpdateLabels, onUpdateAnnotations,
  podLabels, podAnnotations, onUpdatePodLabels, onUpdatePodAnnotations,
  theme = 'blue'
}: MetadataEditorProps & { theme?: string }) {
  const { t } = useTranslation();
  const inpSm = "w-full bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl py-1.5 px-3 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/5 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 h-[36px]";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetadataGroup title={`${t.k8s.label} (${t.common.metadata})`} items={labels} onAdd={onUpdateLabels} onUpdate={onUpdateLabels} onRemove={onUpdateLabels} colorTheme="blue" labelPrefix={t.k8s.label} icon={Tag} inpSm={inpSm} t={t} />
        <MetadataGroup title={`${t.k8s.annotation} (${t.common.metadata})`} items={annotations} onAdd={onUpdateAnnotations} onUpdate={onUpdateAnnotations} onRemove={onUpdateAnnotations} colorTheme="teal" labelPrefix={t.k8s.annotation} icon={FileText} inpSm={inpSm} t={t} />
      </div>

      {(onUpdatePodLabels || onUpdatePodAnnotations) && (
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetadataGroup title={`${t.k8s.podLabel} (${t.common.edit})`} items={podLabels || []} onAdd={onUpdatePodLabels} onUpdate={onUpdatePodLabels} onRemove={onUpdatePodLabels} colorTheme="indigo" labelPrefix={t.k8s.podLabel} icon={Activity} inpSm={inpSm} t={t} />
            <MetadataGroup title={`${t.k8s.podAnnotation} (${t.common.edit})`} items={podAnnotations || []} onAdd={onUpdatePodAnnotations} onUpdate={onUpdatePodAnnotations} onRemove={onUpdatePodAnnotations} colorTheme="purple" labelPrefix={t.k8s.podAnnotation} icon={Globe} inpSm={inpSm} t={t} />
          </div>
        </div>
      )}
    </div>
  );
}

function MetadataEditor(props: MetadataEditorProps & { theme?: string }) {
  const [open, setOpen] = useState(false);
  const { theme = 'blue' } = props;
  const { t } = useTranslation();
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

  const th = themes[theme] || themes.blue;
  const itemCount = (props.labels?.length || 0) + (props.annotations?.length || 0) + (props.podLabels?.length || 0) + (props.podAnnotations?.length || 0);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md ${open ? `${th.activeBg} ${th.border} scale-[1.01]` : `${th.bg} border-transparent hover:border-gray-200 dark:hover:border-gray-700`
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg bg-white dark:bg-gray-900 shadow-sm ${open ? 'animate-bounce-subtle' : ''}`}>
            <Tag className={`w-4 h-4 ${th.icon}`} />
          </div>
          <span className={`text-xs font-black uppercase tracking-widest ${open ? th.text : 'text-gray-600 dark:text-gray-400'}`}>
            {t.common.metadata.toUpperCase()}
          </span>
          {itemCount > 0 && (
            <span className={`${th.dot} text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm`}>
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


// ── Env Item (Isolated to prevent focus loss) ──────────────────────────────
const EnvItem = ({ e, i, wlId, updateWorkloadEnv, removeWorkloadEnv, configMaps, secrets, t, inpSm }: any) => {
  const upE = (patch: Partial<typeof e>) => updateWorkloadEnv(wlId, i, patch);

  return (
    <div key={e.id} className={`p-4 border rounded-2xl bg-white dark:bg-[#0D1117] shadow-sm transition-all duration-200 border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/40 animate-in fade-in slide-in-from-left-2 duration-300`}>
      <div className="grid grid-cols-[1fr_20px_1.5fr_100px_32px] gap-2.5 items-center">
        {/* Key input */}
        <div className="relative group">
          <p className="absolute -top-4 left-1 text-[9px] font-black text-gray-400 opacity-0 group-focus-within:opacity-100 transition-opacity uppercase">KEY</p>
          <input type="text" placeholder="KEY" value={e.name}
            onChange={ev => upE({ name: ev.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })}
            className={`${inpSm} font-black font-mono text-[11px] !bg-gray-50/50 dark:!bg-black/20 border-transparent focus:border-blue-500`} />
        </div>

        <div className="text-center text-gray-300 dark:text-gray-700 font-black text-xs">=</div>

        {/* Value / Reference input */}
        <div className="relative group min-w-0">
          <p className="absolute -top-4 left-1 text-[9px] font-black text-gray-400 opacity-0 group-focus-within:opacity-100 transition-opacity uppercase">VALUE</p>
          {e.type === 'value' ? (
            <input type="text" placeholder="VALUE" value={e.value}
              onChange={ev => upE({ value: ev.target.value })}
              className={`${inpSm} font-mono !bg-white dark:!bg-gray-900 border-gray-200 dark:border-gray-800 shadow-inner`} />
          ) : (
            <div className="grid grid-cols-[1.5fr_1fr] gap-1.5 h-[36px]">
              <div className="relative">
                <input
                  list={`env-names-${e.id}`}
                  placeholder={e.type === 'configMapKeyRef' ? 'CM Name' : 'Secret Name'}
                  value={e.refName}
                  onChange={ev => upE({ refName: ev.target.value, refKey: '' })}
                  className={`${inpSm} font-bold text-[10px] w-full !bg-white dark:!bg-gray-900 border-blue-100 dark:border-blue-900 shadow-inner`}
                />
                <datalist id={`env-names-${e.id}`}>
                  {(e.type === 'configMapKeyRef' ? configMaps : secrets).map((r: any) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </datalist>
              </div>

              <div className="relative">
                <input
                  list={`env-keys-${e.id}`}
                  placeholder="Key"
                  value={e.refKey}
                  onChange={ev => upE({ refKey: ev.target.value })}
                  className={`${inpSm} font-mono text-[10px] w-full !bg-white dark:!bg-gray-900 border-gray-100 dark:border-gray-800 shadow-inner`}
                />
                <datalist id={`env-keys-${e.id}`}>
                  {(() => {
                    const resource = (e.type === 'configMapKeyRef' ? configMaps : secrets).find((r: any) => r.name === e.refName);
                    return resource?.data.map((d: any) => (
                      <option key={d.key} value={d.key}>{d.key}</option>
                    )) || [];
                  })()}
                </datalist>
              </div>
            </div>
          )}
        </div>

        {/* Type select */}
        <div className="relative group">
          <select
            value={e.type}
            onChange={ev => upE({ type: ev.target.value as any, value: '', refName: '', refKey: '' })}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-black uppercase text-[10px] h-9 pl-3 pr-8 appearance-none cursor-pointer shadow-sm hover:border-blue-400 dark:hover:border-blue-900/60 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
          >
            <option value="value">Static</option>
            <option value="configMapKeyRef">Config</option>
            <option value="secretKeyRef">Secret</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
        </div>

        {/* Delete */}
        <button onClick={() => removeWorkloadEnv(wlId, i)}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ── Env From Item (Isolated) ───────────────────────────────────────────
const EnvFromItem = ({ ef, i, wlId, updateWorkloadEnvFrom, removeWorkloadEnvFrom, configMaps, secrets, t, inpSm }: any) => {
  return (
    <div key={ef.id} className="p-4 bg-gray-50/30 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3 transition-colors hover:border-blue-100 dark:hover:border-blue-900/30">
      <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          EnvFrom
        </div>
        <button onClick={() => removeWorkloadEnvFrom(wlId, i)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-[125px_1fr_120px] gap-2">
        <div className="relative group overflow-hidden">
          <select
            value={ef.type}
            onChange={ev => updateWorkloadEnvFrom(wlId, i, { type: ev.target.value as any, name: '' })}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-black uppercase text-[10px] h-9 pl-2 pr-6 appearance-none cursor-pointer shadow-sm hover:border-blue-400 dark:hover:border-blue-900/60 focus:outline-none transition-all"
          >
            <option value="configMap">ConfigMap</option>
            <option value="secret">Secret</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
        </div>

        <div className="relative min-w-0">
          <input
            list={`ef-names-${ef.id}`}
            placeholder={ef.type === 'configMap' ? 'Choose or type ConfigMap name' : 'Choose or type Secret name'}
            value={ef.name}
            onChange={ev => updateWorkloadEnvFrom(wlId, i, { name: ev.target.value })}
            className={`${inpSm} w-full !bg-white dark:!bg-[#0D1117] font-bold border-gray-100 dark:border-gray-800 shadow-inner`}
          />
          <datalist id={`ef-names-${ef.id}`}>
            {(ef.type === 'configMap' ? configMaps : secrets).map((r: any) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </datalist>
        </div>

        <div className="relative group">
          <p className="absolute -top-3.5 left-1 text-[8px] font-black text-gray-400 opacity-0 group-focus-within:opacity-100 transition-opacity uppercase">PREFIX</p>
          <input type="text" placeholder="PREFIX_" value={ef.prefix}
            onChange={ev => updateWorkloadEnvFrom(wlId, i, { prefix: ev.target.value.toUpperCase() })}
            className={`${inpSm} !bg-white dark:!bg-[#0D1117] font-mono text-[10px] border-none shadow-sm`} />
        </div>
      </div>
    </div>
  );
};

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
  const { t } = useTranslation();
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
            <Settings2 className="w-4 h-4 ml-1" /> {t.k8s.workload}: {wl.appName || `(${t.tabs.preview.toUpperCase()})`}
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
        <Section title={t.k8s.basic} icon={<Box className="w-4 h-4" />} theme="blue" badge={t.k8s.badges.core}>
          <div className="grid grid-cols-2 gap-6">
            <div className="relative group">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1 flex items-center gap-1.5 group-hover:text-blue-500 transition-all">{t.k8s.appName}</p>
              <input type="text" value={wl.appName}
                onChange={e => up({ appName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                className={inp} placeholder="my-app" />
            </div>
            <div className="relative group">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1 flex items-center gap-1.5 group-hover:text-blue-500 transition-all">{t.k8s.namespace}</p>
              <input type="text" value={wl.namespace} onChange={e => up({ namespace: e.target.value })} className={inp} />
            </div>
            <div className="col-span-2 relative group mt-2">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1 flex items-center gap-1.5 group-hover:text-blue-500 transition-all">{t.k8s.image.toUpperCase()}</p>
              <input type="text" value={wl.image} onChange={e => up({ image: e.target.value })} className={inp} placeholder="nginx:alpine" />
            </div>
            {!isDaemon && !isCronJob && (
              <div className="grid grid-cols-2 gap-6 col-span-2">
                <div className="space-y-1.5">
                  <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center group-hover:text-blue-500 transition-all">{t.k8s.replicas}</p>
                  <input type="number" min="1" value={wl.replicas} onChange={e => up({ replicas: parseInt(e.target.value) || 1 })} className={inp} />
                </div>
                <div>
                  <ResourceSelector
                    label={t.k8s.imagePullSecrets.toUpperCase()}
                    value={wl.imagePullSecrets?.[0]?.name || ''}
                    inputClassName={inp}
                    onChange={val => up({ imagePullSecrets: val ? [{ name: val }] : [] })}
                    options={[
                      ...secrets.filter(s => s.secretType === 'kubernetes.io/dockerconfigjson').map(s => ({ id: s.id, name: s.name, info: 'Repository Auth' })),
                      ...secrets.filter(s => s.secretType !== 'kubernetes.io/dockerconfigjson').map(s => ({ id: s.id, name: s.name }))
                    ]}
                    placeholder={`-- ${t.storage.secret.toUpperCase()} --`}
                    manualPlaceholder={t.k8s.secret}
                  />
                </div>
              </div>
            )}
            <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.containerPort.toUpperCase()}</p><input type="text" value={wl.containerPort} onChange={e => up({ containerPort: e.target.value })} className={inp} /></div>
            <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.pullPolicy.toUpperCase()}</p><select value={wl.imagePullPolicy} onChange={e => up({ imagePullPolicy: e.target.value as any })} className={inp}><option value="IfNotPresent">{t.k8s.ifNotPresent}</option><option value="Always">{t.k8s.always}</option><option value="Never">{t.k8s.never}</option></select></div>
          </div>

          <div className="mt-4 p-3 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">{t.k8s.exec}</span>
                </div>

                <label className="flex items-center gap-2 px-2 py-1 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-800/30 rounded-full cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group">
                  <div
                    onClick={() => up({ useShellWrapper: !wl.useShellWrapper })}
                    className={`w-3 h-3 rounded border transition-all flex items-center justify-center cursor-pointer ${wl.useShellWrapper ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-yellow-400/60 shadow-inner'}`}
                  >
                    {wl.useShellWrapper && <Check className="w-2 h-2 text-white stroke-[4]" />}
                  </div>
                  <span className="text-[9px] font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-yellow-500" /> {t.k8s.shellMode}
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
                    <span className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em]">{t.k8s.command}</span>
                  </div>
                  <span className="text-[9px] font-black text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800/60 px-1.5 py-0.5 rounded shadow-sm scale-90">{t.k8s.entrypoint}</span>
                </div>
                <input
                  type="text"
                  value={wl.command}
                  onChange={e => up({ command: e.target.value })}
                  placeholder="e.g. /usr/bin/python3"
                  className={inp + " font-mono !bg-white dark:!bg-[#1C2128] border-blue-200 dark:border-blue-800"}
                />
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 pl-1 italic font-medium">{t.k8s.mapToEntrypoint}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em]">{t.k8s.args}</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-800/60 px-1.5 py-0.5 rounded shadow-sm scale-90">{t.k8s.cmd}</span>
                </div>
                <input
                  type="text"
                  value={wl.args}
                  onChange={e => up({ args: e.target.value })}
                  placeholder="e.g. app.py --port 80"
                  className={inp + " font-mono !bg-white dark:!bg-[#1C2128] border-emerald-200 dark:border-emerald-800"}
                />
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5 pl-1 italic font-medium">{t.k8s.mapToCmd}</p>
              </div>
            </div>
          </div>

          {isSts && (
            <div className="mt-2"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.headlessService.toUpperCase()}</p><input type="text" value={wl.serviceName} onChange={e => up({ serviceName: e.target.value })} className={inp} /></div>
          )}
          {isCronJob && (
            <div className="space-y-2 mt-2">
              <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.schedule.toUpperCase()}</p><input type="text" value={wl.schedule} onChange={e => up({ schedule: e.target.value })} className={`${inp} font-mono`} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.concurrency.toUpperCase()}</p><select value={wl.concurrencyPolicy} onChange={e => up({ concurrencyPolicy: e.target.value as any })} className={inp}><option value="Forbid">Forbid</option><option value="Allow">Allow</option><option value="Replace">Replace</option></select></div>
                <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.restartPolicy.toUpperCase()}</p><select value={wl.restartPolicy} onChange={e => up({ restartPolicy: e.target.value as any })} className={inp}><option value="OnFailure">OnFailure</option><option value="Never">Never</option></select></div>
              </div>
            </div>
          )}
        </Section>

        {/* Metadata */}
        <Section title={t.common.metadata} icon={<Tag className="w-4 h-4" />} theme="teal" badge={t.k8s.badges.metadata} defaultOpen={false}>
          <MetadataEditorContent
            labels={wl.labels} annotations={wl.annotations}
            onUpdateLabels={(v: any) => up({ labels: v })}
            onUpdateAnnotations={(v: any) => up({ annotations: v })}
            podLabels={wl.podLabels} podAnnotations={wl.podAnnotations}
            onUpdatePodLabels={(v: any) => up({ podLabels: v })}
            onUpdatePodAnnotations={(v: any) => up({ podAnnotations: v })}
            theme="teal"
          />
        </Section>

        {/* Resources */}
        <Section title={t.k8s.resources} icon={<Cpu className="w-4 h-4" />} theme="orange" badge={t.k8s.badges.quota} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t.k8s.cpuReq, val: wl.cpuReq, key: 'cpuReq', type: 'cpu', hints: ['100m', '500m', '1'] },
              { label: t.k8s.cpuLim, val: wl.cpuLimit, key: 'cpuLimit', type: 'cpu', hints: ['500m', '1', '2'] },
              { label: t.k8s.memReq, val: wl.memReq, key: 'memReq', type: 'mem', hints: ['128Mi', '512Mi', '1Gi'] },
              { label: t.k8s.memLim, val: wl.memLimit, key: 'memLimit', type: 'mem', hints: ['512Mi', '1Gi', '2Gi'] },
            ].map(field => {
              // Parse value and unit
              const valStr = String(field.val || "");
              const match = valStr.match(/^(\d+)(.*)$/);
              const numPart = match ? match[1] : valStr;
              const unitPart = match ? match[2] : "";

              const units = field.type === 'cpu' ? ['', 'm'] : ['Mi', 'Gi', 'Ti', 'Ki'];
              const unitLabels: Record<string, string> = { '': 'Core', 'm': 'm', 'Mi': 'Mi', 'Gi': 'Gi', 'Ti': 'Ti', 'Ki': 'Ki' };

              return (
                <div key={field.key}>
                  <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                    {field.label.toUpperCase()}
                  </p>
                  <div className="flex gap-1.5 items-stretch h-[36px]">
                    <input
                      type="text"
                      placeholder="NUM..."
                      value={numPart}
                      onChange={e => up({ [field.key]: e.target.value + unitPart })}
                      className={`${inp} flex-1 !h-full`}
                    />
                    <div className="relative group min-w-[75px]">
                      <select
                        value={unitPart}
                        onChange={e => up({ [field.key]: numPart + e.target.value })}
                        className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-[11px] h-full pl-2.5 pr-6 appearance-none cursor-pointer hover:border-orange-200 dark:hover:border-orange-900/40 transition-all focus:outline-none text-gray-700 dark:text-gray-300"
                      >
                        {units.map(u => <option key={u} value={u}>{unitLabels[u] || u}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 group-hover:text-orange-500 pointer-events-none transition-colors" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {field.hints.map(h => (
                      <button key={h} onClick={() => up({ [field.key]: h })}
                        className="px-2.5 py-1 rounded-full bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100/50 dark:border-orange-800/30 text-[10px] text-orange-700 dark:text-orange-400 font-bold tracking-tight hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-105 active:scale-95 transition-all shadow-sm">
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Env Vars */}
        <Section title={t.common.env} icon={<Zap className="w-4 h-4" />} theme="indigo" badge={t.k8s.badges.env} defaultOpen={true}>
          <div className="space-y-3">
            {wl.envs.map((e, i) => (
              <EnvItem
                key={e.id}
                e={e}
                i={i}
                wlId={wl.id}
                updateWorkloadEnv={updateWorkloadEnv}
                removeWorkloadEnv={removeWorkloadEnv}
                configMaps={configMaps}
                secrets={secrets}
                t={t}
                inpSm={inpSm}
              />
            ))}
          </div>
          <button onClick={() => addWorkloadEnv(wl.id)} className="w-full mt-4 py-3 border-2 border-dashed border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 rounded-2xl text-xs font-black tracking-wider hover:bg-teal-50/50 hover:border-teal-300 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {t.common.add} {t.common.env}
          </button>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 md:p-6 transition-all duration-300">
              <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-2">
                <ListTree className="w-3.5 h-3.5 text-blue-500" />
                envFrom ({t.tabs.preview})
              </p>

            <div className="space-y-3">
              {(wl.envFrom || []).map((ef, i) => (
                <EnvFromItem
                  key={ef.id}
                  ef={ef}
                  i={i}
                  wlId={wl.id}
                  updateWorkloadEnvFrom={updateWorkloadEnvFrom}
                  removeWorkloadEnvFrom={removeWorkloadEnvFrom}
                  configMaps={configMaps}
                  secrets={secrets}
                  t={t}
                  inpSm={inpSm}
                />
              ))}
            </div>
            <button onClick={() => addWorkloadEnvFrom(wl.id)}
              className="w-full mt-4 py-3 border-2 border-dashed border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-black tracking-wider hover:bg-blue-50/10 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> {t.common.add} envFrom
            </button>
          </div>
        </Section>

        {/* Volumes (Persistence) */}
        <Section title={t.common.volumes} icon={<Database className="w-4 h-4" />} theme="amber" badge={t.k8s.badges.persistence} defaultOpen={false}>
          <div className="space-y-3">
            {wl.volumeMounts.map(v => (
              <div key={v.id} className="p-3 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-lg space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">
                  <div className="flex items-center gap-2"><Box className="w-4 h-4 text-indigo-500" />VOLUME MOUNT</div>
                  <button onClick={() => removeWorkloadVol(wl.id, v.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1 ml-1">{t.storage.volumeName.toUpperCase()}</p>
                    <input type="text" placeholder="data-vol" value={v.name} onChange={e => updateWorkloadVol(wl.id, v.id, { name: e.target.value })} className={inpSm} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1 ml-1">{t.storage.mountPath.toUpperCase()}</p>
                    <input type="text" placeholder="/data" value={v.mountPath} onChange={e => updateWorkloadVol(wl.id, v.id, { mountPath: e.target.value })} className={inpSm} />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">
                      {t.storage.storageSource.toUpperCase()}
                    </p>
                    <div className="relative group">
                      <select value={v.sourceType}
                        onChange={e => updateWorkloadVol(wl.id, v.id, { sourceType: e.target.value as any, resourceRef: '' })}
                        className={`${inpSm} font-bold appearance-none pr-8`}>
                        <option value="pvc">PersistentVolumeClaim</option>
                        <option value="configMap">ConfigMap</option>
                        <option value="secret">Secret</option>
                        <option value="hostPath">HostPath</option>
                        <option value="emptyDir">EmptyDir (Temp Storage)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {['pvc', 'configMap', 'secret'].includes(v.sourceType) ? (
                      <ResourceSelector
                        label={t.k8s.bindResource.toUpperCase()}
                        value={v.resourceRef}
                        onChange={val => updateWorkloadVol(wl.id, v.id, { resourceRef: val })}
                        options={(v.sourceType === 'pvc' ? pvcs : v.sourceType === 'configMap' ? configMaps : secrets).map(r => ({ id: r.id, name: r.name }))}
                        placeholder={t.k8s.bindResource}
                        manualPlaceholder={`Enter existing ${v.sourceType} name`}
                      />
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.k8s.path.toUpperCase()}</p>
                        <input type="text"
                          placeholder={v.sourceType === 'hostPath' ? "Absolute host path (e.g. /var/data)" : "No resource required"}
                          disabled={v.sourceType === 'emptyDir'}
                          value={v.hostPathValue || ''}
                          onChange={e => updateWorkloadVol(wl.id, v.id, { hostPathValue: e.target.value })}
                          className={inpSm} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <Checkbox checked={v.readOnly} onChange={val => updateWorkloadVol(wl.id, v.id, { readOnly: val })} label="ReadOnly" className="shrink-0" />

                  {(v.sourceType === 'configMap' || v.sourceType === 'secret') && (
                    <div className="flex-1 flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800 overflow-hidden">
                      <span className="text-[12px] text-gray-600 dark:text-gray-300 font-black uppercase tracking-[0.2em]">SUBPATH / KEY:</span>
                      {(() => {
                        const res = (v.sourceType === 'configMap' ? configMaps : secrets).find(r => r.name === v.resourceRef);
                        const keys = res?.data.map(d => d.key) || [];
                        if (keys.length > 0) {
                          return (
                            <select value={v.subPath} onChange={e => updateWorkloadVol(wl.id, v.id, { subPath: e.target.value })}
                              className="flex-1 min-w-0 bg-transparent text-xs py-0.5 border-b border-dashed border-gray-400 dark:border-gray-600 focus:outline-none focus:border-blue-400 h-6">
                              <option value="">-- Mount All (Default) --</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          );
                        }
                        return <input type="text" placeholder="Specify key to mount as file (optional)" value={v.subPath}
                          onChange={e => updateWorkloadVol(wl.id, v.id, { subPath: e.target.value })}
                          className="flex-1 border-b border-gray-200 dark:border-gray-700 bg-transparent text-xs py-0.5 px-1 focus:outline-none focus:border-blue-400" />;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => addWorkloadVol(wl.id)} className="text-xs text-indigo-500 hover:text-indigo-400 font-bold py-1 mt-2">+ {t.common.add} Volume</button>
        </Section>

        {/* Probes */}
        <Section title={t.k8s.probes} icon={<Activity className="w-4 h-4" />} theme="emerald" badge={t.k8s.badges.availability} defaultOpen={false}>
          <div className="space-y-3">
            <ProbeEditor label="Liveness" probe={wl.livenessProbe} onChange={(f, v) => updateWorkloadProbe(wl.id, 'livenessProbe', f, v)} />
            <ProbeEditor label="Readiness" probe={wl.readinessProbe} onChange={(f, v) => updateWorkloadProbe(wl.id, 'readinessProbe', f, v)} />
            <ProbeEditor label="Startup" probe={wl.startupProbe} onChange={(f, v) => updateWorkloadProbe(wl.id, 'startupProbe', f, v)} />
          </div>
        </Section>

        {/* Security */}
        <Section title={t.k8s.security} icon={<Shield className="w-4 h-4" />} theme="purple" badge={t.k8s.badges.security} defaultOpen={false}>
          <div className="grid grid-cols-3 gap-2">
            <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">runAsUser</p><input type="number" placeholder="1000" value={wl.runAsUser} onChange={e => up({ runAsUser: e.target.value })} className={inpSm} /></div>
            <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">runAsGroup</p><input type="number" placeholder="3000" value={wl.runAsGroup} onChange={e => up({ runAsGroup: e.target.value })} className={inpSm} /></div>
            <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">fsGroup</p><input type="number" placeholder="2000" value={wl.fsGroup} onChange={e => up({ fsGroup: e.target.value })} className={inpSm} /></div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            <Checkbox checked={wl.runAsNonRoot} onChange={v => up({ runAsNonRoot: v })} label="runAsNonRoot" />
            <Checkbox checked={wl.readOnlyRootFilesystem} onChange={v => up({ readOnlyRootFilesystem: v })} label="readOnlyRootFilesystem" />
            <Checkbox checked={wl.allowPrivilegeEscalation} onChange={v => up({ allowPrivilegeEscalation: v })} label="allowPrivilegeEscalation" />
          </div>
        </Section>

        {/* Update Strategy */}
        {!isDaemon && !isCronJob && (
          <Section title={t.k8s.updating} icon={<RefreshCw className="w-4 h-4" />} theme="cyan" badge={t.k8s.badges.strategy} defaultOpen={false}>
            <div className="flex gap-3">
              <div className="flex-1"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">STRATEGY</p>
                <select value={wl.updateStrategy} onChange={e => up({ updateStrategy: e.target.value as any })} className={inp}>
                  <option value="RollingUpdate">RollingUpdate</option><option value="Recreate">Recreate</option>
                </select></div>
              {wl.updateStrategy === 'RollingUpdate' && <>
                <div className="flex-1"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">maxSurge</p><input type="text" value={wl.maxSurge} onChange={e => up({ maxSurge: e.target.value })} className={inp} /></div>
                <div className="flex-1"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">maxUnavailable</p><input type="text" value={wl.maxUnavailable} onChange={e => up({ maxUnavailable: e.target.value })} className={inp} /></div>
              </>}
            </div>
          </Section>
        )}

        {/* Node Scheduling */}
        <Section title={t.k8s.scheduling} icon={<Globe className="w-4 h-4" />} theme="slate" badge={t.k8s.badges.scheduling} defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1"><Tag className="w-3.5 h-3.5 text-blue-500" />{t.k8s.nodeSelector}</p>
              <div className="space-y-2">
                {wl.nodeSelector.map((ns, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input type="text" placeholder="key (e.g. disktype)" value={ns.key} onChange={e => updateWorkloadNS(wl.id, i, 'key', e.target.value)} className={inpSm} />
                    <input type="text" placeholder="value (e.g. ssd)" value={ns.value} onChange={e => updateWorkloadNS(wl.id, i, 'value', e.target.value)} className={inpSm} />
                    <button onClick={() => removeWorkloadNS(wl.id, i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => addWorkloadNS(wl.id)} className="text-xs text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" />{t.common.add} Selector
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{t.k8s.tolerations} (Tolerations)</p>
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
                          <option value="">(ANY)</option>
                          <option>NoSchedule</option>
                          <option>PreferNoSchedule</option>
                          <option>NoExecute</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addWorkloadTol(wl.id)} className="text-[10px] text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" />{t.common.add} Toleration
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-6 gap-y-3">
              <Checkbox checked={wl.hostNetwork} onChange={v => up({ hostNetwork: v })} label="hostNetwork" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase">{t.k8s.dnsPolicy}:</span>
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
        <Section title={t.k8s.ingress} icon={<Network className="w-4 h-4" />} theme="green" defaultOpen={true}>
          <div className="space-y-6">
            {/* 1. Services Section */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Layers className="w-3 h-3" />{t.network.service}</p>
              {services.length === 0 && <p className="text-xs text-gray-400 italic">{t.network.noService}</p>}
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
                      {isBound && <span className="text-[9px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1 rounded">{t.network.bound}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Ingress Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Globe className="w-3 h-3" />{t.network.ingress}</p>
              {ingresses.length === 0 && <p className="text-xs text-gray-400 italic">{t.network.noIngress}</p>}
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
                          <span className="text-[9px] font-black text-white bg-purple-600 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse-subtle">{t.network.pointing} <Activity className="w-2.5 h-2.5" /></span> :
                          <span className="text-[9px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">{t.network.unbound}</span>
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
                                <span className={pointsToMe ? 'font-bold' : 'text-gray-400'}>{r.serviceName || '(None)'}</span>
                              </span>
                              {pointsToMe ? (
                                <button
                                  onClick={() => {
                                    const { updateIngressRule } = useKubernetesStore.getState();
                                    updateIngressRule(ing.id, r.id, { serviceName: '' });
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-all font-bold shadow-sm whitespace-nowrap">
                                  <Trash2 className="w-2.5 h-2.5" />{t.common.cancel}
                                </button>
                              ) : (
                                mySvcs.length > 0 && (
                                  <button
                                    onClick={() => {
                                      const { updateIngressRule } = useKubernetesStore.getState();
                                      updateIngressRule(ing.id, r.id, { serviceName: mySvcs[0] });
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-700 text-white hover:bg-blue-800 transition-all font-bold shadow-sm whitespace-nowrap">
                                    <Link className="w-2.5 h-2.5" />{t.network.bound}
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
  const { t, language } = useTranslation();
  const { services, ingresses, workloads, secrets, activeServiceId, activeIngressId, setActiveServiceId, setActiveIngressId, addService, removeService, updateService, addIngress, removeIngress, updateIngress, addIngressRule, removeIngressRule, updateIngressRule } = useKubernetesStore();
  const svc = services.find(s => s.id === activeServiceId);
  const ing = ingresses.find(i => i.id === activeIngressId);

  return (
    <div className="space-y-4">
      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Network className="w-4 h-4 text-green-500" />Service</p>
          <button onClick={addService} className={`${btnSm} border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20`}><Plus className="w-3 h-3" />{t.network.new}</button>
        </div>
        {services.length === 0 && <p className="text-xs text-gray-400 italic px-1">{t.network.noService}</p>}
        {services.map(s => <ResRow key={s.id} label={s.name} sub={`${s.type} · ${s.port}→${s.targetPort}`} theme="green" active={s.id === activeServiceId} onClick={() => { setActiveServiceId(s.id); setActiveIngressId(null); }} onDelete={() => removeService(s.id)} />)}
      </div>

      {svc && (
        <div className="border-2 border-green-100 dark:border-green-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] shadow-xl shadow-green-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest">{t.k8s.edit} Service</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-3">
              <div>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.nameLabel}
                </p>
                <input type="text" value={svc.name} onChange={e => updateService(svc.id, { name: e.target.value })} className={inp} />
              </div>
              <div>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.namespaceLabel}
                </p>
                <input type="text" value={svc.namespace} onChange={e => updateService(svc.id, { namespace: e.target.value })} className={inp} />
              </div>
            </div>

            <div className="col-span-2 mt-1">
              <MetadataEditor
                labels={svc.labels} annotations={svc.annotations}
                onUpdateLabels={(v: any) => updateService(svc.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateService(svc.id, { annotations: v })}
                theme="green"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">
                {t.k8s.typeLabel}
              </p>
              <div className="relative group">
                <select value={svc.type} onChange={e => updateService(svc.id, { type: e.target.value as any })} className={`${inp} font-bold appearance-none pr-8`}>
                  <option value="ClusterIP">ClusterIP</option>
                  <option value="NodePort">NodePort</option>
                  <option value="LoadBalancer">LoadBalancer</option>
                  <option value="Headless">Headless (None)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
              </div>
            </div>
            <div>
              <ResourceSelector
                label={t.k8s.selectorLabel}
                value={svc.selectorApp}
                onChange={v => updateService(svc.id, { selectorApp: v })}
                options={workloads.map(w => ({ id: w.id, name: w.appName }))}
                placeholder={t.k8s.selectWorkload}
                inputClassName={inp}
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-end gap-3 p-3 bg-gray-50/50 dark:bg-black/20 rounded-[1.2rem] border border-gray-100 dark:border-gray-800/50">
                <div className="flex-1">
                  <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                    {t.k8s.servicePortLabel}
                  </p>
                  <input type="text" placeholder="80" value={svc.port} onChange={e => updateService(svc.id, { port: e.target.value })} className={`${inpSm} font-mono text-center !h-9 shadow-sm`} />
                </div>

                <div className="pb-2.5 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                    {t.k8s.targetPortLabel}
                  </p>
                  <input type="text" placeholder="80" value={svc.targetPort} onChange={e => updateService(svc.id, { targetPort: e.target.value })} className={`${inpSm} font-mono text-center !h-9 shadow-sm`} />
                </div>

                {svc.type === 'NodePort' && (
                  <>
                    <div className="pb-2.5 px-1">
                      <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-[0.2em] mb-2.5 ml-1">
                        {t.k8s.nodePortLabel}
                      </p>
                      <input type="text" placeholder="30000" value={svc.nodePort} onChange={e => updateService(svc.id, { nodePort: e.target.value })} className={`${inpSm} font-mono text-center border-orange-200 dark:border-orange-900/40 !h-9 bg-orange-50/30 dark:bg-orange-900/10 shadow-sm`} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>


        </div>
      )}

      {/* Ingresses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-500" />Ingress</p>
          <button onClick={addIngress} className={`${btnSm} border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20`}><Plus className="w-3 h-3" />{t.network.new}</button>
        </div>
        {ingresses.length === 0 && <p className="text-xs text-gray-400 italic px-1">{t.network.noIngress}</p>}
        {ingresses.map(i => <ResRow key={i.id} label={i.name} sub={`${i.rules.length} ${t.network.rule}`} theme="purple" active={i.id === activeIngressId} onClick={() => { setActiveIngressId(i.id); setActiveServiceId(null); }} onDelete={() => removeIngress(i.id)} />)}
      </div>

      {ing && (
        <div className="border-2 border-purple-100 dark:border-purple-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] shadow-xl shadow-purple-500/5 duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">{t.k8s.edit} Ingress</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                {t.k8s.nameLabel}
              </p>
              <input type="text" value={ing.name} onChange={e => updateIngress(ing.id, { name: e.target.value })} className={inp} />
            </div>
            <div>
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                {t.k8s.ingressClassLabel}
              </p>
              <input type="text" placeholder="nginx" value={ing.ingressClassName} onChange={e => updateIngress(ing.id, { ingressClassName: e.target.value })} className={inp} />
            </div>
            <div className="col-span-2">
              <MetadataEditor
                labels={ing.labels} annotations={ing.annotations}
                onUpdateLabels={(v: any) => updateIngress(ing.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateIngress(ing.id, { annotations: v })}
                theme="purple"
              />
            </div>
          </div>
          <Checkbox checked={ing.tls} onChange={v => updateIngress(ing.id, { tls: v })} label={t.k8s.enableTls} />
          {ing.tls && (
            <div className="animate-in fade-in slide-in-from-top-1">
              <ResourceSelector
                label={t.k8s.tlsSecretLabel}
                value={ing.tlsSecret}
                onChange={v => updateIngress(ing.id, { tlsSecret: v })}
                options={secrets.map(s => ({ id: s.id, name: s.name }))}
                placeholder={t.k8s.listSelect}
                manualPlaceholder="Secret Name"
                inputClassName={inp}
              />
            </div>
          )}
          <p className="text-[12px] text-gray-600 dark:text-gray-300 font-black uppercase tracking-[0.2em] py-2 border-t border-gray-100 dark:border-gray-800">
            {t.k8s.rulesLabel}
          </p>
          {ing.rules.map(r => (
            <div key={r.id} className="flex gap-2 flex-wrap items-end p-3 bg-gray-50/50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800/50">
              <div className="flex-1 min-w-28 space-y-1.5">
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.k8s.hostLabel}</p>
                <input type="text" placeholder="example.com" value={r.host} onChange={e => updateIngressRule(ing.id, r.id, { host: e.target.value })} className={inpSm} />
              </div>
              <div className="w-32 space-y-1.5">
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.k8s.pathLabel}</p>
                <input type="text" placeholder="/" value={r.path} onChange={e => updateIngressRule(ing.id, r.id, { path: e.target.value })} className={inpSm} />
              </div>
              <div className="flex-1 min-w-[12rem]">
                <ResourceSelector
                  label={t.k8s.targetServiceLabel}
                  value={r.serviceName}
                  onChange={val => {
                    const targetSvc = services.find(s => s.name === val);
                    const patch: any = { serviceName: val };
                    if (targetSvc) patch.servicePort = targetSvc.port;
                    updateIngressRule(ing.id, r.id, patch);
                  }}
                  options={services.map(s => ({ id: s.id, name: s.name }))}
                  placeholder={t.k8s.listSelect}
                  manualPlaceholder="Service NAME"
                />
              </div>
              <div className="w-24 space-y-1.5">
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.k8s.portLabel}</p>
                <input type="text" placeholder="80" value={r.servicePort} onChange={e => updateIngressRule(ing.id, r.id, { servicePort: e.target.value })} className={`${inpSm} font-mono`} />
              </div>
              <button onClick={() => removeIngressRule(ing.id, r.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={() => addIngressRule(ing.id)} className="text-xs text-purple-500 font-medium">+ {t.common.add} {t.network.rule}</button>


        </div>
      )}
    </div>
  );
}

// ── Storage Section ──────────────────────────────────────────────────────────
function StorageSection() {
  const { t, language } = useTranslation();
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
          <button onClick={addStorageClass} className={`${btnSm} border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20`}><Plus className="w-3 h-3" />{t.network.new}</button>
        </div>
        {storageClasses.length === 0 && <p className="text-xs text-gray-400 italic px-1">{t.storage.noSc}</p>}
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
            <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">{t.k8s.edit} StorageClass</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.common.name}</p><input type="text" value={sc.name} onChange={e => updateStorageClass(sc.id, { name: e.target.value })} className={inp} /></div>

            <div className="col-span-2 mb-2">
              <MetadataEditor
                labels={sc.labels} annotations={sc.annotations}
                onUpdateLabels={(v: any) => updateStorageClass(sc.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateStorageClass(sc.id, { annotations: v })}
                theme="orange"
              />
            </div>

            <div className="col-span-2"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">Provisioner</p><input type="text" placeholder="kubernetes.io/aws-ebs" value={sc.provisioner} onChange={e => updateStorageClass(sc.id, { provisioner: e.target.value })} className={inp} /></div>
            <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.restartPolicy}</p><select value={sc.reclaimPolicy} onChange={e => updateStorageClass(sc.id, { reclaimPolicy: e.target.value as any })} className={inp}><option value="Delete">Delete</option><option value="Retain">Retain</option></select></div>
            <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">Binding Mode</p><select value={sc.volumeBindingMode} onChange={e => updateStorageClass(sc.id, { volumeBindingMode: e.target.value as any })} className={inp}><option value="Immediate">Immediate</option><option value="WaitForFirstConsumer">WaitForFirstConsumer</option></select></div>
            <div className="col-span-2"><Checkbox checked={sc.allowVolumeExpansion} onChange={v => updateStorageClass(sc.id, { allowVolumeExpansion: v })} label="Allow Volume Expansion" /></div>
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
              <button onClick={() => addStorageClassParam(sc.id)} className="text-[10px] text-blue-500 hover:text-blue-400 font-bold">+ {t.common.add} Parameter</button>
            </div>
          </div>


        </div>
      )}
      {/* PVs (Cluster-wide) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-slate-500" />PersistentVolume</p>
          <button onClick={addPv} className={`${btnSm} border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400`}><Plus className="w-3 h-3" />{t.network.new}</button>
        </div>
        {pvs.length === 0 && <p className="text-xs text-gray-400 italic px-1">-- {t.k8s.noVolumes} --</p>}
        {pvs.map(p => <ResRow key={p.id} label={p.name} sub={`${p.capacity} · ${p.accessMode}`} theme="slate" active={p.id === activePvId} onClick={() => { setActivePvId(p.id); setActivePvcId(null); setActiveConfigMapId(null); setActiveSecretId(null); setActiveStorageClassId(null); }} onDelete={() => removePv(p.id)} />)}
      </div>
      {pv && (
        <div className="border-2 border-slate-100 dark:border-slate-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] duration-300 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-slate-500/5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.edit} PersistentVolume</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.nameLabel}
                </p>
              <input type="text" value={pv.name} onChange={e => updatePv(pv.id, { name: e.target.value })} className={inp} />
            </div>
            <div className="col-span-2">
              <MetadataEditor
                labels={pv.labels} annotations={pv.annotations}
                onUpdateLabels={(v: any) => updatePv(pv.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updatePv(pv.id, { annotations: v })}
                theme="slate"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">
                {t.k8s.capacityLabel}
              </p>
              {(() => {
                const valStr = String(pv.capacity || "");
                const match = valStr.match(/^(\d+)(.*)$/);
                const numPart = match ? match[1] : valStr;
                const unitPart = match ? match[2] : (valStr ? "" : "Gi");
                const units = ['Mi', 'Gi', 'Ti', 'Pi'];
                return (
                  <div className="flex gap-1.5 items-stretch h-[42px]">
                    <input type="text" placeholder="10" value={numPart}
                      onChange={e => updatePv(pv.id, { capacity: e.target.value + unitPart })}
                      className={`${inp} flex-1 !h-full font-mono text-center shadow-sm`} />
                    <div className="relative group min-w-[70px]">
                      <select value={unitPart} onChange={e => updatePv(pv.id, { capacity: numPart + e.target.value })}
                        className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-[11px] h-full pl-2.5 pr-6 appearance-none cursor-pointer hover:border-blue-200 transition-all focus:outline-none">
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">
                {t.k8s.accessModeLabel}
              </p>
              <div className="relative group">
                <select value={pv.accessMode} onChange={e => updatePv(pv.id, { accessMode: e.target.value as any })} className={`${inp} font-bold appearance-none pr-8`}>
                  <option value="ReadWriteOnce">ReadWriteOnce</option>
                  <option value="ReadWriteMany">ReadWriteMany</option>
                  <option value="ReadOnlyMany">ReadOnlyMany</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">
                {t.k8s.reclaimPolicyLabel}
              </p>
              <div className="relative group">
                <select value={pv.reclaimPolicy} onChange={e => updatePv(pv.id, { reclaimPolicy: e.target.value as any })} className={`${inp} font-bold appearance-none pr-8`}>
                  <option value="Retain">Retain</option>
                  <option value="Delete">Delete</option>
                  <option value="Recycle">Recycle</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">
                {t.k8s.scLabel}
              </p>
              <div className="relative group">
                <select value={pv.storageClass} onChange={e => updatePv(pv.id, { storageClass: e.target.value })} className={`${inp} font-bold appearance-none pr-8`}>
                  <option value="">-- Standard (None) --</option>
                  {storageClasses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
              </div>
            </div>
          </div>



          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2">{t.storage.storageSource}</p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select value={pv.sourceType} onChange={e => updatePv(pv.id, { sourceType: e.target.value as any })} className={`w-32 shrink-0 ${inpSm}`}>
                  <option value="hostPath">HostPath</option>
                  <option value="nfs">NFS</option>
                  <option value="local">Local</option>
                  <option value="csi">CSI</option>
                </select>
                {pv.sourceType === 'hostPath' && <input type="text" placeholder={t.storage.pathPlaceholder} value={pv.hostPath} onChange={e => updatePv(pv.id, { hostPath: e.target.value })} className={inpSm} />}
                {pv.sourceType === 'local' && <input type="text" placeholder={t.storage.localPathPlaceholder} value={pv.hostPath} onChange={e => updatePv(pv.id, { hostPath: e.target.value })} className={inpSm} />}
                {pv.sourceType === 'nfs' && (
                  <div className="flex-1 flex gap-2">
                    <input type="text" placeholder={t.storage.nfsServerPlaceholder} value={pv.nfsServer} onChange={e => updatePv(pv.id, { nfsServer: e.target.value })} className={inpSm} />
                    <input type="text" placeholder={t.storage.nfsPathPlaceholder} value={pv.nfsPath} onChange={e => updatePv(pv.id, { nfsPath: e.target.value })} className={inpSm} />
                  </div>
                )}
                {pv.sourceType === 'csi' && (
                  <div className="flex-1 flex gap-2">
                    <input type="text" placeholder={t.storage.csiDriverPlaceholder} value={pv.csiDriver} onChange={e => updatePv(pv.id, { csiDriver: e.target.value })} className={inpSm} />
                    <input type="text" placeholder={t.storage.vHandlePlaceholder} value={pv.csiHandle} onChange={e => updatePv(pv.id, { csiHandle: e.target.value })} className={inpSm} />
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
          <button onClick={addPvc} className={`${btnSm} border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400`}><Plus className="w-3 h-3" />{t.network.new}</button>
        </div>
        {pvcs.length === 0 && <p className="text-xs text-gray-400 italic px-1">{t.storage.noPvc}</p>}
        {pvcs.map(p => <ResRow key={p.id} label={p.name} sub={`${p.storage} · ${p.accessMode}`} theme="indigo" active={p.id === activePvcId} onClick={() => { setActivePvcId(p.id); setActiveConfigMapId(null); setActiveSecretId(null); setActiveStorageClassId(null); }} onDelete={() => removePvc(p.id)} />)}
      </div>
      {pvc && (
        <div className="border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] duration-300 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.k8s.edit} PVC</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.nameLabel}
                </p>
              <input type="text" value={pvc.name} onChange={e => updatePvc(pvc.id, { name: e.target.value })} className={inp} />
            </div>
            <div>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.namespaceLabel}
                </p>
              <input type="text" value={pvc.namespace} onChange={e => updatePvc(pvc.id, { namespace: e.target.value })} className={inp} />
            </div>
            <div className="col-span-2">
              <MetadataEditor
                labels={pvc.labels} annotations={pvc.annotations}
                onUpdateLabels={(v: any) => updatePvc(pvc.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updatePvc(pvc.id, { annotations: v })}
                theme="indigo"
              />
            </div>
            <div>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.storageLabel}
                </p>
              {(() => {
                const valStr = String(pvc.storage || "");
                const match = valStr.match(/^(\d+)(.*)$/);
                const numPart = match ? match[1] : valStr;
                const unitPart = match ? match[2] : (valStr ? "" : "Gi");
                const units = ['Mi', 'Gi', 'Ti', 'Pi'];
                return (
                  <div className="flex gap-1.5 items-stretch h-[36px]">
                    <input type="text" placeholder="1" value={numPart}
                      onChange={e => updatePvc(pvc.id, { storage: e.target.value + unitPart })}
                      className={`${inp} flex-1 !h-full font-mono text-center shadow-sm`} />
                    <div className="relative group min-w-[70px]">
                      <select value={unitPart} onChange={e => updatePvc(pvc.id, { storage: numPart + e.target.value })}
                        className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-[11px] h-full pl-2.5 pr-6 appearance-none cursor-pointer hover:border-blue-200 transition-all focus:outline-none">
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                );
              })()}
            </div>
            <div>
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.accessModeLabel}
                </p>
              <div className="relative group">
                <select value={pvc.accessMode} onChange={e => updatePvc(pvc.id, { accessMode: e.target.value as any })} className={`${inp} font-bold appearance-none pr-8`}>
                  <option value="ReadWriteOnce">ReadWriteOnce</option>
                  <option value="ReadWriteMany">ReadWriteMany</option>
                  <option value="ReadOnlyMany">ReadOnlyMany</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
              </div>
            </div>
            <div className="col-span-2">
                <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">
                  {t.k8s.scLabel}
                </p>
              <div className="relative group">
                <select value={pvc.storageClass} onChange={e => updatePvc(pvc.id, { storageClass: e.target.value })} className={`${inp} font-bold appearance-none pr-8`}>
                  <option value="">-- Cluster Default --</option>
                  {storageClasses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 pointer-events-none transition-colors" />
              </div>
            </div>
            <div className="">
              <ResourceSelector
                label="Selector PV (Optional)"
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
                placeholder="-- Dynamic Provisioning --"
                manualPlaceholder="PV NAME"
              />
            </div>
          </div>

        </div>
      )}

      {/* ConfigMaps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Tag className="w-4 h-4 text-teal-500" />ConfigMap</p>
          <button onClick={addConfigMap} className={`${btnSm} border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400`}><Plus className="w-3 h-3" />{t.network.new}</button>
        </div>
        {configMaps.length === 0 && <p className="text-xs text-gray-400 italic px-1">-- {t.k8s.noConfigMaps} --</p>}
        {configMaps.map(c => <ResRow key={c.id} label={c.name} sub={`data: ${c.data.length} ${t.common.itemUnit}`} theme="teal" active={c.id === activeConfigMapId} onClick={() => { setActiveConfigMapId(c.id); setActivePvcId(null); setActiveSecretId(null); setActiveStorageClassId(null); }} onDelete={() => removeConfigMap(c.id)} />)}
      </div>
      {cm && (
        <div className="border-2 border-teal-100 dark:border-teal-900/30 rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0E1117] duration-300 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-teal-500/5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.common.edit} ConfigMap</p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.common.name}</p><input type="text" value={cm.name} onChange={e => updateConfigMap(cm.id, { name: e.target.value })} className={inp} /></div>
            <div className="space-y-1.5"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.k8s.namespace}</p><input type="text" value={cm.namespace} onChange={e => updateConfigMap(cm.id, { namespace: e.target.value })} className={inp} /></div>
            <div className="col-span-2">
              <MetadataEditor
                labels={cm.labels} annotations={cm.annotations}
                onUpdateLabels={(v: any) => updateConfigMap(cm.id, { labels: v })}
                onUpdateAnnotations={(v: any) => updateConfigMap(cm.id, { annotations: v })}
                theme="teal"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">{t.storage.cm} Data</p>
          <div className="space-y-3">
            {cm.data.map((d, i) => (
              <div key={i} className="p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5 text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em]">
                    <FileText className="w-3.5 h-3.5" />{t.storage.key}
                  </div>
                  <button onClick={() => removeConfigMapData(cm.id, i)} className="text-gray-400 hover:text-red-400 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input type="text" placeholder="config.yaml / db_host..." value={d.key}
                  onChange={e => updateConfigMapData(cm.id, i, 'key', e.target.value)}
                  className={inpSm} />
                <div className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.value}</div>
                <textarea placeholder={t.storage.valuePlaceholder} value={d.value}
                  onChange={e => updateConfigMapData(cm.id, i, 'value', e.target.value)}
                  className={`w-full block min-h-[100px] max-h-[400px] bg-white dark:bg-[#1C2128] border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-teal-500 font-mono transition`} />
              </div>
            ))}
          </div>
          <button onClick={() => addConfigMapData(cm.id)} className="text-[10px] text-blue-500 font-bold">+ {t.common.add} Item</button>
        </div>
      )}

      {/* Secrets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Shield className="w-4 h-4 text-amber-500" />Secret</p>
          <button onClick={addSecret} className={`${btnSm} border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400`}><Plus className="w-3 h-3" />{t.network.new}</button>
        </div>
        {secrets.length === 0 && <p className="text-xs text-gray-400 italic px-1">-- {t.k8s.noSecrets} --</p>}
        {secrets.map(s => <ResRow key={s.id} label={s.name} sub={`type: ${s.secretType} · ${s.data.length} ${t.common.itemUnit}`} active={s.id === activeSecretId} onClick={() => { setActiveSecretId(s.id); setActivePvcId(null); setActiveConfigMapId(null); }} onDelete={() => removeSecret(s.id)} />)}
      </div>
      {sec && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3 bg-white dark:bg-[#0E1117]">
          <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.common.edit} Secret</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.common.name.toUpperCase()}</p><input type="text" value={sec.name} onChange={e => updateSecret(sec.id, { name: e.target.value })} className={inp} /></div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 h-5 flex items-center">{t.storage.type.toUpperCase()}</p>
              <select value={sec.secretType} onChange={e => updateSecret(sec.id, { secretType: e.target.value })} className={inp}>
                <option value="Opaque">Opaque (Custom/Generic)</option>
                <option value="kubernetes.io/dockerconfigjson">kubernetes.io/dockerconfigjson (Docker Registry)</option>
                <option value="kubernetes.io/tls">kubernetes.io/tls (SSL/TLS Certificate)</option>
                <option value="kubernetes.io/basic-auth">kubernetes.io/basic-auth (Basic Auth)</option>
                <option value="kubernetes.io/ssh-auth">kubernetes.io/ssh-auth (SSH Key)</option>
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
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{t.storage.registryHelper} (.dockerconfigjson)</p>
                  <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.registryUrl}</p><input type="text" placeholder="https://index.docker.io/v1/" defaultValue="https://index.docker.io/v1/" id="docker-registry" className={inpSm} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.username}</p><input type="text" placeholder="admin" id="docker-user" className={inpSm} /></div>
                    <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.password}</p><input type="password" placeholder="******" id="docker-pass" className={inpSm} /></div>
                  </div>
                  <button onClick={() => {
                    const reg = (document.getElementById('docker-registry') as HTMLInputElement).value || 'https://index.docker.io/v1/';
                    const user = (document.getElementById('docker-user') as HTMLInputElement).value;
                    const pass = (document.getElementById('docker-pass') as HTMLInputElement).value;
                    if (!user || !pass) return;
                    const auth = btoa(`${user}:${pass}`);
                    const config = JSON.stringify({ auths: { [reg]: { auth: btoa(`${user}:${pass}`) } } }, null, 2);
                    updateSecret(sec.id, { data: [{ key: '.dockerconfigjson', value: config }] });
                    alert(t.storage.applied);
                  }} className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all">{t.storage.generate}</button>
                </div>
              );
            }
            if (sec.secretType === 'kubernetes.io/tls') {
              return (
                <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />{t.storage.tlsHelper} (tls.crt / tls.key)</p>
                  <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.tlsCrt}</p><textarea id="tls-crt" className={`${inpSm} h-24 font-mono text-[10px]`} placeholder="-----BEGIN CERTIFICATE-----" /></div>
                  <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.tlsKey}</p><textarea id="tls-key" className={`${inpSm} h-24 font-mono text-[10px]`} placeholder="-----BEGIN PRIVATE KEY-----" /></div>
                  <button onClick={() => {
                    const crt = (document.getElementById('tls-crt') as HTMLTextAreaElement).value;
                    const key = (document.getElementById('tls-key') as HTMLTextAreaElement).value;
                    if (!crt || !key) return;
                    updateSecret(sec.id, { data: [{ key: 'tls.crt', value: crt }, { key: 'tls.key', value: key }] });
                    alert(t.storage.applied);
                  }} className="w-full py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 shadow-sm transition-all">{t.storage.apply}</button>
                </div>
              );
            }
            if (sec.secretType === 'kubernetes.io/basic-auth') {
              return (
                <div className="p-4 bg-teal-50/50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" />{t.storage.basicAuthHelper}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.username}</p><input type="text" id="ba-user" className={inpSm} placeholder="admin" /></div>
                    <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.password}</p><input type="password" id="ba-pass" className={inpSm} placeholder="******" /></div>
                  </div>
                  <button onClick={() => {
                    const user = (document.getElementById('ba-user') as HTMLInputElement).value;
                    const pass = (document.getElementById('ba-pass') as HTMLInputElement).value;
                    if (!user || !pass) return;
                    updateSecret(sec.id, { data: [{ key: 'username', value: user }, { key: 'password', value: pass }] });
                    alert(t.storage.applied);
                  }} className="w-full py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 shadow-sm transition-all">{t.storage.apply}</button>
                </div>
              );
            }
            if (sec.secretType === 'kubernetes.io/ssh-auth') {
              return (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />{t.storage.sshHelper}</p>
                  <div><p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.sshKey}</p><textarea id="ssh-key" className={`${inpSm} h-32 font-mono text-[10px]`} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" /></div>
                  <button onClick={() => {
                    const key = (document.getElementById('ssh-key') as HTMLTextAreaElement).value;
                    if (!key) return;
                    updateSecret(sec.id, { data: [{ key: 'ssh-privatekey', value: key }] });
                    alert(t.storage.applied);
                  }} className="w-full py-1.5 bg-slate-600 text-white text-xs font-bold rounded-lg hover:bg-slate-700 shadow-sm transition-all">{t.storage.apply}</button>
                </div>
              );
            }

            return (
              <>
                <p className="text-xs text-gray-500">{t.storage.dataItems}</p>
                <div className="space-y-3">
                  {sec.data.map((d, i) => (
                    <div key={i} className="p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5 text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em]">
                          <KeyRound className="w-3.5 h-3.5" />{t.storage.key}
                        </div>
                        <button onClick={() => removeSecretData(sec.id, i)} className="text-gray-400 hover:text-red-400 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <input type="text" placeholder="key..." value={d.key} onChange={e => updateSecretData(sec.id, i, 'key', e.target.value)} className={inpSm} />
                      <div className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-2.5 ml-1">{t.storage.plaintextValue}</div>
                      <textarea placeholder={t.storage.valuePlaceholder} value={d.value} onChange={e => updateSecretData(sec.id, i, 'value', e.target.value)} className={`${inpSm} h-16 font-mono text-[11px]`} />
                    </div>
                  ))}
                </div>
                <button onClick={() => addSecretData(sec.id)} className="text-xs text-amber-500 font-medium py-1.5 hover:underline">+ {t.common.add} Item</button>
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
  const { t } = useTranslation();
  const { resetOverride } = useAppStore();
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
    { id: 'workload' as const, label: t.k8s.workloadList, icon: <Layers className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { id: 'network' as const, label: t.tabs.network || 'Network', icon: <Network className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400 border-green-500 bg-green-50 dark:bg-green-900/20' },
    { id: 'storage' as const, label: t.tabs.storage || 'Storage', icon: <Database className="w-4 h-4" />, color: 'text-indigo-600 dark:text-indigo-400 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const activeWl = workloads.find(w => w.id === activeWorkloadId);

  return (
    <div className="animate-in fade-in flex flex-col pb-10">
      {/* ── Global Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-4 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-2xl gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1 items-center flex gap-1.5"><Globe className="w-4 h-4 text-blue-500" />{t.k8s.globalConfig}</span>
          <div className="flex items-center gap-2">
            <input type="text" value={globalNamespace}
              onChange={e => setNamespace(e.target.value)}
              placeholder={`${t.k8s.namespace} (e.g. prod)`}
              className="bg-white dark:bg-[#0E1117] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-40" />
            <button onClick={syncAllNamespaces}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95">
              <RefreshCw className="w-4 h-4" /> {t.k8s.syncAll}
            </button>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-1">{t.k8s.stats}</p>
          <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
            {workloads.length} {t.k8s.unitWload} · {services.length + ingresses.length} {t.k8s.unitNet} · {pvcs.length + configMaps.length + secrets.length} {t.k8s.unitStore}
          </p>
        </div>
      </div>

      {/* ── Main Tab Bar ── */}
      <div className="flex gap-2 mb-6">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all flex-1 justify-center ${activeSection === s.id ? s.color : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400'}`}>
            {s.icon}{s.label}
          </button>
        ))}
      </div>

      {/* ── Workload Section ── */}
      {activeSection === 'workload' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t.k8s.workloadList}</p>
            <button onClick={addWorkload} className={`${btnSm} border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20`}><Plus className="w-3 h-3" />{t.network.newWorkload}</button>
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">{w.workloadType} · {w.image}</p>
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
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm font-medium">{t.k8s.selectWorkload}</div>
          )}
        </div>
      )}

      {/* ── Network Section ── */}
      {activeSection === 'network' && (
        <div className="space-y-6">
          <Section title={t.tabs.network || 'Network'} icon={<Network className="w-4 h-4" />} theme="emerald" badge={t.k8s.badges.traffic} defaultOpen={true}>
            <NetworkSection />
          </Section>
        </div>
      )}

      {/* ── Storage Section ── */}
      {activeSection === 'storage' && (
        <div className="space-y-6">
          <Section title={t.tabs.storage || 'Storage'} icon={<Database className="w-4 h-4" />} theme="indigo" badge={t.k8s.badges.persistence} defaultOpen={true}>
            <StorageSection />
          </Section>
        </div>
      )}
    </div>
  );
}
