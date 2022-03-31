
## migration

```
# 生成 migration 范例
npx typeorm-ts-node-commonjs migration:generate -d src/baas-config/test1.ormconfig.ts src/migration/test2

# 执行 migration 范例
npx typeorm-ts-node-commonjs migration:run -d src/baas-config/test1.ormconfig.ts

# 还原到上一个版本
npx typeorm-ts-node-commonjs migration:revert -d src/baas-config/test1.ormconfig.ts
```
