import { People } from "entity/virus/People";
import { TestDose } from "entity/virus/TestDose";
import type { Person, ITestDose } from 'src/baas/typeorm/entity/virus/types';
import ds from '.';
import { throwServiceError } from '@ncf/microkernel';

interface IRequest {
  doseSerial: ITestDose["serial"],
  testeeId: Person["id"],
}

/** 登记新冠管理的人员信息 */
export const faas = async (req: IRequest) => {

  const doseRepo = ds.getRepository(TestDose);
  let testDose = await doseRepo.findOneBy({ serial: req.doseSerial });
  if (!testDose) {
    testDose = doseRepo.create({ testees: [], use_time: new Date() });
  }

  if (!testDose) {
    throwServiceError(1, `指定试剂号 ${req.doseSerial} 无登记`);
    return;
  }

  const testeeRepo = ds.getRepository(People);
  const testee = await testeeRepo.findOneBy({ id: req.testeeId });

  testDose.testees.push(testee!);

  const saved = await doseRepo.save(testDose);
  return saved;
};
