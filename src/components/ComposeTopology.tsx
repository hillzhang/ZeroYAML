"use client";

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
  Connection,
  Edge,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Box, Zap, HardDrive, Trash2, MousePointer2, Settings2, 
  X, ExternalLink, Database, Link, ArrowRight, Layers 
} from 'lucide-react';
import { useComposeStore, ComposeService } from '@/store/useComposeStore';
import { useTranslation } from '@/hooks/useTranslation';

// --- Custom Edge with Deletion ---
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
  data,
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="group"
        >
          {label && (
            <div 
              className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg border border-white/10"
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
            onClick={onEdgeClick}
            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// --- Custom Node Components ---
const ServiceNode = ({ data }: any) => (
  <div className="group relative">
    <div className={`
      px-6 py-4 rounded-3xl border-2 shadow-2xl transition-all duration-500
      ${data.active ? 'bg-indigo-600 border-indigo-400 scale-105' : 'bg-gray-900 border-gray-800 hover:border-indigo-500/50'}
      w-[280px] backdrop-blur-xl
    `}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${data.active ? 'bg-white/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
          <Box className={`w-5 h-5 ${data.active ? 'text-white' : 'text-indigo-400'}`} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 mb-0.5">{data.t.compose.serviceNode}</p>
          <h3 className="font-black text-white text-[15px] break-all leading-tight tracking-tight">{data.label}</h3>
        </div>
      </div>
      
      {data.image && (
        <div className="mt-3 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5 flex items-center gap-2">
           <Layers className="w-3 h-3 text-gray-600" />
           <span className="text-[10px] font-mono text-gray-500 break-all leading-tight">{data.image}</span>
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-gray-900" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-gray-900" />
    </div>
  </div>
);

const ExternalNode = ({ data }: any) => (
  <div className="px-5 py-3 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl w-[200px] flex items-center gap-3 border-l-4 border-l-purple-500">
    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
      <ExternalLink className="w-4 h-4" />
    </div>
    <div className="flex-1 overflow-hidden">
       <p className="text-[9px] font-black text-purple-500/60 uppercase">{data.t.compose.portNode}</p>
       <h3 className="text-[11px] font-black text-gray-300 break-all leading-tight tracking-wider">{data.label}</h3>
    </div>
    <Handle type="source" position={Position.Bottom} className="!opacity-0" />
  </div>
);

const VolumeNode = ({ data }: any) => (
  <div className="px-5 py-3 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl w-[220px] flex items-center gap-3 border-l-4 border-l-orange-500">
    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
      <Database className="w-4 h-4" />
    </div>
    <div className="flex-1 overflow-hidden">
       <p className="text-[9px] font-black text-orange-500/60 uppercase">{data.t.compose.storageNode}</p>
       <h3 className="text-[11px] font-black text-gray-300 break-all leading-tight tracking-wider">{data.label}</h3>
    </div>
    <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-orange-400 !border-2 !border-gray-900" />
  </div>
);

const nodeTypes = {
  service: ServiceNode,
  external: ExternalNode,
  volume: VolumeNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

export function ComposeTopology({ onClose }: { onClose: () => void }) {
  const { composeServices, setComposeServices, activeSvcId, networkName } = useComposeStore();
  const { t } = useTranslation();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync state to graph
  useEffect(() => {
    const initialNodes: any[] = [];
    const initialEdges: any[] = [];
    
    // --- Vertical Layout Setup ---
    const svcXStep = 300;
    const layerYStep = 250;
    
    // 1. Service Nodes (Center Layer)
    composeServices.forEach((svc, idx) => {
      const id = `svc-${svc.id}`;
      initialNodes.push({
        id,
        type: 'service',
        position: { x: idx * svcXStep, y: 150 },
        data: { 
          label: svc.name, 
          image: svc.buildMode === 'image' ? svc.image : t.compose.buildContext,
          active: svc.id === activeSvcId,
          t
        },
      });

      // DependsOn Edges (Service -> Service)
      (svc.dependsOn || []).forEach(depId => {
        initialEdges.push({
          id: `dep:${svc.id}:${depId}`,
          source: id,
          target: `svc-${depId}`,
          label: t.compose.dependencyLine,
          labelStyle: { fill: '#ef4444' }, // Red for dependency
          style: { stroke: '#ef4444', strokeWidth: 2, opacity: 0.6 },
          type: 'deletable',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
        });
      });

      // Port Edges (Net/Outer -> Service) - Inverted to match K8s traffic flow
      svc.ports.forEach((p, pIdx) => {
         const portId = `port-${svc.id}-${pIdx}`;
         const portNodeId = `port-node-${svc.id}-${pIdx}`;
         
         initialNodes.push({
            id: portNodeId,
            type: 'external',
            position: { x: idx * svcXStep + 20, y: 0 },
            data: { label: `${p.host}:${p.container}`, t },
         });

         initialEdges.push({
            id: portId,
            source: portNodeId,
            target: id,
            label: t.compose.portNode,
            labelStyle: { fill: '#a855f7' }, // Purple 500
            style: { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.6 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
         });
      });

      // Volume Edges (Service -> Vol)
      svc.vols.forEach((v, vIdx) => {
         const volNodeId = `vol-${svc.id}-${vIdx}`;
         initialNodes.push({
            id: volNodeId,
            type: 'volume',
            position: { x: idx * svcXStep, y: 150 + layerYStep },
            data: { label: v.host || 'anonymous', t },
         });

         initialEdges.push({
            id: `mount:${svc.id}:${vIdx}`,
            source: id,
            target: volNodeId,
            label: t.common.volumes,
            labelStyle: { fill: '#3b82f6' }, // Blue
            style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '4,4', opacity: 0.6 },
         });
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges.map(e => ({ ...e, type: e.type || 'deletable', data: { onDelete: (id: string) => handleEdgeDelete(id) } })));
  }, [composeServices, activeSvcId]);

  const handleEdgeDelete = useCallback((edgeId: string) => {
    // Determine edge type
    if (edgeId.startsWith('dep:')) {
      const [_, sourceId, targetId] = edgeId.split(':');
      setComposeServices(prev => prev.map(s => 
        s.id === sourceId ? { ...s, dependsOn: (s.dependsOn || []).filter(id => id !== targetId) } : s
      ));
    }
    // Ports and Volumes are currently inline per service, deletion from topology for those 
    // would need a more complex strategy if we want to remove them from the array.
    // For now, let's focus on dependency management.
  }, [setComposeServices]);

  const onConnect = useCallback((params: Connection) => {
    const { source, target } = params;
    if (!source || !target) return;

    // Only allow Service -> Service connections (Dependencies)
    if (source.startsWith('svc-') && target.startsWith('svc-')) {
       const sourceId = source.replace('svc-', '');
       const targetId = target.replace('svc-', '');
       
       if (sourceId === targetId) return;

       setComposeServices(prev => prev.map(s => {
          if (s.id === sourceId) {
             const deps = s.dependsOn || [];
             if (!deps.includes(targetId)) {
                return { ...s, dependsOn: [...deps, targetId] };
             }
          }
          return s;
       }));
    }
  }, [setComposeServices]);

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach(edge => handleEdgeDelete(edge.id));
  }, [handleEdgeDelete]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0D1117] animate-in fade-in duration-300 flex flex-col text-white">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-black/40 backdrop-blur-md">
         <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
               <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
               <h2 className="text-xl font-black tracking-tight leading-tight">{t.compose.topologyTitle}</h2>
               <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  <MousePointer2 className="w-3 h-3" />
                  <span>{t.compose.topologySub}</span>
               </div>
            </div>
         </div>
         <button 
           onClick={onClose}
           className="p-3 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10"
         >
            <X className="w-6 h-6" />
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
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-gray-900 !border-gray-800 !shadow-2xl rounded-xl" />
          
          <Panel position="top-right" className="bg-gray-900/80 p-4 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-xl">
             <div className="flex flex-col gap-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2 mb-1">{t.compose.topologyLegend}</p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20" />
                  <span className="text-xs font-bold text-gray-400">{t.compose.portNode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                  <span className="text-xs font-bold text-gray-400">{t.compose.serviceNode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                  <span className="text-xs font-bold text-gray-400">{t.common.volumes}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                  <span className="text-xs font-bold text-gray-400">{t.compose.depends}</span>
                </div>
             </div>
          </Panel>

          <Panel position="bottom-center" className="bg-blue-600/10 border border-blue-500/20 p-2 px-4 rounded-full backdrop-blur-md mb-4 group hover:bg-blue-600/20 transition-all cursor-default">
             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Settings2 className="w-3 h-3 animate-spin-slow" />
                {t.compose.topologyDragHint}
             </p>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
