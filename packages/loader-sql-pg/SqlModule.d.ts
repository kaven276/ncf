type SqlType = 'do' | 'sf' | 'dyna' | 'bind';

interface Common {
  path: string,
  sqlOnly?: boolean,
  sqlType: SqlType,

  /** 静态编译不通过的异常提示信息 */
  staticError: string,
  /** 最终生成的 faas 函数 */
  faas?: (req: any) => Promise<any>,

  [cfgKey: string]: any,
}

interface DoSql {
  sqlType: 'do',
  doSql: string,
  /** 如 pgplsql 等等，生成 `do language ${m.language || 'plpgsql'} $$${sql}$$` */
  language: string,
}

interface StoreFunction {
  sqlType: 'sf',
  /** 编译到数据库中存储过程的名字，形如 svc_${fnName}_${bodyhash}`.substring(0, 64) */
  fnName: string,
  /** 创建存储过程的文本，形如 `function ${m.fnName}` */
  fnSql: string,
}

interface DynamicSql {
  sqlType: 'dyna',
  sqlTextMaker: Function,
}

interface BindSql {
  sqlType: 'bind',
  /** 已经将命名参数转换为 :n 数字参数的 SQL 文本 */
  sqltext: string,
  /** 需要进行参数绑定的请求参数 keys，对应 :n 顺序 */
  pmap: string[],
}

type SqlModue = Common & (DoSql | StoreFunction | DynamicSql | BindSql)

export type { SqlModue }
