import React, { useState } from 'react';
import { Trash2, Download, Search, Filter, Clock, Box, Rocket, Layers, Zap, FolderHeart, ArrowRight, Eye, X, Code, Settings2, Edit3, Check, FolderInput } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTemplateStore, Template, TemplateType } from '@/store/useTemplateStore';
import { useAppStore } from '@/store/useAppStore';
import { useDockerfileStore } from '@/store/useDockerfileStore';
import { useComposeStore } from '@/store/useComposeStore';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { useTranslation } from '@/hooks/useTranslation';
import { generateDockerfile, generateCompose, generateKubernetes } from '@/utils/generators';

export function TemplatesTab() {
  const { t } = useTranslation();
  const { setActiveTab } = useAppStore();
  const { templates, deleteTemplate, categories, renameCategory, deleteCategory, updateTemplateCategory } = useTemplateStore();
  
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{oldName: string, newName: string} | null>(null);
  const [movingTemplateId, setMovingTemplateId] = useState<string | null>(null);

  React.useEffect(() => {
    setActiveCategory('all');
  }, [filterType]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDownload = (template: Template) => {
    let content = '';
    let filename = '';

    if (template.type === 'dockerfile') {
      content = generateDockerfile(template.data, t);
      filename = 'Dockerfile';
    } else if (template.type === 'compose') {
      content = generateCompose(template.data, t);
      filename = 'docker-compose.yaml';
    } else if (template.type === 'kubernetes') {
      content = generateKubernetes(template.data, t, true);
      filename = 'k8s-bundle.yaml';
    }

    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTemplates = templates.filter(tpl => {
    const matchesType = filterType === 'all' || tpl.type === filterType;
    const matchesCategory = activeCategory === 'all' 
      ? true 
      : activeCategory === 'uncategorized' 
        ? !tpl.category 
        : tpl.category === activeCategory;
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleApply = (template: Template) => {
    if (template.type === 'dockerfile') {
      useDockerfileStore.setState(template.data);
      setActiveTab('dockerfile');
    } else if (template.type === 'compose') {
      useComposeStore.setState(template.data);
      setActiveTab('compose');
    } else if (template.type === 'kubernetes') {
      useKubernetesStore.setState(template.data);
      setActiveTab('kubernetes');
    }
    setPreviewTemplate(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handlePreview = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    setPreviewTemplate(template);
  };

  const getIcon = (type: TemplateType) => {
    switch(type) {
      case 'dockerfile': return <Rocket className="w-5 h-5" />;
      case 'compose': return <Layers className="w-5 h-5" />;
      case 'kubernetes': return <Zap className="w-5 h-5" />;
      default: return <Box className="w-5 h-5" />;
    }
  };

  const getColor = (type: TemplateType) => {
    switch(type) {
      case 'dockerfile': return 'from-orange-400 to-red-500 shadow-orange-500/20';
      case 'compose': return 'from-blue-400 to-indigo-600 shadow-blue-500/20';
      case 'kubernetes': return 'from-purple-400 to-pink-600 shadow-purple-500/20';
      default: return 'from-gray-400 to-gray-600 shadow-gray-500/20';
    }
  };

  const PreviewModal = previewTemplate && createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-gray-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0D1117] w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl bg-gradient-to-br ${getColor(previewTemplate.type)} text-white shadow-xl`}>
              {getIcon(previewTemplate.type)}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{previewTemplate.name}</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 opacity-60">{previewTemplate.type} Snapshot</p>
            </div>
          </div>
          <button 
            onClick={() => setPreviewTemplate(null)}
            className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 📁 SIDEBAR: METADATA */}
          <div className="w-72 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-100 dark:border-gray-800 p-8 flex flex-col gap-8 flex-shrink-0">
             <div className="space-y-4">
                <h3 className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em]">{t.common.metadata}</h3>
                <div className="space-y-4">
                  {previewTemplate.type === 'dockerfile' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.dockerfile.baseImage}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.baseImage}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.dockerfile.layersCount}</p>
                        <p className="text-xs font-black dark:text-white">
                          {(previewTemplate.data.runCmds?.length || 0) + (previewTemplate.data.copyAddItems?.length || 0)} {t.common.itemUnit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.dockerfile.user}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.user || 'root'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.dockerfile.healthcheck}</p>
                        <p className="text-xs font-black dark:text-white truncate text-blue-500 uppercase">
                          {previewTemplate.data.healthcheck ? 'ENABLED' : 'DISABLED'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.dockerfile.expose}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.port || 'None'}</p>
                      </div>
                    </>
                  )}
                  {previewTemplate.type === 'compose' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.compose.servicesCount}</p>
                        <p className="text-xs font-black dark:text-white">{previewTemplate.data.composeServices?.length || 0} {t.common.itemUnit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.compose.addonsCount}</p>
                        <p className="text-xs font-black dark:text-white">{previewTemplate.data.composeAddons?.length || 0} {t.common.itemUnit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.tabs.network}</p>
                        <p className="text-xs font-black dark:text-white truncate">
                          {previewTemplate.data.networkName || 'default'}
                          {previewTemplate.data.useSharedNetwork && (
                             <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[9px]">SHARED</span>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.compose.version}</p>
                        <p className="text-xs font-black dark:text-white">{previewTemplate.data.composeVersion || '3.8'}</p>
                      </div>
                    </>
                  )}
                  {previewTemplate.type === 'kubernetes' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.k8s.unitWload}</p>
                        <p className="text-xs font-black dark:text-white">{previewTemplate.data.workloads?.length || 0} {t.common.itemUnit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.k8s.unitNet}</p>
                        <p className="text-xs font-black dark:text-white">
                          {(previewTemplate.data.services?.length || 0) + (previewTemplate.data.ingresses?.length || 0)} {t.common.itemUnit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.k8s.unitStore}</p>
                        <p className="text-xs font-black dark:text-white">
                          {(previewTemplate.data.pvcs?.length || 0) + 
                           (previewTemplate.data.configMaps?.length || 0) + 
                           (previewTemplate.data.secrets?.length || 0) + 
                           (previewTemplate.data.pvs?.length || 0) + 
                           (previewTemplate.data.storageClasses?.length || 0)} {t.common.itemUnit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t.k8s.namespace}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.globalNamespace || 'default'}</p>
                      </div>
                    </>
                  )}
                </div>
             </div>

             <div className="mt-auto flex flex-col gap-3">
               <button 
                 onClick={() => handleDownload(previewTemplate!)}
                 className="w-full py-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
               >
                 <Download className="w-4 h-4" />
                 {t.common.download}
               </button>
               <button 
                 onClick={() => handleApply(previewTemplate!)}
                 className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
               >
                 <ArrowRight className="w-4 h-4" />
                 {t.common.apply}
               </button>
             </div>
          </div>
          
          {/* ⚡ MAIN CONTENT: YAML PREVIEW */}
          <div className="flex-1 bg-gray-900 flex flex-col overflow-hidden relative">
             <div className="absolute top-6 left-8 z-10">
                <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Code className="w-3 h-3" />
                  Source Code Preview
                </h3>
             </div>
             <div className="flex-1 overflow-auto p-12 pt-16 custom-scrollbar-dark scroll-smooth">
                <pre className="text-xs font-mono leading-relaxed whitespace-pre">
                  {(previewTemplate.type === 'dockerfile' ? generateDockerfile(previewTemplate.data, t) :
                    previewTemplate.type === 'compose' ? generateCompose(previewTemplate.data, t) :
                    generateKubernetes(previewTemplate.data, t, true))
                    .split('\n')
                    .map((line, idx) => (
                      <div key={idx} className="flex gap-6 group/line hover:bg-white/5 transition-colors items-start">
                        <span className="w-9 text-right text-gray-600 select-none opacity-40 font-mono font-bold tabular-nums flex-shrink-0 leading-[1.6]">
                          {idx + 1}
                        </span>
                        <span className="text-cyan-400/90 leading-[1.6] break-all">
                          {line || ' '}
                        </span>
                      </div>
                    ))
                  }
                </pre>
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  const DeleteConfirmModal = deleteId && createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0D1117] w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
          <Trash2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          {t.common.confirm}
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          {t.templates.deleteConfirm}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => setDeleteId(null)}
            className="flex-1 py-3 text-sm font-black tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {t.common.cancel}
          </button>
          <button 
            onClick={() => {
              deleteTemplate(deleteId);
              setDeleteId(null);
            }}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-[10px] tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all"
          >
            {t.common.delete}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  const CategoryManageModal = isManagingCategories && filterType !== 'all' && createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0D1117] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Settings2 className="w-5 h-5" />
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
               {t.templates.manageCategories}
             </h3>
          </div>
          <button onClick={() => setIsManagingCategories(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
           {(categories[filterType] || []).length === 0 ? (
             <div className="py-12 text-center text-gray-400 font-medium">
                No categories found for this type.
             </div>
           ) : (
             (categories[filterType] || []).map(cat => (
               <div key={cat} className="flex items-center gap-2 group/cat p-2 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                  {editingCategory?.oldName === cat ? (
                    <div className="flex-1 flex gap-2">
                       <input 
                         autoFocus
                         value={editingCategory.newName}
                         onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter' && editingCategory.newName.trim() && editingCategory.newName !== cat) {
                             renameCategory(filterType as any, cat, editingCategory.newName.trim());
                             setEditingCategory(null);
                           } else if (e.key === 'Escape') {
                             setEditingCategory(null);
                           }
                         }}
                         className="flex-1 px-4 py-2 bg-white dark:bg-[#0D1117] border border-blue-500 rounded-xl text-sm outline-none dark:text-white"
                       />
                       <button 
                         onClick={() => {
                           if (editingCategory.newName.trim() && editingCategory.newName !== cat) {
                             renameCategory(filterType as any, cat, editingCategory.newName.trim());
                           }
                           setEditingCategory(null);
                         }}
                         className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20"
                       >
                          <Check className="w-4 h-4" />
                       </button>
                    </div>
                  ) : (
                    <>
                       <span className="flex-1 px-4 py-2 font-bold text-gray-700 dark:text-gray-200 text-sm">{cat}</span>
                       <div className="flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                            className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
                          >
                             <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteCategory(filterType as any, cat)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </>
                  )}
               </div>
             ))
           )}
        </div>

        <button 
          onClick={() => setIsManagingCategories(false)}
          className="mt-8 w-full py-4 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl font-black text-xs tracking-widest active:scale-95 transition-all shadow-xl"
        >
           {t.common.finishEdit}
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {PreviewModal}
      {DeleteConfirmModal}
      {CategoryManageModal}

      {/* 🌟 HERO HEADER */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 p-10 text-white shadow-2xl shadow-blue-500/20">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <FolderHeart className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">{t.templates.title}</h1>
              </div>
              <p className="text-blue-100 max-w-md text-sm font-medium leading-relaxed opacity-80">
                Your personal library of production-ready configurations. Save once, orchestrate everywhere.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black tracking-tight text-blue-200 opacity-60">Total Templates</p>
                  <p className="text-2xl font-black mt-1">{templates.length}</p>
               </div>
            </div>
         </div>

         <div className="mt-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-start gap-3 relative z-10">
            <Zap className="w-4 h-4 text-yellow-300 mt-0.5" />
            <div className="flex-1">
               <p className="text-xs font-bold text-white mb-1">
                  {t.common.warning || 'Note'}
               </p>
               <p className="text-[11px] font-medium text-blue-100 leading-relaxed opacity-90">
                  {t.templates.browserStorageNotice}
               </p>
            </div>
         </div>

         {/* Decorative elements */}
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
         <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
      </div>

      {/* 🛠 TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
           {(['all', 'dockerfile', 'compose', 'kubernetes'] as const).map((type) => (
             <button
               key={type}
               onClick={() => setFilterType(type)}
               className={`px-4 py-2 rounded-xl text-[11px] font-black capitalize tracking-tight transition-all duration-300 ${
                 filterType === type 
                   ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm' 
                   : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
               }`}
             >
               {type}
             </button>
           ))}
        </div>
      </div>

      {/* 📂 CATEGORIES */}
      {(filterType !== 'all') && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2 py-2">
             <Filter className="w-4 h-4 text-blue-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.templates.categories}</span>
          </div>
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 border ${
              activeCategory === 'all' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                : 'bg-white dark:bg-[#0D1117] text-gray-400 border-gray-100 dark:border-gray-800 hover:border-blue-500/30'
            }`}
          >
            {t.templates.allCategories}
          </button>
          <button 
            onClick={() => setActiveCategory('uncategorized')}
            className={`px-4 py-2 rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 border ${
              activeCategory === 'uncategorized' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                : 'bg-white dark:bg-[#0D1117] text-gray-400 border-gray-100 dark:border-gray-800 hover:border-blue-500/30'
            }`}
          >
             {t.templates.uncategorized}
          </button>
          {(categories[filterType] || []).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 border ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                  : 'bg-white dark:bg-[#0D1117] text-gray-400 border-gray-100 dark:border-gray-800 hover:border-blue-500/30'
              }`}
            >
              {cat}
            </button>
          ))}
          
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-xl transition-all ml-auto group"
            title={t.templates.manageCategories}
          >
             <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      )}
      {filteredTemplates.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800/80 group">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
            <FolderHeart className="w-16 h-16 text-gray-200 dark:text-gray-700 relative animate-pulse" />
          </div>
          <p className="text-xl font-black text-gray-300 dark:text-gray-600">{t.templates.noData}</p>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-2 max-w-xs text-center leading-relaxed">
            Start saving your configurations to populate your personal template library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          {filteredTemplates.map((tpl) => (
            <div 
              key={tpl.id}
              className="group relative bg-white dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-7 hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden"
            >
              {/* Background accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getColor(tpl.type)} opacity-0 group-hover:opacity-[0.05] blur-3xl transition-opacity duration-700 pointer-events-none`} />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex gap-5">
                   <div className={`flex-shrink-0 p-4 rounded-3xl bg-gradient-to-br ${getColor(tpl.type)} text-white shadow-xl`}>
                      {getIcon(tpl.type)}
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {tpl.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2.5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          tpl.type === 'dockerfile' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/40' :
                          tpl.type === 'compose' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40' :
                          'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40'
                        }`}>
                          {tpl.type}
                        </span>
                        {tpl.category && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-blue-500/5 text-blue-500 border-blue-500/10 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 flex items-center gap-1.5">
                            <Box className="w-2 h-2" />
                            {tpl.category}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                           <Clock className="w-3 h-3" />
                           <span className="text-[10px] font-bold">{new Date(tpl.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                     onClick={(e) => handlePreview(e, tpl)}
                     className="p-3 text-gray-400/50 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-2xl transition-all duration-300"
                     title="Preview"
                   >
                     <Eye className="w-5 h-5" />
                   </button>
                   <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMovingTemplateId(movingTemplateId === tpl.id ? null : tpl.id);
                        }}
                        className={`p-3 rounded-2xl transition-all duration-300 ${
                          movingTemplateId === tpl.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'text-gray-400/50 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                        }`}
                        title={t.templates.moveToCategory}
                      >
                        <FolderInput className="w-5 h-5" />
                      </button>

                      {movingTemplateId === tpl.id && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[50] py-2 animate-in fade-in zoom-in-95 duration-200">
                           <div className="px-3 py-1 mb-1">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.templates.selectCategory}</p>
                           </div>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               updateTemplateCategory(tpl.id, undefined);
                               setMovingTemplateId(null);
                             }}
                             className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 transition-colors"
                           >
                              {t.templates.uncategorized}
                           </button>
                           {(categories[tpl.type] || []).map(cat => (
                             <button 
                               key={cat}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 updateTemplateCategory(tpl.id, cat);
                                 setMovingTemplateId(null);
                               }}
                               className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 transition-colors"
                             >
                                {cat}
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       handleDownload(tpl);
                     }}
                     className="p-3 text-gray-400/50 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded-2xl transition-all duration-300"
                     title={t.common.download}
                   >
                     <Download className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={(e) => handleDelete(e, tpl.id)}
                     className="p-3 text-gray-400/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all duration-300"
                     title={t.common.delete}
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>

              <div className="mt-8 pt-7 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
                 <div className="flex -space-x-2">
                   {/* Decorative dots or metadata */}
                   <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800" />
                   <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800" />
                   <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800" />
                 </div>
                 
                 <button 
                   onClick={() => handleApply(tpl)}
                   className="flex items-center gap-2.5 px-6 py-2.5 bg-gray-900 dark:bg-[#1C2128] text-white dark:text-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-500 active:scale-95 group/btn"
                 >
                   {t.common.apply}
                   <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
