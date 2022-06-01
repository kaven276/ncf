import { StringCodec } from "nats";
import nc from '.';

// create a codec
const sc = StringCodec();

export const faas = async () => {
  // to create a connection to a nats-server:
  nc.publish("hello", sc.encode("world11"));
  nc.publish("hello", sc.encode("again22"));

  // we want to insure that messages that are in flight
  // get processed, so we are going to drain the
  // connection. Drain is the same as close, but makes
  // sure that all messages in flight get seen
  // by the iterator. After calling drain on the connection
  // the connection closes.
  // await nc.drain();
  return 'ok';
}
