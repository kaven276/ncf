import React from 'react';
import { ctxTitle, type Layout, Helmet } from '@ncf/mw-react-server-render';

/** 各个 bootstrap 页面的 header */
export function CommonHead(props: {
  /** document title 设置 */
  title?: string
} = {}) {
  const helmet = Helmet.renderStatic();
  return (
    <head >
      {/* <title>{props.title ?? 'Bootstrap 模板'}</title> */}
      {helmet.title.toComponent()}
      {helmet.meta.toComponent()}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" />
    </head>
  );
}

/** 返回完整的 html */
export const Layout1: Layout = (props) => {

  return (
    <html lang="zh-CN">
      <CommonHead title={ctxTitle.get()} />
      <div className="container">
        {props.children}
      </div>
    </html>
  )
}

/** 只返回 body 内部的内容 */
export const Layout2: Layout = (props) => {

  return (
    <div className="container">
      <Helmet>
        <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.1/jquery.slim.js"></script>
      </Helmet>
      {props.children}
    </div>
  )
}
