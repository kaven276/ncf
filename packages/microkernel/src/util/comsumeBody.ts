import { IncomingMessage } from 'node:http';

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return Promise
 */
export async function consumeBody(body: IncomingMessage): Promise<Buffer> {

  const accum: Buffer[] = [];
  let accumBytes = 0;

  // console.log('consumeBody');
  try {
    let chunk: Buffer;
    for await (chunk of body) {
      accumBytes += chunk.length;
      // console.log('chunk', accumBytes, chunk);
      accum.push(chunk);
    }
  } catch (error) {

  }

  return Buffer.concat(accum, accumBytes);
}
