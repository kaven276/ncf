import db from '.';

export const faas = async () => {
  const now = String(Date.now());
  await db.put(now + ':fe:react', '10');
  await db.put(now + 'fe:vue', '120');
  await db.put(now + 'fe:angular', '0');
}
