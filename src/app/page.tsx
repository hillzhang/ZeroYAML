"use client";

import { Layers, Rocket, Zap } from "lucide-react";
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ComposeTab } from '../components/tabs/ComposeTab';
import { DockerfileTab } from '../components/tabs/DockerfileTab';
import { KubernetesTab } from '../components/tabs/KubernetesTab';
import { CodeViewer } from '../components/preview/CodeViewer';
import { ThemeSwitch } from '../components/ThemeSwitch';

export default function ZeroYAMLApp() {
  const { activeTab, setActiveTab, setActiveTooltip } = useAppStore();
  const { t, language, setLanguage } = useTranslation();

  const tabs = [
    { id: 'dockerfile', label: t.tabs.dockerfile, icon: Rocket },
    { id: 'compose', label: t.tabs.compose, icon: Layers },
    { id: 'kubernetes', label: t.tabs.kubernetes, icon: Zap },
  ];

  return (
    <div 
      className="min-h-screen bg-white dark:bg-[#0D1117] text-gray-900 dark:text-gray-200 font-sans flex flex-col selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-700 dark:selection:text-blue-300"
      onClick={() => setActiveTooltip(null)}
    >
      {/* 🧊 PREMIUM HEADER */}
      <header className="sticky top-0 h-16 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-xl flex items-center justify-between px-6 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-blue-600 p-2 rounded-xl shadow-lg transform group-hover:scale-105 active:scale-95 transition-all">
              <Layers className="text-white w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none tracking-tight">ZeroYAML</h1>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mt-1 opacity-80">PRO Orchestration Engine</span>
          </div>
        </div>

        {/* 🚀 NAVIGATION TABS */}
        <nav className="flex items-center bg-gray-100/50 dark:bg-[#0D1117] p-1 rounded-2xl border border-gray-200/50 dark:border-gray-800 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-gray-700/50' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          {/* Language Switcher */}
          <div className="flex items-center bg-gray-100/50 dark:bg-[#0D1117] p-0.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
            <button 
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${language === 'zh' ? 'bg-white dark:bg-[#1C2128] text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ZH
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${language === 'en' ? 'bg-white dark:bg-[#1C2128] text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-4 text-gray-400 dark:text-gray-600">
             <ThemeSwitch />
          </div>
        </div>
      </header>

      {/* 📦 MAIN VIEWPORT */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧：可视化配置层 */}
        <section className="w-[45%] min-w-[520px] bg-white dark:bg-[#0D1117] overflow-y-auto pb-32">
          <div className="p-8 max-w-4xl mx-auto">
             {activeTab === 'compose' ? <ComposeTab /> : activeTab === 'dockerfile' ? <DockerfileTab /> : <KubernetesTab />}
          </div>
        </section>

        {/* 右侧：代码实时预览层 */}
        <div className="flex-1 bg-gray-50 dark:bg-[#1E1E1E] flex flex-col">
          <CodeViewer />
        </div>
      </main>
    </div>
  );
}
