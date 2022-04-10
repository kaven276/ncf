import { getTop10 } from 'src/mw/apm';

export async function faas() {
  console.dir(getTop10());
  return getTop10();
}
