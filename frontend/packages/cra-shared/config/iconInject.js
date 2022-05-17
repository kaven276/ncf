/** 本方式注入，icon 服务地址是 build 构建时决定，无法响应 rancher 拉起环境变量配置或者开发时 config.js 配置，故暂废弃不用了 */
const injectIcon_ = () => {
  const ICON_URL = process.env.FE_ICON_URL || 'http://10.39.35.250:99';
  return `
  <link rel="stylesheet" type="text/css" href="${ICON_URL}/iconfont.css" />
  <script defer src="${ICON_URL}/iconfont.js"></script>
  `
}

const fs = require('fs');
/** 将 icon injection runtime 注入，认 rancher env 和 config.js */
exports.injectIcon = () => {
  const fpath = require.resolve('../public/icon.js', __dirname);
  const scriptText = fs.readFileSync(fpath, { encoding: 'utf8' });
  return `<script>${scriptText}</script>`
}