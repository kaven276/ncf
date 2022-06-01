import { Service, getDebug } from '@ncf/microkernel';
import mq from '.';

const debug = getDebug(module);

interface Api {
  path: '/amqp/sender',
  request: undefined,
  response: void,
}

const queueName = 'tasks';

export const faas: Service<Api> = async () => {
  const channel = await mq.createChannel();
  await channel.assertQueue(queueName, { durable: false });
  for (let i = 0; i <= 3; i++) {
    await new Promise(r => setTimeout(r, 1000));
    channel.sendToQueue(queueName, Buffer.from(`生产消息:${i}`))
    debug(`[p]<-- 生产消息:${i}`);
  }
  await channel.close();
}
