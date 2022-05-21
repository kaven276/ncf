// https://pm2.keymetrics.io/docs/tutorials/using-transpilers-with-pm2
// https://typestrong.org/ts-node/docs/options
// https://juejin.cn/post/6844903624665989127
// https://www.npmjs.com/package/tsconfig-paths

// 解释器使用 ts-node 方式，不能支持 cluster 模式，不推荐。但是方便指定 --transpile-only
const tsNodeConfig = {
  interpreter: './node_modules/.bin/ts-node',
  // 解释器参数 -P 表示项目路径，会自动使用项目的 tsconfig.json
  interpreter_args: '-P ./tsconfig.json -r tsconfig-paths/register --transpile-only',
  script: './src/index.ts',
}

// 通过启动 js 里面注册 -r ts-node/register -r tsconfig-paths/register 来运行 ts
// require('ts-node').register 中可以方便的指定参数配置，推荐
const jsBootConfig = {
  script: './src/server.js',
  exec_mode: 'cluster',
  instances: 3,
}

// 解释器还是 node 不是 ts-node，这样 pm2 支持启用 cluster 模式
const nodeCluster = {
  interpreter: 'node',
  interpreter_args: '-r ts-node/register -r tsconfig-paths/register',
  script: './src/index.ts',
  exec_mode: 'cluster',
  instances: 3,
}

// 预编译完执行，这样加载编译后的代码，更快速
// 但是 tsc 编译完后，tsconfig.json paths 中的 import 没有调整过来，暂时无法使用
const jsConfig = {
  script: './dist/index.js',
}


module.exports = {
  apps: [{
    name: "ncf-examples",
    // 指定解释器
    ...jsBootConfig,
    cwd: './',
    env: {
      NODE_ENV: 'development'
    },
    env_development: {
      NODE_ENV: 'development',
      DEBUG: '*',
    },
    env_production: {
      NODE_ENV: 'production'
    },
    kill_timeout: 3000,
    wait_ready: false,
    watch: false,
    // watch: ['server'],
    ignore_watch: ['node_modules'],
    watch_options: {
      // "usePolling": true
    },
    vizion: false,
  }]
}
