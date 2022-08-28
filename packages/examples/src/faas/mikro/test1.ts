import db from 'src/baas/mikro/mikro.baas';

export const faas = async () => {
  // console.log(db);
  return db.em.raw('select now();');
  return db.isConnected();
}
