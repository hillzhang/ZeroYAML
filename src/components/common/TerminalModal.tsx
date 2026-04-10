"use client";

import { useState, useRef, useEffect } from 'react';
import { Terminal, X, RefreshCw, Send, Trash2, ChevronRight, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useAppStore';

interface HistoryItem {
  command: string;
  output: string;
  error?: string;
  timestamp: Date;
}

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'k8s' | 'docker';
}

const K8S_KEYWORDS = [
  'kubectl', 'get', 'describe', 'logs', 'delete', 'apply', 'edit', 'exec', 'port-forward', 'rollout', 'explain', 'create', 'run', 'expose', 'label', 'annotate', 'top', 'rollout', 'scale', 'autoscale', 'certificate', 'cluster-info', 'cordon', 'uncordon', 'drain', 'taint',
  'pods', 'deployments', 'services', 'configmaps', 'secrets', 'namespaces', 'nodes', 'persistentvolumeclaims', 'ingresses', 'statefulsets', 'daemonsets', 'cronjobs', 'jobs', 'events', 'endpoints', 'replicasets', 'resourcequotas', 'limitranges',
  'all', 'svc', 'po', 'deploy', 'cm', 'pvc', 'ns', 'no', 'ing', 'sts', 'ds', 'cj', 'rs'
];

const DOCKER_KEYWORDS = [
  'docker', 'ps', 'images', 'run', 'stop', 'start', 'restart', 'rm', 'rmi', 'logs', 'inspect', 'exec', 'build', 'pull', 'push', 'network', 'volume', 'stats', 'top', 'cp', 'diff', 'events', 'history', 'kill', 'load', 'pause', 'port', 'rename', 'save', 'search', 'tag', 'unpause', 'update', 'wait'
];

export function TerminalModal({ isOpen, onClose, type }: TerminalModalProps) {
  const { t } = useTranslation();
  const kt = t.k8sDashboard.terminal;
  const { kubeconfig, dockerSocket } = useAppStore();
  
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [executing, setExecuting] = useState(false);
  const [status, setStatus] = useState<'ready' | 'connecting' | 'error'>('ready');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalTheme, setTerminalTheme] = useState<'dark' | 'light'>('dark');
  
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (instant = false) => {
    outputEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
  };

  const lastHistoryLength = useRef(history.length);

  useEffect(() => {
    if (isOpen) {
      const isNewContent = history.length > lastHistoryLength.current;
      // Small timeout to ensure the DOM has calculated its height
      const timer = setTimeout(() => {
        scrollToBottom(!isNewContent);
        lastHistoryLength.current = history.length;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [history, isOpen]);

  useEffect(() => {
    const trimmed = command.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const parts = command.trimEnd().split(' ');
    const lastWord = command.split(' ').pop() || '';
    const isTrailingSpace = command.endsWith(' ');
    
    // Commands that usually followed by resources (K8s) or images/containers (Docker)
    const k8sResourceCmds = ['get', 'describe', 'delete', 'edit', 'logs', 'explain', 'top', 'scale', 'expose'];
    const dockerResourceCmds = ['logs', 'inspect', 'exec', 'stop', 'start', 'restart', 'rm', 'rmi', 'history', 'stats', 'top', 'pause', 'unpause', 'wait'];
    
    const resourceCommands = type === 'k8s' ? k8sResourceCmds : dockerResourceCmds;
    const prevWord = parts[parts.length - (isTrailingSpace ? 1 : 2)]?.toLowerCase() || '';
    const shouldShowResources = resourceCommands.includes(prevWord);

    const K8S_RESOURCES = ['pods', 'deployments', 'services', 'configmaps', 'secrets', 'namespaces', 'nodes', 'pvc', 'ingresses', 'statefulsets', 'daemonsets', 'cronjobs', 'events', 'endpoints', 'rs'];
    
    let matches: string[] = [];

    if (isTrailingSpace && shouldShowResources && type === 'k8s') {
      matches = K8S_RESOURCES;
    } else if (lastWord.length >= 1) {
      const candidates = type === 'k8s' 
        ? (shouldShowResources ? K8S_RESOURCES : K8S_KEYWORDS)
        : DOCKER_KEYWORDS;
        
      matches = candidates.filter(k => 
        k.startsWith(lastWord.toLowerCase()) && 
        k.toLowerCase() !== lastWord.toLowerCase()
      );
    }

    setSuggestions(matches);
    setSelectedSuggestionIndex(0);
  }, [command, type]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        applySuggestion(suggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (commandHistory.length > 0) {
        e.preventDefault();
        const nextIndex = historyIndex - 1;
        if (nextIndex >= -1) {
          setHistoryIndex(nextIndex);
          setCommand(nextIndex === -1 ? '' : commandHistory[nextIndex]);
        }
      }
    } else if (e.key === 'ArrowUp') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (commandHistory.length > 0) {
        e.preventDefault();
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setCommand(commandHistory[nextIndex]);
        }
      }
    }
  };

  const applySuggestion = (sug: string) => {
    const parts = command.split(' ');
    parts[parts.length - 1] = sug;
    setCommand(parts.join(' ') + ' ');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const runCommand = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!command.trim() || executing) return;

    const cmdToRun = command.trim();

    // Support local 'history' command
    if (cmdToRun.toLowerCase() === 'history') {
      const historyOutput = commandHistory
        .map((cmd, i) => `${commandHistory.length - i}  ${cmd}`)
        .reverse()
        .join('\n');
      
      setHistory(prev => [...prev, {
        command: cmdToRun,
        output: historyOutput || 'No history recorded yet.',
        timestamp: new Date()
      }]);
      setCommand('');
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    const baseCmd = type === 'k8s' ? 'kubectl' : 'docker';
    const fullCommand = cmdToRun.startsWith(baseCmd) ? cmdToRun : `${baseCmd} ${cmdToRun}`;
    
    // Add to command history
    setCommandHistory(prev => [cmdToRun, ...prev.filter(c => c !== cmdToRun)].slice(0, 50));
    setHistoryIndex(-1);

    setExecuting(true);
    setStatus('connecting');
    setCommand(''); 
    setSuggestions([]);

    try {
      const apiPath = type === 'k8s' ? '/api/kubernetes/terminal' : '/api/docker/terminal';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (type === 'k8s') {
        headers['x-kubeconfig'] = btoa(unescape(encodeURIComponent(kubeconfig || '')));
      } else {
        headers['x-docker-socket'] = btoa(dockerSocket || '');
      }

      const res = await fetch(apiPath, {
        method: 'POST',
        headers,
        body: JSON.stringify({ command: fullCommand }),
      });

      const data = await res.json();
      
      const newHistoryItem: HistoryItem = {
        command: fullCommand,
        output: data.stdout || '',
        error: data.stderr || data.error || '',
        timestamp: new Date()
      };

      setHistory(prev => [...prev, newHistoryItem]);
      setStatus(data.error || data.stderr ? 'error' : 'ready');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setHistory(prev => [...prev, {
        command: fullCommand,
        output: '',
        error: errorMessage,
        timestamp: new Date()
      }]);
      setStatus('error');
    } finally {
      setExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setStatus('ready');
  };

  const isDark = terminalTheme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-10">
      <div className={`fixed inset-0 backdrop-blur-xl transition-colors duration-500 ${isDark ? 'bg-black/70' : 'bg-gray-400/30'}`} onClick={onClose} />
      
      <div className={`relative w-full max-w-5xl h-[85vh] rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] border overflow-hidden flex flex-col transition-all duration-500 ${
        isDark ? 'bg-[#0D1117] border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Terminal Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-500 ${isDark ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-lg transition-all duration-500 ${
              isDark ? 'bg-blue-600 shadow-blue-500/20' : 'bg-blue-500 shadow-blue-500/10'
            }`}>
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className={`text-sm font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>{type === 'k8s' ? 'Kubernetes terminal' : 'Docker terminal'}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'ready' ? 'bg-emerald-500' : status === 'connecting' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-xs font-bold transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {status === 'ready' ? kt.ready : status === 'connecting' ? kt.connecting : kt.error}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTerminalTheme(isDark ? 'light' : 'dark')}
              className={`p-3 rounded-2xl transition-all active:scale-95 border ${
                isDark 
                ? 'bg-white/5 border-white/10 text-gray-400 hover:text-yellow-400 hover:bg-white/10' 
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-white shadow-sm'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <Zap className={`w-4 h-4 ${isDark ? 'fill-yellow-400/20' : ''}`} />
            </button>
            <button 
              onClick={clearHistory}
              className={`p-3 rounded-2xl transition-all active:scale-95 border ${
                isDark 
                ? 'bg-white/5 border-white/10 text-gray-400 hover:text-red-400 hover:bg-white/10' 
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-red-500 hover:bg-white shadow-sm'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className={`p-3 rounded-2xl transition-all active:scale-95 border ${
                isDark 
                ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' 
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div className={`flex-1 overflow-auto p-6 md:p-8 font-mono text-sm leading-relaxed transition-colors duration-500 scrollbar-thin ${
          isDark ? 'bg-[#090C10] text-gray-300 scrollbar-thumb-white/10' : 'bg-white text-gray-800 scrollbar-thumb-gray-200'
        }`}>
          {history.length === 0 && (
            <div className={`h-full flex flex-col items-center justify-center opacity-20 select-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Terminal className="w-20 h-20 mb-4" />
              <p className="text-sm font-black">{type === 'k8s' ? 'Kubectl Interactive Shell' : 'Docker Interactive Shell'}</p>
              <p className="text-xs mt-2">Enter commands to interact with your {type === 'k8s' ? 'cluster' : 'engine'}</p>
            </div>
          )}
          
          <div className="space-y-8">
            {history.map((item, idx) => (
              <div key={idx} className="animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-3 mb-3 text-left">
                  <ChevronRight className="w-4 h-4 text-emerald-500 font-black" />
                  <span className={`opacity-50 text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>[{item.timestamp.toLocaleTimeString()}]</span>
                  <span className={`px-2 py-0.5 rounded-lg border font-bold ${
                    isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/90' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>{item.command}</span>
                </div>
                {item.output && (
                  <pre className={`p-5 rounded-2xl whitespace-pre-wrap break-all border transition-all duration-300 shadow-inner ${
                    isDark 
                    ? 'bg-white/[0.03] border-white/5 text-emerald-400/90' 
                    : 'bg-gray-50 border-gray-100 text-gray-800'
                  }`}>
                    {item.output}
                  </pre>
                )}
                {item.error && (
                  <pre className={`p-5 rounded-2xl whitespace-pre-wrap break-all border transition-all duration-300 shadow-inner ${
                    isDark 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-red-50 border-red-100 text-red-600'
                  }`}>
                    {item.error}
                  </pre>
                )}
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>
        </div>

        {/* Command Input Area */}
        <div className={`p-6 md:p-8 relative border-t transition-colors duration-500 ${
          isDark ? 'bg-black/60 border-white/5' : 'bg-gray-50 border-gray-100'
        }`}>
          {/* Terminal Suggestions */}
          {suggestions.length > 0 && (
            <div className={`absolute bottom-[calc(100%+12px)] left-6 right-6 backdrop-blur-2xl border rounded-3xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-[200] transition-colors duration-500 ${
              isDark ? 'bg-[#0D1117]/95 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.7)]' : 'bg-white/95 border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)]'
            }`}>
              <div className="max-h-48 overflow-y-auto scrollbar-none space-y-1 text-left">
                {suggestions.map((sug, i) => (
                  <button
                    key={sug}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySuggestion(sug);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between group/sug ${
                      i === selectedSuggestionIndex 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                       <span className={`text-xs ${i === selectedSuggestionIndex ? 'text-white' : 'text-blue-500 opacity-40'}`}>➜</span>
                       <span className="font-bold">{sug}</span>
                    </div>
                    {i === selectedSuggestionIndex && (
                      <span className={`text-xs border px-1.5 py-0.5 rounded-md font-black ${
                        isDark ? 'bg-black/20 border-white/20' : 'bg-white/20 border-gray-300'
                      }`}>Tab</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={runCommand} className="relative group">
            <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 ${
              isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'
            }`} />
            <div className="relative flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 flex items-center gap-2 pointer-events-none">
                  <span className="text-blue-500 font-bold">$</span>
                </div>
                <input 
                  type="text" 
                  ref={inputRef}
                  autoFocus
                  autoComplete="off"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={kt.inputPlaceholder.replace('{cmd}', type === 'k8s' ? 'kubectl' : 'docker')}
                  disabled={executing}
                  className={`w-full rounded-[2rem] py-5 pl-12 pr-6 text-sm font-mono border transition-all disabled:opacity-50 outline-none ${
                    isDark 
                    ? 'bg-[#0D1117] border-white/10 text-gray-200 focus:border-blue-500/50 shadow-inner' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 shadow-sm'
                  }`}
                />
              </div>
              <button 
                type="submit"
                disabled={executing || !command.trim()}
                className={`px-8 py-5 rounded-[2rem] font-black text-xs transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                  executing ? (isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400') : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                }`}
              >
                {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {executing ? kt.connecting : kt.run}
              </button>
            </div>
          </form>
          
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`} />
              <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Fast access:</span>
            </div>
            {(type === 'k8s' 
              ? ['get pods', 'get svc', 'get nodes', 'describe pod', 'logs --tail=20']
              : ['ps', 'images', 'stats', 'logs', 'inspect', 'network ls', 'volume ls']
            ).map(fastCmd => (
              <button 
                key={fastCmd} 
                type="button" 
                onClick={() => { 
                  const prefix = type === 'k8s' ? 'kubectl' : 'docker';
                  setCommand(`${prefix} ${fastCmd}`); 
                  inputRef.current?.focus(); 
                }} 
                className={`text-xs font-black px-2.5 py-1 rounded-lg border transition-all ${
                  isDark 
                  ? 'text-gray-400 hover:text-emerald-400 bg-white/5 border-white/5 hover:border-emerald-500/30' 
                  : 'text-gray-500 hover:text-blue-600 bg-gray-100 border-gray-200 hover:border-blue-500/30 shadow-sm'
                }`}
              >
                {fastCmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
