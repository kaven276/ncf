import { StringCodec } from "nats";
import nc from '.';

// create a codec
const sc = StringCodec();

const subcribe = (async () => {
  // create a simple subscriber and iterate over messages
  // matching the subscription
  const messages: any[] = [];
  const sub = nc.subscribe("hello");
  for await (const m of sub) {
    console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    messages.push(sc.decode(m.data));
  }
  console.log("subscription closed");
  return messages;
});

export const faas = async () => {
  // to create a connection to a nats-server:
  const promise = subcribe();
  nc.publish("hello", sc.encode("world11"));
  nc.publish("hello", sc.encode("again22"));

  // we want to insure that messages that are in flight
  // get processed, so we are going to drain the
  // connection. Drain is the same as close, but makes
  // sure that all messages in flight get seen
  // by the iterator. After calling drain on the connection
  // the connection closes.
  // await nc.drain();
  return promise;
}
