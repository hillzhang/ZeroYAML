import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

async function executeCommand(command: string, env: NodeJS.ProcessEnv, timeoutMs: number) {
  return new Promise<{ stdout: string; stderr: string; error?: string }>((resolve) => {
    const child = spawn(command, { env, shell: true });
    
    let stdout = '';
    let stderr = '';
    const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 50MB limit

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ 
        stdout: stdout + '\n\n[Process timed out after 30s]', 
        stderr: stderr,
        error: 'Execution timed out' 
      });
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      if (stdout.length < MAX_BUFFER_SIZE) {
        stdout += data.toString();
        if (stdout.length >= MAX_BUFFER_SIZE) {
          stdout += '\n\n[Output truncated: reached 50MB limit]';
          child.kill('SIGTERM');
        }
      }
    });

    child.stderr.on('data', (data) => {
      if (stderr.length < MAX_BUFFER_SIZE) {
        stderr += data.toString();
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, error: err.message });
    });

    child.on('close', (_code) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();
    const dockerSocket = req.headers.get('x-docker-socket');

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    if (!command.trim().startsWith('docker')) {
      return NextResponse.json({ error: 'Only docker commands are allowed' }, { status: 403 });
    }

    const env = { ...process.env };
    if (dockerSocket) {
      try {
        const decodedSocket = Buffer.from(dockerSocket, 'base64').toString();
        if (decodedSocket) {
          env.DOCKER_HOST = decodedSocket.startsWith('/') ? `unix://${decodedSocket}` : decodedSocket;
        }
      } catch (e) {
        console.error('Failed to decode docker socket:', e);
      }
    }

    const { stdout, stderr, error } = await executeCommand(command, env, 30000);

    if (error && !stdout && !stderr) {
       return NextResponse.json({ error, stdout: '', stderr: '' }, { status: 500 });
    }

    return NextResponse.json({ stdout, stderr, error });
  } catch (error: unknown) {
    const err = error as { message?: string; stdout?: string; stderr?: string };
    return NextResponse.json({ 
      error: err.message || 'Execution failed',
      stdout: err.stdout || '',
      stderr: err.stderr || '' 
    }, { status: 500 });
  }
}
