import React, { useState } from 'react';
import { Trash2, Download, Search, Filter, Clock, Box, Rocket, Layers, Zap, FolderHeart, ArrowRight, Eye, X, Code, Settings2, Edit3, Check, FolderInput, Plus, CheckSquare, Square, ChevronDown, ListChecks } from 'lucide-react';
import { createPortal } from 'react-dom';
import JSZip from 'jszip';
import { useTemplateStore, Template, TemplateType } from '@/store/useTemplateStore';
import { useAppStore } from '@/store/useAppStore';
import { useDockerfileStore } from '@/store/useDockerfileStore';
import { useComposeStore } from '@/store/useComposeStore';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { useTranslation } from '@/hooks/useTranslation';
import { generateDockerfile, generateCompose, generateKubernetes } from '@/utils/generators';

export function TemplatesTab() {
  const { t } = useTranslation();
  const tm = t.templates;
  const { setActiveTab } = useAppStore();
  const { templates, deleteTemplate, categories, renameCategory, deleteCategory, updateTemplateCategory, addCategory, deleteTemplates, bulkUpdateCategory } = useTemplateStore();
  
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{oldName: string, newName: string} | null>(null);
  const [movingTemplateId, setMovingTemplateId] = useState<string | null>(null);
  const [newCategoryInModal, setNewCategoryInModal] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

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

  const handleBulkDownload = async () => {
    const zip = new JSZip();
    const selectedTemplates = templates.filter(tpl => selectedIds.includes(tpl.id));

    selectedTemplates.forEach(tpl => {
      let content = '';
      let filename = '';

      if (tpl.type === 'dockerfile') {
        content = generateDockerfile(tpl.data, t);
        filename = `dockerfile/${tpl.name}.dockerfile`;
      } else if (tpl.type === 'compose') {
        content = generateCompose(tpl.data, t);
        filename = `compose/${tpl.name}.yaml`;
      } else if (tpl.type === 'kubernetes') {
        content = generateKubernetes(tpl.data, t, true);
        filename = `kubernetes/${tpl.name}.yaml`;
      }

      zip.file(filename, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZeroYAML-Templates-${new Date().toISOString().split('T')[0]}.zip`;
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
      <div className="bg-white dark:bg-[#0D1117] w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl bg-gradient-to-br ${getColor(previewTemplate.type)} text-white shadow-xl`}>
              {getIcon(previewTemplate.type)}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{previewTemplate.name}</h2>
              <p className="text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em] mt-1 opacity-80">{previewTemplate.type} {tm.snapshotTitle}</p>
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
                <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-[0.2em]">{tm.metadataLabel}</h3>
                <div className="space-y-4">
                  {previewTemplate.type === 'dockerfile' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.dockerfile.baseImage}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.baseImage}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.dockerfile.layersCount}</p>
                        <p className="text-xs font-black dark:text-white">
                          {(previewTemplate.data.runCmds?.length || 0) + (previewTemplate.data.copyAddItems?.length || 0)} {t.common.itemUnit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.dockerfile.user}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.user || 'root'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.dockerfile.expose}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.port || 'None'}</p>
                      </div>
                    </>
                  )}
                  {previewTemplate.type === 'compose' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.compose.servicesCount}</p>
                        <p className="text-xs font-black dark:text-white">{previewTemplate.data.composeServices?.length || 0} {t.common.itemUnit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.tabs.network}</p>
                        <p className="text-xs font-black dark:text-white truncate">
                          {previewTemplate.data.networkName || 'default'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.compose.version}</p>
                        <p className="text-xs font-black dark:text-white">{previewTemplate.data.composeVersion || '3.8'}</p>
                      </div>
                    </>
                  )}
                  {previewTemplate.type === 'kubernetes' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.k8s.unitWload}</p>
                        <p className="text-xs font-black dark:text-white">{previewTemplate.data.workloads?.length || 0} {t.common.itemUnit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.k8s.namespaceLabel}</p>
                        <p className="text-xs font-black dark:text-white truncate">{previewTemplate.data.globalNamespace || 'default'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t.k8s.unitStore}</p>
                        <p className="text-xs font-black dark:text-white">
                          {(previewTemplate.data.pvcs?.length || 0) + (previewTemplate.data.configMaps?.length || 0)} {t.common.itemUnit}
                        </p>
                      </div>
                    </>
                  )}
                </div>
             </div>

             <div className="mt-auto flex flex-col gap-3">
               <button 
                 onClick={() => handleDownload(previewTemplate!)}
                 className="w-full py-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
               >
                 <Download className="w-4 h-4" />
                 {t.common.download}
               </button>
               <button 
                 onClick={() => handleApply(previewTemplate!)}
                 className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
               >
                 <ArrowRight className="w-4 h-4" />
                 {t.common.apply}
               </button>
             </div>
          </div>
          
          {/* ⚡ MAIN CONTENT: YAML PREVIEW */}
          <div className="flex-1 bg-gray-900 flex flex-col overflow-hidden relative">
             <div className="absolute top-6 left-8 z-10">
                <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center gap-2 bg-gray-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                  <Code className="w-3 h-3" />
                  {tm.sourcePreview}
                </h3>
             </div>
             <div className="flex-1 overflow-auto p-12 pt-20 custom-scrollbar-dark scroll-smooth">
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
          {tm.deleteConfirm}
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
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all"
          >
            {t.common.delete}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-20">
      {PreviewModal}
      {DeleteConfirmModal}

      {/* 🚀 FLOAT ACTION BAR */}
      {isBatchMode && selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-gray-900 dark:bg-[#1C2128] text-white px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl">
             <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-black tracking-tight">{tm.selectedItems.replace('{count}', selectedIds.length.toString())}</span>
             </div>
             
             <div className="flex items-center gap-4">
                <button 
                  onClick={handleBulkDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black text-xs transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                >
                  <Download className="w-4 h-4" />
                  {tm.bulkDownload}
                </button>

                <button 
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-xl font-bold text-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.common.delete}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* 🌟 HERO HEADER */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-indigo-900 p-10 text-white shadow-2xl shadow-blue-500/20 border border-white/5">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <FolderHeart className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tight italic">{tm.title}</h1>
              </div>
              <p className="text-white/80 max-w-md text-sm font-bold leading-relaxed">
                Your high-fidelity library of production-ready configurations. Snapshot once, deploy everywhere.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                  <p className="text-xs font-bold tracking-tight text-blue-200 opacity-60 uppercase">{tm.totalTemplates}</p>
                  <p className="text-2xl font-black mt-1 tabular-nums">{templates.length}</p>
               </div>
            </div>
         </div>

         <div className="mt-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-start gap-4 relative z-10">
            <Zap className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
               <p className="text-xs font-black text-white mb-1 uppercase tracking-widest opacity-80">
                  {t.common.warning}
               </p>
               <p className="text-xs font-bold text-blue-50 leading-relaxed">
                  {tm.browserStorageNotice}
               </p>
            </div>
         </div>

         {/* Decorative elements */}
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
         <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
      </div>

      {/* 🛠 TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all shadow-sm dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
           {(['all', 'dockerfile', 'compose', 'kubernetes'] as const).map((type) => (
             <button
               key={type}
               onClick={() => setFilterType(type)}
               className={`px-5 py-2 rounded-xl text-xs font-black capitalize tracking-tight transition-all duration-300 ${
                 filterType === type 
                   ? 'bg-white dark:bg-[#1C2128] text-blue-700 dark:text-blue-400 shadow-md ring-1 ring-black/5' 
                   : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
               }`}
             >
               {type}
             </button>
           ))}
        </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedIds([]);
              }}
              className={`px-5 py-2.5 rounded-xl transition-all border shadow-sm active:scale-95 flex items-center gap-2 ${
                isBatchMode 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                  : 'text-blue-600 bg-white dark:bg-[#0D1117] border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10'
              }`}
            >
               <ListChecks className="w-4 h-4" />
               <span className="text-xs font-black uppercase tracking-tight">{tm.bulkActions}</span>
            </button>
         </div>
      </div>

      {/* 📦 CONTENT GRID */}
      {filteredTemplates.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 group">
          <FolderHeart className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-6 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-xl font-black text-gray-400 dark:text-gray-600">{tm.noData}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTemplates.map((tpl) => (
            <div 
              key={tpl.id}
              onClick={() => setPreviewTemplate(tpl)}
              className="group relative bg-white dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 cursor-pointer hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-6 items-center">
                   {isBatchMode && (
                     <button 
                       onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIds(prev => 
                            prev.includes(tpl.id) ? prev.filter(id => id !== tpl.id) : [...prev, tpl.id]
                          );
                       }}
                       className={`flex-shrink-0 p-3 rounded-2xl transition-all ${
                          selectedIds.includes(tpl.id) 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-blue-50'
                       }`}
                     >
                        {selectedIds.includes(tpl.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                     </button>
                   )}
                   <div className={`p-4 rounded-3xl bg-gradient-to-br ${getColor(tpl.type)} text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                      {getIcon(tpl.type)}
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight mb-1">{tpl.name}</h3>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-black uppercase text-blue-500 opacity-80 tracking-widest">{tpl.type}</span>
                         <span className="w-1 h-1 rounded-full bg-gray-300" />
                         <span className="text-xs font-bold text-gray-400 uppercase">{new Date(tpl.id).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleDownload(tpl); }}
                     className="p-3 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-500 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all"
                   >
                     <Download className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setDeleteId(tpl.id); }}
                     className="p-3 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
