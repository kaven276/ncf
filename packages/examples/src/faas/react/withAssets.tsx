import React from 'react';
import { User } from "entity/User";
import { Service } from '@ncf/microkernel';


/**
 * 测试页面挂载静态资源，测试带 js/css
 */
export const faas: Service = async (req) => {

  return (
    <html lang="zh-CN">
      <head>
        <link href="/static/style.css" rel="stylesheet" />
        <script src="/static/test.js"></script>
      </head>
      <div className="container">

      </div>
    </html>
  );
}

