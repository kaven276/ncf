import { User } from 'src/entity/User';
import ds from './dedicated.ds';

interface IRequest {
}

/** 示范 faas 使用独占专用的数据源对象 */
export const faas = async (req: IRequest) => {
  // console.log(module.exports.default);
  const userRepo = ds.getRepository(User);
  const result = await userRepo.findOne({});
  return result;
};
