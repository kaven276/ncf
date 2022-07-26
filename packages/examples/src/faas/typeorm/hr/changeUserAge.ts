import { User } from "entity/User";
import ds from '.';

export const faas = async () => {
  const userRepo = ds.getRepository(User);
  const user = (await userRepo.findOneBy({}))!;
  user.age += 1;
  await userRepo.save(user);
  return 'chage age+1, 验证 save 只 update 变化了的字段而不是全部字段';
}
