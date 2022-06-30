export function rewrite(path: string): string {
  if (path.startsWith('/old')) {
    return path.replace('/old', '/typeorm');
  }
  return path;
}
