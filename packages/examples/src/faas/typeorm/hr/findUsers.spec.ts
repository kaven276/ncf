import { User, UserRole } from "entity/User";

export interface IRequest {
  sex?: User["sex"],
  /** 是否结果中包含所有别名数组 */
  showNames?: boolean;
  /** 是否按照 firstName ILike 匹配查找 */
  onlyFirstName?: string,
}

export interface ISpec {
  path: '/typeorm/hr/findUsers',
  request: IRequest,
  response: User[],
}
