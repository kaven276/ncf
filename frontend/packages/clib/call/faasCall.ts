import fetch from 'clib/fetch';

let prefix = 'http://127.0.0.1:8000';

export interface IApi {
  path: string,
  request?: any,
  response: any,
}

interface HttpResponse<T> {
  code: number,
  msg?: string,
  data: T,
}

/** 调用服务端 */
export async function faasCall<T extends IApi = IApi>(path: T["path"], req?: T["request"]): Promise<HttpResponse<T["response"]>> {
  return fetch(`${prefix}${path}`, {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'content-type': 'application/json',
    },
    cache: "no-store",
    credentials: 'omit',
  }).then(resp => resp.json());
}
