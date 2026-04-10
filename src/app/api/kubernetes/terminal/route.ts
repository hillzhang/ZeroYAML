import { NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

import { spawn } from 'child_process';

async function executeCommand(command: string, env: NodeJS.ProcessEnv, timeoutMs: number) {
  return new Promise<{ stdout: string; stderr: string; error?: string }>((resolve) => {
    // shell: true is needed to support complex commands and pipes
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

export async function POST(request: Request) {
  const kubeconfigHeader = request.headers.get('x-kubeconfig');
  const { command } = await request.json();

  if (!command) {
    return NextResponse.json({ error: 'Command is required' }, { status: 400 });
  }

  // Safety check: prevent malicious commands
  if (!command.trim().startsWith('kubectl')) {
     return NextResponse.json({ error: 'Only kubectl commands are allowed for security reasons.' }, { status: 400 });
  }

  const kcContent = kubeconfigHeader ? Buffer.from(kubeconfigHeader, 'base64').toString('utf-8') : null;
  
  let tempConfigPath = '';
  
  try {
    const env = { ...process.env };
    
    if (kcContent) {
      const tempDir = os.tmpdir();
      tempConfigPath = path.join(tempDir, `kubeconfig-${uuidv4()}`);
      await fs.writeFile(tempConfigPath, kcContent);
      env.KUBECONFIG = tempConfigPath;
    }

    // Capture the output using the new manual streaming method
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
  } finally {
    if (tempConfigPath) {
      try {
        await fs.unlink(tempConfigPath);
      } catch (e) {
        console.warn('Failed to delete temp kubeconfig:', e);
      }
    }
  }
}
