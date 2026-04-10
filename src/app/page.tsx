"use client";

import { useState, useEffect } from 'react';
import { Layers, Rocket, Zap, FolderHeart, Box, ChevronDown, Monitor, X, CheckSquare, Square } from "lucide-react";
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ComposeTab } from '../components/tabs/ComposeTab';
import { DockerfileTab } from '../components/tabs/DockerfileTab';
import { KubernetesTab } from '../components/tabs/KubernetesTab';
import { TemplatesTab } from '../components/tabs/TemplatesTab';
import { DockerDashboardTab } from '../components/tabs/DockerDashboardTab';
import { KubernetesDashboardTab } from '../components/tabs/KubernetesDashboardTab';
import { CodeViewer } from '../components/preview/CodeViewer';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { TemplateManager } from '../components/TemplateManager';
import { GlobalSettings } from '../components/GlobalSettings';

/**
 * 🎨 GITHUB ICON COMPONENT
 */
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function ZeroYAMLApp() {
  const { activeTab, setActiveTab, setActiveTooltip, containerRuntime, setContainerRuntime, isDashboardEnabled, setIsDashboardEnabled } = useAppStore();
  const { t, language, setLanguage } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const allTabs = [
    { id: 'templates', label: t.templates.title, icon: FolderHeart },
    { id: 'dockerfile', label: t.tabs.dockerfile, icon: Rocket },
    { id: 'compose', label: t.tabs.compose, icon: Layers },
    { id: 'kubernetes', label: t.tabs.kubernetes, icon: Zap },
    { id: 'containers', label: t.tabs.containers, icon: Box },
  ];

  const tabs = allTabs.filter(tab => tab.id !== 'containers' || isDashboardEnabled);

  // Fallback if current tab is disabled
  useEffect(() => {
    if (!isDashboardEnabled && activeTab === 'containers') {
      setActiveTab('dockerfile');
    }
  }, [isDashboardEnabled, activeTab, setActiveTab]);

  return (
    <div
      className="h-screen bg-white dark:bg-[#0D1117] text-gray-900 dark:text-gray-200 font-sans flex flex-col overflow-hidden selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-700 dark:selection:text-blue-300"
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
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mt-1 opacity-80">PRO Orchestration Engine</span>
          </div>
        </div>

        {/* 🚀 NAVIGATION TABS */}
        <nav className="flex items-center bg-gray-100/50 dark:bg-[#0D1117] p-1.5 rounded-[1.2rem] border border-gray-200/50 dark:border-gray-800 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            if (tab.id === 'containers') {
               return (
                 <div key={tab.id} className="relative group/nav h-9">
                    <button
                      onClick={() => setActiveTab('containers')}
                      className={`
                        h-full flex items-center gap-2 px-5 rounded-[0.9rem] text-sm font-black tracking-tight transition-all border
                        ${isActive
                          ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm border-gray-200/50 dark:border-gray-700/50'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
                        }
                      `}
                    >
                      <Box className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                      {tab.label}
                      <ChevronDown className={`w-3 h-3 opacity-40 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className="absolute top-[85%] left-0 pt-4 w-60 opacity-0 scale-95 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:pointer-events-auto transition-all duration-200 z-[100] origin-top">
                       <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-2 overflow-hidden">
                          <button 
                            onClick={() => { setContainerRuntime('docker'); setActiveTab('containers'); }}
                            className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-xs font-black transition-colors ${containerRuntime === 'docker' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                             <div className="flex items-center gap-3">
                                <Rocket className="w-4 h-4 opacity-40" />
                                DOCKER ENGINE
                             </div>
                             {containerRuntime === 'docker' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                          </button>
                          <button 
                            onClick={() => { setContainerRuntime('kubernetes'); setActiveTab('containers'); }}
                            className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-xs font-black transition-colors ${containerRuntime === 'kubernetes' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                             <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 opacity-40" />
                                KUBERNETES CLUSTER
                             </div>
                             {containerRuntime === 'kubernetes' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                          </button>
                       </div>
                    </div>
                 </div>
               );
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  h-9 flex items-center gap-2 px-5 rounded-[0.9rem] text-sm font-black tracking-tight transition-all border
                  ${isActive
                    ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm border-gray-200/50 dark:border-gray-700/50'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
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
              className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${language === 'zh' ? 'bg-white dark:bg-[#1C2128] text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ZH
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${language === 'en' ? 'bg-white dark:bg-[#1C2128] text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-4 text-gray-400 dark:text-gray-600">
            <TemplateManager />
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800" />
            <a
              href="https://github.com/hillzhang/ZeroYAML"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
              title="View on GitHub"
            >
              <GitHubIcon className="w-5 h-5" />
            </a>
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800" />
            <GlobalSettings onOpen={() => setIsSettingsOpen(true)} />
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800" />
            <ThemeSwitch />
          </div>
        </div>
      </header>

      {/* 📦 MAIN VIEWPORT */}
      <main className="h-[calc(100vh-64px)] flex overflow-hidden">
        {/* 左侧：可视化配置层 */}
        <section className={`${activeTab === 'templates' || activeTab === 'containers' ? 'w-full' : 'w-[45%] min-w-[520px]'} bg-white dark:bg-[#0D1117] overflow-y-auto pb-32 transition-all duration-300`}>
          <div className="p-8 max-w-7xl mx-auto">
            {activeTab === 'templates' ? <TemplatesTab /> :
              activeTab === 'compose' ? <ComposeTab /> :
                activeTab === 'dockerfile' ? <DockerfileTab /> :
                  activeTab === 'containers' ? (
                    containerRuntime === 'docker' ? <DockerDashboardTab /> : <KubernetesDashboardTab />
                  ) :
                    <KubernetesTab />}
          </div>
        </section>

        {/* 右侧：代码实时预览层 */}
        {activeTab !== 'templates' && activeTab !== 'containers' && (
          <div className="flex-1 bg-gray-50 dark:bg-[#1E1E1E] flex flex-col">
            <CodeViewer />
          </div>
        )}
      </main>

      {/* 🔮 GLOBAL SETTINGS MODAL (Portaled to root to avoid Header clipping) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl" onClick={() => setIsSettingsOpen(false)} />
          
          <div className="relative bg-white dark:bg-[#1C2128] w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full -mr-16 -mt-16" />
            
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{t.platform.title}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{t.platform.subtitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="group bg-gray-50/50 dark:bg-black/20 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 transition-all hover:border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Rocket className="w-4 h-4 text-blue-500 opacity-60" />
                    <span className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">{t.tabs.containers}</span>
                  </div>
                  
                  <button
                    onClick={() => setIsDashboardEnabled(!isDashboardEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${isDashboardEnabled ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${isDashboardEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
                
                <p className="text-xs font-bold text-gray-400 leading-relaxed mb-4">
                  {t.platform.dashboardDesc}
                </p>

                {isDashboardEnabled ? (
                  <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <CheckSquare className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-black text-blue-600 uppercase">{t.platform.featureActive}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-500/5 rounded-xl border border-gray-100/10">
                    <Square className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-black text-gray-400 uppercase">{t.platform.featureDisabled}</span>
                  </div>
                )}
              </div>

              {/* Environment Info */}
              <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t.platform.environment}</span>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">{t.platform.productionMode}</span>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full mt-10 py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs tracking-[0.2em] shadow-xl transition-all uppercase"
            >
              {t.platform.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
