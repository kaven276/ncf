import React from 'react';
import { User } from "entity/User";
import { faas as findUsers } from '../typeorm/hr/findUsers';
import { IRequest, header, renderUser } from './userTable';
import { Layout } from './common';
import { setReactServerRenderConfig, ctxTitle } from '@ncf/mw-react-server-render';


/** 单独对本faas服务配置 Layout/title，当然正式使用时会在目录配置上统一设置，使得代码非常的简练 */
export const config = {
  ...setReactServerRenderConfig({
    Layout,
  }),
}

/** 使用可复用的 react Layout 包裹 */
export async function faas(req: IRequest) {
  const users: User[] = await findUsers(req);
  ctxTitle.set('user table 4');
  return (
    <div>
      <br />
      <form role="form" className="form-inline well" action="./userTable3" method="get">
        <div className="form-group">
          <label htmlFor="onlyFirstName">firstName 模糊匹配查询条件</label>
          <input type="text" className="form-control" id="onlyFirstName"
            name="onlyFirstName" placeholder="请输入名称"
            defaultValue={req.onlyFirstName}
          />
        </div>
        <div className="checkbox">
          <label>
            <input type="checkbox" name="showNames" defaultChecked={req.showNames} />是否展示别名清单
          </label>
        </div>
        <button type="submit" className="btn btn-default">查询</button>
      </form>
      <table className='table table-bordered table-hover table-responsive'>
        {header}
        <tbody>{users.map(renderUser)}</tbody>
      </table>
    </div>
  );
}
