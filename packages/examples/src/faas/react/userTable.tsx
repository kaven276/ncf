import React from 'react';
import { User } from "entity/User";
import { faas as findUsers } from '../typeorm/hr/findUsers';
import { CommonHead } from './common';
import { Service } from '@ncf/microkernel';

export const header = (
  <thead>
    <tr>
      <th>first name</th>
      <th>last name</th>
      <th>age</th>
      <th>names</th>
    </tr>
  </thead>
);

export function renderUser(user: User) {
  return (
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
    </tr>
  )
}


export interface IRequest {
  sex?: User["sex"],
  showNames?: boolean;
  onlyFirstName?: string,
}

interface Spec { path: any, request: IRequest, response: any };

/**
 * 完整测测试 ORM find 参数，包括
 * 1) select/where/order
 * 2) relation 的 select/where/order
 * 3) take, skip
 * 4) dynamic query/sql
 */
export const faas: Service<Spec> = async (req: IRequest) => {
  const users: User[] = await findUsers(req);
  return (
    <html lang="zh-CN">
      {CommonHead({ title: '用户列表' })}
      <div className="container">
        <table className='table' cellPadding={10} style={{ border: "1px solid lime" }}>
          {header}
          <tbody>{users.map(renderUser)}</tbody>
        </table>
      </div>
    </html>
  );
}

// 针对 tsx 自动多请求测试配置范例
faas.tests = {
  test1: {
    sex: 'm',
  },
  test2: {
    showNames: true,
  }
}
