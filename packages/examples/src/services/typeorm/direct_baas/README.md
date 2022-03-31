直接通过 typescript import 获取已经初始化后的 typeorm DataSource，不依赖任何的中间件机制。

## 方案一 byDir.ts

各个 faas 模块通过 import . 来从目录模块中拿到 getter 函数，层层向上，最终拿到 baas 模块。

好处是可以通过 ts 关系非常清晰的在 baas 功能模块和 baas 使用模块双向导航。

## 方案二 byManager.ts

统一在管理模块 lazy 持有各个 DataSource，faas 模块调用管理模块的 getter(name) 获取指定名称的 typeorm DataSource.
