import React from 'react';
import { User } from "src/entity/User";
import { faas as findUsers } from '../typeorm/hr/findUsers';
import { renderToString } from 'react-dom/server';
import { innerCall } from '@ncf/microkernel';

const header = (
  <thead>
    <tr>
      <th>first name</th>
      <th>last name</th>
      <th>age</th>
      <th>names</th>
    </tr>
  </thead>
)

interface IRequest {
  sex?: User["sex"],
  showNames?: boolean;
  onlyFirstName?: string,
}
/**
 * 完整测测试 ORM find 参数，包括
 * 1) select/where/order
 * 2) relation 的 select/where/order
 * 3) take, skip
 * 4) dynamic query/sql
 */
export async function faas(req: IRequest) {
  // return innerCall(findUsers, req);
  //@ts-ignore
  const users: User[] = (await innerCall('/typeorm/hr/findUsers', req)).data;
  const rows = users.map(user => (
    <tr key={user.id}>
      <td>{user.firstName}</td>
      <td>{user.lastName}</td>
      <td>{user.age}</td>
      <td>
        {user.names && (
          <ul>
            {user.names.map(n => (<li>{n}</li>))}
          </ul>
        )}
      </td>
    </tr>)
  );
  return '<!DOCTYPE html>' + renderToString(
    <html lang="zh-CN">
      <table cellPadding={10} style={{ border: "1px solid lime" }}>{header}<tbody>{rows}</tbody></table>
    </html>
  );
  // return users;
}
