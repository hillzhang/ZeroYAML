import { NextRequest, NextResponse } from 'next/server';
import { getDockerInstance } from '@/utils/docker';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;
  const socketHeader = request.headers.get('x-docker-socket');
  const customSocket = socketHeader ? Buffer.from(socketHeader, 'base64').toString('utf-8') : undefined;
  const docker = getDockerInstance(customSocket);

  try {
    const container = docker.getContainer(id);

    switch (action) {
      case 'start':
        await container.start();
        break;
      case 'stop':
        await container.stop();
        break;
      case 'restart':
        await container.restart();
        break;
      case 'remove':
        await container.remove({ force: true });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Docker Action Error (${action}):`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
