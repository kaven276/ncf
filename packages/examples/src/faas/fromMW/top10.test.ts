// import { faas as mwConfigOnFaas } from './mwConfigOnFaas'
import { innerCall } from '@ncf/microkernel';

/** 测试中间件目录配置也可以直接配置到单个 faas 服务生效 */
export const faas = async () => {
  return innerCall('/fromMW/top10');
}
