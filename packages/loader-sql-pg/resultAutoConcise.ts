import type { SqlModue } from './SqlModule';
import { QueryResult } from 'pg';

// 将 sql result rows 自动做简化

export function resultAutoConcise(res: QueryResult, m: SqlModue) {
  // if (m.doSql) {
  //   return JSON.parse(res["2"].rows[0]["svc.resp"]);
  // }
  const { rows, fields } = res;
  if (!rows.length) {
    return rows;
  }
  if (m.onerow) {
    return rows[0];
  }
  if (fields[0].name === 'array_to_json') {
    return rows[0].array_to_json;
  }
  if (fields[0].name === 'json_agg') {
    return rows[0].json_agg;
  }
  return rows;
};
