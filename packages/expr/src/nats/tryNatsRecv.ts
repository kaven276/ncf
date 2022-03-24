import { connect, StringCodec } from "nats";
const sc = StringCodec();

const servers = [
  { port: 4222 },
];

async function test() {
  servers.forEach(async (v) => {
    try {
      const nc = await connect(v);
      console.log(`connected to ${nc.getServer()}`);
      // this promise indicates the client closed
      const done = nc.closed();
      // do something with the connection

      const sub = nc.subscribe("hello");
      (async () => {
        for await (const m of sub) {
          console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
        }
        console.log("subscription closed");
      })();

      return;
      // close the connection
      await nc.close();
      // check if the close was OK
      const err = await done;
      if (err) {
        console.log(`error closing:`, err);
      }
    } catch (err) {
      console.error(err);
      console.log(`error connecting to ${JSON.stringify(v)}`);
    }
  });
}

test();
