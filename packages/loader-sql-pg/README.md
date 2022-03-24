早先版本的内容
===============

使用哪个连接池，由 PSQL_POOL_ATTR 配置指定的配置项指定的 BAAS 路径决定。

比如：PSQL_POOL_ATTR='psql_pool'，那么配置项 psql_pool 的值写 BAAS 路径。psql 模块就用这个连接池访问数据库。

倒推：

1. psql 模块要用哪个连接池？来自哪个 BAAS 路径的资源？
2. 首先要规定哪个配置项指定 BAAS 路径
3. 这个配置项的名称由 PSQL_POOL_ATTR 配置决定。

注：源信息，相当于常量，属性名采用全大写。

现在版本的内容
==============

* 对于 pg pool/client 从何而来，是否是分配的带事务的 client 不关心。
  - 从 IConfig 中取得 getPool
  - 因此需要在 dir/index.ts 中配置
