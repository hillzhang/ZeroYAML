import { NextRequest, NextResponse } from 'next/server';
import * as k8s from '@kubernetes/client-node';

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'deployments';
    const kube64 = req.headers.get('x-kubeconfig');
    const ns64 = req.headers.get('x-kubernetes-namespace');

    if (!kube64) return NextResponse.json({ error: 'No kubeconfig' }, { status: 400 });

    const kubeconfig = atob(kube64);
    const namespace = ns64 ? atob(ns64) : 'default';

    const kc = new k8s.KubeConfig();
    kc.loadFromString(kubeconfig);
    
    const appsV1 = kc.makeApiClient(k8s.AppsV1Api);
    const batchV1 = kc.makeApiClient(k8s.BatchV1Api);
    const coreV1 = kc.makeApiClient(k8s.CoreV1Api);

    let items: any[] = [];

    switch (type) {
      case 'deployments':
        const dRes = await appsV1.listNamespacedDeployment({ namespace });
        items = dRes.items.map(i => ({
          id: i.metadata?.uid,
          name: i.metadata?.name,
          namespace: i.metadata?.namespace,
          status: i.status?.conditions?.[0]?.type || 'Unknown',
          replicas: `${i.status?.readyReplicas || 0}/${i.spec?.replicas || 0}`,
          creationTimestamp: i.metadata?.creationTimestamp,
          pods: [] // Placeholder
        }));
        break;
      case 'statefulsets':
        const sRes = await appsV1.listNamespacedStatefulSet({ namespace });
        items = sRes.items.map(i => ({
          id: i.metadata?.uid,
          name: i.metadata?.name,
          namespace: i.metadata?.namespace,
          status: i.status?.readyReplicas === i.spec?.replicas ? 'Ready' : 'Progressing',
          replicas: `${i.status?.readyReplicas || 0}/${i.spec?.replicas || 0}`,
          creationTimestamp: i.metadata?.creationTimestamp
        }));
        break;
      case 'daemonsets':
        const dsRes = await appsV1.listNamespacedDaemonSet({ namespace });
        items = dsRes.items.map(i => ({
          id: i.metadata?.uid,
          name: i.metadata?.name,
          namespace: i.metadata?.namespace,
          status: 'Running',
          replicas: `${i.status?.numberReady || 0}/${i.status?.desiredNumberScheduled || 0}`,
          creationTimestamp: i.metadata?.creationTimestamp
        }));
        break;
      case 'cronjobs':
        const cjRes = await batchV1.listNamespacedCronJob({ namespace });
        items = cjRes.items.map(i => ({
          id: i.metadata?.uid,
          name: i.metadata?.name,
          namespace: i.metadata?.namespace,
          status: i.spec?.suspend ? 'Suspended' : 'Active',
          schedule: i.spec?.schedule,
          creationTimestamp: i.metadata?.creationTimestamp
        }));
        break;
      case 'pods':
        const pRes = await coreV1.listNamespacedPod({ namespace });
        items = pRes.items.map(i => ({
          id: i.metadata?.uid,
          name: i.metadata?.name,
          namespace: i.metadata?.namespace,
          status: i.status?.phase,
          image: i.spec?.containers[0].image,
          ip: i.status?.podIP,
          creationTimestamp: i.metadata?.creationTimestamp
        }));
        break;
    }

    // Attempt to fill pods into controllers via prefix matching (Simulated for drill-down)
    if (type !== 'pods' && items.length > 0) {
       const allPods = await coreV1.listNamespacedPod({ namespace });
       items = items.map(item => ({
          ...item,
          pods: allPods.items
            .filter(p => p.metadata?.name?.startsWith(item.name))
            .map(p => ({
               id: p.metadata?.uid,
               name: p.metadata?.name,
               status: p.status?.phase,
               ip: p.status?.podIP
            }))
       }));
    }

    return NextResponse.json(items);
  } catch (err: any) {
    console.error('K8s Workload API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
