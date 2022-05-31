export const roles = {
  /** 管理员 */
  admin: 'admin',
  /** 审批员 */
  approver: 'approver',
  /** 普通访问者 */
  normal: 'normal',
} as const;

export type Roles = typeof roles[keyof typeof roles];

declare module '@ncf/microkernel' {
  interface Service {
    /** 允许执行本 faas 的角色 */
    role?: Roles;
  }
}
