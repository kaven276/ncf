import { People } from "entity/virus/People";
import type { Person } from 'entity/virus/types';
import ds from '.';
import { throwServiceError } from '@ncf/microkernel';

interface IRequest {
  /** 受测人身份证号码 */
  testeeId: Person["id"],
}

/** 登记新冠管理的人员信息 */
export const faas = async (req: IRequest) => {

  const testeeRepo = ds.getRepository(People);
  let testee = await testeeRepo.find({
    where: {
      id: req.testeeId
    },
    relations: {
      // dose: true
    },
  });
  if (!testee) {
    throwServiceError(1, `指定人员身份证为 ${req.testeeId} 无登记`);
  }
  return testee[0];

};
