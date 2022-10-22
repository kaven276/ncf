使用 react 在服务端渲染页面，相当于传统的 jsp/asp。

特点

* 完全基于 typescript 开发，tsx 方便的带入 ts 数据
* 视图的模块化，提取封装完全基于标准 typescript 模块
* 通过中间件支持 faas 返回 tsx 后，自动转换成 html 文本返回
* 中间件支持配置 document.title
* 中间件支持配置页面的框架 Layout
* 曾经 js 有大量的模板引擎 DSL，https://www.npmjs.com/package/consolidate，现在统一到 react 方式，也是最有利开发维护的纯 js 方式
* 原有的 html 代码转 jsx 可以使用在线服务，如 https://www.345tool.com/zh-hans/converter/html-to-jsx-converter

服务端渲染和同构渲染参考

* [面向 Model 编程的前端架构设计](https://juejin.cn/post/6899647897508577294)
* [服务端组件 React server-component 介绍](https://zhuanlan.zhihu.com/p/379835181)
* [rfcs server-components](https://github.com/josephsavona/rfcs/blob/server-components/text/0000-server-components.md)
* [从零开始，揭秘React服务端渲染核心技术](https://juejin.cn/post/6844903902500880392#heading-8)

## jss

install `yarn add jss jss-preset-default`

## styled-component

install `yarn add styled-components` `yarn add -D @types/styled-components`

## emotion

install `yarn add @emotion/react @emotion/styled`
