import { getOnlyQueryRunnerForTx } from 'src/baas/typeorm/getOnlyQueryRunnerForTx';
import { default as ds } from 'src/baas/typeorm/test1';

export { default } from 'src/baas/typeorm/test1';

export async function getManager() {
  const queryRunner = await getOnlyQueryRunnerForTx(ds);
  const manager = queryRunner.manager;
  return manager;
}
