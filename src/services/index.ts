import { getConnFromThread } from 'src/lib/transaction';

export async function getManager() {
  const queryRunner = await getConnFromThread('postgis');
  const manager = queryRunner.manager;
  return manager;
}
