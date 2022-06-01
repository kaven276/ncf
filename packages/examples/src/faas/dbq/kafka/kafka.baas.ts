import { Kafka } from 'kafkajs';


export const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['127.0.0.1:9093'],
});

export const producer = kafka.producer()
export const consumer = kafka.consumer({ groupId: 'test-group' })
