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
        const clusters = kc.clusters;
        if (clusters && clusters.length > 0) {
            clusters.forEach(c => { (c as any).skipTLSVerify = true; });
        }
    } else {
        kc.loadFromDefault();
    }

    const k8sApi = kc.makeApiClient(k8s.AppsV1Api); // 注意这里用的是 AppsV1Api
    
    // 识别命名空间
    let ns = 'default';
    if (namespaceHeader) {
      ns = Buffer.from(namespaceHeader, 'base64').toString('utf-8').trim() || 'default';
    }

    const response = await k8sApi.listNamespacedDeployment({ namespace: ns });
    const items = response.items.map((deploy: any) => ({
      id: deploy.metadata?.uid,
      name: deploy.metadata?.name,
      namespace: deploy.metadata?.namespace,
      readyReplicas: deploy.status?.readyReplicas || 0,
      replicas: deploy.status?.replicas || 0,
      updatedReplicas: deploy.status?.updatedReplicas || 0,
      availableReplicas: deploy.status?.availableReplicas || 0,
      image: deploy.spec?.template?.spec?.containers?.[0]?.image || 'Unknown',
      creationTimestamp: deploy.metadata?.creationTimestamp,
      labels: deploy.metadata?.labels || {}
    }));

    return NextResponse.json(items);
  } catch (error: any) {
    const detail = error.response?.body?.message || error.message;
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
