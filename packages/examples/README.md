## 普通启动

```shell
# 开启调式日志，
export DEBUG='*'
# 开启开发模式，用于开启模块热更新，如果
export NODE_ENV='development'

# 注：如果不构建，采用 ts-node 运行没有设置本环境变量 DEBUG 会自动设置成 '*' 来运行，并且自动开启模块热更新
# 如果直接使用 node 运行构建后的 js 代码，需要设置上面环境变量来生效

npm start # 正式运行模式启动，ts-node 直接运行，但是不做 ts 编译检查，简单脱掉类型留下 js 来执行，比较快速
npm dev # 开发模式启动，ts-node 直接运行 ts 代码，带 ts 编译检查
```

## pm2 集成

开发模式 pm2 启动 

```shell
pm2 start ecosystem.config.js --env development
```

## migration

```
# 生成 migration 范例
npx typeorm-ts-node-commonjs migration:generate -d src/baas-config/test1.ormconfig.ts src/migration/test2

# 执行 migration 范例
npx typeorm-ts-node-commonjs migration:run -d src/baas-config/test1.ormconfig.ts

# 还原到上一个版本
npx typeorm-ts-node-commonjs migration:revert -d src/baas-config/test1.ormconfig.ts
```
