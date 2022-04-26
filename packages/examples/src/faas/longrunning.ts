/** 测试一个长任务是否可以 survive SIGHUP，gracefule quit */
export const faas = async () => {
  await new Promise(r => setTimeout(r, 10 * 1000));
  return 'sorry let you wait too long';
}
