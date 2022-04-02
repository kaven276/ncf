import { DataSource } from 'typeorm';
import { useLifecycle } from '@ncf/microkernel';

// psql -h 10.39.38.53 -p 5432 -U postgres -d postgres
// create user fe CREATEDB CREATEROLE LOGIN CONNECTION LIMIT 80;
// alter user fe password 'typeorm2022';
// psql -h 10.39.38.53 -p 5432 -U fe -d postgres
// create database fe OWNER fe;
// psql -h 10.39.38.53 -p 5432 -U fe -d fe
// create schema test1 AUTHORIZATION fe;
// set search_path= 'test1';
// You are connected to database "fe" as user "fe" on host "10.39.38.53" at port "5432".

let ds = useLifecycle<DataSource>(module, {
  /* ncf 确保一个 BAAS 连接池只被创建和初始化一次 */
  async initialize() {
    const baas = new DataSource({
      type: "postgres",
      host: "10.39.38.53",
      port: 5432,
      database: 'fe',
      schema: 'test1',
      username: "fe",
      password: "typeorm2022",
      synchronize: true,
      logging: true,
      entities: ["src/entity/**/*.ts"],
      migrations: ["src/migration/**/*.ts"],
      subscribers: ["src/subscriber/**/*.ts"],
    });
    await baas.initialize();
    return baas;
  },
  /** hotUpdate 时，或者进程退出时，将会被系统自动执行，正常的清理资源 */
  async destroy(baas: DataSource) {
    if (baas && baas.isInitialized) {
      // console.info('test1 baas typeorm pool destroying...')
      await baas.destroy();
    }
  },
});

export default ds;
