import React from 'react';
import { ctxTitle, type Layout } from '@ncf/mw-react-server-render';

/** 各个 bootstrap 页面的 header */
export function CommonHead(props: {
  /** document title 设置 */
  title?: string
} = {}) {
  return (
    <head>
      <title>{props.title ?? 'Bootstrap 模板'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" />
    </head>
  );
}

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
