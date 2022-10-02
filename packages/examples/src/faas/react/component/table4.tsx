import React, { type PropsWithChildren } from 'react';
import { User } from "entity/User";
import { faas as findUsers } from '../../typeorm/hr/findUsers';
import { Helmet } from "@ncf/mw-react-server-render";
import { header, renderUser } from '../userTable';


/** 异步函数，输出 Promise<tsx>，真正实现了集成 tsx,css,js,后台异步调用(db) 的组件化
 */
export async function asyncUsersTable4() {
  const users: User[] = await findUsers({});
  return () => (
    <table id="users4" cellPadding={10} style={{ border: "1px solid lime" }}>
      <Helmet>
        <style>{`
          #users4 > thead {color: pink}
          #users4 > tbody { color: gray}
        `}</style>
      </Helmet>
      {header}
      <tbody>{users.map(renderUser)}</tbody>
    </table>
  )
}
