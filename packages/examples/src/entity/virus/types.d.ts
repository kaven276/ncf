/** 人员 */
interface Person {
  /** 18位身份证ID */
  id: string,
  /** 人员姓名 */
  name: string,
  /** 手机号 */
  mobile: string,
  /** 录入时间 */
  regtime: Date,
  dose?: ITestDose[],
}

/** 试剂 */
interface ITestDose {
  /** 试剂编号 */
  serial: string,
  /** 使用时间 */
  use_time: Date,
  /** 使用的人员 */
  testees: Person[],
}

export type {
  Person,
  ITestDose,
}
