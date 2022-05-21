
const url = 'https://blitzjs.com/docs/postgres';
const fetch = global.fetch;

/** 直接使用 fetch 来实现代理的效果 */
export async function faas(req: any) {

  const resp = await fetch(url);
  return resp.text();
}
