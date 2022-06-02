事务，一个 faas 请求，调用多处子模块，各自使用 baas 做操作

* mixTypeormPgTx.ts 跨 pg/typeorm 两类 baas 做统一事务
* testTransactionQueryRunner.ts 不同参数并发调用两遍带事务子函数，子函数还带有带事务子函数
