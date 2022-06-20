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

数据库等基础环境
================

目前仅配置 postgres db，docker-compose.yml 为安装配置 pg 容器的声明文件。

本目录下执行 `docker-compose up -d` 拉起 pg 容器。

范例展示核心部分说明
=================

* 100% typescript 覆盖
  - 前后台之间靠 ts API 规范集成，依赖 faasCall/AsyncTrack
  - 后台代码到关系数据库通过 typeorm
  - 环境变量通过 env.ts 类型化和模块化
  - 各种静态配置直接使用 ts，如国际化中配置项可以是函数，无需 json/xml/yaml/.property 等形式的配置
  - 从业务概念和业务活动出发开始落地核心 ts 类型定义，再延伸到 typeorm 模型，前后台 faas 服务 API 规范
* 架构基本概念
  - faas 外部能直接调用的服务
  - baas 为数据库连接池类的对象，用于 faas 访问外部资源，主要是有状态服务，如各种数据库，队列，缓存系统或者第三方系统
  - middleware 执行 faas 前类似 koa 洋葱模型的拦截处理，可以在其中做记录日志统计，对请求响应数据进行校验和转换，认证授权的校验，并发度控制，APM集成等等
    - dir config 目录配置，可以在任何层级对本目录范围内的中间件进行配置，做到中间件对不同的 faas 的配置可以千人前面
  - extension 位于紧贴核心层面，但是依赖第三方资源的扩展，如 laterCall 支持扩展，目前一版基于 rocksdb 来实现持久化的延迟任务
  - loader 模块加载器，将非 js/ts faas 转换成 faas 服务，如针对 json5/xml/yaml 的静态文件加载器，针对 pg/oracle 的 sql 服务加载器
  - proxy 代理。将外部系统的 API 包装代理，从而纳入 ncf 体系，可以添加 ts 接口规范，接受 ncf 中间件的加成。可用于非ncf旧系统的迁移过渡。
  - gateway 接入网关，可以通过nodejs原生http模块或者是koa生态模块来对外部请求接入，导入到 NCF 核心层处理
* 任务类型
  - 标准的请求响应 faas 服务
  - laterCall 延迟任务，标准 faas 服务发起，时间到了最终落到执行目标 faas
  - 定时任务，按照 js crontab 配置定时发起 faas 调用，faas 可能是 cpu 密集型长任务
  - 进程独占的一次性任务
  - 流程执行任务
* 事务性
  - 直接使用 typeorm/pg 等 baas 连接池模块，发起 auto-commit 的请求
  - 强事务，两阶段提交事务。使用 db.getXxxTx 版本的数据库连接对象，然后进行变更；同一个 faas 执行期间的 db.getXxxTx 确保返回是同一个数据库连接。
    faas 执行成功后自动对所有连接执行 commit，faas 执行异常自动对所有连接执行 rollback。
  - 弱事务，最终一致性事务。对于 faas 中通过 laterCall 执行延迟任务的，faas 执行成功后，会尝试一次性将所有积累的 laterCall 序列化后发往 later 服务，
    延迟任务保存成功后，faas 中的 pending tx commit，否则 rollback。
    写延迟队列也在 faas 事务控制中，如果 faas 执行异常，则积攒的延迟任务就会被丢弃。
* 懒加载，热更新
  - 全量懒加载，没被使用的模块不会加载
  - 因为懒加载，服务启动快，方便开发调试
  - 因为懒加载，可以方便的通过 faas 平台执行一次性任务
  - 模块变更保存后，自动热更新自身和整个依赖链条，重新访问受影响的 faas 时，使用的是全新的版本
* 测试，自动执行测试，测试覆盖率
  - REPL 开启 .auto 后
  - 执行 yarn tap 执行所有 .test.ts 模块，并自动统计测试覆盖率出报表


范例索引
=========

/src/env.ts 对部署环境变量的统一供应模块，应用其他代码对环境变量的使用仅允许通过该模块引用
/src/intf 为业务模型 typescript 定义，不涉及映射数据库表，也不涉及服务接口定义，为业务层最为抽象层面的定义
/src/cfg/ 独立的配置，仅用于声明，需要具体的中间件来落地支持
/src/baas 各种基础设施特别是数据库的客户端模块，主要是连接池对象
/src/cron 定时任务
/src/ext 核心的扩展，暂时空。一些核心层面的支持，如延迟执行等，不使用第三方npm依赖或第三方基础设施如特定数据库或队列无法支持，因而采用 extension 方式支持。
/src/faas 全部 faas 服务，对应的 ts 接口规范，json schema 校验，单元测试模块等等
/src/flow 基于标准 js 异步函数的流程引擎，目前版本仅为尝试，不作为标准
/src/i18n 多语言支持范例，没有用到第三方支持，纯 typescript 方式
/src/mw 各个中间件模块范例
/src/task 任务定义范例


## faas 范例

* /faas/basic 最基础的 faas 概念，faas, 接口规范，请求响应schema校验，import 其他模块
* /faas/cfg 各种静态配置 loader 范例
* /faas/sql 各种 sql as service loader 范例，目前还没有移植 postgre/oracle 的老的 sqlib，仅占位用
* /faas/file 文件上传下载转换，多文件上传范例
* /faas/proxy /faas/ITSM 代理范例
* /faas/composite/nested faas 间调用，依赖有状态模块的范例
* /faas/composite/transaction 两阶段事务范例
* /faas/composite/later 延迟执行范例，相当于解耦的弱事务，最终一致性模型
* /dbq 中的子目录 /es /pg /typeorm /redis /amqp /kv 各种常见基础设施数据库队列的集成范例
* /4A 认证，权限校验等 AAAA 范例，目前只有登录服务
* /fromMW 基于中间件的服务，展示通过 faas 展示和控制中间件
* /versions 展示基于特性的灰度控制方案
* /usecase 无需前端开发，直接运行后台模块，目前是通过 react 标准前端开发方式 react-ink 字符终端交互

## typescript 贯穿

* /src/intf/user.ts 抽象的用户数据规范
* /src/baas/typeorm/entity/User.ts 具体到ORM数据库表
* /src/faas/typeorm/hr/findUsers.ts 使用到 User entity 的 faas
* /src/faas/typeorm/hr/findUsers.spec.ts  findUsers 服务的纯 ts 接口规范
* /src/faas/typeorm/hr/findUsers.test.ts findUsers 的 unit test 和 tap test 

* xxx.check.ts 从接口规范到请求响应校验的定义
* env.ts 环境变量的 ts 模块化


## 范例数据准备

vscode 搜 seed

* /src/faas/typeorm/hr/fillSeedUsers.ts 填充初始用户数据
* /src/faas/typeorm/hr/fillSeedOrgs.ts 填充初始组织数据
