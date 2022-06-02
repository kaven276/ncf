import { env } from 'src/env';
import { getCaller } from '@ncf/microkernel';

export const faas = async () => {
  if (getCaller().user !== 'admin') {
    return '只有管理员有权限看环境变量配置';
  }
  return env;
}
