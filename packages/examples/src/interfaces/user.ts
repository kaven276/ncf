export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "ghost"
}

/** 核心领域模型: 用户 */
export interface IUser {
  /** 用户标识 */
  id: number,
  firstName: string,
  lastName: string,
  age: number,
  sex: string,
  role: UserRole,
  names: string[],
  extra?: string,
}
