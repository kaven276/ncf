import later from '.';

interface Request {
  /** 是否清理掉全部的延迟队列数据？ */
  clear: boolean,
}

/** 模拟写延迟队列 */
export const faas = async (req: Request) => {
  if (req.clear) {
    await later.clear();
  }
  const now = Date.now();
  await later.put(String(now + 1000 * 1), { path: '/dir1/dir2/faas1', request: { p1: 1 } });
  await later.put(String(now + 1000 * 5), { path: '/dir1/faas3', request: { p1: 2 } });
  await later.put(String(now + 1000 * 10), { path: '/dir1/dir3/faas3', request: { p1: 3 } });
}
