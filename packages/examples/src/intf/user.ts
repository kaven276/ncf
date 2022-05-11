export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "ghost"
}

/** 核心领域模型: 用户 */
export interface IUser {
  /** 用户标识 */
  id: number,
  /** 用户首姓名 */
  firstName: string,
  /** 用户尾姓名 */
  lastName: string,
  /** 用户年龄 */
  age: number,
  /** 性别 */
  sex: string,
  /** 角色 */
  role: UserRole,
  /** 其他多个名称 */
  names: string[],
  /** 额外的拓展信息 */
  extra?: string,
}
