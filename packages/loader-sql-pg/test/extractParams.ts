import { parseNamedParam } from '../sqlParser';
import type { SqlModue } from '../SqlModule';

const m: SqlModue = {

} as SqlModue;
const sql: string = `select * from t1 where id=:id`;
parseNamedParam(sql, m);
console.dir(m);
