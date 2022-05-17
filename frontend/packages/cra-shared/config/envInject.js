const { GitRevisionPlugin } = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin();

/** 所有要用到的环境变量原样收集好，注入的前端应用
 * @returns string
 */
function getFEnv() {
  const FEnv = {
    // VERSION: (gitRevisionPlugin.version()),
    COMMITHASH: (gitRevisionPlugin.commithash()),
    BRANCH: (gitRevisionPlugin.branch()),
    LASTCOMMITDATETIME: (gitRevisionPlugin.lastcommitdatetime()),
  };
  Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith('FE_') && value) {
      FEnv[key.slice(3)] = value;
    }
  });
  return JSON.stringify(FEnv);
}

/** 用于注入构建时 FE_ 开头的环境变量到前端 index.html */
exports.injectEnv = () => {
  return `
  <script>var envConfig = ${getFEnv()}; function overrideByContainerEnv(c) { window.envOverride = c }</script>
  <script src="/config.js"></script>
  `
}