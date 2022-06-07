import redis from '.';
import { nanoid } from 'nanoid';
import { range, makeArr } from 'src/util/fake';
import { redisKey } from './constants';

function fakeIdList(): string[] {
  return makeArr(range(80, 120)).map(() => String(range(1000, 9999)));
}


/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  const resultListId = nanoid() //=> "V1StGXR8_Z5jdHi6B-myT"
  const resultList = fakeIdList();
  const result = await redis.lpush(redisKey(resultListId), ...resultList);
  return {
    resultListId,
    result,
  };
}
