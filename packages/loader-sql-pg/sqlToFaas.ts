import { readFile } from 'fs/promises';
import { resultAutoConcise } from "./resultAutoConcise";
import * as sqlparser from "./sqlParser";
import type { SqlModue } from './SqlModule';
import { getDebug, getCallState } from '@ncf/microkernel';
import type { QueryConfig, Pool, PoolClient } from 'pg';
import { cfgPgConnection } from './config';

const debug = getDebug(module);

/** 检测防范 sqltext 出现不带 where 条件的 delete/update */
function checkDangerousSqlText(m: SqlModue) {

  let sqltext: string | undefined;
  if (m.sqlType === 'bind') {
    sqltext = m.sqltext;
  } else if (m.sqlType === 'dyna') {
    sqltext = m.sqlTextMaker();
  }
  if (sqltext === undefined) return;
  if (sqltext.match(/\b(delete|update)\b/gi) && !sqltext.match(/where/gi)) {
    m.staticError = "delete|update without where filter";
  }
}

/** 将原始 sql 文本中头部的注释解析，取出配置保存，遇到第一次非空行非注释行后返回后面的文本(分行好的) */
function extractConfigAndKeepEffectiveLines(m: SqlModue, cfg: any, sql: string): string[] {
  const sqlLines = sql.split("\n");

  // 处理 .sql 文件头部 meta 信息，相当于 .js 的 exports.xxx，如 "-- pool: task"
  let i: number;
  for (i = 0; i < sqlLines.length; i += 1) {
    const sqlLine = sqlLines[i];
    if (sqlLine.match(/^\s*$/)) continue; // 空行不处理，往下看
    const matchComment = sqlLine.match(/^\s*--(.*)$/); // 是否是 -- 开头的注释行
    if (matchComment) {
      const matchConfig = matchComment[1].match(/(\w+)\s*:\s*(.+)\s*$/); // 是否配置了 exports.attr
      if (!matchConfig) continue; // 非配置行忽略，往下看
      const key = matchConfig[1];
      const value = matchConfig[2].trim();
      if (key.match(/^(in|out)Converter$/)) {
        if (value.startsWith("(")) {
          // -- outConverter: (sqlResult, req, m) => {}
          try {
            m[key] = eval(value); // 定义了箭头函数的js代码
          } catch (e) {
            console.error(
              `path(${key}) value=${value} outConverter eval error ${e}`
            );
          }
        } else if (value.match(/^\s*\w+\s*$/)) {
          m[key] = cfg[value]; // converter 从字符串变成函数
        } else {
          throw new Error(`module(${key}) ${key} 配置错误！`);
        }
      } else {
        m[key] = value;
      }
    } else {
      // 第一次非空行也非注释，认定是 sql 开始，头部结束
      break;
    }
  }
  return sqlLines.slice(i); // 剩下的行是 sql 文本各行
}

// called from processJsFile and processSqlFile
function loadSqlFile(sql: string, cfg: object, key: string) {
  const m: SqlModue = {
    path: key,
    sqlOnly: true,
  } as SqlModue;
  const sqlLines = extractConfigAndKeepEffectiveLines(m, cfg, sql);


  if (sqlparser.ifCreateFunctionThenVersionName(m, sqlLines)) {
    // 什么也不用做
  } else if (sql.match(/\${/)) {
    // dynamic sql
    m.sqlType = 'dyna';
    if (m.sqlType === 'dyna') {
      m.sqlTextMaker = sqlparser.makeSqlGenFunc(sql, sqlLines)!;
    }
  } else {
    // static sql (but may use bind)
    m.sqlType = 'bind'
    sqlparser.parseNamedParam(sqlparser.stripSqlComment(sqlLines), m);
  }
  return m;
}


// loader 是异步的，promise 返回结果
// 这样一些非常大的文件，可以被 loader 分片处理，防止独占时间循环造成主线程卡死
export async function loaderPostgresSQL(abspath: string, regPath: string, dirConfig: any): Promise<SqlModue> {
  if (abspath.endsWith('schema.sql')) return {} as SqlModue;
  const sqlText = await readFile(abspath, { encoding: "utf8" }).then(
    (text) => text
  );
  const m = loadSqlFile(sqlText, dirConfig, regPath);

  m.faas = async (req) => {
    // 第一步取得连接池
    // const pool = getPGPool();
    // 这里的 Client 也可能是 pool 或者纳入事务管理的 client。
    const conn: Pool | PoolClient = cfgPgConnection.get(getCallState())();
    // debug('executing', m.path, Object.keys(m));
    // debug(conn, conn.query);
    let queryOption: QueryConfig;
    if (m.sqlType === 'sf') {
      await conn.query(m.fnSql); // 先部署存储过程，后面再执行
      debug("fn deployed", m.path);
      queryOption = {
        text: `select * from ${m.fnName}($1)`,
        values: [req],
      };
    } else if (m.sqlType === 'do') {
      const reqJsonText = JSON.stringify(req);
      queryOption = {
        text: `set session svc.req= '${reqJsonText}';${m.doSql};show svc.resp;`,
      };
    } else if (m.sqlType === 'bind') {
      queryOption = {
        // name: path, // 考虑缓存 parse 结果
        text: m.sqltext,
        values: m.pmap.map((paramName) => req[paramName]),
      };
    } else if (m.sqlType === 'dyna') {
      queryOption = {
        text: m.sqlTextMaker(),
      };
    }

    debug(queryOption!);
    return conn.query(queryOption!).then((res) => {
      //@ts-ignore
      const { _parsers, _types, ...resOthers } = res;
      // return resOthers;
      // debug(resOthers, { depth: 5 });
      return resOthers;
      return resultAutoConcise(res, m);
    });
  };

  return m;
};
