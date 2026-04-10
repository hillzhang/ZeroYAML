import Docker from 'dockerode';
import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * 获取 Docker 实例的通用工厂函数
 * 适配多种环境：Docker Desktop, OrbStack, Colima, Linux, Windows
 */
export function getDockerInstance(customPath?: string): Docker {
  // 0. 如果用户手动填写了路径，优先使用
  if (customPath) {
    console.log(`Using custom docker socket: ${customPath}`);
    return new Docker({ socketPath: customPath });
  }

  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  // 1. 如果是 Windows，通常使用命名管道
  if (isWin) {
    return new Docker({ socketPath: '//./pipe/docker_engine' });
  }

  // 2. 如果是 Mac/Linux，按优先级检查常见路径
  if (isMac || process.platform === 'linux') {
    const home = os.homedir();
    const commonPaths = [
      '/var/run/docker.sock', // 标准路径 / Docker Desktop / OrbStack Symlink
      path.join(home, '.orbstack/run/docker.sock'), // OrbStack Direct
      path.join(home, '.docker/run/docker.sock'),   // Docker contextual paths
      path.join(home, '.colima/default/docker.sock'), // Colima
    ];

    for (const socketPath of commonPaths) {
      if (fs.existsSync(socketPath)) {
        console.log(`Docker detected at: ${socketPath}`);
        return new Docker({ socketPath });
      }
    }
  }

  // 3. 回退到默认初始化（依赖环境变量或默认路径）
  console.log('Using default dockerode initialization');
  return new Docker();
}
