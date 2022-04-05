import { getPoolClient } from 'src/baas/pg/pg1';

export async function faas() {
  const client = await getPoolClient();
  const res = await client.query('update user2 set age=age + $1 where "firstName"=$2 RETURNING "age"', [Math.floor(Math.random() * 10) - 5, 'LiYong']);
  return res.rows[0].age; // 返回更新后的新 age
}
