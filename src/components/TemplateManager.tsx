import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, FolderHeart, Trash2, Download, X, CheckCircle2, Rocket, Layers, Zap } from 'lucide-react';
import { useTemplateStore, TemplateType } from '@/store/useTemplateStore';
import { useAppStore } from '@/store/useAppStore';
import { useDockerfileStore } from '@/store/useDockerfileStore';
import { useComposeStore } from '@/store/useComposeStore';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { useTranslation } from '@/hooks/useTranslation';

export function TemplateManager() {
  const { t } = useTranslation();
  const { activeTab } = useAppStore();
  const { templates, saveTemplate, categories, addCategory } = useTemplateStore();
  const [categoryName, setCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  const dfStore = useDockerfileStore();
  const cpStore = useComposeStore();
  const k8sStore = useKubernetesStore();

  const [isOpen, setIsOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saveMode, setSaveMode] = useState<'current' | 'full'>('full');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    if (!templateName.trim()) return;

    let data: any = {};
    const type = activeTab as TemplateType;

    if (activeTab === 'dockerfile') {
      data = {
        appName: dfStore.appName,
        baseImage: dfStore.baseImage,
        workdir: dfStore.workdir,
        port: dfStore.port,
        startCmd: dfStore.startCmd,
        entrypoint: dfStore.entrypoint,
        envVars: dfStore.envVars,
        volumes: dfStore.volumes,
        user: dfStore.user,
        healthcheck: dfStore.healthcheck,
        args: dfStore.args,
        labels: dfStore.labels,
        runCmds: dfStore.runCmds,
        copyAddItems: dfStore.copyAddItems,
        useShellWrapper: dfStore.useShellWrapper,
      };
    } else if (activeTab === 'compose') {
      data = {
        composeServices: cpStore.composeServices,
        composeAddons: cpStore.composeAddons,
        composeVersion: cpStore.composeVersion,
        networkName: cpStore.networkName,
        useSharedNetwork: cpStore.useSharedNetwork,
      };
    } else if (activeTab === 'kubernetes') {
      if (saveMode === 'full') {
        data = {
          globalNamespace: k8sStore.globalNamespace,
          workloads: k8sStore.workloads,
          services: k8sStore.services,
          ingresses: k8sStore.ingresses,
          pvcs: k8sStore.pvcs,
          configMaps: k8sStore.configMaps,
          secrets: k8sStore.secrets,
          pvs: k8sStore.pvs,
          storageClasses: k8sStore.storageClasses,
        };
      } else {
        // Current Mode: Only save the active resource
        const activeSection = k8sStore.activeSection;
        data = {
          globalNamespace: k8sStore.globalNamespace,
          workloads: activeSection === 'workload' ? k8sStore.workloads.filter(w => w.id === k8sStore.activeWorkloadId) : [],
          services: activeSection === 'network' ? k8sStore.services.filter(s => s.id === k8sStore.activeServiceId) : [],
          ingresses: activeSection === 'network' ? k8sStore.ingresses.filter(i => i.id === k8sStore.activeIngressId) : [],
          pvcs: activeSection === 'storage' ? k8sStore.pvcs.filter(p => p.id === k8sStore.activePvcId) : [],
          configMaps: activeSection === 'storage' ? k8sStore.configMaps.filter(c => c.id === k8sStore.activeConfigMapId) : [],
          secrets: activeSection === 'storage' ? k8sStore.secrets.filter(s => s.id === k8sStore.activeSecretId) : [],
          pvs: activeSection === 'storage' ? k8sStore.pvs.filter(p => p.id === k8sStore.activePvId) : [],
          storageClasses: activeSection === 'storage' ? k8sStore.storageClasses.filter(s => s.id === k8sStore.activeStorageClassId) : [],
          activeSection: activeSection // Keep section for context
        };
      }
    }

    saveTemplate(templateName, type, data, selectedCategory || undefined);
    setTemplateName('');
    setSelectedCategory('');
    setCategoryName('');
    setIsCreatingCategory(false);
    setShowSuccess(true);
    setTimeout(() => {
       setShowSuccess(false);
       setIsOpen(false);
       setSaveMode('full');
    }, 1500);
  };

  if (activeTab === 'templates') return null;

  const modal = isOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[999] flex justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300 items-center">
      <div className="bg-white dark:bg-[#161B22] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-200">
        <div className="p-7 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Save className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.templates.saveAs}</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {activeTab === 'kubernetes' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Snapshot Strategy</label>
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <button 
                  onClick={() => setSaveMode('current')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    saveMode === 'current' 
                      ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  Current Resource
                </button>
                <button 
                  onClick={() => setSaveMode('full')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    saveMode === 'full' 
                      ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  Full Cluster Spec
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Template Name</label>
            <input 
              type="text" 
              placeholder={t.templates.namePlaceolder}
              autoFocus
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t.templates.selectCategory}</label>
              <button 
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
              >
                {isCreatingCategory ? t.common.cancel : `+ ${t.templates.createCategory}`}
              </button>
            </div>

            {isCreatingCategory ? (
              <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text" 
                  placeholder={t.templates.newCategoryPlaceholder}
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-1 px-5 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all dark:text-white"
                />
                <button 
                  onClick={() => {
                    if (categoryName.trim()) {
                      addCategory(activeTab as any, categoryName.trim());
                      setSelectedCategory(categoryName.trim());
                      setCategoryName('');
                      setIsCreatingCategory(false);
                    }
                  }}
                  className="px-4 py-3 bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 rounded-2xl font-bold text-xs"
                >
                  {t.common.add}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-3 rounded-2xl text-[11px] font-bold text-left transition-all truncate border ${
                    selectedCategory === '' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t.templates.uncategorized}
                </button>
                {(categories[activeTab] || []).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-3 rounded-2xl text-[11px] font-bold text-left transition-all truncate border ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
            >
              {t.common.cancel}
            </button>
            <button 
              onClick={handleSave}
              disabled={!templateName.trim()}
              className="flex-[2] px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              {showSuccess ? <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              {showSuccess ? t.templates.saveSuccess : t.common.save}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all font-bold text-[11px] uppercase tracking-wider"
      >
        <Save className="w-3.5 h-3.5" />
        {t.templates.saveAs}
      </button>

      {modal}
    </>
  );
}
