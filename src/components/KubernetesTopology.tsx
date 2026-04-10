import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  Background,
  Controls,
  Panel,
  Edge,
  Node,
  MarkerType,
  useNodesState,
  useEdgesState,
  Connection,
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  EdgeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Globe, 
  Network, 
  Box, 
  Database, 
  KeyRound, 
  HardDrive, 
  X,
  Zap,
  MousePointer2,
  Settings2
} from 'lucide-react';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { useTranslation } from '@/hooks/useTranslation';

// ── Custom Node Type ────────────────────────────────────────────────────────

const K8sNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const Icon = data.icon || Box;
  const colorClass = data.color || 'blue';
  
  const themes: Record<string, string> = {
    blue: 'border-blue-500/50 bg-blue-50/90 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
    purple: 'border-purple-500/50 bg-purple-50/90 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
    green: 'border-green-500/50 bg-green-50/90 dark:bg-green-900/40 text-green-600 dark:text-green-300',
    orange: 'border-orange-500/50 bg-orange-50/90 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300',
    amber: 'border-amber-500/50 bg-amber-50/90 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
    slate: 'border-slate-500/50 bg-slate-50/90 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300',
  };

  return (
    <div className={`px-4 py-3 rounded-2xl border-2 shadow-xl backdrop-blur-md transition-all duration-300 min-w-[200px] ${themes[colorClass]} ${selected ? 'ring-4 ring-blue-500/20 scale-105' : ''}`}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-blue-400 !border-2 !border-white dark:!border-gray-900 hover:scale-125 transition-transform" />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white dark:bg-black/40 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-black uppercase tracking-widest opacity-60 leading-none mb-1">{data.type}</p>
          <p className="text-sm font-black tracking-tight truncate">{data.name}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-400 !border-2 !border-white dark:!border-gray-900 hover:scale-125 transition-transform" />
    </div>
  );
};

// ── Custom Edge Type ─────────────────────────────────────────────────────────

const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex flex-col items-center gap-1 group"
        >
          {label && (
            <div 
              className="px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg border border-white/10"
              style={{ 
                backgroundColor: labelStyle?.fill as string || '#3b82f6',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              {label}
            </div>
          )}
          <button
            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 active:scale-90"
            onClick={(evt) => {
               evt.stopPropagation();
               window.dispatchEvent(new CustomEvent('delete-edge', { detail: id }));
            }}
          >
            <X className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = {
  k8s: K8sNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

// ── Main Component ────────────────────────────────────────────────────────────

export function KubernetesTopology({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const state = useKubernetesStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [modePicker, setModePicker] = React.useState<{ workId: string; targetId: string; targetName: string; type: 'cm' | 'sec'; } | null>(null);

  const deleteEdgeById = useCallback((edgeId: string) => {
    const parts = edgeId.split(':');
    const action = parts[0];
    if (action === 'ingrule') {
      const [_, ingId, ruleId] = parts;
      state.updateIngressRule(ingId, ruleId, { serviceName: '' });
    } else if (action === 'svclink') {
      const [_, svcId] = parts;
      state.updateService(svcId, { selectorApp: '' });
    } else if (action === 'volmount') {
      const [_, workId, mountId] = parts;
      const work = state.workloads.find(w => w.id === workId);
      if (work) state.removeContainerVol(workId, work.containers[0].id, false, mountId);
    } else if (action === 'envfrom') {
      const [_, workId, idxStr] = parts;
      const work = state.workloads.find(w => w.id === workId);
      if (work) state.removeContainerEnvFrom(workId, work.containers[0].id, false, parseInt(idxStr));
    }
  }, [state]);

  useEffect(() => {
    const handler = (e: any) => deleteEdgeById(e.detail);
    window.addEventListener('delete-edge', handler);
    return () => window.removeEventListener('delete-edge', handler);
  }, [deleteEdgeById]);

  const onConnect = useCallback((params: Connection) => {
    const { source, target } = params;
    if (!source || !target) return;

    if (source.startsWith('ing-') && target.startsWith('svc-')) {
      const ingId = source.replace('ing-', '');
      const svcId = target.replace('svc-', '');
      const svc = state.services.find(s => s.id === svcId);
      const ingress = state.ingresses.find(i => i.id === ingId);
      if (svc && ingress) {
        state.updateIngressRule(ingress.id, ingress.rules[0].id, { serviceName: svc.name });
      }
    } 
    else if (source.startsWith('svc-') && target.startsWith('work-')) {
      const svcId = source.replace('svc-', '');
      const workId = target.replace('work-', '');
      const svc = state.services.find(s => s.id === svcId);
      const work = state.workloads.find(w => w.id === workId);
      if (svc && work) {
        state.updateService(svc.id, { selectorApp: work.appName });
      }
    }
    else if (source.startsWith('work-')) {
      const workId = source.replace('work-', '');
      const work = state.workloads.find(w => w.id === workId);
      const mainContainer = work?.containers[0];
      if (work && mainContainer) {
        if (target.startsWith('pvc-')) {
          const pvc = state.pvcs.find(p => p.id === target.replace('pvc-', ''));
          if (pvc) {
            state.addContainerVol(work.id, mainContainer.id, false);
            const updatedWork = useKubernetesStore.getState().workloads.find(w => w.id === workId);
            const lastVol = updatedWork?.containers[0].volumeMounts.slice(-1)[0];
            if (lastVol) state.updateContainerVol(work.id, mainContainer.id, false, lastVol.id, { name: pvc.name, sourceType: 'pvc', resourceRef: pvc.name });
          }
        } else if (target.startsWith('cm-') || target.startsWith('sec-')) {
          const type = target.startsWith('cm-') ? 'cm' : 'sec';
          const targetId = target.replace(`${type}-`, '');
          const res = type === 'cm' ? state.configMaps.find(m => m.id === targetId) : state.secrets.find(s => s.id === targetId);
          if (res) {
            setModePicker({ workId: work.id, targetId: res.id, targetName: res.name, type });
          }
        }
      }
    }
  }, [state]);

  const handleModeSelect = (mode: 'env' | 'vol') => {
    if (!modePicker) return;
    const { workId, targetName, type } = modePicker;
    const work = state.workloads.find(w => w.id === workId);
    const mainContainer = work?.containers[0];

    if (work && mainContainer) {
      if (mode === 'vol') {
        state.addContainerVol(work.id, mainContainer.id, false);
        const updatedWork = useKubernetesStore.getState().workloads.find(w => w.id === workId);
        const lastVol = updatedWork?.containers[0].volumeMounts.slice(-1)[0];
        if (lastVol) state.updateContainerVol(work.id, mainContainer.id, false, lastVol.id, { name: targetName, sourceType: type === 'cm' ? 'configMap' : 'secret', resourceRef: targetName });
      } else {
        state.addContainerEnvFrom(work.id, mainContainer.id, false);
        state.updateContainerEnvFrom(work.id, mainContainer.id, false, mainContainer.envFrom.length, { type: type === 'cm' ? 'configMap' : 'secret', name: targetName });
      }
    }
    setModePicker(null);
  };

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach(edge => deleteEdgeById(edge.id));
  }, [deleteEdgeById]);

  // Layout Logic
  useEffect(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    
    let x = 0;
    const xOffset = 350;
    const yOffset = 120;

    // Ingresses
    state.ingresses.forEach((ing, i) => {
      const id = `ing-${ing.id}`;
      initialNodes.push({
        id, type: 'k8s', position: { x: 0, y: i * yOffset },
        data: { name: ing.name, type: 'Ingress', icon: Globe, color: 'purple' },
      });
      ing.rules.forEach(rule => {
        const targetSvc = state.services.find(s => s.name === rule.serviceName);
        if (targetSvc) {
          initialEdges.push({
            id: `ingrule:${ing.id}:${rule.id}`, source: id, target: `svc-${targetSvc.id}`,
            animated: true, style: { stroke: '#a855f7', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
          });
        }
      });
    });

    // Services
    x += xOffset;
    state.services.forEach((svc, i) => {
      const id = `svc-${svc.id}`;
      initialNodes.push({
        id, type: 'k8s', position: { x, y: i * yOffset },
        data: { name: svc.name, type: 'Service', icon: Network, color: 'blue' },
      });
      if (svc.selectorApp) {
        const targetWorkload = state.workloads.find(w => w.appName === svc.selectorApp);
        if (targetWorkload) {
          initialEdges.push({
            id: `svclink:${svc.id}`, source: id, target: `work-${targetWorkload.id}`,
            animated: true, style: { stroke: '#3b82f6', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
          });
        }
      }
    });

    // Workloads
    x += xOffset;
    state.workloads.forEach((w, i) => {
      const id = `work-${w.id}`;
      initialNodes.push({
        id, type: 'k8s', position: { x, y: i * yOffset },
        data: { name: w.appName, type: w.workloadType, icon: Box, color: 'green' },
      });
      w.containers.forEach(c => {
        c.volumeMounts.forEach(vol => {
          if (vol.resourceRef) {
            let targetId = ''; let color = '#94a3b8';
            if (vol.sourceType === 'pvc') {
              const pvc = state.pvcs.find(p => p.name === vol.resourceRef);
              if (pvc) targetId = `pvc-${pvc.id}`;
              color = '#f97316';
            } else if (vol.sourceType === 'configMap') {
              const cm = state.configMaps.find(m => m.name === vol.resourceRef);
              if (cm) targetId = `cm-${cm.id}`;
              color = '#eab308';
            } else if (vol.sourceType === 'secret') {
              const sec = state.secrets.find(s => s.name === vol.resourceRef);
              if (sec) targetId = `sec-${sec.id}`;
              color = '#ef4444';
            }
            if (targetId) {
              initialEdges.push({
                id: `volmount:${w.id}:${vol.id}`, source: id, target: targetId,
                label: 'Vol',
                labelStyle: { fill: '#3b82f6' }, // High contrast blue
                style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '6,6', opacity: 0.6 },
              });
            }
          }
        });
        (c.envFrom || []).forEach((ef, idx) => {
          let targetId = '';
          if (ef.type === 'configMap') {
             const cm = state.configMaps.find(m => m.name === ef.name);
             if (cm) targetId = `cm-${cm.id}`;
          } else {
             const sec = state.secrets.find(s => s.name === ef.name);
             if (sec) targetId = `sec-${sec.id}`;
          }
          if (targetId) {
            initialEdges.push({ 
              id: `envfrom:${w.id}:${idx}`, source: id, target: targetId, 
              label: 'Env',
              labelStyle: { fill: '#10b981' }, // High contrast emerald
              style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4,4', opacity: 0.6 } 
            });
          }
        });
      });
    });

    // Storage
    x += xOffset;
    let sY = 0;
    state.pvcs.forEach(pvc => {
      initialNodes.push({ id: `pvc-${pvc.id}`, type: 'k8s', position: { x, y: sY }, data: { name: pvc.name, type: 'PVC', icon: HardDrive, color: 'orange' } });
      sY += yOffset;
    });
    state.configMaps.forEach(cm => {
      initialNodes.push({ id: `cm-${cm.id}`, type: 'k8s', position: { x, y: sY }, data: { name: cm.name, type: 'ConfigMap', icon: Database, color: 'amber' } });
      sY += yOffset;
    });
    state.secrets.forEach(sec => {
      initialNodes.push({ id: `sec-${sec.id}`, type: 'k8s', position: { x, y: sY }, data: { name: sec.name, type: 'Secret', icon: KeyRound, color: 'orange' } });
      sY += yOffset;
    });

    setNodes(initialNodes);
    setEdges(initialEdges.map(e => ({ ...e, type: 'deletable' })));
  }, [state, setNodes, setEdges]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0D1117] animate-in fade-in duration-300 flex flex-col text-white">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-black/40 backdrop-blur-md">
         <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
               <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
               <h2 className="text-xl font-black tracking-tight dark:text-white uppercase leading-tight">{t.k8s.topology}</h2>
               <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  <MousePointer2 className="w-3 h-3" />
                  <span>{t.k8s.topologySub}</span>
               </div>
            </div>
         </div>
         <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 group">
           <X className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
         </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#0D1117]">
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes} edgeTypes={edgeTypes}
          fitView className="bg-[#0D1117]"
        >
          <Background color="#94a3b8" gap={20} size={1} />
          <Controls className="!bg-gray-900 !border-gray-800 !shadow-2xl rounded-xl" />
          <Panel position="top-right" className="bg-gray-900/80 p-4 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-xl">
             <div className="flex flex-col gap-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2 mb-1">Legend</p>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20" /><span className="text-xs font-bold text-gray-400 uppercase">Ingress → Service</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" /><span className="text-xs font-bold text-gray-400 uppercase">Service → Workload</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-500/20" /><span className="text-xs font-bold text-gray-400 uppercase">Workload → Storage</span></div>
             </div>
          </Panel>
        </ReactFlow>

        {modePicker && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 max-w-sm w-full mx-4">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 rounded-2xl bg-blue-500/10"><Settings2 className="w-6 h-6 text-blue-500" /></div>
                 <h3 className="text-lg font-black uppercase tracking-tight dark:text-white">Connection Mode</h3>
               </div>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">How should <span className="text-blue-500 font-black">{modePicker.targetName}</span> be associated with this workload?</p>
               <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => handleModeSelect('env')} className="group flex flex-col items-start p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white rounded-2xl transition-all shadow-sm">
                    <span className="font-black uppercase text-sm mb-1 tracking-wider">Environment Variables</span>
                    <span className="text-xs opacity-70 font-bold group-hover:opacity-100 uppercase">Inject as process environment</span>
                  </button>
                  <button onClick={() => handleModeSelect('vol')} className="group flex flex-col items-start p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white rounded-2xl transition-all shadow-sm">
                    <span className="font-black uppercase text-sm mb-1 tracking-wider">Volume Mount</span>
                    <span className="text-xs opacity-70 font-bold group-hover:opacity-100 uppercase">Mount as file system path</span>
                  </button>
               </div>
               <button onClick={() => setModePicker(null)} className="w-full mt-6 py-2 text-xs font-black uppercase text-gray-400 hover:text-red-500 transition-colors">Cancel Connection</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
