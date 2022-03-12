import { debug } from 'debug';
import Module from 'module';
import { servicesDir } from './resolve';

const len = servicesDir.length;

/** 自动根据当前的 faas/middleware */
export function getDebug(m: Module) {
  if (m.path.startsWith(servicesDir)) {
    const restPath = m.filename.substring(len);
    // console.log('restPath', restPath,  m.filename, m.id);
    const sects = restPath.split('/');
    sects[sects.length - 1] = sects[sects.length - 1]
    if (sects[1] === 'src') {
      if (sects[2] === 'services') {
        // svc: / 后面带空格，方便 vscode 直接 option click 调转到输出日志的源码文件
        return debug(`svc: ${sects.slice(3).join('/')}`);
      } else if (sects[2] === 'middlewares') {
        return debug(`mw: ${sects.slice(3).join('/')}`);
      }
    }
  }
  return debug(m.path);
}