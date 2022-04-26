使用 npm 包 amqplib 对接 rabbitmq 范例。

用途：

* 使用延迟调用。比如 faa1(下单) 延迟调用 faas2(没支付就取消订单)，实现过多长时间没有支付就取消订单。
* 客户端推送。send(userId, msgType, msgContent) 到队列，队列在找到对应的 websocket nodejs cluster 中指定节点将消息推送到用户客户端。
* 工作流节点完成消息进入队列，然后路由到指定 nodejs 上改 work flow 异步函数执行实例中，驱动流程继续处理。

参考 
* https://github.com/coolliyong/node_rabbitMQ_mqtutorial
* https://github.com/amqp-node/amqplib/tree/main/examples/tutorials
* https://www.rabbitmq.com/getstarted.html
* https://amqp-node.github.io/amqplib/
