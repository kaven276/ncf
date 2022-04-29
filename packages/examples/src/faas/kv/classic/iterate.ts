import later from 'src/baas/leveldb/later.baas';
import db from '.';

/** 遍历 kv store */
export const faas = async () => {
  const now = Date.now();
  const result: any[] = [];
  for await (const [key, value] of db.iterator({
    lt: now,
  })) {
    const dueTime = Number(key);
    result.push({ dueTime, key, value, delta: now - dueTime });
  }
  if (result.length > 0) {
    console.dir(result);
  }
  await later.batch(result.map(item => ({
    type: 'del',
    key: item.key,
  })));
  return result;
}
