import { getTop10 } from 'src/middlewares/apm';

export async function faas() {
  console.dir(getTop10());
  return getTop10();
}
