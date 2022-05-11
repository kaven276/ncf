import { innerCall } from '@ncf/microkernel';

export const faas = async () => {
  return innerCall('/typeorm/hr/changeUsers', { id: 1 });
}
