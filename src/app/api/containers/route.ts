import { NextResponse } from 'next/server';
import { getDockerInstance } from '@/utils/docker';

export async function GET(request: Request) {
  const socketHeader = request.headers.get('x-docker-socket');
  const customSocket = socketHeader ? Buffer.from(socketHeader, 'base64').toString('utf-8') : undefined;
  const docker = getDockerInstance(customSocket);
  
  console.log('Fetching containers started...');
  try {
    const containers = await docker.listContainers({ all: true });
    console.log(`Found ${containers.length} containers`);
    return NextResponse.json(containers);
  } catch (error: any) {
    console.error('Docker API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
