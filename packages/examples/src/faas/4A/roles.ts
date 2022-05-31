export const roles = {
  /** 管理员 */
  admin: 'admin',
  /** 审批员 */
  approver: 'approver',
  /** 普通访问者 */
  normal: 'normal',
} as const;

export type Roles = typeof roles[keyof typeof roles];
