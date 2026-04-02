"use client";

import Editor from "@monaco-editor/react";
import { useAppStore } from '@/store/useAppStore';
import { useCodeGenerators } from '@/hooks/useCodeGenerators';
import { Code2, Copy, Download, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function CodeViewer() {
  const { activeTab, isFullStack, setIsFullStack, isEditingMode, setIsEditingMode, manualCode, setManualCode } = useAppStore();
  const { dockerfileContent, composeYamlContent, kubernetesYamlContent } = useCodeGenerators();
  const { resolvedTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const generatedCode = activeTab === 'kubernetes' ? kubernetesYamlContent : activeTab === 'compose' ? composeYamlContent : dockerfileContent;
  const displayCode = isEditingMode ? manualCode : generatedCode;

  const handleToggleEdit = () => {
    if (!isEditingMode) {
      setManualCode(generatedCode);
    }
    setIsEditingMode(!isEditingMode);
  };

  const handleReset = () => {
    setManualCode(generatedCode);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (isEditingMode && value !== undefined) {
      setManualCode(value);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const code = isEditingMode ? manualCode : generatedCode;
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
    const code = isEditingMode ? manualCode : generatedCode;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentTitle = activeTab === 'kubernetes' 
    ? (isFullStack ? 'k8s-full-stack.yaml' : 'kubernetes.yaml')
    : (activeTab === 'compose' ? 'docker-compose.yml' : 'Dockerfile');

  return (
    <div className={`flex-1 flex flex-col bg-white dark:bg-[#0D1117] relative border-l border-gray-200 dark:border-gray-800 ${isEditingMode ? 'shadow-[inset_0_0_50px_rgba(59,130,246,0.05)]' : ''}`}>
      {/* Header Toolbar */}
      <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-3 h-16 flex justify-between items-center px-6 relative z-10 shadow-sm transition-all duration-500">
        <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isEditingMode ? 'bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-blue-500'}`} />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 leading-none">{currentTitle}</span>
              {isEditingMode && <span className="text-[8px] font-black text-orange-500 mt-1 uppercase tracking-tighter">MANUAL EDIT ACTIVE</span>}
            </div>
          </div>
          
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800" />

          {activeTab === 'kubernetes' && !isEditingMode && (
            <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-[#0D1117] p-1 rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-inner">
              <button
                onClick={() => setIsFullStack(false)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${!isFullStack ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Current
              </button>
              <button
                onClick={() => setIsFullStack(true)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${isFullStack ? 'bg-white dark:bg-[#1C2128] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Full Spec
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2.5">
          {isEditingMode && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 h-10 transition-all rounded-xl border border-orange-200/50 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 active:scale-95 group"
              title="重置为自动生成代码"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-90deg] transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">重置</span>
            </button>
          )}

          <button 
            onClick={handleToggleEdit}
            className={`flex items-center gap-2 px-5 h-10 transition-all rounded-2xl ${isEditingMode ? 'bg-blue-600 text-white shadow-lg border-blue-500' : 'bg-white dark:bg-[#1C2128] text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-800'}`}
          >
            <Code2 className={`w-3.5 h-3.5 ${isEditingMode ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
               {isEditingMode ? '正在编辑' : '直接修改'}
            </span>
          </button>

          <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 self-center mx-1" />

          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 h-10 transition-all rounded-2xl border ${isCopied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white dark:bg-[#1C2128] hover:bg-gray-50 dark:hover:bg-[#252A31] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 shadow-sm'}`}
          >
            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
               {isCopied ? '已复制' : '复制内容'}
            </span>
          </button>

          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 h-10 bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 transition-all rounded-2xl text-white shadow-xl shadow-blue-500/10 border-gray-800 dark:border-blue-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">导出</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#080B10]">
        {mounted && (
          <div className="w-full h-full animate-in fade-in duration-1000">
            <Editor
              height="100%"
              language={activeTab === 'dockerfile' ? 'dockerfile' : 'yaml'}
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
              value={displayCode}
              onChange={handleEditorChange}
              options={{
                readOnly: !isEditingMode,
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
                renderLineHighlight: isEditingMode ? "all" : "none",
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                }
              }}
            />
          </div>
        )}
        
        {/* Manual Edit Overlay */}
        {isEditingMode && (
          <div className="absolute right-10 bottom-10 p-5 rounded-[2rem] bg-orange-500 text-white shadow-2xl shadow-orange-500/20 animate-bounce pointer-events-none z-20">
            <p className="text-[10px] font-black uppercase tracking-tighter">Manual Override Active</p>
          </div>
        )}
      </div>
    </div>
  );
}
