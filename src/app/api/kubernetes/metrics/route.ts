import { NextResponse } from 'next/server';
import * as k8s from '@kubernetes/client-node';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const namespace = searchParams.get('namespace');
  const kubeconfigHeader = request.headers.get('x-kubeconfig');
  
  const kc = new k8s.KubeConfig();
  try {
    if (kubeconfigHeader) {
      const decodedConfig = Buffer.from(kubeconfigHeader, 'base64').toString('utf-8');
      kc.loadFromString(decodedConfig);
      const clusters = kc.clusters;
      if (clusters && clusters.length > 0) {
        clusters.forEach(c => {
          (c as any).skipTLSVerify = true;
        });
      }
    } else {
      kc.loadFromDefault();
    }

    const metricsClient = new k8s.Metrics(kc);
    
    // Fetch metrics for all pods in namespace or all namespaces
    let podMetrics;
    if (namespace) {
      podMetrics = await metricsClient.getPodMetrics(namespace);
    } else {
      podMetrics = await metricsClient.getPodMetrics();
    }

    // Helper to parse CPU/Mem from K8s format (e.g. "100m", "100Mi")
    const parseK8sCpu = (cpuStr: string) => {
      if (cpuStr.endsWith('n')) return parseFloat(cpuStr) / 1000000; // nanocores to millicores
      if (cpuStr.endsWith('u')) return parseFloat(cpuStr) / 1000;    // microcores
      if (cpuStr.endsWith('m')) return parseFloat(cpuStr);           // millicores
      return parseFloat(cpuStr) * 1000;                              // cores to millicores
    };

    const parseK8sMem = (memStr: string) => {
      if (memStr.endsWith('Ki')) return parseFloat(memStr) * 1024;
      if (memStr.endsWith('Mi')) return parseFloat(memStr) * 1024 * 1024;
      if (memStr.endsWith('Gi')) return parseFloat(memStr) * 1024 * 1024 * 1024;
      return parseFloat(memStr);
    };

    if (!podMetrics || !podMetrics.items) {
      return NextResponse.json([]);
    }

    const result = podMetrics.items.map((m: any) => {
      // Metrics per pod usually sum of containers
      let totalCpu = 0;
      let totalMem = 0;
      m.containers.forEach((c: any) => {
        totalCpu += parseK8sCpu(c.usage.cpu);
        totalMem += parseK8sMem(c.usage.memory);
      });

      return {
        name: m.metadata.name,
        namespace: m.metadata.namespace,
        cpu: totalCpu, // in millicores
        memory: totalMem, // in bytes
        timestamp: m.timestamp
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('K8s Metrics Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
