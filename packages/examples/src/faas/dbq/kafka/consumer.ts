import { consumer } from './kafka.baas';
import { getDebug } from '@ncf/microkernel';

const debug = getDebug(module);

export const faas = async () => {
  await consumer.connect();
  debug('kafka consumer connected!');
  const messages: any[] = [];
  try {
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });
    debug('kafka consumer subscribed!');

    // 这里没有退出机制，会一直监听新消息，不退出
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          partition,
          offset: message.offset,
          value: message.value?.toString(),
        });
        messages.push(message);
      },
    });
  } finally {
    await consumer.disconnect();
  }
  return messages;
}
