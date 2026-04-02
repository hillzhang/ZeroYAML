"use client";

import { useState } from 'react';
import { useDockerfileStore } from '@/store/useDockerfileStore';
import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Box, Info, Settings, Plus, Trash2, ChevronDown, Rocket,
  Terminal, Shield, FileCode, Tag, Database, Activity,
  Files, Layers, User, Globe, Layout, Palette, Zap,
  Check, ListTree, FileText, Link, Hammer
} from "lucide-react";

// ── Shared styles ────────────────────────────────────────────────────────────
const inp = "w-full bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/5 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-700";
const inpSm = "w-full bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-lg py-1.5 px-3 text-[13px] focus:outline-none focus:border-blue-400 transition-all text-gray-800 dark:text-gray-200";
const btnSm = "flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border transition-all font-black uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-900";

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

// ── Metadata Group ──────────────────────────────────────────────────────────
function MetadataGroup({ title, items, onUpdate, colorTheme = "blue", icon: Icon }: any) {
  const themeConfigs: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-500",
    teal: "text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10 border-l-teal-500",
    orange: "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 border-l-orange-500",
    amber: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 border-l-amber-500",
    slate: "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 border-l-slate-500",
  };

  const config = themeConfigs[colorTheme] || themeConfigs.blue;
  const textColor = config.split(' ')[0];

  return (
    <div className={`p-5 rounded-3xl border border-l-8 ${config} transition-all duration-300 shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-2`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-black/5">
            <Icon className={`w-4 h-4 ${textColor}`} />
          </div>
          <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${textColor}`}>{title}</p>
        </div>
        <span className="text-[10px] bg-white/80 dark:bg-black/40 text-gray-400 dark:text-gray-500 px-3 py-1 rounded-full font-black border border-gray-100 dark:border-gray-800 shadow-inner">{items.length} ITMS</span>
      </div>

      <div className="space-y-3">
        {(items || []).map((it: any, i: number) => (
          <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
            <input type="text" placeholder="KEY..." value={it.key}
              onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, key: e.target.value } : x))}
              className={`${inpSm} font-mono !bg-white dark:!bg-[#1C2128] border-gray-100 dark:border-gray-700 shadow-inner`} />
            <input type="text" placeholder="VALUE..." value={it.value}
              onChange={e => onUpdate(items.map((x: any, idx: number) => idx === i ? { ...x, value: e.target.value } : x))}
              className={`${inpSm} font-mono !bg-white dark:!bg-[#1C2128] border-gray-100 dark:border-gray-700 shadow-inner`} />
            <button onClick={() => onUpdate(items.filter((_: any, idx: number) => idx !== i))}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => onUpdate([...items, { key: '', value: '' }])}
          className={`w-full py-2.5 border-2 border-dashed rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2 
            ${colorTheme === 'blue' ? 'border-blue-100 dark:border-blue-900/50 text-blue-500 hover:bg-blue-50/50' : 
              colorTheme === 'teal' ? 'border-teal-100 dark:border-teal-900/50 text-teal-500 hover:bg-teal-50/50' : 
              colorTheme === 'orange' ? 'border-orange-100 dark:border-orange-900/50 text-orange-500 hover:bg-orange-50/50' : 
              'border-slate-100 dark:border-slate-900/50 text-slate-500 hover:bg-slate-50/50'}`}>
          <Plus className="w-3.5 h-3.5" /> ADD NEW {title.split(' ')[0]}
        </button>
      </div>
    </div>
  );
}

export function DockerfileTab() {
  const { activeTooltip, setActiveTooltip } = useAppStore();
  const {
    appName, setAppName, baseImage, setBaseImage, workdir, setWorkdir, port, setPort,
    startCmd, setStartCmd, entrypoint, setEntrypoint, envVars, setEnvVars, volumes, setVolumes,
    user, setUser, healthcheck, setHealthcheck, args, setArgs, labels, setLabels,
    runCmds, setRunCmds, copyAddItems, setCopyAddItems,
    useShellWrapper, setUseShellWrapper
  } = useDockerfileStore();

  const updateArrayField = (list: any[], setList: any, index: number, field: string, value: string) => {
    const newList = [...list];
    newList[index][field] = value;
    setList(newList);
  };

  const removeArrayItem = (list: any[], setList: any, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-in fade-in duration-700 flex flex-col pb-20">
      {/* 1. Base Config */}
      <Section title="1. 基础配置与核心定义" icon={<Rocket className="w-4 h-4" />} theme="blue" badge="CORE DEFINITION">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 group-hover:text-blue-500 transition-all">
              应用标识 (APP NAME) 
              <Info className="w-3.5 h-3.5 cursor-help opacity-40 hover:opacity-100" onClick={() => setActiveTooltip(activeTooltip === 'appName' ? null : 'appName')} />
            </p>
            {activeTooltip === 'appName' && <div className="absolute left-0 -top-12 bg-gray-900 text-white border border-gray-700 p-2.5 text-[10px] rounded-xl shadow-2xl w-[220px] z-20">镜像生成的仓库名。例如: my-service</div>}
            <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className={inp} placeholder="my-awesome-app" />
            <div className="text-[9px] text-gray-400 mt-2 font-bold italic opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> TARGET: {appName || 'undefined'}:latest
            </div>
          </div>

          <div className="relative group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 group-hover:text-blue-500 transition-all">
              基础镜像 (FROM) 
              <Info className="w-3.5 h-3.5 cursor-help opacity-40 hover:opacity-100" onClick={() => setActiveTooltip(activeTooltip === 'baseImage' ? null : 'baseImage')} />
            </p>
            {activeTooltip === 'baseImage' && <div className="absolute right-0 -top-12 bg-gray-900 text-white border border-gray-700 p-2.5 text-[10px] rounded-xl shadow-2xl w-[220px] z-20">构建基座镜像，建议使用 alpine 系列减小体积</div>}
            <input type="text" list="base-images-list" value={baseImage} onChange={(e) => setBaseImage(e.target.value)} className={inp} placeholder="node:20-alpine" />
            <datalist id="base-images-list">
              <option value="node:20-alpine" />
              <option value="node:22-slim" />
              <option value="alpine:latest" />
              <option value="python:3.11-slim" />
              <option value="golang:1.22-alpine" />
              <option value="nginx:alpine" />
            </datalist>
          </div>

          <div className="relative">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Layout className="w-3.5 h-3.5 text-blue-400" /> 工作目录 (WORKDIR)</p>
            <input type="text" value={workdir} onChange={(e) => setWorkdir(e.target.value)} className={inp} placeholder="/app" />
          </div>

          <div className="relative">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3.5 h-3.5 text-blue-400" /> 运行用户 (USER)</p>
            <input type="text" placeholder="node / www-data / 1001" value={user} onChange={(e) => setUser(e.target.value)} className={inp} />
          </div>
        </div>

        {/* Start Command Block */}
        <div className="mt-10 p-8 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-[#161B22] dark:to-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-[2.5rem] space-y-6 shadow-inner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">服务启动配置</p>
                  <p className="text-[8px] text-gray-400 font-bold tracking-tighter uppercase mt-1">Runtime Execution Logic</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Checkbox checked={useShellWrapper} onChange={(val: boolean) => setUseShellWrapper(val)} label="SH -EC WRAPPER" theme="yellow" />
              </div>
            </div>

            {(entrypoint || startCmd) && (
              <div className="px-5 py-2 bg-white/80 dark:bg-black/40 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]">
                <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate max-w-[300px]">
                  <span className="opacity-50 text-[8px] font-sans mr-2 uppercase font-black">Preview:</span> 
                  {useShellWrapper ? 'sh -ec "' : ''}<span className="font-black">{entrypoint || '<ENTRYPOINT>'}</span> {startCmd || '<CMD>'}{useShellWrapper ? '"' : ''}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative items-start">
            <div className="hidden md:flex absolute left-1/2 top-[46px] -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white dark:bg-[#0D1117] border border-blue-200 dark:border-blue-800 rounded-full shadow-2xl text-blue-500 hover:scale-110 transition-transform ring-8 ring-blue-500/5">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="space-y-3 relative group">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" /> 入口指令 (ENTRYPOINT)
                </p>
                <span className="text-[9px] font-black text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800/60 px-3 py-1 rounded-full shadow-sm">FIXED</span>
              </div>
              <input type="text" placeholder="[node]" value={entrypoint} onChange={(e) => setEntrypoint(e.target.value)}
                className={`${inp} !bg-white dark:!bg-[#0D1117] border-blue-200 dark:border-blue-800 shadow-lg focus:ring-blue-500/10 placeholder:opacity-30`} />
              <p className="text-[10px] text-gray-400 px-2 leading-relaxed font-bold italic opacity-60">通常为镜像的强制启动二进制文件</p>
            </div>

            <div className="space-y-3 relative group">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> 默认参数 (CMD)
                </p>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-800/60 px-3 py-1 rounded-full shadow-sm">ARGS</span>
              </div>
              <input type="text" placeholder="[server.js]" value={startCmd} onChange={(e) => setStartCmd(e.target.value)}
                className={`${inp} !bg-white dark:!bg-[#0D1117] border-emerald-200 dark:border-emerald-800 shadow-lg focus:ring-emerald-500/10 placeholder:opacity-30`} />
              <p className="text-[10px] text-emerald-600/60 px-2 leading-relaxed font-bold italic opacity-60">传递给入口指令的默认参数</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Variables & Metadata */}
      <Section title="2. 环境变量与元数据" icon={<Tag className="w-4 h-4" />} theme="teal" badge="METADATA & VARS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MetadataGroup title="环境变量 (ENV)" items={envVars} onUpdate={setEnvVars} colorTheme="teal" icon={Zap} />
          <MetadataGroup title="构建参数 (ARG)" items={args} onUpdate={setArgs} colorTheme="orange" icon={Settings} />
          <div className="md:col-span-2">
            <MetadataGroup title="标签说明 (LABEL)" items={labels} onUpdate={setLabels} colorTheme="slate" icon={Info} />
          </div>
        </div>
      </Section>

      {/* 3. Build Flow */}
      <Section title="3. 构建流程指令" icon={<Hammer className="w-4 h-4" />} theme="orange" badge="BUILD FLOW">
        <div className="space-y-10">
          {/* RUN Block */}
          <div className="p-8 bg-gray-50/50 dark:bg-[#161B22]/50 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-500 shadow-xl shadow-orange-500/20"><Terminal className="w-4 h-4 text-white" /></div>
                <div>
                  <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em]">运行时构建指令 (RUN)</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 italic">Layer Execution Scripts</p>
                </div>
              </div>
              <button onClick={() => setRunCmds([...runCmds, ""])} className={`${btnSm} !bg-white dark:!bg-[#0D1117] border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-500 transition-all duration-300 shadow-md active:translate-y-0.5`}><Plus className="w-4 h-4" /> ADD STEP</button>
            </div>

            <div className="space-y-4 relative z-10">
              {runCmds.map((cmd, i) => (
                <div key={i} className="group/row relative animate-in slide-in-from-left-2 duration-500">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500 rounded-l-2xl z-10 group-hover/row:w-3 transition-all duration-300" />
                  <textarea
                    placeholder="apt-get update && apt-get install -y ..."
                    value={cmd} rows={2}
                    onChange={(e) => { const n = [...runCmds]; n[i] = e.target.value; setRunCmds(n); }}
                    className="w-full bg-[#1A1A1A] text-orange-100 p-5 pl-8 text-[13px] font-mono leading-relaxed rounded-2xl focus:outline-none focus:ring-4 ring-orange-500/10 transition-all border border-transparent focus:border-orange-500/30 selection:bg-orange-500/30 shadow-xl"
                  />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/row:opacity-100 transition-all translate-x-2 group-hover/row:translate-x-0">
                    <button onClick={() => setRunCmds(runCmds.filter((_, idx) => idx !== i))} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {runCmds.length === 0 && <div className="py-10 border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-[2rem] flex flex-col items-center justify-center opacity-40 italic text-[11px] font-black uppercase tracking-widest text-orange-400">No build steps defined. Click ADD STEP.</div>}
            </div>
          </div>

          {/* Files Block */}
          <div className="pt-10 border-t-2 border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500 shadow-xl shadow-blue-500/20"><Files className="w-4 h-4 text-white" /></div>
                <div>
                   <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em]">文件资源传输 (COPY/ADD)</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 italic">Source To Destination Mapping</p>
                </div>
              </div>
              <button onClick={() => setCopyAddItems([...copyAddItems, { type: "COPY", from: "", chown: "", src: "", dest: "" }])} className={`${btnSm} !bg-white dark:!bg-[#0D1117] border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-500 transition-all duration-300 shadow-md active:translate-y-0.5`}><Plus className="w-4 h-4" /> ADD RULE</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {copyAddItems.map((item, i) => (
                <div key={i} className="flex flex-col lg:flex-row gap-4 items-center bg-gray-50/50 dark:bg-[#161B22]/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-400/50 transition-all group/file shadow-sm">
                  <div className="flex items-center gap-3">
                    <select value={item.type} onChange={(e) => updateArrayField(copyAddItems, setCopyAddItems, i, "type", e.target.value)}
                      className="bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-full py-2 px-6 text-[11px] font-black text-blue-600 shadow-lg focus:ring-4 ring-blue-500/10 outline-none cursor-pointer transition-all">
                      <option value="COPY">COPY</option>
                      <option value="ADD">ADD</option>
                    </select>
                    {item.type === 'COPY' && (
                      <div className="flex items-center gap-2 bg-white dark:bg-[#0D1117] px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 shadow-inner">
                        <span className="text-[9px] text-gray-400 font-black uppercase">FROM</span>
                        <input type="text" placeholder="--from" value={item.from} onChange={(e) => updateArrayField(copyAddItems, setCopyAddItems, i, "from", e.target.value)}
                          className={`w-[80px] bg-transparent outline-none text-[11px] font-black text-blue-500`} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full flex items-center gap-4">
                    <div className="flex-1 relative group">
                      <input type="text" placeholder="Source pattern..." value={item.src} onChange={(e) => updateArrayField(copyAddItems, setCopyAddItems, i, "src", e.target.value)}
                        className={`${inpSm} !py-2.5 !rounded-2xl !bg-white dark:!bg-[#0D1117] border-blue-200/50 font-mono shadow-md focus:ring-4 ring-blue-500/5`} />
                      <p className="absolute -top-2 left-4 px-1.5 bg-white dark:bg-[#0D1117] text-[8px] font-black text-gray-400 uppercase tracking-widest shadow-sm border border-gray-100 dark:border-gray-800 rounded">SRC</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                       <Rocket className="w-4 h-4 text-blue-600 rotate-90" />
                    </div>
                    <div className="flex-1 relative group">
                      <input type="text" placeholder="Container dest..." value={item.dest} onChange={(e) => updateArrayField(copyAddItems, setCopyAddItems, i, "dest", e.target.value)}
                        className={`${inpSm} !py-2.5 !rounded-2xl !bg-white dark:!bg-[#0D1117] border-blue-200/50 font-mono shadow-md focus:ring-4 ring-blue-500/5`} />
                      <p className="absolute -top-2 left-4 px-1.5 bg-white dark:bg-[#0D1117] text-[8px] font-black text-gray-400 uppercase tracking-widest shadow-sm border border-gray-100 dark:border-gray-800 rounded">DEST</p>
                    </div>
                  </div>
                  <button onClick={() => removeArrayItem(copyAddItems, setCopyAddItems, i)} className="text-gray-300 hover:text-red-500 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all opacity-0 group-hover/file:opacity-100"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
              {copyAddItems.length === 0 && <div className="py-10 border-2 border-dashed border-blue-200 dark:border-gray-800 rounded-[2rem] flex flex-col items-center justify-center opacity-40 italic text-[11px] font-black uppercase tracking-widest text-blue-400">No resources provided.</div>}
            </div>
          </div>

          {/* Network & Storage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t-2 border-gray-100 dark:border-gray-800">
            <div className="p-8 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/30 group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-500/20"><Globe className="w-4 h-4 text-white" /></div>
                <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">对外暴露端口 (EXPOSE)</p>
              </div>
              <div className="relative group">
                <input type="number" value={port} onChange={(e) => setPort(e.target.value)} className={`${inp} !bg-white dark:!bg-[#0D1117] !font-mono !text-lg !py-4 shadow-lg`} placeholder="8080" />
                <p className="text-[9px] text-gray-400 mt-3 font-bold italic opacity-60">暴露运行时监听的 TCP/UDP 端口</p>
              </div>
            </div>

            <div className="p-8 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-[3rem] border border-emerald-100 dark:border-emerald-900/30 group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-500/20"><Activity className="w-4 h-4 text-white" /></div>
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">健康巡检 (HEALTHCHECK)</p>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-gray-400 mb-2 uppercase tracking-widest px-1">巡检指令 (CMD)</p>
                  <input type="text" placeholder="curl -f http://localhost:8080/ || exit 1" value={healthcheck} onChange={(e) => setHealthcheck(e.target.value)} className={`${inp} !bg-white dark:!bg-[#0D1117] shadow-lg font-mono focus:ring-emerald-500/10`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter px-1">INTERVAL (--interval)</p>
                    <input type="text" placeholder="30s" className={`${inpSm} !py-2.5 !bg-white dark:!bg-[#0D1117] text-center font-black shadow-md`} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter px-1">TIMEOUT (--timeout)</p>
                    <input type="text" placeholder="5s" className={`${inpSm} !py-2.5 !bg-white dark:!bg-[#0D1117] text-center font-black shadow-md`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-8 bg-gray-50/50 dark:bg-[#161B22]/50 rounded-[3rem] border border-gray-200 dark:border-gray-800 shadow-inner group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gray-600 shadow-xl shadow-black/20"><Database className="w-4 h-4 text-white" /></div>
                  <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">声明持久化卷 (VOLUME)</p>
                </div>
                <button onClick={() => setVolumes([...volumes, ""])} className={`${btnSm} !bg-white dark:!bg-[#0D1117] border-gray-200 text-gray-500 hover:border-gray-900 transition-all shadow-md active:translate-y-0.5`}><Plus className="w-4 h-4" /> ADD VOLUME</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {volumes.map((vol, i) => (
                  <div key={i} className="flex gap-2 group/vol animate-in slide-in-from-top-2 duration-300">
                    <input type="text" placeholder="/app/data" value={vol} onChange={(e) => { const n = [...volumes]; n[i] = e.target.value; setVolumes(n); }} 
                      className={`${inpSm} !py-3 !rounded-[1.2rem] !bg-white dark:!bg-[#0D1117] border-gray-200 shadow-md focus:border-gray-500`} />
                    <button onClick={() => setVolumes(volumes.filter((_, idx) => idx !== i))} className="p-3 text-gray-300 hover:text-red-500 opacity-0 group-hover/vol:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {volumes.length === 0 && <div className="md:col-span-2 py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] flex flex-col items-center justify-center opacity-40 italic text-[10px] font-black uppercase tracking-widest">No persistent volumes defined.</div>}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Templates */}
      <h2 className="text-[12px] font-black text-gray-400 dark:text-gray-500 mb-10 mt-16 flex items-center justify-center gap-8 uppercase tracking-[0.6em]">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-gray-400 dark:via-gray-800 dark:to-gray-700" />
        生产级镜像模板库
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-200 to-gray-400 dark:via-gray-800 dark:to-gray-700" />
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Next.js Static Build", icon: <Layout className="w-6 h-6" />, desc: "多阶段构建的最佳实践，彻底分离编译环境与运行层", color: "blue",
            action: () => {
              setAppName('next-app'); setBaseImage('node:20-alpine'); setPort('3000'); setWorkdir('/app');
              setCopyAddItems([{ type: 'COPY', chown: '', src: 'package.json package-lock.json', dest: './', from: '' }, { type: 'COPY', chown: '', src: '.', dest: '.', from: '' }]);
              setRunCmds(['npm ci', 'npm run build']); setStartCmd('npm start');
            }
          },
          {
            title: "Python FastAPI", icon: <Zap className="w-6 h-6" />, desc: "包含依赖安装与 uvicorn web 服务启动的极简生产层", color: "teal",
            action: () => {
              setAppName('python-api'); setBaseImage('python:3.11-slim'); setPort('8000'); setWorkdir('/app');
              setCopyAddItems([{ type: 'COPY', chown: '', src: 'requirements.txt', dest: '.', from: '' }, { type: 'COPY', chown: '', src: '.', dest: '.', from: '' }]);
              setRunCmds(['pip install --no-cache-dir -r requirements.txt']); setStartCmd('uvicorn main:app --host 0.0.0.0 --port 8000');
            }
          },
          {
            title: "Golang Static", icon: <Hammer className="w-6 h-6" />, desc: "Alpine 环境下静态编译与拉取依赖的最佳实践架构", color: "indigo",
            action: () => {
              setAppName('go-server'); setBaseImage('golang:1.22-alpine'); setPort('8080'); setWorkdir('/app');
              setCopyAddItems([{ type: 'COPY', chown: '', src: 'go.mod go.sum', dest: './', from: '' }, { type: 'COPY', chown: '', src: '.', dest: '.', from: '' }]);
              setRunCmds(['go mod download', 'go build -o server main.go']); setStartCmd('./server');
            }
          },
          {
            title: "Static Nginx", icon: <Globe className="w-6 h-6" />, desc: "极致精简，将本地前端构建产物直接推送到 Nginx 服务", color: "purple",
            action: () => {
              setAppName('static-web'); setBaseImage('nginx:alpine'); setPort('80'); setWorkdir('/usr/share/nginx/html');
              setCopyAddItems([{ type: 'COPY', chown: '', src: './dist', dest: '.', from: '' }]); setStartCmd('');
            }
          },
          {
            title: "Spring Boot JAR", icon: <Database className="w-6 h-6" />, desc: "使用 OpenJDK 运行 JAR 的标准模板，内置时区与启动优化", color: "orange",
            action: () => {
              setAppName('spring-boot-app'); setBaseImage('openjdk:21-jdk-slim'); setPort('8080'); setWorkdir('/app');
              setCopyAddItems([{ type: 'COPY', chown: '', src: 'target/*.jar', dest: 'app.jar', from: '' }]); setStartCmd('-jar app.jar'); setEntrypoint('java');
            }
          },
        ].map(tpl => (
          <button key={tpl.title} onClick={tpl.action}
            className={`group relative p-8 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-[3rem] text-left transition-all hover:shadow-2xl hover:-translate-y-2 select-none overflow-hidden active:scale-95 duration-500 shadow-sm`}>
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 shadow-xl border border-black/5
              ${tpl.color === 'blue' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                tpl.color === 'teal' ? 'bg-teal-500 text-white shadow-teal-500/20' :
                  tpl.color === 'indigo' ? 'bg-indigo-500 text-white shadow-indigo-500/20' :
                    tpl.color === 'purple' ? 'bg-purple-500 text-white shadow-purple-500/20' :
                      'bg-orange-500 text-white shadow-orange-500/20'}`}>
              {tpl.icon}
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3 truncate pr-6 uppercase tracking-tight">{tpl.title}</h3>
            <p className="text-[11px] text-gray-400 font-bold leading-relaxed h-10 line-clamp-2 italic">{tpl.desc}</p>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
               APP TEMPLATE <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            {/* Aesthetic flourish */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity 
              ${tpl.color === 'blue' ? 'bg-blue-500' : 'bg-gray-500'} rounded-full blur-3xl`} />
          </button>
        ))}
      </div>
    </div>
  );
}
