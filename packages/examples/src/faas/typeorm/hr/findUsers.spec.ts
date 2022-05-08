import { User, UserRole } from "entity/User";

export interface IRequest {
  sex?: User["sex"],
  showNames?: boolean;
  onlyFirstName?: string,
}

export interface ISpec {
  path: '/typeorm/hr/findUsers',
  request: IRequest,
  response: User[],
}
