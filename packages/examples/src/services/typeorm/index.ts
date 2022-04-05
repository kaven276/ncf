import { getOnlyQueryRunnerForTx } from 'src/bass/typeorm/getOnlyQueryRunnerForTx';
import { default as ds } from 'src/bass/typeorm/test1';

export { default } from 'src/bass/typeorm/test1';

export async function getManager() {
  const queryRunner = await getOnlyQueryRunnerForTx(ds);
  const manager = queryRunner.manager;
  return manager;
}
