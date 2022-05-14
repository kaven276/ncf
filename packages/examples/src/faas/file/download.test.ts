import { outerCall } from '@ncf/microkernel';

export const faas = async () => {
  return outerCall('/file/download', { filename: '奖状.jpg'});
}
