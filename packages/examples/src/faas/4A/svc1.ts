import { Service } from '@ncf/microkernel';

export const faas: Service = async () => {
  return 'ok';
}

// 配置 faas 要求的角色
faas.role = 'normal';
