import { Service, getDebug, resolved } from '@ncf/microkernel';
import mq from '.';
import { state } from './state';

const debug = getDebug(module);

interface Api {
  path: '/amqp/receiver',
  request: undefined,
  response: {
    inst: number,
    msgText: string,
  },
}

const queueName = 'tasks';

export const faas: Service<Api> = async () => {
  const inst = ++state.receiverInst;
  const channel = await mq.createChannel();
  await channel.assertQueue(queueName, { durable: false });
  // 自动回执消息
  const opt = {
    noAck: true
  }
  // 每次消费一个消息
  await channel.prefetch(1)
  // 消费消息
  let msgText: string;
  await channel.consume(queueName, msg => {
    if (!msg) return;
    msgText = msg.content.toString()
    debug(`${inst}[c]--> 接收到消息:${msgText}`)
    channel.ack(msg);
  }, opt);
  await channel.close();
  return {
    inst,
    msgText: msgText!,
  };
}
