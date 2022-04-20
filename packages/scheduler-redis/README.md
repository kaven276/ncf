调度器核心功能
============

1. 对于弱事务，主事务成功带提交前，将附属任务放入可靠队列，然后由本调度器执行
2. 对于需要延迟定时执行的事务，需要本调度器来实现按计划时间执行任务

设计
====

createScheduler(opts)

- opts.redisClient 提供 redis 客户端对象
- opts.queueName 队列名称，对应 redis 中的 LIST
- faasUrlHttp faas 服务的根地址，从队列中取出的任务将按这个地址进行调用
- faasUrlSocketIo faas 服务，gateway 采用 socket.io 协议的
