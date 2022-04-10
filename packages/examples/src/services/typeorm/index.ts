import ds from 'src/baas/typeorm/test1.baas';

export { default } from 'src/baas/typeorm/test1.baas';

export async function getManager() {
  const queryRunner = await ds.getQueryRunnerTx();
  const manager = queryRunner.manager;
  return manager;
}
