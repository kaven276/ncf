import { getCaller } from '@ncf/microkernel';

export const faas = async () => {
  return getCaller();
};
