npm 包 fetch 最新版 fetch@^3 为纯 esm，commonjs 模块只能采用 import() 方式导入，
但是 typescript 工程已经将产出 module 设置成 commonjs 了，因此直接在 .ts 文件中 import(esm) 最终生成的代码就是 .js 中 import(esm)，从而报异常。

解决的方法是写纯 .js 来 import(esm)，然后在包装 .ts 来方便应用 .ts 代码来 import 使用。

参考 https://www.npmjs.com/package/node-fetch
