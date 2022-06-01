import { StringCodec } from "nats";
import nc from '.';

// create a codec
const sc = StringCodec();

export const faas = (async () => {
  // create a simple subscriber and iterate over messages
  // matching the subscription
  const messages: any[] = [];
  const sub = nc.subscribe("hello");
  for await (const m of sub) {
    console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    messages.push(sc.decode(m.data));
    if (messages.length > 1) break;
  }
  console.log("subscription closed", messages);
  return messages;
});
