// 查询指定用户是否有指定的角色
// 可以借助布隆过滤器快速判断
// 可以通过缓存 user 包含的 roles array

import { roles } from './roles';

/** 每个用户拥有的角色清单，最终应该来自于数据库 */
const userRoles: {
  [key: string]: string[] | undefined,
} = {
  admin: [roles.admin, roles.approver, roles.normal],
  user1: [roles.normal],
  user2: [roles.approver],
  user3: [roles.admin],
}

export async function ifUserHasRole(user: string, role: string) {
  const roles = userRoles[user];
  // console.dir([user, roles, role]);
  if (!roles) return false;
  return roles.includes(role);
}
