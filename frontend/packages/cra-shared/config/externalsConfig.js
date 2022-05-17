const paths = require('./paths');
const fs = require('fs');
const resolveApp = paths.resolveApp;
const { externalsSrcConfig, globalNameMap, orderDepConfig } = require('./externalsResource');

/** 从当前应用 build.config.js 中配置要哪些包做 externals 保存在这里 */
let externalsArr = [];
try {
  externalsArr = require(resolveApp('build.config.js')).externals.split(',').filter(Boolean);
} catch (e) {
}

/** 根据应用 build.config.js 中描述的 externals npm 包清单生成 webpack externals 配置 */
exports.makeExternalsConfig = () => {
  // console.log('makeExternalsConfig', externalsString)
  let config = {};
  for (let n of externalsArr) {
    config[n] = globalNameMap[n];
  }
  // console.log('makeExternalsConfig', config);
  return config;
}

/** 传入 alias.$externalsInfo 并最终传入 index.html 中 window. */
exports.makeExternalsInfo = () => {
  let externalsSrc = {};
  for (let n of externalsArr) {
    externalsSrc[n] = externalsSrcConfig[n];
  }
  let orderDep = {};
  for (let n of externalsArr) {
    orderDep[n] = orderDepConfig[n];
  }
  return JSON.stringify({
    externalsSrc,
    orderDep,
    externalsArr,
  });
}

/** 将 externals injection runtime 注入，通过 alias.$externalsScript */
exports.externalsScript = () => {
  const fpath = require.resolve('../public/externals.js', __dirname);
  const scriptText = fs.readFileSync(fpath, { encoding: 'utf8' });
  // return scriptText;
  return `<script>
  window.$externalsInfo = '${exports.makeExternalsInfo()}'; // 必须用单引号，因为里面有 json string
  (function(){${scriptText}})()
  </script>`
}
