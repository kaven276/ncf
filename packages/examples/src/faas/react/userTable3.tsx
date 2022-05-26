import React from 'react';
import { User } from "entity/User";
import { faas as findUsers } from '../typeorm/hr/findUsers';
import { IRequest, header, renderUser } from './userTable';
import { Layout } from './common';
import { setReactServerRenderConfig } from '@ncf/mw-react-server-render';


/** 单独对本faas服务配置 Layout/title，当然正式使用时会在目录配置上统一设置，使得代码非常的简练 */
export const config = {
  ...setReactServerRenderConfig({
    Layout,
    title: '用户列表3',
  }),
}

/** 使用可复用的 react Layout 包裹 */
export async function faas(req: IRequest) {
  const users: User[] = await findUsers(req);
  return (
    <table className='table' cellPadding={10} style={{ border: "1px solid lime" }}>
      {header}
      <tbody>{users.map(renderUser)}</tbody>
    </table>
  );
}
