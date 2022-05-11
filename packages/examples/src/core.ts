import 'dotenv/config';
import { setHttpEnqueue } from '@ncf/microkernel';

setHttpEnqueue({
  host: '127.0.0.1',
  port: process.env.LATER_PORT || 7999,
});
