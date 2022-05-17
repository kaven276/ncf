const path = require('path');
const appPkgName = path.basename(process.cwd());

const config = {
  'umi3a': 4001,
  'enncloud-ucenter': 4002,
  'enncloud-portal': 4003,
  'enncloud-bss': 4004,
  'enncloud-cmp': 4005,
  'enncloud-oss': 4006,
  'app-fl-console': 4007,
  'app-lc-monitor': 4008,
  'app-jira-manager': 4009,
  'app-fl-demo': 4010,
  'clouddeskwebclient': 4011,
  'app-fl-proxy': 4012,
  'app-fl-demand': 4013,
  'sso': 4014,
  'mobile': 4015,
  'enncloud-others': 4016,
  'cra5template': 4017,
}

exports.PORT = config[appPkgName];

console.log(`Buiding ${appPkgName}, PORT=${exports.PORT}`);