import { NextResponse } from 'next/server';
import * as k8s from '@kubernetes/client-node';

export async function GET(request: Request) {
  const kubeconfigHeader = request.headers.get('x-kubeconfig');
  const namespaceHeader = request.headers.get('x-kubernetes-namespace');
  const kc = new k8s.KubeConfig();

  try {
    if (kubeconfigHeader) {
        const decodedConfig = Buffer.from(kubeconfigHeader, 'base64').toString('utf-8');
        kc.loadFromString(decodedConfig);
        
        // 修正：在 K8s SDK 中安全设置跳过证书验证
        const clusters = kc.clusters;
        if (clusters && clusters.length > 0) {
            clusters.forEach(c => {
                (c as any).skipTLSVerify = true; // 批量强制跳过，防止 read-only 赋值错误
            });
        }
    } else {
        kc.loadFromDefault();
    }

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    
    // 🧠 识别命名空间
    let targetNamespace: string | undefined;
    
    if (namespaceHeader) {
      const decodedNs = Buffer.from(namespaceHeader, 'base64').toString('utf-8').trim();
      if (decodedNs !== '') targetNamespace = decodedNs;
    }
    
    if (!targetNamespace) {
      const currentContext = kc.getCurrentContext();
      const contextObj = kc.getContexts().find(c => c.name === currentContext);
      if (contextObj?.namespace) targetNamespace = contextObj.namespace;
    }

    // 🔍 适配最新 SDK 的调用方式
    let pods;
    try {
        if (targetNamespace) {
            console.log(`Listing pods in namespace: ${targetNamespace}`);
            // 最新 SDK 使用对象参数模式
            const response = await k8sApi.listNamespacedPod({ namespace: targetNamespace });
            pods = response.items;
        } else {
            console.log('Listing pods in all namespaces...');
            const response = await k8sApi.listPodForAllNamespaces();
            pods = response.items;
        }
    } catch (apiError: any) {
        // 如果全集群拉取失败且由于权限原因，尝试降级到 'default'
        if (!targetNamespace) {
            console.log('Permission denied for all namespaces, falling back to "default"');
            const fallbackResponse = await k8sApi.listNamespacedPod({ namespace: 'default' });
            pods = fallbackResponse.items;
        } else {
            throw apiError;
        }
    }
    
    if (!pods) {
        return NextResponse.json({ error: 'Failed to retrieve pods list' }, { status: 403 });
    }
    
    const mappedPods = pods.map((pod: any) => ({
      id: pod.metadata?.uid,
      name: pod.metadata?.name,
      namespace: pod.metadata?.namespace,
      status: pod.status?.phase,
      image: pod.spec?.containers?.[0]?.image || 'Unknown',
      images: pod.spec?.containers?.map((c: any) => c.image) || [],
      node: pod.spec?.nodeName,
      ip: pod.status?.podIP,
      creationTimestamp: pod.metadata?.creationTimestamp,
      restartCount: pod.status?.containerStatuses?.reduce((acc: number, curr: any) => acc + curr.restartCount, 0) || 0,
      labels: pod.metadata?.labels || {}
    }));

    return NextResponse.json(mappedPods);
  } catch (error: any) {
    console.error('Final K8s Sync Error:', error.message);
    const detail = error.response?.body?.message || error.message;
    return NextResponse.json({ error: `Connection failed: ${detail}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const namespace = searchParams.get('namespace') || 'default';
  const kubeconfigHeader = request.headers.get('x-kubeconfig');
  
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const kc = new k8s.KubeConfig();
  try {
    if (kubeconfigHeader) {
      kc.loadFromString(Buffer.from(kubeconfigHeader, 'base64').toString('utf-8'));
    } else {
      kc.loadFromDefault();
    }
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    await k8sApi.deleteNamespacedPod({ name, namespace });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const action = searchParams.get('action'); // e.g., 'restart'
  const namespace = searchParams.get('namespace') || 'default';
  const kubeconfigHeader = request.headers.get('x-kubeconfig');

  if (!name || !action) return NextResponse.json({ error: 'Missing name or action' }, { status: 400 });

  const kc = new k8s.KubeConfig();
  try {
    if (kubeconfigHeader) {
      kc.loadFromString(Buffer.from(kubeconfigHeader, 'base64').toString('utf-8'));
    } else {
      kc.loadFromDefault();
    }
    
    if (action === 'restart') {
      const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
      // Restarting a pod is effectively deleting it in K8s
      await k8sApi.deleteNamespacedPod({ name, namespace });
      return NextResponse.json({ success: true, message: 'Pod deleted for restart' });
    }
    
    return NextResponse.json({ error: 'Action not supported for pods' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
