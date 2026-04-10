"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useAppStore';
import {
  RefreshCw, Play, RotateCcw, Trash2, Search, Rocket,
  Link, StopCircle, Settings, X, AlertTriangle, CheckSquare, Square, Activity,
  Terminal
} from "lucide-react";
import { LiveMetrics } from '@/components/common/LiveMetrics';
import { TerminalModal } from '@/components/common/TerminalModal';

interface ContainerInfo {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Ports: Array<{ PrivatePort: number; PublicPort: number; Type: string }>;
  Mounts: Array<{ Source: string; Destination: string; Mode: string; Type: string; RW: boolean }>;
}

export function DockerDashboardTab() {
  const { t } = useTranslation();
  const { dockerSocket, setDockerSocket } = useAppStore();
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; action: () => void; type: 'danger' | 'info' | 'success';
  }>({ isOpen: false, title: '', message: '', action: () => {}, type: 'info' });

  const fetchContainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/containers', { headers: { 'x-docker-socket': btoa(dockerSocket || '') } });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setContainers(Array.isArray(data) ? data : []);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchContainers(); }, [dockerSocket]);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/containers/${id}/${action}`, {
        method: 'POST',
        headers: { 'x-docker-socket': btoa(dockerSocket || '') }
      });
      if (res.ok) fetchContainers();
    } catch (err) { console.error(err); }
  };

  const handleBatchAction = async (action: string) => {
    const ids = Array.from(selectedIds);
    setLoading(true);
    for (const id of ids) {
       await handleAction(id, action);
    }
    setSelectedIds(new Set());
    setLoading(false);
  };

  const requestAction = (id: string, name: string, action: string, type: 'danger' | 'info' | 'success' = 'info') => {
    const actionText = t.containers.actions[action as keyof typeof t.containers.actions] || action;
    setConfirmModal({
      isOpen: true,
      title: t.containers.confirm.title.replace('{action}', action.toUpperCase()),
      message: t.containers.confirm.message.replace('{name}', name).replace('{action}', actionText),
      type,
      action: () => {
        handleAction(id, action);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const requestBatchAction = (action: string, type: 'danger' | 'info' | 'success' = 'info') => {
    if (selectedIds.size === 0) return;
    const actionText = t.containers.actions[action as keyof typeof t.containers.actions] || action;
    setConfirmModal({
      isOpen: true,
      title: t.containers.confirm.batchTitle.replace('{action}', action.toUpperCase()),
      message: t.containers.confirm.batchMessage.replace('{count}', selectedIds.size.toString()).replace('{action}', actionText),
      type,
      action: () => {
        handleBatchAction(action);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContainers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContainers.map(c => c.Id)));
    }
  };

  const filteredContainers = containers.filter(c => {
    const matchesSearch = c.Names[0].toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.State === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-in fade-in duration-700 flex flex-col pb-20 pt-4 px-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="text-left font-black">
          <h2 className="text-2xl text-gray-800 dark:text-white flex items-center gap-3">
             <div className="w-2 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
             Docker Engine
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 ml-5">{t.containers.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTerminalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600/20 text-sm font-black transition-all shadow-sm active:scale-95 group"
          >
            <Terminal className="w-5 h-5 group-hover:rotate-6 transition-transform" />
            {t.containers.terminal}
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-blue-500 shadow-sm transition-all"><Settings className="w-5 h-5" /></button>
          <button onClick={fetchContainers} className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 active:scale-90 transition-all"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50 dark:bg-white/5 p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
             <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={t.containers.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 ring-blue-500/5 shadow-sm" />
             </div>
             
             <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'running', 'exited', 'paused'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${statusFilter === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-gray-700'}`}>
                    {s === 'all' ? t.containers.filter.all : t.containers.status[s as keyof typeof t.containers.status] || s}
                  </button>
                ))}
             </div>
          </div>

          {selectedIds.size > 0 && (
             <div className="flex items-center justify-between px-8 py-5 bg-blue-600 rounded-[2rem] text-white shadow-xl animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">{selectedIds.size}</div>
                   <span className="text-sm font-black">{t.containers.selected}</span>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => requestBatchAction('start', 'success')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all">
                      <Play className="w-4 h-4 fill-current"/>
                      <span className="text-xs font-black">{t.containers.actions.start}</span>
                   </button>
                   <button onClick={() => requestBatchAction('stop', 'danger')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all">
                      <StopCircle className="w-4 h-4"/>
                      <span className="text-xs font-black">{t.containers.actions.stop}</span>
                   </button>
                   <button onClick={() => requestBatchAction('restart', 'info')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all">
                      <RotateCcw className="w-4 h-4"/>
                      <span className="text-xs font-black">{t.containers.actions.restart}</span>
                   </button>
                   <div className="w-px h-6 bg-white/20 mx-2" />
                   <button onClick={() => requestBatchAction('remove', 'danger')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg">
                      <Trash2 className="w-4 h-4"/>
                      <span className="text-xs font-black">{t.containers.actions.remove}</span>
                   </button>
                </div>
             </div>
          )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="px-10 flex items-center justify-between text-xs font-black text-gray-600 dark:text-gray-400 mb-2">
           <div className="flex items-center gap-4 cursor-pointer hover:text-blue-600 transition-all group" onClick={toggleSelectAll}>
              <div className={`transition-all ${selectedIds.size === filteredContainers.length && filteredContainers.length > 0 ? 'text-blue-500 scale-110' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500'}`}>
                {selectedIds.size === filteredContainers.length && filteredContainers.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </div>
              <span className={selectedIds.size === filteredContainers.length && filteredContainers.length > 0 ? 'text-blue-500' : ''}>{t.containers.selectAll}</span>
           </div>
           <span>{t.containers.controlCenter} / {t.containers.actionsLabel}</span>
        </div>

        {loading ? (
             <div className="py-40 text-center"><RefreshCw className="w-12 h-12 text-blue-500 animate-spin opacity-20 mx-auto" /></div>
        ) : (
          filteredContainers.map(c => (
            <div key={c.Id} className={`group relative bg-white dark:bg-[#0D1117] border rounded-[3rem] p-8 lg:p-10 transition-all hover:shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8 ${selectedIds.has(c.Id) ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'border-gray-100 dark:border-gray-800'}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20">
                 <button onClick={() => toggleSelect(c.Id)} className={`p-4 rounded-2xl transition-all ${selectedIds.has(c.Id) ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'}`}>
                    {selectedIds.has(c.Id) ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                 </button>
              </div>

              {/* LEFT: INFO */}
              <div className="flex items-start gap-8 text-left flex-1 min-w-0 pl-6">
                 <div className="relative mt-2">
                   <div className={`w-4 h-4 rounded-full ${c.State === 'running' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-gray-300'}`} />
                   {c.State === 'running' && <div className="absolute -inset-1 rounded-full bg-emerald-500 opacity-20 animate-ping" />}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2 truncate">
                       <h3 className="text-2xl font-black text-gray-800 dark:text-white truncate">{c.Names[0].replace('/', '')}</h3>
                       <code className="text-xs text-gray-300 bg-gray-50 dark:bg-white/5 px-2 rounded-lg font-bold shrink-0">{c.Id.substring(0, 12)}</code>
                    </div>
                    <div className="flex gap-6 mb-6 text-gray-400 font-bold text-sm uppercase truncate">
                       <span className="truncate max-w-[200px]">{c.Image}</span>
                       <span className="shrink-0">{c.Status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {c.Ports.map((p, i) => (
                         <div key={`port-${i}`} className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100/50 dark:border-blue-500/10 text-xs font-black text-blue-600 dark:text-blue-400">
                           <Link className="w-3.5 h-3.5" />
                           {p.PublicPort && <span>{p.PublicPort}→</span>}
                           <span>{p.PrivatePort}</span>
                         </div>
                       ))}
                       
                       {c.Mounts.length > 0 && (
                         <div className="relative group/mount">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100/50 dark:border-white/5 text-xs font-black text-gray-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all cursor-help">
                               <Settings className="w-3.5 h-3.5 opacity-50" />
                               <span>{c.Mounts.length} {t.common.volumes}</span>
                            </div>
                            
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-xs p-4 bg-gray-900/95 dark:bg-[#1C2128]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 opacity-0 invisible group-hover/mount:opacity-100 group-hover/mount:visible transition-all duration-200 z-[100] scale-95 group-hover/mount:scale-100 origin-bottom pointer-events-none">
                               <div className="flex flex-col gap-3">
                                  {c.Mounts.map((m, idx) => (
                                     <div key={`m-${idx}`} className="flex flex-col gap-1 text-xs text-left">
                                        <div className="flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                           <span className="text-gray-400 font-bold tracking-tighter">Source:</span>
                                           <span className="text-white break-all">{m.Source}</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-3.5">
                                           <span className="text-gray-400 font-bold tracking-tighter">Target:</span>
                                           <span className="text-blue-400 break-all">{m.Destination}</span>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                               <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 dark:bg-[#1C2128] rotate-45 border-r border-b border-white/10" />
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* RIGHT: METRICS & ACTIONS - RIGID ALIGNMENT */}
              <div className="flex flex-col lg:flex-row items-center gap-8 shrink-0 lg:min-w-[520px] justify-end">
                 {/* METRICS - FIXED WIDTH TO PREVENT PUSHING ACTIONS */}
                 <div className="w-full lg:w-[280px] shrink-0 flex justify-center lg:justify-end">
                    {c.State === 'running' && <LiveMetrics type="docker" id={c.Id} />}
                 </div>

                 {/* ACTIONS - FIXED WIDTH & END ALIGNMENT */}
                 <div className="w-full lg:w-[200px] shrink-0 flex justify-center lg:justify-end pr-2">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-[2.5rem]">
                       {c.State === 'running' ? (
                         <>
                           <div className="relative group/btn">
                              <button onClick={() => requestAction(c.Id, c.Names[0], 'stop', 'danger')} className="p-4 rounded-xl md:rounded-2xl bg-white dark:bg-gray-800 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                 <StopCircle className="w-5 h-5"/>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap pointer-events-none z-[100]">
                                 {t.containers.actions.stop}
                                 <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800" />
                              </div>
                           </div>

                           <div className="relative group/btn">
                              <button onClick={() => requestAction(c.Id, c.Names[0], 'restart', 'info')} className="p-4 rounded-xl md:rounded-2xl bg-white dark:bg-gray-800 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                                 <RotateCcw className="w-5 h-5"/>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap pointer-events-none z-[100]">
                                 {t.containers.actions.restart}
                                 <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800" />
                              </div>
                           </div>
                         </>
                       ) : (
                         <button onClick={() => requestAction(c.Id, c.Names[0], 'start', 'success')} className="w-[124px] py-4 rounded-2xl bg-white dark:bg-gray-800 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-xs shadow-sm flex items-center justify-center gap-2">
                            <Play className="w-4 h-4 fill-current"/>
                            {t.containers.actions.start}
                         </button>
                       )}
                       <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
                       
                       <div className="relative group/btn">
                          <button onClick={() => requestAction(c.Id, c.Names[0], 'remove', 'danger')} className="p-4 rounded-xl md:rounded-2xl bg-white dark:bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                             <Trash2 className="w-5 h-5"/>
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap pointer-events-none z-[100]">
                             {t.containers.actions.remove}
                             <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-red-600" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-2xl" onClick={() => setIsSettingsOpen(false)} />
           <div className="relative bg-white dark:bg-[#1C2128] w-full max-w-xl rounded-[4rem] p-12 shadow-[0_32px_120px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-12">
                 <div className="flex flex-col">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{t.containers.title} {t.common.metadata}</h3>
                    <p className="text-xs text-gray-400 font-black mt-1 opacity-60">Engine Protocol Configuration</p>
                 </div>
                 <button onClick={() => setIsSettingsOpen(false)} className="p-4 rounded-3xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="group bg-gray-50/50 dark:bg-black/20 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 transition-all hover:border-blue-500/20">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white"><Rocket className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-gray-800 dark:text-white">{t.containers.customSocket}</span>
                       <span className="text-xs font-bold text-gray-400">Local Unix socket or TCP address</span>
                    </div>
                 </div>
                 <input type="text" value={dockerSocket} onChange={e => setDockerSocket(e.target.value)} placeholder="/var/run/docker.sock" className="w-full bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-sm font-black focus:ring-4 ring-blue-500/5 focus:border-blue-500/20 outline-none transition-all" />
              </div>
              <button onClick={() => { setIsSettingsOpen(false); fetchContainers(); }} className="w-full mt-10 py-6 rounded-[2rem] bg-blue-600 text-white font-black text-sm shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"><RefreshCw className="w-4 h-4" />{t.common.save} & {t.containers.refresh}</button>
           </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl" />
           <div className="relative bg-white dark:bg-[#1C2128] w-full max-md rounded-[3.5rem] p-10 shadow-2xl border border-gray-100 dark:border-white/5 text-center">
              <div className={`p-6 rounded-[2rem] mb-8 inline-block ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}><AlertTriangle className="w-10 h-10" /></div>
              <h3 className="text-2xl font-black mb-4 italic">{confirmModal.title}</h3>
              <p className="text-sm font-bold text-gray-500 mb-10 leading-relaxed">{confirmModal.message}</p>
              <div className="flex w-full gap-4">
                 <button onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))} className="flex-1 py-5 rounded-3xl font-black bg-gray-50 dark:bg-gray-800 text-gray-500 transition-all uppercase text-xs tracking-widest">{t.common.cancel}</button>
                 <button onClick={confirmModal.action} className={`flex-1 py-5 rounded-3xl font-black text-white transition-all uppercase text-xs tracking-widest ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{t.common.confirm}</button>
              </div>
           </div>
        </div>
      )}

      {/* 💻 DOCKER TERMINAL */}
      <TerminalModal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        type="docker"
      />
    </div>
  );
}
