import db from '.';

export const faas = async () => {
  return await db.getMany(['fe:react', 'fe:vue']);
}
