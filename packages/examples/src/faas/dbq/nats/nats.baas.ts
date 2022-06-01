import { connect, type NatsConnection } from 'nats';
import { resolved } from '@ncf/microkernel';

// 异步获取 mongodb 的 db 实例对象
let connection = resolved<NatsConnection>(async (addDisposer) => {
  const connection: NatsConnection = await connect();
  addDisposer(async () => {
    connection.close();
  });
  return connection;
});

export default connection;
