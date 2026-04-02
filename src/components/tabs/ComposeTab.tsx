"use client";

import { useState } from 'react';
import { useComposeStore, ComposeService } from '@/store/useComposeStore';
import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  Box, Layers, Info, Shield, Terminal, Activity, Zap, Check, Plus, 
  ChevronDown, Trash2, Globe, Database, Settings, Layout, Rocket,
  Cpu, HardDrive, ListTree, FileCode, Tag, MousePointer2, Share2
} from "lucide-react";

// ── Shared styles ────────────────────────────────────────────────────────────
const inp = "w-full bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/5 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400";
const inpSm = "w-full bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-lg py-1.5 px-3 text-[13px] focus:outline-none focus:border-blue-400 transition-all text-gray-800 dark:text-gray-200";
const btnSm = "flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border transition-all font-black uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95";

// ── Collapsible Section ──────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true, theme = "blue", badge }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; theme?: string; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const themes: Record<string, { icon: string; bg: string; border: string; badge: string }> = {
    blue: { icon: "text-blue-500", bg: "bg-blue-50/30 dark:bg-blue-900/10", border: "border-blue-500/20", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    teal: { icon: "text-teal-500", bg: "bg-teal-50/30 dark:bg-teal-900/10", border: "border-teal-500/20", badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800" },
    orange: { icon: "text-orange-500", bg: "bg-orange-50/30 dark:bg-orange-900/10", border: "border-orange-500/20", badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
    indigo: { icon: "text-indigo-500", bg: "bg-indigo-50/30 dark:bg-indigo-900/10", border: "border-indigo-500/20", badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
    purple: { icon: "text-purple-500", bg: "bg-purple-50/30 dark:bg-purple-900/10", border: "border-purple-500/20", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
    emerald: { icon: "text-emerald-500", bg: "bg-emerald-50/30 dark:bg-emerald-900/10", border: "border-emerald-500/20", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  };
  const t = themes[theme] || themes.blue;

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden mb-8 shadow-sm bg-white dark:bg-[#0D1117] transition-all hover:border-gray-300 dark:hover:border-gray-700">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-6 py-5 ${t.bg} hover:opacity-95 transition-all text-left select-none group border-b ${t.border}`}>
        <div className="flex items-center gap-5">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <div className={t.icon}>{icon}</div>
          </div>
          <div>
            <p className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-[0.15em]">{title}</p>
            {badge && <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${t.badge}`}>{badge}</span>}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-500 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-8 bg-white dark:bg-[#0D1117] animate-in fade-in slide-in-from-top-2 duration-500">{children}</div>}
    </div>
  );
}

// ── Metadata Editor ─────────────────────────────────────────────────────────
function MetadataEditor({ title, items, onUpdate, theme = "blue", icon: Icon }: any) {
  const themes: any = {
    blue: "text-blue-500 bg-blue-50/30 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800",
    teal: "text-teal-500 bg-teal-50/30 border-teal-200 dark:bg-teal-900/10 dark:border-teal-800",
    orange: "text-orange-500 bg-orange-50/30 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800",
    emerald: "text-emerald-500 bg-emerald-50/30 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800",
  };
  const t = themes[theme] || themes.blue;

  return (
    <div className={`p-5 rounded-3xl border ${t} space-y-4 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-black/5">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</p>
        </div>
        <span className="text-[10px] font-black opacity-50">{(items || []).length} ITEMS</span>
      </div>
      <div className="space-y-2.5">
        {(items || []).map((it: any, i: number) => (
          <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
            <input type="text" placeholder="KEY" value={it.key} onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, key: e.target.value } : x))}
              className={`${inpSm} font-mono !rounded-xl !bg-white dark:!bg-[#1C2128]`} />
            <input type="text" placeholder="VALUE" value={it.value} onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, value: e.target.value } : x))}
              className={`${inpSm} font-mono !rounded-xl !bg-white dark:!bg-[#1C2128]`} />
            <button onClick={() => onUpdate(items.filter((_: any, idx: number) => idx !== i))}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => onUpdate([...(items || []), { key: '', value: '' }])}
          className="w-full py-2 border-2 border-dashed border-black/5 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> ADD NEW {title.split(' ')[0]}
        </button>
      </div>
    </div>
  );
}

export function ComposeTab() {
  const { composeServices, setComposeServices, activeSvcId, setActiveSvcId, composeAddons, setComposeAddons, composeVersion, setComposeVersion } = useComposeStore();
  const { activeTooltip, setActiveTooltip } = useAppStore();

  const activeSvcIndex = composeServices.findIndex(s => s.id === activeSvcId);
  const svc = composeServices[activeSvcIndex];

  if (!svc) return null;

  const updateSvc = (field: keyof ComposeService, value: any) => {
    const n = [...composeServices];
    n[activeSvcIndex] = { ...n[activeSvcIndex], [field]: value };
    setComposeServices(n);
  };

  const updateArr = (lf: keyof ComposeService, idx: number, sf: string | null, val: any) => {
    const n = [...composeServices];
    const lst = [...(n[activeSvcIndex][lf] as any[])];
    if (sf) lst[idx] = { ...lst[idx], [sf]: val };
    else lst[idx] = val;
    n[activeSvcIndex] = { ...n[activeSvcIndex], [lf] : lst } as any;
    setComposeServices(n);
  };

  const addArr = (lf: keyof ComposeService, empty: any) => {
    const n = [...composeServices];
    const lst = [...(n[activeSvcIndex][lf] as any[])];
    lst.push(empty);
    n[activeSvcIndex] = { ...n[activeSvcIndex], [lf] : lst } as any;
    setComposeServices(n);
  };

  const remArr = (lf: keyof ComposeService, idx: number) => {
    const n = [...composeServices];
    const lst = [...(n[activeSvcIndex][lf] as any[])];
    lst.splice(idx, 1);
    n[activeSvcIndex] = { ...n[activeSvcIndex], [lf] : lst } as any;
    setComposeServices(n);
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Service Tabs and Global Config */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10 items-start lg:items-center justify-between">
        <div className="flex-1 flex flex-wrap gap-2.5 p-2 bg-gray-50/50 dark:bg-[#161B22]/50 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] relative overflow-hidden group w-full lg:w-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          {composeServices.map((tabSvc) => (
            <div key={tabSvc.id} className="relative group/tab">
              <button
                onClick={() => setActiveSvcId(tabSvc.id)}
                className={`flex items-center gap-3 px-5 py-3 text-xs font-black rounded-3xl transition-all duration-500 relative z-10 
                  ${activeSvcId === tabSvc.id 
                    ? 'bg-white dark:bg-[#0D1117] text-blue-600 shadow-lg dark:shadow-black/40 border border-gray-200 dark:border-gray-700 scale-105 active:scale-100' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${activeSvcId === tabSvc.id ? 'bg-blue-500 scale-125' : 'bg-gray-300 dark:bg-gray-700'}`} />
                {tabSvc.name.toUpperCase() || 'UNNAMED'}
              </button>
              {composeServices.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = composeServices.filter(s => s.id !== tabSvc.id);
                    setComposeServices(next);
                    if (activeSvcId === tabSvc.id) setActiveSvcId(next[0].id);
                  }}
                  className={`absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover/tab:opacity-100 transition-all hover:scale-110 z-20 font-black`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button 
            onClick={() => {
              const newId = "svc-" + Date.now();
              setComposeServices([...composeServices, { 
                id: newId, name: `service-${composeServices.length + 1}`, buildMode: "image", image: "nginx:alpine", dockerfile: "Dockerfile", context: ".", ports: [{ host: "80", container: "80" }], restart: "unless-stopped", envs: [], vols: [], command: "", entrypoint: "", user: "", privileged: false, cpus: "", memLimit: "", extraHosts: [], capAdd: [], envFiles: [], logDriver: "default", logMaxSize: "", logMaxFile: "3", healthcheck: { enabled: false, test: "curl -f http://localhost/ || exit 1", interval: "30s", timeout: "10s", retries: "3", startPeriod: "40s" }, dependsOn: [], useGpu: false, labels: [], networkMode: "bridge", shmSize: "", pid: "", tty: false, stdinOpen: false, customYaml: "", useShellWrapper: false 
              }]);
              setActiveSvcId(newId);
            }}
            className="px-6 py-3 text-xs font-black text-blue-500 hover:bg-white dark:hover:bg-[#0D1117] rounded-full transition-all flex items-center gap-2 group/add"
          >
            <Plus className="w-4 h-4 group-hover/add:rotate-90 transition-transform" />
            ADD SERVICE
          </button>
        </div>

        <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-[#161B22]/50 p-2 rounded-full border border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2 px-4">
             <Settings className="w-3.5 h-3.5 text-gray-400" />
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">VERSION</span>
          </div>
          <select
            value={composeVersion}
            onChange={(e) => setComposeVersion(e.target.value)}
            className="bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-full py-2 px-6 text-[10px] font-black text-blue-600 focus:outline-none focus:ring-4 ring-blue-500/10 cursor-pointer transition-all"
          >
            <option value="3.9">3.9</option>
            <option value="3.8">3.8</option>
            <option value="none">V2</option>
          </select>
        </div>
      </div>

      {/* Editor Content */}
      <div className="space-y-4">
        {/* 1. Core Configuration */}
        <Section title="1. 核心定义与镜像源" icon={<Rocket className="w-4 h-4" />} theme="blue" badge="CORE DEFINITION">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="relative group">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
                   服务标识 (SERVICE NAME)
                   <Info className="w-3.5 h-3.5 cursor-help opacity-40 hover:opacity-100" onClick={() => setActiveTooltip(activeTooltip === 'name' ? null : 'name')} />
                </p>
                {activeTooltip === 'name' && <div className="absolute left-0 -top-12 bg-gray-900 text-white p-2 text-[10px] rounded-xl shadow-2xl w-[200px] z-20 border border-gray-700">Compose 内部唯一的服务键名</div>}
                <input type="text" value={svc.name} onChange={e => updateSvc("name", e.target.value)} className={inp} placeholder="web-api" />
              </div>

              <div className="p-6 bg-gray-50/50 dark:bg-[#161B22]/50 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">部署来源 (DEPLOY SOURCE)</p>
                  <div className="flex bg-white dark:bg-[#0D1117] rounded-full border border-gray-200 dark:border-gray-800 p-1.5 shadow-inner">
                    <button onClick={() => updateSvc('buildMode', 'build')} 
                      className={`px-4 py-1.5 text-[9px] font-black rounded-full transition-all ${svc.buildMode === 'build' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>BUILD</button>
                    <button onClick={() => updateSvc('buildMode', 'image')} 
                      className={`px-4 py-1.5 text-[9px] font-black rounded-full transition-all ${svc.buildMode === 'image' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>IMAGE</button>
                  </div>
                </div>
                {svc.buildMode === 'image' ? (
                  <input type="text" placeholder="e.g. nginx:alpine" value={svc.image} onChange={e => updateSvc("image", e.target.value)}
                    className={`${inp} !bg-white dark:!bg-[#0D1117]`} />
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1 group/ctx">
                      <p className="absolute -top-2 left-3 bg-white dark:bg-[#0D1117] px-1 text-[8px] font-black text-blue-500 opacity-60 uppercase z-10">Context</p>
                      <input type="text" placeholder="." value={svc.context || '.'} onChange={e => updateSvc("context", e.target.value)}
                        className={`${inp} !bg-white dark:!bg-[#0D1117] flex-1 !border-blue-100 dark:!border-blue-900/30 !rounded-2xl`} />
                    </div>
                    <div className="relative group/df">
                      <p className="absolute -top-2 left-3 bg-white dark:bg-[#0D1117] px-1 text-[8px] font-black text-emerald-500 opacity-60 uppercase z-10">Dockerfile</p>
                      <input type="text" placeholder="Dockerfile" value={svc.dockerfile || 'Dockerfile'} onChange={e => updateSvc("dockerfile", e.target.value)}
                        className={`${inp} !bg-white dark:!bg-[#0D1117] w-32 !border-emerald-100 dark:!border-emerald-900/30 !rounded-2xl !text-xs font-mono`} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 group-hover:text-indigo-500 transition-colors">
                  重启策略 (RESTART POLICY)
                  <Info className="w-3.5 h-3.5 cursor-help opacity-40" onClick={() => setActiveTooltip(activeTooltip === 'restart' ? null : 'restart')} />
                </p>
                {activeTooltip === 'restart' && <div className="absolute right-0 -top-12 bg-gray-900 text-white p-2 text-[10px] rounded-xl shadow-2xl w-[200px] z-20 border border-gray-700">控制进程崩溃或宿主机重启时的行为</div>}
                <select value={svc.restart} onChange={e => updateSvc("restart", e.target.value)}
                  className={`${inp} cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center]`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
                  <option value="no">no (Always Stop)</option>
                  <option value="always">always (Force Start)</option>
                  <option value="unless-stopped">unless-stopped (Recommended)</option>
                  <option value="on-failure">on-failure (Exit non-zero)</option>
                </select>
              </div>

              <div className="p-6 bg-indigo-50/20 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl space-y-4">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">启动依赖 (DEPENDS ON)</p>
                <div className="flex flex-wrap gap-2">
                  {composeServices.filter(s => s.id !== svc.id).map(ds => {
                    const isChecked = (svc.dependsOn || []).includes(ds.id);
                    return (
                      <button key={ds.id} 
                        onClick={() => {
                          const newDeps = isChecked 
                            ? (svc.dependsOn || []).filter(id => id !== ds.id)
                            : [...(svc.dependsOn || []), ds.id];
                          updateSvc("dependsOn", newDeps);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black transition-all ${isChecked ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-indigo-300'}`}>
                        {isChecked ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {ds.name}
                      </button>
                    );
                  })}
                  {composeServices.length <= 1 && <span className="text-[10px] font-bold text-gray-400 italic">NO OTHER SERVICES YET</span>}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 2. Networking */}
        <Section title="2. 网络接口与端口映射" icon={<Globe className="w-4 h-4" />} theme="indigo" badge="NETWORKING">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="p-6 bg-gray-50/50 dark:bg-[#161B22]/50 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">暴露端口 (PORTS)</p>
                  <span className="text-[9px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full border border-blue-200/50">HOST:CONTAINER</span>
                </div>
                <button onClick={() => addArr("ports", { host: "", container: "" })} className={btnSm + " !bg-white dark:!bg-[#0D1117] border-blue-200 text-blue-600"}><Plus className="w-3.5 h-3.5" /> ADD PORT</button>
              </div>
              
              <div className="space-y-6">
                {svc.ports.map((p, i) => (
                  <div key={i} className="group animate-in slide-in-from-top-1 space-y-1.5">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1 relative group">
                        <input type="text" placeholder="8080" value={p.host} onChange={e => updateArr("ports", i, "host", e.target.value)}
                          className={`${inp} !text-center !font-mono focus:ring-blue-500/20 !py-2 shadow-sm border-gray-100 dark:border-gray-800`} />
                      </div>
                      
                      <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shrink-0 border border-black/5 dark:border-white/5 shadow-inner">
                        <ChevronDown className="w-3.5 h-3.5 text-blue-500 -rotate-90 stroke-[3]" />
                      </div>
                      
                      <div className="flex-1 relative group">
                        <input type="text" placeholder="80" value={p.container} onChange={e => updateArr("ports", i, "container", e.target.value)}
                          className={`${inp} !text-center !font-mono focus:ring-emerald-500/20 !py-2 shadow-sm border-gray-100 dark:border-gray-800`} />
                      </div>

                      {svc.ports.length > 1 && (
                        <button onClick={() => remArr("ports", i)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-12 px-2">
                       <p className="text-[8px] text-gray-400 text-center italic uppercase font-black tracking-[0.2em] opacity-60">Entry Port</p>
                       <p className="text-[8px] text-gray-400 text-center italic uppercase font-black tracking-[0.2em] opacity-60">Inside Port</p>
                    </div>
                  </div>
                ))}
                {svc.ports.length === 0 && (
                  <div className="py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">No ports exposed</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
               <div className="relative group">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">网络模式 (NETWORK MODE)</p>
                <select value={svc.networkMode || "bridge"} onChange={e => updateSvc("networkMode", e.target.value)}
                  className={`${inp} appearance-none bg-no-repeat bg-[right_1rem_center]`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
                  <option value="bridge">bridge (Default Isolated)</option>
                  <option value="host">host (Share Host Network)</option>
                  <option value="none">none (No Network Stack)</option>
                </select>
               </div>
               <div className="relative group">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">进程间通讯 (PID)</p>
                <select value={svc.pid || ""} onChange={e => updateSvc("pid", e.target.value)}
                  className={`${inp} appearance-none bg-no-repeat bg-[right_1rem_center]`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
                  <option value="">Default (Isolated)</option>
                  <option value="host">host (Visible to System)</option>
                </select>
               </div>
            </div>

            <div className="md:col-span-2">
              <MetadataEditor title="本地域名解析 (EXTRA HOSTS)" items={(svc.extraHosts || []).map(h => ({ key: h.host, value: h.ip }))} 
                onUpdate={(newItems: any) => updateSvc("extraHosts", newItems.map((it: any) => ({ host: it.key, ip: it.value })))}
                theme="indigo" icon={Settings} />
            </div>
          </div>
        </Section>

        {/* 3. Environment & Variables */}
        <Section title="3. 环境变量与标签" icon={<Tag className="w-4 h-4" />} theme="teal" badge="METADATA & VARS">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MetadataEditor title="环境变量 (ENVIRONMENT)" items={svc.envs} onUpdate={(val: any) => updateSvc("envs", val)} theme="teal" icon={Zap} />
              <MetadataEditor title="服务标签 (LABELS)" items={svc.labels} onUpdate={(val: any) => updateSvc("labels", val)} theme="blue" icon={Tag} />
              <div className="md:col-span-2 p-6 bg-teal-50/20 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">外部变量文件 (ENV FILE)</p>
                  <button onClick={() => addArr("envFiles", "")} className={btnSm + " !bg-white dark:!bg-[#0D1117] border-teal-200 text-teal-600"}><Plus className="w-3.5 h-3.5" /> ADD ENV_FILE</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {svc.envFiles.map((f, i) => (
                    <div key={i} className="flex gap-2 group animate-in slide-in-from-top-1">
                      <input type="text" value={f} onChange={e => updateArr("envFiles", i, null, e.target.value)} placeholder=".env.production"
                        className={`${inpSm} !bg-white dark:!bg-[#0D1117] border-teal-200/50 dark:border-teal-800/50`} />
                      <button onClick={() => remArr("envFiles", i)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {svc.envFiles.length === 0 && <p className="text-[10px] text-gray-400 italic">No environment files defined.</p>}
                </div>
              </div>
           </div>
        </Section>

        {/* 4. Persistence & Execution */}
        <Section title="4. 存储卷与执行命令" icon={<HardDrive className="w-4 h-4" />} theme="orange" badge="STORAGE & EXEC">
          <div className="space-y-8">
            <div className="p-6 bg-gray-50/50 dark:bg-[#161B22]/50 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20"><Database className="w-3.5 h-3.5 text-white" /></div>
                  <p className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">目录挂载 (VOLUMES)</p>
                </div>
                <button onClick={() => addArr("vols", { host: "", container: "" })} className={`${btnSm} !rounded-full border-orange-200 text-orange-600 bg-white dark:bg-[#0D1117]`}><Plus className="w-3.5 h-3.5" /> ADD VOLUME</button>
              </div>
              <div className="space-y-3">
                {svc.vols.map((v, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-3 items-center group animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex-1 w-full flex items-center gap-3">
                      <input type="text" placeholder="HOST PATH (e.g. ./data)" value={v.host} onChange={e => updateArr("vols", i, "host", e.target.value)}
                        className={`${inpSm} !bg-white dark:!bg-[#0D1117] border-orange-200/50`} />
                      <Rocket className="w-3.5 h-3.5 text-orange-200 dark:text-orange-900 rotate-90 shrink-0" />
                      <input type="text" placeholder="CONTAINER PATH (e.g. /app/data)" value={v.container} onChange={e => updateArr("vols", i, "container", e.target.value)}
                        className={`${inpSm} !bg-white dark:!bg-[#0D1117] border-orange-200/50`} />
                    </div>
                    <button onClick={() => remArr("vols", i)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {svc.vols.length === 0 && <p className="text-[10px] text-gray-400 text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">NO VOLUMES CONFIGURED</p>}
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-50 to-orange-50/30 dark:from-[#161B22] dark:to-orange-900/10 border border-orange-100 dark:border-orange-900/40 rounded-[2rem] space-y-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-600 shadow-xl shadow-orange-500/20">
                      <Terminal className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest leading-none">启动执行指令</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-1">ENTRYPOINT & COMMAND WRAPPING</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Checkbox checked={svc.useShellWrapper} onChange={(val) => updateSvc("useShellWrapper", val)} label="SH -EC WRAPPER" theme="yellow" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative items-start">
                  <div className="hidden md:flex absolute left-1/2 top-[42px] -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white dark:bg-[#0D1117] border border-orange-200 dark:border-orange-800 rounded-full shadow-lg text-orange-500 hover:scale-110 transition-transform cursor-pointer">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-orange-500" /> ENTRYPOINT</p>
                      <span className="text-[8px] font-black bg-orange-100 dark:bg-orange-900/60 text-orange-600 px-2.5 py-0.5 rounded-full">FIXED</span>
                    </div>
                    <input type="text" placeholder="[bin/sh]" value={svc.entrypoint} onChange={e => updateSvc("entrypoint", e.target.value)}
                      className={`${inp} !bg-white dark:!bg-[#0D1117] border-orange-200 dark:border-orange-800 focus:ring-orange-500/10 shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-emerald-500" /> COMMAND</p>
                      <span className="text-[8px] font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 px-2.5 py-0.5 rounded-full">ARGS</span>
                    </div>
                    <input type="text" placeholder="[start.sh]" value={svc.command} onChange={e => updateSvc("command", e.target.value)}
                      className={`${inp} !bg-white dark:!bg-[#0D1117] border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500/10 shadow-sm`} />
                  </div>
                  <div className="col-span-1 md:col-span-2 pt-2">
                    <div className="px-5 py-3 bg-white/60 dark:bg-black/40 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-inner">
                      <p className="text-[10px] font-mono text-gray-500 tracking-tight leading-relaxed">
                        <span className="text-orange-500 font-bold opacity-60 mr-2">PREVIEW:</span>
                        {svc.useShellWrapper ? 'sh -ec "' : ''}<span className="text-gray-800 dark:text-gray-200">{svc.entrypoint || '<ENTRYPOINT>'}</span> <span className="text-gray-600 dark:text-gray-400">{svc.command || '<COMMAND>'}</span>{svc.useShellWrapper ? '"' : ''}
                      </p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">运行用户 (USER)</p>
                  <input type="text" placeholder="node / 1001" value={svc.user} onChange={e => updateSvc("user", e.target.value)} className={inp} />
               </div>
               <div className="space-y-2 flex flex-col justify-end">
                  <div className="p-3 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:bg-white transition-all">
                    <Checkbox checked={svc.privileged} onChange={(val: boolean) => updateSvc("privileged", val)} label="特权模式 (PRIVILEGED)" theme="orange" />
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">共享内存 (SHM_SIZE)</p>
                  <input type="text" placeholder="e.g. 2gb" value={svc.shmSize} onChange={e => updateSvc("shmSize", e.target.value)} className={inp} />
               </div>
            </div>
          </div>
        </Section>

        {/* 5. Resources & Health */}
        <Section title="5. 资源配额与健康检查" icon={<Cpu className="w-4 h-4" />} theme="teal" badge="HEALTH & LIMITS">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-50/50 to-blue-50/30 dark:from-[#161B22] dark:to-emerald-900/10 border border-emerald-100 dark:border-emerald-900/40 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-500/20"><Activity className="w-4 h-4 text-white" /></div>
                    <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">健康探测 (HEALTHCHECK)</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-white/80 dark:bg-black/30 rounded-full border border-emerald-100 dark:border-emerald-990 shadow-sm">
                    <Checkbox checked={!!svc.healthcheck?.enabled} onChange={(val) => updateSvc("healthcheck", { ...(svc.healthcheck || {}), enabled: val })} label="ENABLE" theme="emerald" />
                  </div>
                </div>

                {svc.healthcheck?.enabled ? (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 mb-2 uppercase tracking-widest font-mono">COMMAND (CMD-SHELL)</p>
                      <input type="text" placeholder="curl -f http://localhost:8080/ || exit 1" value={svc.healthcheck.test} onChange={e => updateSvc("healthcheck", { ...svc.healthcheck, test: e.target.value })}
                        className={`${inp} !bg-white dark:!bg-[#0D1117] !py-3 shadow-md border-emerald-200 focus:ring-emerald-500/10 font-mono`} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'INTERVAL', key: 'interval', placeholder: '30s' },
                        { label: 'TIMEOUT', key: 'timeout', placeholder: '10s' },
                        { label: 'START PG', key: 'startPeriod', placeholder: '40s' },
                        { label: 'RETRIES', key: 'retries', placeholder: '3' },
                      ].map(f => (
                        <div key={f.key} className="space-y-1.5">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{f.label}</p>
                          <input type="text" placeholder={f.placeholder} value={svc.healthcheck ? (svc.healthcheck as any)[f.key] : ''} onChange={e => updateSvc("healthcheck", { ...svc.healthcheck, [f.key]: e.target.value })}
                            className={`${inpSm} !py-2 !rounded-xl !bg-white dark:!bg-[#0D1117] text-center font-bold`} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border-2 border-dashed border-emerald-500/10 rounded-[2rem] flex flex-col items-center justify-center opacity-40 group hover:opacity-100 transition-opacity cursor-pointer" onClick={() => updateSvc("healthcheck", { ...(svc.healthcheck || {}), enabled: true })}>
                    <Activity className="w-8 h-8 text-emerald-500 mb-3" />
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Disabled - Click to Enable</p>
                  </div>
                )}
             </div>

             <div className="space-y-8">
               <div className="p-6 bg-gray-50/50 dark:bg-[#161B22]/50 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-6">
                 <div className="flex items-center gap-2">
                   <Settings className="w-4 h-4 text-blue-500" />
                   <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">资源配额限制 (LIMITS)</p>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CPU 核心 (E.G. 0.5)</p>
                      <input type="text" value={svc.cpus} onChange={e => updateSvc("cpus", e.target.value)} className={inp} placeholder="0.25" />
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">内存容量 (E.G. 512M)</p>
                      <input type="text" value={svc.memLimit} onChange={e => updateSvc("memLimit", e.target.value)} className={inp} placeholder="1G" />
                   </div>
                 </div>
                 <label className="flex items-center gap-3 p-3 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-gray-400 transition-all shadow-sm">
                    <input type="checkbox" checked={svc.useGpu} onChange={e => updateSvc("useGpu", e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                      请求核心级 GPU 加速 (1X NVIDIA GPU)
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                 </label>
               </div>

               <div className="relative group">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MousePointer2 className="w-3.5 h-3.5" /> 专家延展配置 (CUSTOM YAML)
                  </p>
                  <textarea value={svc.customYaml} onChange={e => updateSvc("customYaml", e.target.value)} rows={3} placeholder="sysctls:&#10;  - net.core.somaxconn=1024"
                    className="w-full bg-[#1E1E1E] text-orange-200 p-4 rounded-3xl text-xs font-mono focus:ring-4 ring-orange-500/10 transition-all border border-transparent focus:border-orange-500/30" />
               </div>
             </div>
          </div>
        </Section>

        {/* 6. Add-ons */}
        <Section title="6. 全局附加组件库" icon={<Plus className="w-4 h-4" />} theme="purple" badge="ADD-ONS">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'redis', name: 'Redis 7', desc: 'High Performance Cache', icon: <Zap className="w-5 h-5" />, color: 'orange' },
                { id: 'postgres', name: 'PostgreSQL 15', desc: 'Advanced SQL Support', icon: <Database className="w-5 h-5" />, color: 'blue' },
                { id: 'mysql', name: 'MySQL 8.0', desc: 'Standard Relational DB', icon: <Settings className="w-5 h-5" />, color: 'indigo' },
              ].map(item => (
                <label key={item.id} className={`group relative p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden 
                  ${composeAddons[item.id as keyof typeof composeAddons] 
                    ? 'bg-purple-500 border-purple-500 text-white shadow-2xl shadow-purple-500/40 scale-105' 
                    : 'bg-white dark:bg-[#0D1117] border-gray-100 dark:border-gray-800 hover:border-purple-300 hover:-translate-y-1 shadow-sm'}`}>
                  <input type="checkbox" checked={composeAddons[item.id as keyof typeof composeAddons]} 
                    onChange={(e) => setComposeAddons({ ...composeAddons, [item.id]: e.target.checked })} className="hidden" />
                  
                  <div className={`p-3 rounded-2xl mb-4 w-fit transition-transform group-hover:rotate-6 
                    ${composeAddons[item.id as keyof typeof composeAddons] ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <div className={composeAddons[item.id as keyof typeof composeAddons] ? 'text-white' : `text-${item.color}-500`}>{item.icon}</div>
                  </div>
                  
                  <p className="text-sm font-black uppercase tracking-tight">{item.name}</p>
                  <p className={`text-[10px] mt-1 font-bold ${composeAddons[item.id as keyof typeof composeAddons] ? 'text-purple-100' : 'text-gray-400'}`}>{item.desc}</p>
                  
                  {composeAddons[item.id as keyof typeof composeAddons] && (
                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in-50 duration-300">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-xl">
                        <Check className="w-4 h-4 stroke-[4]" />
                      </div>
                    </div>
                  )}
                </label>
              ))}
           </div>
        </Section>
      </div>
    </div>
  );
}
