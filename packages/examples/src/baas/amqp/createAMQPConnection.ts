import { getDebug, resolved } from '@ncf/microkernel';
import { connect, Connection } from 'amqplib';

const debug = getDebug(module);

export function createAMQPConnection(connStr: string) {
  return resolved<Connection>(async (addDisposer) => {
    const connection = await connect(connStr);

    addDisposer(async () => {
      debug(`AMQPConnection destroying ${connStr}`,);
      connection.close();
    });
    return connection;
  });
}
