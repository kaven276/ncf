
## migration

```
# 生成 migration 范例
npx typeorm-ts-node-commonjs migration:generate -d src/baas-config/test1.ormconfig.ts src/migration/test2

# 执行 migration 范例
npx typeorm-ts-node-commonjs migration:run -d src/baas-config/test1.ormconfig.ts
```
