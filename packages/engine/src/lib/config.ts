import { servicesDir } from '../util/resolve';
import { IFaasModule } from '../lib/faas';

/** 一个配置的全部内容，配置从 faas module 向上看各上级目录的 config.ts 中的 export config，通过 prototype 融合 */
export interface IConfig {

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

/*
设计
dir1/dir2/faas 的 prototype chain，必须保持稳定。
相关的固定配置对象建立在 root 上。
*/

/** 获取指定 faas 对应的配置，配置数据为 prototype chain 按照 /config.ts 向上找 */
export async function getFaasConfig(path: string, fassModule: IFaasModule): Promise<IConfig> {
  let config = configMap.get(fassModule);
  if (config) {
    return config;
  }
  // 从 faas 模块，确保创建 prototype chain，并 fill root config container
  const parentDirs = path.split('/');
  let upper: IConfigContainer = await fillRootPromise;
  let currentPath = servicesDir + '/src/services';
  for (let i = 1; i < parentDirs.length - 1; i++) {
    const thisDirName = parentDirs[i];
    let thisDirConfig = upper.subs[thisDirName];
    currentPath = currentPath + '/' + thisDirName;
    if (!thisDirConfig) {
      const newConfig = Object.create(upper.cfg);
      // 需要动态加载
      let dirModule: any;
      try {
        dirModule = await import(`${currentPath}/config.ts`);
        if (dirModule.config) {
          Object.assign(newConfig, dirModule.config);
        }
      } catch (e) {
        ;
      }
      upper.subs[thisDirName] = {
        cfg: newConfig,
        subs: {},
      };
    }
    upper = upper.subs[thisDirName];
  }
  const faasConfig: IConfig = Object.create(upper.cfg);
  if (fassModule.config) {
    Object.assign(faasConfig, fassModule.config);
  }
  configMap.set(fassModule, faasConfig);
  //@ts-ignore
  // console.log('faasConfig.randomLatency', faasConfig.randomLatency);
  return faasConfig;
}
