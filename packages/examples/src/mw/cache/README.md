缓存中间件。

faas 需要 `export function getCacheKey(req): string`,
cache 中间件对当前 faas 查找缓存中的 cacheKey 对应的缓存内容，如果有则直接返回，并且不再往下执行。
没有 cacheKey 的化，或者 cacheKey 为 undefined，则不看缓存。
