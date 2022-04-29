import db from '.';
import { StringDecoder } from 'node:string_decoder';
const decoder = new StringDecoder('utf8');

/** 遍历 kv store */
export const faas = async () => {
  const result = [];
  //@ts-ignore
  for await (const [key, value] of db.iterator()) {
    result.push([decoder.write(key), decoder.write(value)]);
  }
  return result;
}
