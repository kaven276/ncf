/**
 * 请求响应规格检查模块
 */

export function checkRequest(req: any) {
  if (!req.user) {
    throw Error('请求中没有user字段');
  }
}

export function checkResponse(resp: any) {
  if (!resp.name) {
    throw Error('响应中没有name字段');
  }
}
