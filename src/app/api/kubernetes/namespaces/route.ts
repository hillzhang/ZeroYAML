import { NextResponse } from 'next/server';
import * as k8s from '@kubernetes/client-node';

export async function GET(request: Request) {
  const kubeconfigHeader = request.headers.get('x-kubeconfig');
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

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    
    try {
        const response = await k8sApi.listNamespace();
        const namespaces = response.items.map((ns: any) => ({
            name: ns.metadata?.name,
            status: ns.status?.phase,
            creationTimestamp: ns.metadata?.creationTimestamp,
        }));
        return NextResponse.json(namespaces);
    } catch (err: any) {
        // 如果没有拉取全集群 Namespace 的权限，则返回 Kubeconfig 里定义的那个
        console.log('Permission denied for listing all namespaces, falling back to context namespace');
        const currentContext = kc.getCurrentContext();
        const contextObj = kc.getContexts().find(c => c.name === currentContext);
        const defaultNs = contextObj?.namespace || 'default';
        return NextResponse.json([{ name: defaultNs, status: 'Active' }]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
