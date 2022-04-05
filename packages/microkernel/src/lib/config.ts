import { ProjectDir } from '../util/resolve';
import { IFaasModule } from '../lib/faas';
import { getDebug } from '../util/debug';
import { getCallState } from '../executor';
import { ICallState } from './callState';
import { registerDep } from '../hotUpdate';
import { sep, join } from 'path';

const debug = getDebug(module);

// export const proxySettingKey = Symbol('proxySettingKey');
export const proxyTriggerPrefixKey = Symbol('proxyTriggerPrefix');

/** 一个配置的全部内容，配置从 faas module 向上看各上级目录的 index.ts 中的 export config，通过 prototype 融合 */
export interface IConfig {
  /** 该目录默认的文件后缀，能加速快速解析，不配置默认按照 .ts 处理，可以配置成 .yml, .xml 等等 */
  ext?: string,
  // [proxySettingKey]?: string | boolean,
  /** 在该前缀下，使用代理来处理，没有 faas module .faas 时，使用 dir/index.ts 中的 .faas 替换 */
  [proxyTriggerPrefixKey]?: string,
  //@ts-ignore
  [key: symbol]: any,
}


/** 因为不想造成原始源码模块在框架内被改变，所以外部记录对应的配置 */
const configMap = new WeakMap<IFaasModule, IConfig>()

interface IConfigContainer {
  cfg: IConfig,
  subs: {
    [subdir: string]: IConfigContainer,
  }
}

export const root: IConfigContainer = {
  cfg: undefined as unknown as IConfig,
  subs: {},
}

/** 配置根配置 */
async function fillRoot() {
  const configModule = await import(`${ProjectDir}/src/services/index.ts`);
  const config = configModule.config;
  root.cfg = config;
}

const fillRootPromise = fillRoot();

/** 获取当前 faas 的指定项的配置 */
export function getConfig(s: symbol, ctx?: ICallState): any {
  const { fassModule } = ctx || getCallState();
  const config = getConfigByFaas(fassModule);
  if (config) {
    return config[s];
  }
}

/*
设计
dir1/dir2/faas 的 prototype chain，必须保持稳定。
相关的固定配置对象建立在 root 上。
*/

export function getConfigByFaas(fassModule: IFaasModule): IConfig | undefined {
  let config = configMap.get(fassModule);
  if (config) {
    return config;
  }
}

/** 获取指定 faas 对应的配置，配置数据为 prototype chain 按照 /index.ts 向上找 */
export async function ensureDirConfig(path: string): Promise<IConfig> {
  // 从 faas 模块，确保创建 prototype chain，并 fill root config container
  if (!root.cfg) {
    await fillRootPromise;
  }
  const parentDirs = path.split('/');
  let upper: IConfigContainer = root;
  let currentPath = join(ProjectDir, 'src/services');
  for (let i = 1; i < parentDirs.length - 1; i++) {
    const thisDirName = parentDirs[i];
    let thisDirConfig = upper.subs[thisDirName];
    currentPath = join(currentPath, thisDirName);
    if (!thisDirConfig) {
      const newConfig = Object.create(upper.cfg);
      upper.subs[thisDirName] = {
        cfg: newConfig,
        subs: {},
      };
      // 随后动态加载配置更新
      const configPath = `${currentPath}/index.ts`;
      await import(`${currentPath}${sep}index.ts`).then(async dirModule => {
        debug('load', currentPath, dirModule);
        await registerDep(configPath);
        if (dirModule.config) {
          Object.assign(newConfig, dirModule.config);
        }
        // dirModule.faas 配置代表该路径是代理服务
        if (dirModule.faas) {
          debug('have proxy', currentPath);
          newConfig[proxyTriggerPrefixKey] = parentDirs.slice(0, i + 1).join('/');
        }
      }).catch(() => {
        debug('config not exists for dir', currentPath);
      });
    }
    upper = upper.subs[thisDirName];
  }
  return upper.cfg;
}

/** 获取指定 faas 对应的配置，配置数据为 prototype chain 按照 /index.ts 向上找 */
export function ensureFaasConfig(dirConfig: IConfig, fassModule: IFaasModule): IConfig {
  const faasConfig: IConfig = Object.create(dirConfig);
  if (fassModule.config) {
    Object.assign(faasConfig, fassModule.config);
  }
  configMap.set(fassModule, faasConfig);
  return faasConfig;
}
