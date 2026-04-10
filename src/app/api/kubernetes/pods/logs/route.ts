import { NextRequest, NextResponse } from 'next/server';
import * as k8s from '@kubernetes/client-node';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const podName = searchParams.get('pod');
  const namespace = searchParams.get('namespace') || 'default';
  const container = searchParams.get('container');
  const tail = searchParams.get('tail') || '100';
  
  const kubeconfig = req.headers.get('x-kubeconfig');

  if (!podName) {
    return NextResponse.json({ error: 'Pod name is required' }, { status: 400 });
  }

  try {
    const kc = new k8s.KubeConfig();
    if (kubeconfig) {
      const decodedConfig = Buffer.from(kubeconfig, 'base64').toString();
      kc.loadFromString(decodedConfig);
    } else {
      kc.loadFromDefault();
    }

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    
    const res = await k8sApi.readNamespacedPodLog({
      name: podName,
      namespace: namespace,
      container: container || undefined,
      tailLines: parseInt(tail)
    });

    return new NextResponse(res, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err: any) {
    console.error('Failed to fetch K8s logs:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch logs' }, { status: 500 });
  }
}
