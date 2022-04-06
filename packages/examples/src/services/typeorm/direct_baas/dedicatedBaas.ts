import { User } from 'src/entity/User';
import { resolved } from '@ncf/microkernel';
import { env } from 'src/env';
import { EXAMPLE_PG_DB_PASSWORD } from 'src/secrets';
import { DataSource } from 'typeorm';

/** 创建并初始化好的连接池，只供本模块自己专用 */
export let _ds = resolved<DataSource>(async () => {
  const baas = new DataSource({
    type: "postgres",
    host: env.BAAS_HOST,
    port: 25432,
    database: 'pgsqlib',
    schema: 'test1',
    username: "test1",
    password: EXAMPLE_PG_DB_PASSWORD,
    synchronize: false,
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
  });
  await baas.initialize();
  return baas;
});


interface IRequest {
}

/** 示范 faas 使用独占专用的数据源对象 */
export const faas = async (req: IRequest) => {
  // console.log(exports.faas);
  const userRepo = _ds.getRepository(User);
  const result = await userRepo.findOne({});
  return result;
};
