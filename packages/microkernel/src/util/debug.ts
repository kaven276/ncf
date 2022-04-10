import { debug } from 'debug';
import Module from 'module';
import { ProjectDir } from './resolve';
import { sep, basename } from 'path';

const len = ProjectDir.length;
const BAAS = sep + 'baas' + sep;

/** 自动根据当前的 faas/middleware */
export function getDebug(m: Module) {
  if (m.path.startsWith(ProjectDir)) {
    const restPath = m.filename.substring(len);
    // console.log('restPath', restPath,  m.filename, m.id);
    const sects = restPath.split(sep);
    sects[sects.length - 1] = basename(sects[sects.length - 1], '.ts');
    if (sects[1] === 'src') {
      if (sects[2] === 'faas') {
        // svc: / 后面带空格，方便 vscode 直接 option click 调转到输出日志的源码文件
        return debug(`svc: ${sects.slice(3).join('/')}`);
      } else if (sects[2] === 'middlewares') {
        return debug(`mw: ${sects.slice(3).join('/')}`);
      }
    }
  }
  if (m.filename.includes(BAAS)) {
    // console.log('baas path', m.path);
    return debug('baas: ' + m.filename.split(BAAS).pop()!);
  }
  const sects = m.filename.split(sep + 'src' + sep);
  if (sects.length > 1) {
    const packageName = sects[0].split(sep).pop();
    const inPkgPath = sects.pop();
    // console.log('pkg: path', m.path)
    return debug(`${packageName}: ${inPkgPath}`);
  }

  return debug(`others: ${m.path.split(sep).slice(-3).join('/')}`);
}
