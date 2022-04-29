import { createAMQPConnection } from './createAMQPConnection';
import { env } from 'src/env';

let connection = createAMQPConnection(env.AMQP_URL);

export default connection;
