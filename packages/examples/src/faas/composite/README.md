不再是简单的单功能服务，需要将各个原子处理成分按规则整合成更高层的服务。

1. nested 只是 faas 通过其他 faas，有状态模块的支持来实现其功能
2. transaction 2PC 两阶段提交的强事务
3. later 延迟执行指定的 faas
