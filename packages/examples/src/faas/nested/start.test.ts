import { innerCall } from '@ncf/microkernel';

export const faas = async () => {
  return innerCall('/nested/start', { multi: 10 });
}
