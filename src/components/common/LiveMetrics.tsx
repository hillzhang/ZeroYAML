import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useAppStore';

interface LiveMetricsProps {
  type: 'docker' | 'kubernetes';
  id: string; // containerId or podName
  namespace?: string;
  interval?: number;
}

export function LiveMetrics({ type, id, namespace, interval = 3000 }: LiveMetricsProps) {
  const [data, setData] = useState<{cpu: number, memory: number}[]>([]);
  const [current, setCurrent] = useState<{cpu: number, memory: number} | null>(null);
  const { t } = useTranslation();
  const { kubeconfig, dockerSocket } = useAppStore();

  useEffect(() => {
    let timer: any;
    
    const fetchMetrics = async () => {
      try {
        const isDocker = type === 'docker';
        const url = isDocker 
          ? `/api/containers/stats?id=${id}` 
          : `/api/kubernetes/metrics?namespace=${namespace || 'default'}`;
        
        // Always get fresh values from store to avoid dependency array length issues
        const store = useAppStore.getState();
        const currentKubeconfig = store.kubeconfig;
        const currentDockerSocket = store.dockerSocket;

        const headers: Record<string, string> = {};
        const safeB64 = (str: string) => {
          try {
            return btoa(unescape(encodeURIComponent(str || '')));
          } catch (e) {
            return "";
          }
        };

        if (isDocker && currentDockerSocket) headers['x-docker-socket'] = safeB64(currentDockerSocket);
        if (!isDocker && currentKubeconfig) headers['x-kubeconfig'] = safeB64(currentKubeconfig);

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const stats = await res.json();
        if (stats.error) throw new Error(stats.error);
        
        let point = { cpu: 0, memory: 0 };
        
        if (isDocker) {
          point = { cpu: stats.cpu || 0, memory: stats.memory || 0 };
        } else {
          const podStat = Array.isArray(stats) ? stats.find((m: any) => m.name === id) : null;
          if (podStat) {
            point = { cpu: podStat.cpu, memory: podStat.memory };
          }
        }
        
        setCurrent(point);
        setData(prev => {
          const next = [...prev, point];
          return next.slice(-20);
        });
      } catch (err) {
        console.warn('Metrics skip:', err);
      }
    };

    fetchMetrics();
    timer = setInterval(fetchMetrics, interval);
    return () => clearInterval(timer);
  }, [type, id, namespace, interval]);

  const renderSparkline = (values: number[], color: string, sparkId: string) => {
    if (values.length < 2) return <div className="w-24 h-8 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || (max > 0 ? max * 0.1 : 1);
    const width = 100;
    const height = 32;
    
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height * 0.9 - ((v - min) / range) * (height * 0.8);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible" preserveAspectRatio="none font-mono">
        <defs>
          <linearGradient id={`grad-${sparkId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#grad-${sparkId})`}
          d={`M 0,${height} L ${points} L ${width},${height} Z`}
          className="transition-all duration-700 ease-in-out"
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          className="transition-all duration-700 ease-in-out drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
        />
      </svg>
    );
  };

  if (!current) {
    return (
      <div className="flex items-center gap-6 p-2">
         <div className="w-24 h-10 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
         <div className="w-24 h-10 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-10 px-5 py-3 bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm group/metrics">
      <div className="flex flex-col gap-1.5 items-center mr-1">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
         <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tracking-[0.2em]">{t.metrics.live}</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between min-w-[100px]">
          <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 opacity-80">{t.metrics.cpu}</span>
          <span className="text-sm font-black text-gray-800 dark:text-white font-mono tabular-nums">
            {current.cpu.toFixed(current.cpu < 10 ? 2 : 1)}{type === 'docker' ? '%' : 'm'}
          </span>
        </div>
        {renderSparkline(data.map(d => d.cpu), '#3B82F6', `cpu-${id}`)}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between min-w-[100px]">
          <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 opacity-80">{t.metrics.memory}</span>
          <span className="text-sm font-black text-gray-800 dark:text-white font-mono tabular-nums">
            {type === 'docker' ? `${current.memory.toFixed(current.memory < 10 ? 2 : 1)}%` : 
             current.memory > 1024 * 1024 * 1024 ? `${(current.memory / 1024 / 1024 / 1024).toFixed(1)}G` : 
             `${(current.memory / 1024 / 1024).toFixed(1)}M`}
          </span>
        </div>
        {renderSparkline(data.map(d => d.memory), '#10B981', `mem-${id}`)}
      </div>
    </div>
  );
}
