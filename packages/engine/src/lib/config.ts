import { servicesDir } from '../util/resolve';
import { IFaasModule } from '../lib/faas';
import { getDebug } from '../util/debug';
import { getCallState } from '../executor';
import { ICallState } from './callState';

const debug = getDebug(module);

/** 一个配置的全部内容，配置从 faas module 向上看各上级目录的 config.ts 中的 export config，通过 prototype 融合 */
export interface IConfig {
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
  cfg: {},
  subs: {},
}

/** 配置根配置 */
async function fillRoot() {
  const configModule = await import(`${servicesDir}/src/services/config.ts`);
  const config = configModule.config;
  Object.assign(root.cfg, config);
  return root;
}

const fillRootPromise = fillRoot();

/** 获取当前 faas 的指定项的配置 */
export function getConfig<K extends keyof IConfig>(s: K, ctx?: ICallState): IConfig[K] | undefined {
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

/** 获取指定 faas 对应的配置，配置数据为 prototype chain 按照 /config.ts 向上找 */
export async function ensureFaasConfig(path: string, fassModule: IFaasModule): Promise<IConfig> {
  // 从 faas 模块，确保创建 prototype chain，并 fill root config container
  const parentDirs = path.split('/');
  let upper: IConfigContainer = root;
  let currentPath = servicesDir + '/src/services';
  for (let i = 1; i < parentDirs.length - 1; i++) {
    const thisDirName = parentDirs[i];
    let thisDirConfig = upper.subs[thisDirName];
    currentPath = currentPath + '/' + thisDirName;
    if (!thisDirConfig) {
      const newConfig = Object.create(upper.cfg);
      upper.subs[thisDirName] = {
        cfg: newConfig,
        subs: {},
      };
      // 随后动态加载配置更新
      await import(`${currentPath}/config.ts`).then(dirModule => {
        if (dirModule.config) {
          Object.assign(newConfig, dirModule.config);
        }
      }).catch(() => {
        debug('config not exists for dir', currentPath);
      });
    }
    upper = upper.subs[thisDirName];
  }
  const faasConfig: IConfig = Object.create(upper.cfg);
  if (fassModule.config) {
    Object.assign(faasConfig, fassModule.config);
  }
  configMap.set(fassModule, faasConfig);
  return faasConfig;
}
