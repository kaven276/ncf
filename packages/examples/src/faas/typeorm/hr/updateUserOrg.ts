import { User, UserRole } from "entity/User";
import { Org } from "entity/Org";
import ds from '.';

export const faas = async () => {
  const orgRepo = ds.getRepository(Org);
  const org = await orgRepo.findOne({ where: {} });
  const userRepo = ds.getRepository(User);
  const result = await userRepo.update(2, {
    org: org!,
  });
  return result;
}
