"use client";

import Editor from "@monaco-editor/react";
import { useAppStore } from '@/store/useAppStore';
import { useCodeGenerators } from '@/hooks/useCodeGenerators';
import { useTranslation } from '@/hooks/useTranslation';
import { Code2, Copy, Download, RotateCcw, CheckCircle2, RotateCw, AlertTriangle } from 'lucide-react';
import { useTheme } from "next-themes";
import { useComposeStore } from '@/store/useComposeStore';
import { useDockerfileStore } from '@/store/useDockerfileStore';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { useEffect, useState } from "react";

export function CodeViewer() {
  const { t, language } = useTranslation();
  const { activeTab, isFullStack, setIsFullStack, overrides, setOverrideEnabled, setOverrideEditing, setOverrideCode, resetOverride } = useAppStore();
  const { dockerfileContent, composeYamlContent, kubernetesYamlContent } = useCodeGenerators();
  const composeReset = useComposeStore(s => s.reset);
  const dockerfileReset = useDockerfileStore(s => s.reset);
  const kubernetesReset = useKubernetesStore(s => s.reset);
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);

  useEffect(() => setMounted(true), []);

  const currentOverride = overrides[activeTab];
  const generatedCode = activeTab === 'kubernetes' ? kubernetesYamlContent : activeTab === 'compose' ? composeYamlContent : dockerfileContent;

  // Logic: Show manual code if override is ENABLED. Otherwise show generated code.
  const displayCode = currentOverride.isEnabled ? currentOverride.code : generatedCode;

  const handleStartEdit = () => {
    if (!currentOverride.isEnabled) {
      setOverrideCode(activeTab, generatedCode);
      setOverrideEnabled(activeTab, true);
    }
    setOverrideEditing(activeTab, true);
  };

  const handleStopEdit = () => {
    setOverrideEditing(activeTab, false);
  };

  const handleRestoreAuto = () => {
    const confirmMsg = language === 'zh' 
      ? "确定要恢复自动同步吗？您手动修改的所有内容将会被覆盖消失。" 
      : "Are you sure you want to restore auto-sync? All your manual modifications will be overwritten.";
    
    if (window.confirm(confirmMsg)) {
      setOverrideEnabled(activeTab, false);
      setOverrideEditing(activeTab, false);
    }
  };

  const handleGlobalReset = () => {
    const msg = activeTab === 'dockerfile' 
      ? t.editor.confirmResetDockerfile
      : activeTab === 'compose' 
        ? t.editor.confirmResetCompose 
        : t.editor.confirmResetKubernetes;
    
    if (window.confirm(`${msg}\n${t.editor.resetWarning}`)) {
      if (activeTab === 'dockerfile') dockerfileReset();
      else if (activeTab === 'compose') composeReset();
      else if (activeTab === 'kubernetes') kubernetesReset();
      
      resetOverride(activeTab);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (currentOverride.isEditing && value !== undefined) {
      setSaveStatus('saving');
      setOverrideCode(activeTab, value);

      const timer = setTimeout(() => setSaveStatus('saved'), 400);
      const timer2 = setTimeout(() => setSaveStatus(null), 1800);
      return () => { clearTimeout(timer); clearTimeout(timer2); };
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const code = displayCode;
    let filename = activeTab === 'kubernetes' ? 'k8s-manifest.yaml' : activeTab === 'compose' ? 'docker-compose.yml' : 'Dockerfile';
    if (activeTab === 'kubernetes' && isFullStack) filename = 'k8s-full-stack.yaml';

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const code = displayCode;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentTitle = activeTab === 'kubernetes'
    ? (isFullStack ? 'k8s-full-stack.yaml' : 'kubernetes.yaml')
    : (activeTab === 'compose' ? 'docker-compose.yml' : 'Dockerfile');

  return (
    <div className={`flex-1 flex flex-col bg-white dark:bg-[#0D1117] relative border-l border-gray-200 dark:border-gray-800 ${currentOverride.isEnabled ? 'shadow-[inset_0_0_80px_rgba(59,130,246,0.08)]' : ''}`}>
      {/* Header Toolbar */}
      <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-3 h-16 flex justify-between items-center px-6 relative z-10 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${currentOverride.isEnabled ? 'bg-orange-500 animate-pulse ring-4 ring-orange-500/10' : 'bg-blue-500 ring-4 ring-blue-500/10'}`} />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-none mr-2">{currentTitle}</span>
              {currentOverride.isEnabled && (
                <div className="flex items-center gap-2 mt-2 h-4">
                  <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded-lg bg-orange-600 tracking-normal shadow-sm whitespace-nowrap">{t.common.overrideActive}</span>
                  <span className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-lg bg-red-600 tracking-normal shadow-xl flex items-center gap-2 animate-pulse whitespace-nowrap border border-red-500/50">
                    <AlertTriangle className="w-3 h-3 text-red-100" />
                    {language === 'zh' ? "恢复即清空手动修改" : "Restore will clear manual changes"}
                  </span>
                  {saveStatus && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition-opacity duration-300 ${saveStatus === 'saving' ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                      {saveStatus === 'saving' ? t.common.saving : t.common.saved}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800" />

          {activeTab === 'kubernetes' && !currentOverride.isEnabled && (
            <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-[#0D1117] p-1 rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-inner">
              <button
                onClick={() => setIsFullStack(false)}
                className={`px-4 py-1.5 text-[12px] font-bold tracking-tight rounded-lg transition-all ${!isFullStack ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Current
              </button>
              <button
                onClick={() => setIsFullStack(true)}
                className={`px-4 py-1.5 text-[10px] font-bold tracking-tight rounded-lg transition-all ${isFullStack ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Full Spec
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2.5">
          {currentOverride.isEnabled && (
            <button
              onClick={handleRestoreAuto}
              className="flex items-center gap-2 px-4 h-10 transition-all rounded-xl border border-blue-200/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 active:scale-95 group"
              title={t.common.restoreAuto}
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-90deg] transition-transform" />
              <span className="text-[12px] font-bold tracking-tight">{t.common.restoreAuto}</span>
            </button>
          )}

          <button
            onClick={currentOverride.isEditing ? handleStopEdit : handleStartEdit}
            className={`flex items-center gap-2 px-5 h-10 transition-all rounded-2xl ${currentOverride.isEditing ? 'bg-blue-600 text-white shadow-lg border-blue-500' : 'bg-white dark:bg-[#1C2128] text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-800 shadow-sm'}`}
            title={currentOverride.isEditing ? t.common.finishEdit : t.common.manualEdit}
          >
            <Code2 className={`w-3.5 h-3.5 ${currentOverride.isEditing ? 'animate-pulse' : ''}`} />
            <span className="text-[12px] font-bold tracking-tight leading-none">
              {currentOverride.isEditing ? t.common.finishEdit : t.common.manualEdit}
            </span>
          </button>

          <button
            onClick={handleGlobalReset}
            className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-[#1C2128] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm transition-all active:scale-95 group"
            title={t.common.newClear}
          >
            <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[12px] font-bold tracking-tight leading-none">{t.common.newClear}</span>
          </button>

          <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 self-center mx-1" />

          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 h-10 transition-all rounded-2xl border ${isCopied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white dark:bg-[#1C2128] hover:bg-gray-50 dark:hover:bg-[#252A31] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 shadow-sm'}`}
          >
            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[12px] font-bold tracking-tight leading-none">
              {isCopied ? t.common.copied : t.common.copyContent}
            </span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 h-10 bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 transition-all rounded-2xl text-white shadow-xl shadow-blue-500/10 border-gray-800 dark:border-blue-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[12px] font-bold tracking-tight leading-none">{t.common.export}</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#080B10]">
        <div key={activeTab} className="w-full h-full animate-in fade-in duration-500">
          {mounted && (
            <Editor
              height="100%"
              language={activeTab === 'dockerfile' ? 'dockerfile' : 'yaml'}
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
              value={displayCode}
              onChange={handleEditorChange}
              options={{
                readOnly: !currentOverride.isEditing,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 28,
                padding: { top: 30, bottom: 100 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                selectionHighlight: true,
                renderLineHighlight: currentOverride.isEditing ? "all" : "none",
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                }
              }}
            />
          )}
        </div>

        {/* Manual Edit Overlay */}
        {currentOverride.isEditing && (
          <div className="absolute right-10 bottom-10 p-5 rounded-[2rem] bg-orange-500 text-white shadow-2xl shadow-orange-500/20 animate-bounce pointer-events-none z-20">
            <p className="text-[10px] font-bold tracking-tight">Editing...</p>
          </div>
        )}
      </div>
    </div>
  );
}
