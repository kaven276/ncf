import React from 'react';
import { User } from "entity/User";
import { faas as findUsers } from '../typeorm/hr/findUsers';
import { IRequest, header, renderUser } from './userTable';
import { Layout1 } from './common';
import { ctxTitle } from '@ncf/mw-react-server-render';

/** 使用可复用的 react Layout 包裹 */
export async function faas(req: IRequest) {
  ctxTitle.set('user table 3');
  const users: User[] = await findUsers(req);
  return (
    <Layout1>
      <table className='table' cellPadding={10} style={{ border: "1px solid lime" }}>
        {header}
        <tbody>{users.map(renderUser)}</tbody>
      </table>
    </Layout1>
  );
}
