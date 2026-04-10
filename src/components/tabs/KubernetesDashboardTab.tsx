"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useAppStore';
import {
  RefreshCw, RotateCcw, Search, Zap, Globe, Database, HardDrive, 
  Settings, Clock, X, AlertTriangle, ChevronDown, Calculator, Calendar, Server, Layers, Link, Box,
  LayoutPanelTop, Terminal, Trash2, ExternalLink, ShieldCheck, Activity
} from "lucide-react";
import { LiveMetrics } from '@/components/common/LiveMetrics';
import { TerminalModal } from '@/components/common/TerminalModal';

interface K8sResource {
  id: string;
  name: string;
  namespace: string;
  status: string;
  image?: string;
  replicas?: string;
  creationTimestamp: string;
  schedule?: string;
  lastScheduleTime?: string;
  type?: string;
  clusterIP?: string;
  ports?: any[];
  pods?: any[];
  capacity?: string;
  accessModes?: string[];
  mounts?: { name: string; mountPath: string; readOnly?: boolean }[];
}

interface NamespaceInfo { name: string; }
type ResourceGroup = 'workloads' | 'network' | 'storage';
type WorkloadType = 'deployments' | 'statefulsets' | 'daemonsets' | 'cronjobs' | 'pods';

export function KubernetesDashboardTab() {
  const { t, language } = useTranslation();
  const kd = t.k8sDashboard;
  const { kubeconfig, setKubeconfig, containerNamespace, setContainerNamespace } = useAppStore();

  const [k8sResources, setK8sResources] = useState<K8sResource[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const [activeGroup, setActiveGroup] = useState<ResourceGroup>('workloads');
  const [activeWorkload, setActiveWorkload] = useState<WorkloadType>('deployments');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNamespaceDropdownOpen, setIsNamespaceDropdownOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNamespaceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; action: () => void; type: 'danger' | 'info' | 'success';
  }>({ isOpen: false, title: '', message: '', action: () => {}, type: 'info' });

  const [logModal, setLogModal] = useState<{
    isOpen: boolean; podName: string; namespace: string; content: string; loading: boolean;
  }>({ isOpen: false, podName: '', namespace: '', content: '', loading: false });

  const fetchNamespaces = async () => {
    try {
      const res = await fetch('/api/kubernetes/namespaces', { headers: { 'x-kubeconfig': btoa(unescape(encodeURIComponent(kubeconfig || ''))) } });
      const data = await res.json();
      if (!data.error) setNamespaces(data);
    } catch (err) { console.error(err); }
  };

  const fetchK8sResources = async () => {
    setLoading(true);
    let endpoint = '/api/kubernetes/workloads';
    if (activeGroup === 'network') endpoint = '/api/kubernetes/services';
    else if (activeGroup === 'storage') endpoint = '/api/kubernetes/pvc';
    
    const url = activeGroup === 'workloads' ? `${endpoint}?type=${activeWorkload}` : endpoint;

    try {
      const res = await fetch(url, { 
        headers: { 
            'x-kubeconfig': btoa(unescape(encodeURIComponent(kubeconfig || ''))),
            'x-kubernetes-namespace': btoa(unescape(encodeURIComponent(containerNamespace || '')))
        } 
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setK8sResources(Array.isArray(data) ? data : []);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const refreshAll = async () => {
     await fetchK8sResources();
     fetchNamespaces();
  };

  const fetchLogs = async (podName: string, namespace: string) => {
    setLogModal(prev => ({ ...prev, isOpen: true, podName, namespace, loading: true, content: '' }));
    try {
      const res = await fetch(`/api/kubernetes/pods/logs?pod=${podName}&namespace=${namespace}&tail=200`, {
        headers: { 'x-kubeconfig': btoa(unescape(encodeURIComponent(kubeconfig || ''))) }
      });
      const text = await res.text();
      setLogModal(prev => ({ ...prev, content: text, loading: false }));
    } catch (err: any) {
      setLogModal(prev => ({ ...prev, content: `Error fetching logs: ${err.message}`, loading: false }));
    }
  };

  useEffect(() => { refreshAll(); }, [kubeconfig, containerNamespace, activeGroup, activeWorkload]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  const requestAction = (id: string, name: string, action: string, type: 'danger' | 'info' | 'success' = 'info') => {
    setConfirmModal({
      isOpen: true,
      title: `${action.toUpperCase()} Resource`,
      message: `确定要执行 ${action} 动作于 ${name} 吗?`,
      type,
      action: async () => {
        try {
          setLoading(true);
          const method = action === 'delete' ? 'DELETE' : 'POST';
          const url = `/api/kubernetes/pods?name=${name}&namespace=${containerNamespace || 'default'}${action === 'restart' ? '&action=restart' : ''}`;
          
          const res = await fetch(url, {
            method,
            headers: { 'x-kubeconfig': btoa(unescape(encodeURIComponent(kubeconfig || ''))) }
          });
          
          if (res.ok) {
            refreshAll();
          } else {
            const err = await res.json();
            setError(err.error || 'Action failed');
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="animate-in fade-in duration-700 flex flex-col pb-20 pt-4 px-2">
      {/* 🧊 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="text-left font-black">
          <h2 className="text-2xl text-gray-800 dark:text-white flex items-center gap-3">
             <div className="w-2 h-7 bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
             {kd.title}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-5 font-bold">{kd.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTerminalOpen(true)} 
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600/20 text-xs font-black transition-all shadow-sm active:scale-95 group"
          >
            <Terminal className="w-5 h-5 group-hover:rotate-6 transition-transform" />
            {kd.terminal.title}
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 shadow-sm transition-all"><Settings className="w-5 h-5" /></button>
          <button onClick={refreshAll} className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 active:scale-90 transition-all"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {/* 🛠 K8S NAVIGATION */}
      <div className="flex flex-col gap-6 mb-10 animate-in slide-in-from-top-2 duration-500">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/50 dark:bg-white/5 p-4 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
            <div className="flex gap-2">
               {[
                 { id: 'workloads', label: kd.groups.workloads, icon: LayoutPanelTop },
                 { id: 'network', label: kd.groups.network, icon: Globe },
                 { id: 'storage', label: kd.groups.storage, icon: Database }
               ].map(g => (
                 <button key={g.id} onClick={() => setActiveGroup(g.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${activeGroup === g.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                    <g.icon className="w-4 h-4" />{g.label}
                 </button>
               ))}
            </div>

            <div className="relative" ref={dropdownRef}>
               <button onClick={() => setIsNamespaceDropdownOpen(!isNamespaceDropdownOpen)} className="flex items-center justify-between gap-4 px-5 py-3 min-w-[200px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-black shadow-sm">
                  <div className="flex items-center gap-2 truncate text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span>{containerNamespace || (language === 'zh' ? '全部分区' : 'All Namespaces')}</span></div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isNamespaceDropdownOpen ? 'rotate-180' : ''}`} />
               </button>
               {isNamespaceDropdownOpen && (
                 <div className="absolute right-0 mt-3 w-full bg-white dark:bg-[#1C2128] border border-gray-100 dark:border-white/5 rounded-3xl shadow-2xl z-[150] overflow-hidden p-2 animate-in zoom-in-95 origin-top-right">
                    <div className="max-h-[300px] overflow-y-auto">
                       <button onClick={() => {setContainerNamespace(''); setIsNamespaceDropdownOpen(false);}} className="w-full text-left px-5 py-3 text-xs font-black text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">Default / All</button>
                       {namespaces.map(ns => (
                         <button key={ns.name} onClick={() => {setContainerNamespace(ns.name); setIsNamespaceDropdownOpen(false);}} className={`w-full text-left px-5 py-3 text-xs font-black rounded-xl transition-colors ${containerNamespace === ns.name ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>{ns.name}</button>
                       ))}
                    </div>
                 </div>
               )}
            </div>
         </div>

         {activeGroup === 'workloads' && (
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'deployments', label: kd.workloadTypes.deployments, icon: Server },
                { id: 'statefulsets', label: kd.workloadTypes.statefulsets, icon: Database },
                { id: 'daemonsets', label: kd.workloadTypes.daemonsets, icon: Layers },
                { id: 'cronjobs', label: kd.workloadTypes.cronjobs, icon: Clock },
                { id: 'pods', label: kd.workloadTypes.pods, icon: Box }
              ].map(w => (
                <button 
                  key={w.id} 
                  onClick={() => setActiveWorkload(w.id as any)} 
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
                    activeWorkload === w.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-sm text-blue-700 dark:text-blue-400' 
                    : 'border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 font-bold'
                  }`}
                >
                   <w.icon className={`w-4 h-4 ${activeWorkload === w.id ? 'text-blue-600' : 'text-gray-400 opacity-60'}`} />
                   {w.label}
                </button>
              ))}
           </div>
         )}
      </div>

      {/* 🔍 SEARCH */}
      <div className="relative mb-8 group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
         <input type="text" placeholder={kd.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800 rounded-3xl py-4 pl-14 pr-8 text-sm font-black focus:outline-none focus:ring-4 ring-blue-500/5 shadow-sm" />
      </div>

      {/* 📦 CONTENT LIST */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
             <div className="py-40 text-center"><RefreshCw className="w-12 h-12 text-blue-500 animate-spin opacity-20 mx-auto" /></div>
        ) : (
          k8sResources.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(resource => (
            <div key={resource.id} className="flex flex-col mb-4">
               {/* 📦 RESOURCE CARD */}
               <div 
                 onClick={() => activeGroup === 'workloads' && toggleExpand(resource.id)}
                 className={`group bg-white dark:bg-[#0D1117] border transition-all rounded-[2.5rem] p-8 flex flex-col lg:flex-row justify-between items-center gap-6 z-10 ${
                   activeGroup === 'workloads' ? 'cursor-pointer hover:border-blue-400/50 hover:shadow-xl' : ''
                 } ${
                   expandedItems.has(resource.id) ? 'border-blue-500/30 shadow-xl' : 'border-gray-100 dark:border-gray-800'
                 }`}
               >
                  <div className="flex items-center gap-6 text-left flex-1 w-full">
                     <div className={`p-4 rounded-2xl ${expandedItems.has(resource.id) ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-white/5 text-blue-500 opacity-60'}`}>
                        {activeGroup === 'network' ? <Globe className="w-6 h-6" /> : 
                         activeGroup === 'storage' ? <Database className="w-6 h-6" /> :
                         activeWorkload === 'cronjobs' ? <Calendar className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                           <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">{resource.name}</h3>
                           <span className="text-xs font-black bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg">{resource.namespace}</span>
                           
                           {activeGroup === 'network' && (
                             <span className="text-xs font-black bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg">{resource.type || 'Service'}</span>
                           )}

                           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black ${
                             resource.status === 'Ready' || resource.status === 'Active' || resource.status === 'Running' || resource.status === 'Bound'
                               ? 'bg-emerald-100/50 text-emerald-600' : 'bg-orange-100/50 text-orange-600'
                           }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${resource.status === 'Ready' || resource.status === 'Running' || resource.status === 'Bound' ? 'bg-emerald-500' : 'bg-orange-500'} `} />
                              {resource.status === 'Ready' ? kd.status.ready : 
                               resource.status === 'Active' ? kd.status.active :
                               resource.status === 'Running' ? kd.status.running :
                               resource.status === 'Bound' ? kd.status.bound : 
                               resource.status === 'Waiting' ? kd.status.waiting :
                               resource.status === 'Failed' ? kd.status.failed : resource.status || kd.status.unknown}
                           </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-600 dark:text-gray-400">
                           {activeGroup === 'network' && (
                             <>
                               <span className="flex items-center gap-2 font-mono"><Link className="w-4 h-4 text-blue-500/60" /> {kd.columns.ip}: <b className="text-gray-600 dark:text-gray-200 font-black">{resource.clusterIP || 'None'}</b></span>
                               <div className="flex gap-2">
                                  {resource.ports?.map((p, i) => (
                                    <span key={i} className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-gray-100 dark:border-white/5 text-gray-500 font-black">{p.port}/{p.protocol}</span>
                                  ))}
                               </div>
                             </>
                           )}

                           {activeGroup === 'storage' && (
                             <>
                               <span className="flex items-center gap-2 text-orange-500/80"><HardDrive className="w-4 h-4" /> {kd.columns.capacity}: <b className="text-gray-600 dark:text-gray-200 font-black">{resource.capacity || 'Unknown'}</b></span>
                               <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500/60" /> {kd.columns.mode}: <b className="text-gray-600 dark:text-gray-200 font-black">{resource.accessModes?.join(', ') || 'N/A'}</b></span>
                             </>
                           )}

                           {activeGroup === 'workloads' && (
                             activeWorkload !== 'cronjobs' ? (
                               <span className="flex items-center gap-2"><Calculator className="w-4 h-4 text-blue-500/60" /> <b className="text-gray-600 dark:text-gray-200 font-black">{resource.replicas || '0/0'}</b> <span className="opacity-60">{kd.columns.replicas}</span></span>
                             ) : (
                               <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500/60" /> <b className="text-gray-600 dark:text-gray-200 font-black">{resource.schedule}</b> <span className="opacity-60">{kd.columns.schedule}</span></span>
                             )
                           )}
                           <span className="flex items-center gap-2 opacity-60"><Calendar className="w-4 h-4" /> {new Date(resource.creationTimestamp).toLocaleDateString()}</span>

                           {/* Mounts Visibility */}
                           {resource.mounts && resource.mounts.length > 0 && (
                             <div className="flex items-center gap-2 ml-2">
                               <div className="flex -space-x-2">
                                 {resource.mounts.map((m, idx) => (
                                   <div key={idx} className="group/mount relative">
                                     <div className="w-7 h-7 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg flex items-center justify-center shadow-sm hover:z-10 hover:border-blue-500 transition-all cursor-help">
                                       <Database className="w-3.5 h-3.5 text-blue-500" />
                                     </div>
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/mount:opacity-100 transition-all z-[200] shadow-2xl border border-white/10 font-black">
                                       <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-2 border-b border-white/10 pb-1 mb-1">
                                           <HardDrive className="w-3 h-3 text-blue-400" />
                                           <span>{m.name}</span>
                                         </div>
                                         <div className="text-gray-400 flex items-center gap-2">
                                           <Link className="w-3 h-3" />
                                           <span>{m.mountPath}</span>
                                         </div>
                                       </div>
                                       <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {activeGroup === 'workloads' && (
                    <div className="flex items-center gap-3">
                      <div className={`p-4 rounded-full border transition-all ${expandedItems.has(resource.id) ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                         <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${expandedItems.has(resource.id) ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  )}
               </div>
               
               {activeGroup === 'workloads' && expandedItems.has(resource.id) && (
                 <div className="relative ml-12 -mt-6 pt-10 pb-6 pr-6 pl-10 bg-gray-50/50 dark:bg-black/20 rounded-b-[3rem] border-x border-b border-gray-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-500 z-0 text-left">
                    <div className="absolute left-6 top-0 bottom-10 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent" />
                    <div className="space-y-4">
                       {resource.pods && resource.pods.map(pod => (
                          <div key={pod.id} className="relative flex items-center justify-between bg-white dark:bg-[#1C2128] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group/pod">
                             <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-blue-500/20" />
                             <div className="flex items-center gap-6 overflow-hidden flex-1">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${pod.status === 'Running' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`} />
                                <div className="flex flex-col gap-0.5 min-w-0">
                                   <span className="text-sm font-black text-gray-800 dark:text-white truncate">{pod.name}</span>
                                   <span className="text-xs font-bold text-gray-400 font-mono">{pod.ip || (language === 'zh' ? '暂无 IP' : 'No IP')}</span>
                                </div>
                                
                                {/* ⚡ POD METRICS */}
                                {pod.status === 'Running' && (
                                   <div className="ml-8 hidden md:block">
                                      <LiveMetrics type="kubernetes" id={pod.name} namespace={resource.namespace} interval={5000} />
                                   </div>
                                )}
                             </div>
                             
                             <div className="flex items-center gap-4">
                                <span className={`text-xs font-black px-2 py-1 rounded-md ${pod.status === 'Running' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-gray-400 bg-gray-50 dark:bg-white/5'}`}>{pod.status?.toUpperCase() || kd.status.unknown}</span>
                                
                                <div className="flex items-center gap-2">
                                  {/* Action Buttons with Tooltips */}
                                  {[
                                    { icon: Terminal, color: 'text-blue-500', label: kd.actions.logs, tooltip: kd.actions.logs, action: () => fetchLogs(pod.name, resource.namespace) },
                                    { icon: RotateCcw, color: 'text-orange-500', label: kd.actions.restart, tooltip: kd.actions.restart, action: () => requestAction(pod.name, 'restart', 'info') },
                                    { icon: Trash2, color: 'text-red-500', label: kd.actions.delete, tooltip: kd.actions.delete, action: () => requestAction(pod.name, 'delete', 'danger') }
                                  ].map((act, i) => (
                                    <div key={i} className="relative group/action">
                                      <button 
                                        onClick={act.action}
                                        className={`p-2 rounded-xl bg-gray-50 dark:bg-white/5 ${act.color} hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm border border-gray-100 dark:border-white/5`}
                                      >
                                        <act.icon className="w-3.5 h-3.5" />
                                      </button>
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/action:opacity-100 transition-all z-[200]">
                                        {act.tooltip}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>
                       ))}
                       {(!resource.pods || resource.pods.length === 0) && (
                          <div className="py-6 text-center text-xs font-black text-gray-400 italic bg-white/30 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/5">{kd.noPods}</div>
                       )}
                    </div>
                 </div>
               )}
            </div>
          ))
        )}
      </div>

      {/* ⚙️ SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-2xl" onClick={() => setIsSettingsOpen(false)} />
           <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D1117] rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"><X className="w-6 h-6" /></button>
              
              <div className="mb-10 text-left">
                 <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tighter mb-2 italic">{kd.settings.title}</h2>
                 <p className="text-sm text-gray-400 font-bold opacity-60 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-500" /> {kd.settings.subtitle}
                 </p>
              </div>

              <div className="space-y-8">
                 <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl flex items-center gap-6">
                    <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/30">
                       <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col text-left">
                       <span className="text-lg font-black text-emerald-600">{kd.settings.activeKubeconfig}</span>
                       <span className="text-xs font-bold text-gray-400">{kd.settings.placeholder}</span>
                    </div>
                 </div>
                 <textarea value={kubeconfig} onChange={e => setKubeconfig(e.target.value)} placeholder="apiVersion: v1..." className="w-full h-40 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 text-xs font-mono focus:ring-4 ring-emerald-500/5 focus:border-emerald-500/20 outline-none transition-all resize-none shadow-inner" />
              </div>
              <button 
                onClick={() => { setIsSettingsOpen(false); refreshAll(); }} 
                className="w-full mt-10 py-6 rounded-[2rem] bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
              >
                <RefreshCw className="w-4 h-4" />
                {kd.settings.save}
              </button>
           </div>
        </div>
      )}

      {/* ⚠️ CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
           <div className="relative w-full max-w-md bg-white dark:bg-[#161B22] rounded-[2.5rem] p-10 shadow-2xl border border-white/10 animate-in zoom-in-95">
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-blue-500 shadow-lg shadow-blue-500/30'}`}>
                 <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-4 tracking-tighter">{confirmModal.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-8 leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-4">
                 <button onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-black text-xs transition-all">Cancel</button>
                 <button onClick={confirmModal.action} className={`flex-1 py-4 rounded-2xl text-white font-black text-xs transition-all ${confirmModal.type === 'danger' ? 'bg-red-500 shadow-lg shadow-red-500/20 hover:bg-red-600' : 'bg-blue-600 shadow-lg shadow-blue-500/20 hover:bg-blue-700'}`}>Confirm</button>
              </div>
           </div>
        </div>
      )}

      {/* 📜 LOG VIEWER MODAL */}
      {logModal.isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl" onClick={() => setLogModal(prev => ({...prev, isOpen: false}))} />
           <div className="relative w-full max-w-5xl bg-[#0D1117] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                       <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col text-left">
                       <h3 className="text-lg font-black text-white tracking-tight">{kd.actions.logs} - {logModal.podName}</h3>
                       <span className="text-xs font-bold text-gray-500">{logModal.namespace}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={() => fetchLogs(logModal.podName, logModal.namespace)} className="p-3 rounded-2xl hover:bg-white/5 text-gray-400 transition-all"><RefreshCw className={`w-5 h-5 ${logModal.loading ? 'animate-spin' : ''}`} /></button>
                    <button onClick={() => setLogModal(prev => ({ ...prev, isOpen: false }))} className="p-3 rounded-2xl hover:bg-white/5 text-gray-400 transition-all"><X className="w-5 h-5" /></button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-auto p-8 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                 {logModal.loading ? (
                    <div className="h-full flex items-center justify-center flex-col gap-4 text-gray-500">
                       <RefreshCw className="w-8 h-8 animate-spin opacity-20" />
                       <span className="font-black animate-pulse">Streaming Logs...</span>
                    </div>
                 ) : (
                    <pre className="text-gray-300 whitespace-pre-wrap break-all text-left">
                       {logModal.content || 'No logs available.'}
                    </pre>
                 )}
              </div>
              
              <div className="px-8 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-gray-500">Live Streaming</span>
                 </div>
                 <span className="text-xs font-black text-gray-600">Showing last 200 lines</span>
              </div>
           </div>
        </div>
      )}
      {/* 💻 TERMINAL MODAL */}
      <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} type="k8s" />
    </div>
  );
}
