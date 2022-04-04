module.exports = {
  apps: [{
    name: "ncf-examples",
    // 指定解释器
    interpreter: './node_modules/.bin/ts-node',
    // 解释器参数 -P 表示项目路径，会自动使用项目的 tsconfig.json
    // interpreter_args: '-P ../.. -r tsconfig-paths/register',
    interpreter_args: '-r tsconfig-paths/register',
    script: './index.ts',
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
    }
  }]
}
