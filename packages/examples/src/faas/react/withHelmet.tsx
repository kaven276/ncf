import React, { type PropsWithChildren } from 'react';
import { User } from "entity/User";
import { faas as findUsers } from '../typeorm/hr/findUsers';
import { Service } from '@ncf/microkernel';
import { Helmet, cfgLayout, toClientScript, fnToIIFE } from "@ncf/mw-react-server-render";
import { header, renderUser } from './userTable';
import { Layout2 } from './common';
import tableJsText from './userTable.ssr.js';
import tableCssText from './userTable.ssr.css';

export interface IRequest {
  sex?: User["sex"],
  showNames?: boolean;
  onlyFirstName?: string,
}

interface Spec { path: string, request: IRequest, response: any };

let laterContent: any;

/** 容器来控制子内容如何渲染，并记录写内容供后面的 Later 组件在后面渲染 */
function Wrapper(p: PropsWithChildren<any>) {
  const child = p.children;
  if (child instanceof Array) {
    return (
      <div>children should be single</div>
    )
  }
  // 前面的渲染可以收集一些内容，后面可以用到
  laterContent = child;
  // console.dir(p);
  if (child.type === 'div') {
    child.type === 'h1';
    return { ...child, type: 'h1' };
  }
  return child;
}

/** 渲染来自其他组件渲染时记录的内容 */
function Later() {
  if (!laterContent) {
    return (<div>no later content</div>)
  }
  const el = React.cloneElement(laterContent, undefined, (
    <h2> double to {2 * Number(laterContent.props.children)}</ h2>
  ));
  return el;
}

/** 每个组件可以拥有自己的样式，
 * 多次渲染 head 中内容只会渲染一次，
 * css selector 可以确保样式规则不外泄。
 * 引用的外部文件能确保不重复生成多份 link/script。
 * 本范例全部 style/script 都使用文本方式编写，无 css/js 语言支持，适合简单的 css/js 代码
 */
function UserTable1(p: {
  users: User[],
}) {
  return (
    <table className='users1' cellPadding={10} style={{ border: "1px solid lime" }}>
      <Helmet>
        <style>{`
          .users1 > thead {color: orange}
          .users1 > tbody { color: lime}
        `}</style>
        <script>{`
          const t = $('.users1');
          t.click((e) => console.warn('table clicked ' + e.currentTarget.className));
        `}</script>
      </Helmet>
      {header}
      <tbody>{p.users.map(renderUser)}</tbody>
    </table>
  )
}

/** 独立的 css/js 被 import，然后内嵌随 html 一起返回，网络请求减少整体加载效率更高。
 * 直接引用 .css 文本，因为没法启用 less 无法集成如 fn, color 等 js 功能，模块化只能分散到多个文件，组织能力较差，而且需要额外写文件 import 也比较麻烦
 * 直接引用 .js 文本，一般不推荐了，因为没法用 ts 而且需要 import 比较麻烦
 */
function UserTable2(p: {
  users: User[],
}) {
  return (
    <table className='users2' cellPadding={10} style={{ border: "1px solid lime" }}>
      <Helmet>
        <style>{tableCssText}</style>
        <script>{tableJsText}</script>
      </Helmet>
      {header}
      <tbody>{p.users.map(renderUser)}</tbody>
    </table>
  )
}

/** 浏览器端执行的代码 */
function clientScript() {
  //该函数在 browser 执行，服务端仅仅要其中的代码文本，ts 转成 js 出现在浏览器中
  document.title = 'embed server js to client js';
  // 请注意类型标注在浏览器端已经被去除
  let a: string;
  // 这里面的代码不能引用任何服务端标识符
  const t = $('.users3');
  t.on('click', (e) => console.error('table clicked ' + e.currentTarget.className));
}

/** css/js 内嵌随 html 一起返回，网络请求减少整体加载效率更高 */
function UserTable3(p: {
  users: User[],
}) {
  return (
    <table className='users3' cellPadding={10} style={{ border: "1px solid lime" }}>
      <Helmet>
        <script>{fnToIIFE(clientScript)}</script>
      </Helmet>
      {header}
      <tbody>{p.users.map(renderUser)}</tbody>
    </table>
  )
}

/** 单独对本faas服务配置 Layout/title，当然正式使用时会在目录配置上统一设置，使得代码非常的简练 */
export const config = {
  ...cfgLayout.set(Layout2)
}

/**
 * 展示通过 Helmet 不要 layout 配置输出服务端页面。
 */
export const faas: Service<Spec> = async (req: IRequest) => {
  const users: User[] = await findUsers(req);
  return (
    <div className="container">
      <Helmet>
        <title>user table4 from helmet</title>
        <link href="/table.css" />
      </Helmet>
      <Later />
      <Wrapper>
        <div>123</div>
        {/* <div>456</div> */}
      </Wrapper>
      <div>{module.id}</div>
      {true && <UserTable1 users={users} />}
      <br />
      {true && <UserTable2 users={users} />}
      <br />
      {true && <UserTable3 users={users} />}
      <Later />
    </div>
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

/**
 * 参考：
 * https://www.npmjs.com/package/react-html-document 支持将服务端json状态返回到前端
 * https://www.npmjs.com/package/react-async-component 支持异步组件，不知道 react 自己的
 */
