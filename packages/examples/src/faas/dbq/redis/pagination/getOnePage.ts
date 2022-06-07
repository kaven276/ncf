import redis from '.';
import { redisKey } from './constants';
import { state } from './state';

const countPerPage = 10;

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas(req: any) {
  req = {
    resultListId: "c6RzMOdnhd12z3LPU0bGe",
    pageNo: state.currentPageNo,
    ...req,
  }
  state.currentPageNo += 1;

  const len = await redis.llen(redisKey(req.resultListId));
  if (req.pageNo * countPerPage > len) {
    req.pageNo = state.currentPageNo = 0;
  }
  // const resultList = await redis.lrange(redisKey(req.resultListId), 0, countPerPage);
  const resultList = await redis.lrange(redisKey(req.resultListId), req.pageNo * countPerPage, (req.pageNo + 1) * countPerPage);
  return {
    req,
    len,
    resultList,
  };
}
