import { producer } from './kafka.baas';

export const faas = async () => {
  await producer.connect();
  const result = await producer.send({
    topic: 'test-topic',
    messages: [
      { value: 'Hello KafkaJS user!' + Math.random() },
    ],
  });
  await producer.disconnect();
  return result;
}
