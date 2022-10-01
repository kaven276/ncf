如果 faas 返回的是  react element 则使用 react-dom/server 渲染和转换成 html 文本

* 支持 react-helmet 在组件中配置 head 区域内容，包括 title, meta, style, link, style，可设置 html/body attributes
* 支持 import .css, .js as text 或者模板字符串函数
* 支持 css 到 less, css module
* 支持 .js 到 .ts
* 支持 `<Link href="@./userTable.ssr.css" />` 这个涉及到异步组件，需要等待 css 加载完成后再渲染
* 支持 `<Script href="@./userTable.ssr.js"></script>`
* css-in-js 方案到服务端应用的引用
  - https://cssinjs.org/features?v=v10.9.2

## 使用 Helmet 的三套 css/js 嵌入方案

1. `<style>css text</style>`
2. `import csstext; ... <style>{csstext}</style>`, `import jstext; ... <script>{jstext}</script>` 比较麻烦，还需要而外新起文件并且import比较麻烦
3. `<Helmet>{toClientScript(() => jstext)}</Helmet>` 直接用ts写客户端代码，ts转换后的js将出现在浏览器，完全优于方案1生成js
