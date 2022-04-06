
## pm2 集成

普通启动

```shell
# 开启调式日志
export DEBUG='*'
# 开启开发模式，用于开启模块热更新
export NODE_ENV='development'
```

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
