import { debug } from 'debug';
import Module from 'module';
import { ProjectDir, jsExt, MoundDir } from './resolve';
import { sep, basename } from 'path';

const len = ProjectDir.length;

const noop = () => { };

/** 自动根据当前的 faas/middleware */
export function getDebug(m: Module) {
  if (m.path.startsWith(ProjectDir)) {
    const restPath = m.filename.substring(len);
    // console.log('restPath', restPath,  m.filename, m.id);
    const sects = restPath.split(sep);
    sects[sects.length - 1] = basename(sects[sects.length - 1], jsExt);
    if (sects[1] === MoundDir) {
      // svc: / 后面带空格，方便 vscode 直接 option click 调转到输出日志的源码文件
      return debug(`${sects[2]}:${sects.slice(3).join('/')}`);
    }
  }

  const sects = m.filename.split(sep + MoundDir + sep);
  if (sects.length > 1) {
    const packageName = sects[0].split(sep).pop();
    const inPkgPath = sects.pop();
    // console.log('pkg: path', m.path)
    return debug(`${packageName}:${inPkgPath}`);
  }

  if (m.path.includes('node_modules')) {
    return noop;
  }

  // 在monorepo中，和应用在同级的其他包
  if (m.path.includes('packages')) {
    const relative = m.filename.split(sep + 'packages' + sep)[1].split(sep);
    const pkgName = relative[0];
    const fileName = relative.pop();
    return debug(`${pkgName}:${fileName}`);
  }

  return debug(`others:${m.path.split(sep).slice(-3).join('/')}`);
}
