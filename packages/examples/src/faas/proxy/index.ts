import { getProxiedPath, Service } from '@ncf/microkernel';
import { cfgLatency } from 'src/mw/randomLatency';

/** 目录模块导出 faas 代表该目录路径使用反向代理 */
export const faas: Service = async(req: any) => {
  const targetPath = getProxiedPath();
  if (true) {
    // 直接代理到自己，方便测试和演示
    return fetch(`http://localhost:8000/typeorm${targetPath}`, {
      method: 'POST',
      body: JSON.stringify(req),
      headers: {
        'content-type': 'application/json',
      },
    }).then(resp => resp.json());
  } else {
    // 查看请求信息
    return {
      targetPath,
      req,
    };
  }
}

/** 说明代理模块也可以受中间及其配置影响，和实体 faas 模块一样 */
export const config = {
  ...cfgLatency.set({
    maxLatencyMs: 0,
  }),
}
