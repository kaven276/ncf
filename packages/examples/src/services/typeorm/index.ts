import { getOnlyQueryRunnerForTx } from 'src/baas/typeorm/getOnlyQueryRunnerForTx';
import { default as ds } from 'src/baas/typeorm/test1.baas';

export { default } from 'src/baas/typeorm/test1.baas';

export async function getManager() {
  const queryRunner = await getOnlyQueryRunnerForTx(ds);
  const manager = queryRunner.manager;
  return manager;
}
