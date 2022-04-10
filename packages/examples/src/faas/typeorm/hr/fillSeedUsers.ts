import { User } from "entity/User";
import ds from '.';

/** 插入初始演示测试用用户数据 */
export const faas = async (req: undefined) => {
  const userRepo = ds.getRepository(User);

  console.log("Loading users from the database...");
  const users = await userRepo.find();
  console.log("Loaded users: ", users);
  // await userRepo.remove(users);
  if (users.length > 0) {
    return users; // 如果已经插入种子数据，不要再重复做了，会插入重复数据
  }

  console.log("Inserting a new user into the database...");
  const user1 = userRepo.create({
    firstName: "Timber",
    lastName: "Saw",
    age: 25,
    names: 'kaven,kavn276,安德范,李勇'.split(','),
  });
  userRepo.save(user1);
  console.log("Saved a new user with id: " + user1.id);

  const user2 = userRepo.create({
    firstName: "LiYong",
    age: 43,
    names: [...user1.names, 'another'],
  });
  userRepo.save(user2);

  return users;
};
