import { getDebug } from '@ncf/microkernel';
import type { SqlModue } from './SqlModule';
import { createHash } from 'crypto';

const debug = getDebug(module);

/*
1. 需要把 :name 替换成 $n
   m.sqltext 修正为 m.psqltext
   m.pmap = {name: [1,2]} 用于将命名参数换成替换 $n 的参数
*/

/**
 * 去除 sql 中所有的注释行
 * @param lines 原始的行数组
 * @returns 没有注释的 sql text
 */
export function stripSqlComment(lines: string[]): string {
  return lines.filter(line => (!line.match(/^\s*--/))).join("\n");
}

/**
 * 将命名参数原始sql，转换成pg $n格式的sql，并计算和保存名称到位置的转换关系
 * INSERT INTO users(name, email) VALUES($1, $2)
 * @see https://node-postgres.com/features/queries
 * @param {string} sqltext sql原始文本
 * @param {object} m 服务模块对象
 */
export function parseNamedParam(sqltext: string, m: SqlModue) {
  const pmap: string[] = [];
  function replace(matchedParamName: string) {
    // pmap.push(matchedParamName.substr(1));
    // return `$${pmap.length}`;
    pmap.push(matchedParamName.substring(2));
    return `${matchedParamName.substring(0, 1)}$${pmap.length}`;
  }
  // const psqltext = sqltext.replace(/(?<!:)(?::)\w{2,}/gm, replace); // node893 fail
  const psqltext = sqltext.replace(/[^:]:\w{2,}/gm, replace);
  if ((m.sqlType = 'bind') === 'bind') {
    m.sqltext = psqltext;
    m.pmap = pmap; // 有 m.pmap 则执行前需要动态带入
  }
}

// --${} 将 -- 去掉
export function makeSqlGenFunc(sqltext: string, lines: string[]) {

  // 把行尾 ifLine 条件标注，去掉--，还原成 sql`text` 认知的格式
  const dynamicSqlText = lines.filter(line => (!line.match(/^\s*--/))).map(line => line.replace("--${", "${")).join("\n");
  debug(sqltext);
  const sqlFuncParamNames = ['m'];

  {
    // match :name 准备做参数绑定
    const match = sqltext.match(/(?::)\w{3,}/gm);
    if (match) {
      // 无匹配 match=null，有返回匹配数组
      for (const param of match) {
        const name = param.substring(1);
        if (!sqlFuncParamNames.includes(name)) {
          sqlFuncParamNames.push(name);
          debug('param', name);
        }
      }
    }
  }

  {
    // match ${!!name} 做行包含还是移除开关
    const match = sqltext.match(/\${!?!?(\w+)}/gm);
    if (match) {
      for (const param of match) {
        //@ts-ignore
        const name = param.match(/\w+/)[0];
        if (!sqlFuncParamNames.includes(name)) {
          sqlFuncParamNames.push(name);
        };
      }
    }
  }

  // 提取全部的绑定变量 :name
  // 崎岖全部的 ${} 变量
  let sqlGenFunc: Function;
  try {
    // eslint-disable-next-line no-eval
    sqlGenFunc = eval(`({${sqlFuncParamNames.join(",")}})=>sql\`${dynamicSqlText}\``);
  } catch (e) {
    console.error('parse dynamic sql failed');
    console.error(e);
    console.error(dynamicSqlText);
    return;
  }
  return sqlGenFunc;
}

/**
 * 处理存储函数，计算hash，修改函数名为 svc_name_hash
 * @param {object} m 服务模块对象
 * @return {boolean} 不是函数返回 false, 是函数返回 true
 */
export function ifCreateFunctionThenVersionName(m: SqlModue, sqlLines: string[]): boolean {
  const sql = sqlLines.join('\n');

  // 识别是否是 declare 开头的匿名块，允许多行白字符外 declare
  // 是标记 m.declare = true
  // 可以按照 m.language 配置不同的 postgres 服务端语言，不填默认为 pgplsql
  if (sql.match(/^\W*(declare)\W+/i)) {
    m.sqlType = 'do';
    if (m.sqlType === 'do') {
      m.doSql = `do language ${m.language || 'plpgsql'} $$${sql}$$`;
      return true;
    }
  }

  // 判断是否是创建存储过程的 sql 文本，不是的话就退出
  const refn = /create\s+(?:or\s+)replace\s+(function\s+(\w+))/i;
  const matchedFunction = refn.exec(sql);
  // debug(m.path, matchedFunction, m.sqltext);
  if (!matchedFunction) {
    return false; // 没有命中函数创建
  }

  const bodyhash = comoputeHashFromStoredProcedureContent(sql);
  // console.log(bodyhash);

  // console.dir(refn.exec(sql));
  const replacedStr = matchedFunction[1];
  const srcFnName = matchedFunction[2];
  const fnName = /\/([^/]*)$/.exec(m.path!)![1]; // 取路径最后一段
  if (srcFnName !== fnName) {
    throw new Error(`${fnName} path mismatch with function name ${srcFnName}`);
  }
  m.sqlType = 'sf';
  if (m.sqlType === 'sf') {
    // 原始创建存储过程文本中的函数名替换成带有版本哈希的函数名
    m.fnName = `svc_${fnName}_${bodyhash}`.substring(0, 64);
    m.fnSql = sql.replace(replacedStr, `function ${m.fnName}`);
    // debug('fnName=%s', fnName);
    // debug(m.sql);
  }
  return true; // 命中函数创建
}

/** 从存储过程文本内容部分计算哈希值返回 */
function comoputeHashFromStoredProcedureContent(sql: string): string {
  const re = /\$\$((.|\n)*;\s*)\$\$/; // node 8.9.3 不支持 doAll
  const body = re.exec(sql)![1];
  // console.dir(body.split('\n'));
  const hash = createHash('md5');
  hash.update(body);
  const bodyhash = hash.digest('hex');
  return bodyhash;
}

