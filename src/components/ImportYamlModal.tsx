import React from 'react';
import { X, Workflow, FileDown } from 'lucide-react';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { parseKubernetesYaml } from '@/utils/k8s-parser';
import { useTranslation } from '@/hooks/useTranslation';

interface ImportYamlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportYamlModal({ isOpen, onClose }: ImportYamlModalProps) {
  const { t } = useTranslation();
  const [importYaml, setImportYaml] = React.useState('');
  const state = useKubernetesStore();

  const handleImport = () => {
    if (!importYaml.trim()) return;
    try {
      const resources = parseKubernetesYaml(importYaml);
      state.batchLoadResources(resources);
      onClose();
      setImportYaml('');
    } catch (e: any) {
      alert('Failed to parse YAML: ' + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[3rem] shadow-2xl flex flex-col h-[60vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Workflow className="w-6 h-6 text-white" /></div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">{t.k8s.reverseEngineering}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic leading-none mt-1">{t.k8s.reverseEngineeringSub}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="flex-1 p-8 flex flex-col gap-6">
          <textarea 
            value={importYaml}
            onChange={(e) => setImportYaml(e.target.value)}
            placeholder={t.k8s.pasteYamlPlaceholder}
            className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 font-mono text-xs text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 scrollbar-none resize-none placeholder-gray-700"
          />
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 px-8 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 transition-all active:scale-95"
            >
              {t.common.cancel}
            </button>
            <button 
              onClick={handleImport}
              className="flex-[2] py-4 px-8 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <FileDown className="w-4 h-4" />
              {t.k8s.generateArchitecture}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
