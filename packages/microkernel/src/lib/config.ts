import { jsExt, ServiceDir, prefixLength } from '../util/resolve';
import { IFaasModule } from '../lib/faas';
import { getDebug } from '../util/debug';
import { ICallState } from './callState';
import { registerDep } from '../hotUpdate';
import { join, dirname, sep } from 'path';
import * as assert from 'node:assert/strict';

const debug = getDebug(module);

export const proxyTriggerPrefixKey = Symbol('proxyTriggerPrefix');

/** 一个配置的全部内容，配置从 faas module 向上看各上级目录的 index.ts 中的 export config，通过 prototype 融合 */
export interface IConfig {
  /** 该目录默认的文件后缀，能加速快速解析，不配置默认按照 .ts 处理，可以配置成 .yml, .xml 等等 */
  ext?: string,
  // [proxySettingKey]?: string | boolean,
  /** 在该前缀下，使用代理来处理，没有 faas module .faas 时，使用 dir/index.ts 中的 .faas 替换 */
  [proxyTriggerPrefixKey]?: string,
  /** 各个自定义的配置项，key 必须是 symbol 以确保配置间互不冲突 */
  [s: symbol]: any,
}

declare module './faas' {
  interface IFaasModule<T> {
    /** faas 服务模块可能带有配置 */
    config?: IConfig,
    /** faas 模块绑定的配置，带 prototype chain */
    __config?: IConfig,
  }
}

const defaultConfig: IConfig = {};
const dirMap = new Map<string, IConfig>();
async function getDirConfig(
  /** index.ts 所属的目录的相对项目的路径 */
  path: string
): Promise<IConfig> {
  assert.ok(!dirMap.has(path), '因为有para版本控制，不可能出现已有 config 记录');
  debug('loading dir config', path);
  const parent = (path === sep) ? defaultConfig : (await getDirConfigPara(dirname(path)));
  // 随后动态加载配置更新
  const configPath = join(ServiceDir, path, 'index' + jsExt);
  const dirModule = await import(configPath).then(async (m: any) => {
    await registerDep(configPath);
    return m;
  }).catch((e) => {
    // debug('config not exists for dir', path, configPath);
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.dir(e);
    }
    return;
  });

  const newConfig = Object.create(parent);
  if (dirModule?.config) {
    Object.assign(newConfig!, dirModule.config);
  }
  // dirModule.faas 配置代表该路径是代理服务
  if (dirModule?.faas) {
    debug('have proxy', path);
    newConfig[proxyTriggerPrefixKey] = path;
  }
  dirMap.set(path, newConfig);
  debug('loaded dir config', path, newConfig);
  return newConfig;
}

/** 记录每个目录配置模块的加载状态，防止并发的加载重复操作，并发归一 */
const loadMap = new Map<string, Promise<IConfig>>();

/** 异步获取指定目录的配置，并发归一 */
export async function getDirConfigPara(
  /** index.ts 所属的目录的相对项目的路径 */
  path: string
): Promise<IConfig> {
  let loadState = loadMap.get(path);
  if (!loadState) {
    loadState = getDirConfig(path);
    loadMap.set(path, loadState);
  } else {
    debug('load repeat', path);
  }
  return await loadState;
}

export function updateConfig(absPath: string) {
  // 目录配置改变的话，更新 config prototype chain
  debug('config changed for', absPath.substring(prefixLength));
  const path = dirname(absPath.substring(prefixLength));
  const config = dirMap.get(path)!;
  if (!config) {
    debug(`还未完整加载过配置，配置模块又改变了 ${path}`);
    return;
  }

  // 随后动态加载配置更新
  import(absPath).then(async dirModule => {
    await registerDep(absPath);

    // 先删除之前 prototype chain node 上的配置；因为只有开发时热更新用，无需考虑处理性能
    Object.getOwnPropertySymbols(config).forEach(symbolKey => {
      //@ts-ignore
      delete config[symbolKey];
    });
    if (dirModule.config) {
      Object.assign(config, dirModule.config);
    }
    if (dirModule.faas) {
      debug('have proxy', path);
      config[proxyTriggerPrefixKey] = path;
    }
  }).catch();
}


/** 因为不想造成原始源码模块在框架内被改变，所以外部记录对应的配置 */
const configMap = new WeakMap<IFaasModule, IConfig>()

/** 获取指定 faas 对应的配置，配置数据为 prototype chain 按照 /index.ts 向上找 */
export function ensureFaasConfig(dirConfig: IConfig, fassModule: IFaasModule): IConfig {
  let faasConfig: IConfig;
  if (fassModule.config) {
    faasConfig = Object.assign(Object.create(dirConfig), fassModule.config);
  } else {
    faasConfig = dirConfig;
  }
  configMap.set(fassModule, faasConfig);
  return faasConfig;
}

/** 针对新的配置项，方便的创建对应配置设置和配置读取，默认配置组合 */
export function createCfgItem<T>(key: symbol, defaultCfg?: T) {
  return {
    default: defaultCfg,
    /** 对目录 index 和 faas 模块做配置 */
    set(cfg: T) {
      return { [key]: cfg };
    },
    /** 获取配置内容，ctx 通常是 NCF 给中间件参数送入的  */
    get(ctx: ICallState): T {
      return ctx.fassModule.__config?.[key] || defaultCfg;
    },
    /** 获取 faas 专有配置内容，不看目录配置(不走prototype chain节省处理)  */
    get1(ctx: ICallState): T | undefined {
      const cfg = ctx.fassModule.__config;
      if (!cfg) return undefined;
      const desc = Object.getOwnPropertyDescriptor(cfg, key);
      return desc ? desc.value : defaultCfg;
    }
  }
}
