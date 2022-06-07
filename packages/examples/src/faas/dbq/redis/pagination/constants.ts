const key = 'IdListKey';

export function redisKey(resultId: string) {
  return `${key}:${redisKey}`;
}
