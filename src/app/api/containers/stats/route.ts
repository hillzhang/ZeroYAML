import { NextResponse } from 'next/server';
import { getDockerInstance } from '@/utils/docker';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const socketHeader = request.headers.get('x-docker-socket');
  const customSocket = socketHeader ? Buffer.from(socketHeader, 'base64').toString('utf-8') : undefined;
  
  if (!id) {
    return NextResponse.json({ error: 'Container ID required' }, { status: 400 });
  }

  const docker = getDockerInstance(customSocket);
  const container = docker.getContainer(id);

  try {
    // get stats without streaming
    const stats = await container.stats({ stream: false });
    
    // Calculate CPU usage percentage
    // stats.cpu_stats.cpu_usage.total_usage
    // stats.precpu_stats.cpu_usage.total_usage
    // stats.cpu_stats.system_cpu_usage
    // stats.precpu_stats.system_cpu_usage
    
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * (stats.cpu_stats.online_cpus || 1) * 100.0 : 0;

    // Calculate Memory usage
    // stats.memory_stats.usage
    // stats.memory_stats.limit
    const memUsage = stats.memory_stats.usage;
    const memLimit = stats.memory_stats.limit;
    const memPercent = memLimit > 0 ? (memUsage / memLimit) * 100.0 : 0;

    return NextResponse.json({
      cpu: parseFloat(cpuPercent.toFixed(2)),
      memory: parseFloat(memPercent.toFixed(2)),
      memoryUsage: memUsage,
      memoryLimit: memLimit,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Docker Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
