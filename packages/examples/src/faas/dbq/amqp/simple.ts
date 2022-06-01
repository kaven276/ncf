import { Service, getDebug } from '@ncf/microkernel';
import mq from '.';

const debug = getDebug(module);

interface Api {
  path: '/dbq/amqp/simple',
  request: undefined,
  response: {
    msgList: string[],
  },
}

const queueName = 'simplest';

export const faas: Service<Api> = async () => {
  receive(); // 先开启消息接收端，方便测试
  const channel = await mq.createChannel();
  await channel.assertQueue(queueName, { durable: false });
  const msgList: string[] = [];
  for (let i = 0; i <= 3; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const msg = `生产消息:${i}`;
    msgList.push(msg);
    channel.sendToQueue(queueName, Buffer.from(msg))
    debug(`[p]<-- 生产消息:${i}`);
  }
  return {
    msgList,
  }
}

const receive = async () => {
  const channel = await mq.createChannel();
  await channel.assertQueue(queueName, { durable: false });
  // 自动回执消息
  const opt = {
    noAck: true
  }
  // 每次消费一个消息
  channel.prefetch(1)
  // 消费消息
  channel.consume(queueName, msg => {
    if (!msg) return;
    const msgText = msg.content.toString()
    debug(`[c]--> 接收到消息:${msgText}`)
  }, opt);
}
