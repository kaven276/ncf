import { innerCall } from '@ncf/microkernel';

export const faas = async () => {
  return innerCall('/esm/getUrl', {});
}
