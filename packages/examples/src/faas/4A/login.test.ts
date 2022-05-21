import { innerCall } from '@ncf/microkernel';
import type { ISpec } from './login';

export const faas = async () => {
  return innerCall<ISpec>('/4A/login', {
    user: 'admin',
    password: '123456',
  }).then(resp => resp.token);
}
