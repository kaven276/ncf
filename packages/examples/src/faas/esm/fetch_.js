const { resolved } = require('@ncf/microkernel');

// import() 只能写到 .js 文件中，因为 ts 会将 import() 转换成 require()，而 require(esm) 会加载失败
exports.fetch_ = resolved(() => import('fetch3').then(m => m.default));
