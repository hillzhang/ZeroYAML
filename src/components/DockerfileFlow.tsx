import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  X, 
  MousePointer2, 
  Layers, 
  Terminal, 
  FileCode, 
  Globe, 
  Zap,
  Box,
  Settings,
  ArrowDown,
  Rocket
} from 'lucide-react';
import { useDockerfileStore } from '../store/useDockerfileStore';
import { useTranslation } from '../hooks/useTranslation';

// --- Custom Nodes ---

const BaseNode = ({ data }: any) => (
  <div className="px-6 py-4 rounded-[2rem] bg-[#0D1117] border border-gray-800 shadow-2xl min-w-[340px] border-l-8 border-l-blue-500 transition-all hover:scale-[1.02] hover:shadow-blue-500/10 group">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
        <Box className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-blue-500/60 tracking-widest text-left">Base Image</p>
        <h3 className="text-base font-black text-white break-all leading-tight text-left tracking-tight">{data.image || 'scratch'}</h3>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-blue-400 !border-gray-900" />
  </div>
);

const StepNode = ({ data }: any) => (
  <div className="px-6 py-5 rounded-[2.2rem] bg-[#0D1117] border border-gray-800 shadow-2xl min-w-[360px] max-w-[500px] border-l-8 border-l-indigo-500 transition-all hover:border-indigo-500/50 group">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
        <Terminal className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-indigo-500/60 tracking-widest text-left mb-2">Build Step / Layer</p>
        <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 font-mono text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap text-left">
          {data.command || 'RUN ...'}
        </div>
      </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-gray-900" />
    <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-gray-900" />
  </div>
);

const ResourceNode = ({ data }: any) => (
  <div className="px-6 py-4 rounded-[2.2rem] bg-[#0D1117] border border-gray-800 shadow-2xl min-w-[360px] max-w-[500px] border-l-8 border-l-emerald-500 transition-all hover:border-emerald-500/50 group">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
        <FileCode className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-2">
           <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest border border-emerald-500/20">
              {data.type || 'COPY'}
           </span>
           <p className="text-xs font-black text-emerald-500/40 tracking-widest leading-none">Instruction</p>
        </div>
        <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2 p-3 bg-emerald-500/[0.02] rounded-2xl border border-emerald-500/10">
          <span className="text-xs font-mono font-bold text-emerald-500 break-all text-right">{data.src}</span>
          <div className="flex justify-center">
             <Rocket className="w-3.5 h-3.5 text-gray-600 rotate-90 shrink-0" />
          </div>
          <span className="text-xs font-mono font-bold text-blue-400 break-all text-left">{data.dest}</span>
        </div>
      </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-emerald-400 !border-gray-900" />
    <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-emerald-400 !border-gray-900" />
  </div>
);

const MetadataNode = ({ data }: any) => (
  <div className="px-5 py-3 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl w-[200px] border-l-4 border-l-purple-500">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
        <Globe className="w-4 h-4" />
      </div>
      <div className="flex-1 overflow-hidden text-left">
        <p className="text-xs font-black text-purple-500/60 tracking-widest text-left">Expose / Env</p>
        <h3 className="text-xs font-black text-gray-300 truncate tracking-wider text-left">{data.label}</h3>
      </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-purple-400 !border-gray-900" />
    <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-purple-400 !border-gray-900" />
  </div>
);

const ArtifactNode = ({ data }: any) => (
  <div className="px-8 py-6 rounded-[2.5rem] bg-indigo-600 border border-indigo-400 shadow-[0_20px_50px_rgba(79,70,229,0.3)] min-w-[360px] max-w-[500px] transition-all hover:scale-[1.05] group">
    <div className="flex items-start gap-5">
      <div className="p-4 rounded-[1.5rem] bg-white/20 text-white shadow-inner group-hover:rotate-12 transition-transform">
        <Zap className="w-8 h-8 fill-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-indigo-100 tracking-widest text-left mb-2 opacity-80 leading-none">Output Entrypoint</p>
        <div className="p-4 bg-black/20 rounded-2xl border border-white/10 font-mono text-sm font-black text-white leading-relaxed break-words whitespace-pre-wrap text-left shadow-inner">
          {data.command || 'CMD ...'}
        </div>
      </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-white !border-gray-900" />
  </div>
);

const nodeTypes = {
  base: BaseNode,
  step: StepNode,
  resource: ResourceNode,
  metadata: MetadataNode,
  artifact: ArtifactNode,
};

// --- Main Component ---

export const DockerfileFlow = ({ onClose }: { onClose: () => void }) => {
  const { baseImage, workdir, runCmds, copyAddItems, port, entrypoint, startCmd } = useDockerfileStore();
  const { t } = useTranslation();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    let currentY = 0;
    const yStep = 180;
    const centerX = 0;

    // 1. Base Image
    initialNodes.push({
      id: 'base',
      type: 'base',
      position: { x: centerX, y: currentY },
      data: { image: baseImage || 'scratch' }
    });
    currentY += yStep;

    // 2. Workdir (Mental Layer)
    if (workdir) {
      initialNodes.push({
        id: 'workdir',
        type: 'step',
        position: { x: centerX, y: currentY },
        data: { command: `WORKDIR ${workdir}` }
      });
      initialEdges.push({
        id: 'e-base-workdir',
        source: 'base',
        target: 'workdir',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 3 }
      });
      currentY += yStep;
    }

    // 3. COPY / ADD Items
    copyAddItems.forEach((item, idx) => {
      const id = `resource-${idx}`;
      initialNodes.push({
        id,
        type: 'resource',
        position: { x: centerX, y: currentY },
        data: { 
          type: item.type, // Pass the actual type (COPY/ADD)
          src: item.src, 
          dest: item.dest 
        }
      });
      
      const prevId = idx === 0 ? (workdir ? 'workdir' : 'base') : `resource-${idx - 1}`;
      initialEdges.push({
        id: `e-res-${idx}`,
        source: prevId,
        target: id,
        style: { stroke: '#10b981', strokeWidth: 2 }
      });
      currentY += yStep;
    });

    // 4. RUN Commands
    runCmds.forEach((cmdStr, idx) => {
      const id = `run-${idx}`;
      initialNodes.push({
        id,
        type: 'step',
        position: { x: centerX, y: currentY },
        data: { command: cmdStr }
      });
      
      const prevId = idx === 0 
        ? (copyAddItems.length > 0 ? `resource-${copyAddItems.length - 1}` : (workdir ? 'workdir' : 'base'))
        : `run-${idx - 1}`;
        
      initialEdges.push({
        id: `e-run-${idx}`,
        source: prevId,
        target: id,
        animated: true,
        style: { stroke: '#818cf8', strokeWidth: 2 }
      });
      currentY += yStep;
    });

    // 5. EXPOSE Ports
    if (port) {
      initialNodes.push({
        id: 'expose',
        type: 'metadata',
        position: { x: centerX, y: currentY },
        data: { label: `PORT ${port}` }
      });
      
      const prevId = runCmds.length > 0 
        ? `run-${runCmds.length - 1}` 
        : (copyAddItems.length > 0 ? `resource-${copyAddItems.length - 1}` : (workdir ? 'workdir' : 'base'));
        
      initialEdges.push({
        id: 'e-meta-expose',
        source: prevId,
        target: 'expose',
        style: { stroke: '#a855f7', strokeWidth: 2 }
      });
      currentY += yStep;
    }

    // 6. Entrypoint / CMD (The Artifact)
    const finalCmd = entrypoint || startCmd;
    if (finalCmd) {
      initialNodes.push({
        id: 'artifact',
        type: 'artifact',
        position: { x: centerX, y: currentY + 30 },
        data: { command: finalCmd }
      });
      
      const prevId = port ? 'expose' : (runCmds.length > 0 ? `run-${runCmds.length - 1}` : 'base');
      initialEdges.push({
        id: 'e-final',
        source: prevId,
        target: 'artifact',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
        style: { stroke: '#6366f1', strokeWidth: 3, opacity: 0.8 }
      });
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [baseImage, workdir, runCmds, copyAddItems, port, entrypoint, startCmd, setNodes, setEdges]);

  return (
    <div className="fixed inset-0 z-[100] bg-black animation-in fade-in duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0,transparent_100%)]" />
      
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-900/80 to-transparent backdrop-blur-sm z-10 flex items-center justify-between px-8">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
               <Layers className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
               <h3 className="text-xl font-black text-white tracking-tighter">{t.preview.buildFlowTitle}</h3>
               <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mt-0.5">
                   <ArrowDown className="w-3 h-3" />
                   <span>IMAGE LAYER PIPELINE</span>
               </div>
            </div>
         </div>
         
         <button 
           onClick={onClose}
           className="p-3 rounded-2xl bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all border border-gray-700 hover:border-red-500/50 group shadow-xl"
         >
           <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
         </button>
      </div>

      <div className="w-screen h-screen">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
          minZoom={0.5}
          maxZoom={2}
        >
          <Background color="#1f2937" gap={20} size={1} />
          <Controls className="!bg-gray-900 !border-gray-800 !fill-white shadow-2xl" />
          
          <Panel position="bottom-right" className="bg-gray-900/80 p-4 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-xl mb-12 mr-8">
             <div className="flex flex-col gap-3">
                <p className="text-xs font-black text-gray-400 tracking-widest border-b border-gray-800 pb-2 mb-1">Build Layers</p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-xs font-black text-gray-400">Base Image</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-xs font-black text-gray-400">Execution (Run)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-xs font-black text-gray-400">Injection (Copy)</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span className="text-xs font-black text-gray-400">Config (Expose)</span>
                </div>
             </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
