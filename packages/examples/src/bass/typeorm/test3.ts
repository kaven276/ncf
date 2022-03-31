import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

// psql -h 10.39.38.53 -p 5432 -U postgres -d postgres
// create user fe CREATEDB CREATEROLE LOGIN CONNECTION LIMIT 80;
// alter user fe password 'typeorm2022';
// psql -h 10.39.38.53 -p 5432 -U fe -d postgres
// create database fe OWNER fe;
// psql -h 10.39.38.53 -p 5432 -U fe -d fe
// create schema test1 AUTHORIZATION fe;
// set search_path= 'test1';
// You are connected to database "fe" as user "fe" on host "10.39.38.53" at port "5432".

const dsOptions: DataSourceOptions = {
  type: "postgres",
  host: "10.39.38.53",
  port: 5432,
  database: 'fe',
  schema: 'test1',
  username: "fe",
  password: "typeorm2022",
  synchronize: true,
  logging: true,
  // driver: {
  //   max: 2,
  // },
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
}

let ds: DataSource;
/** 标准的异步函数，返回创建好的数据库连接池 */
export const baas = async () => {
  ds = ds ?? new DataSource(dsOptions);
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  return ds;
}
