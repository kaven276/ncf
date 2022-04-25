import { createAMQPConnection } from './createAMQPConnection';

let connection = createAMQPConnection('amqp://admin:admin@localhost:5672');

export default connection;
