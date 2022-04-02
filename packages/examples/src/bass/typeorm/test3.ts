import { DataSource, makeTypeOrmDataSource } from './makeTypeOrmDataSource';

// psql -h 10.39.38.53 -p 5432 -U postgres -d postgres
// create user fe CREATEDB CREATEROLE LOGIN CONNECTION LIMIT 80;
// alter user fe password 'typeorm2022';
// psql -h 10.39.38.53 -p 5432 -U fe -d postgres
// create database fe OWNER fe;
// psql -h 10.39.38.53 -p 5432 -U fe -d fe
// create schema test1 AUTHORIZATION fe;
// set search_path= 'test1';
// You are connected to database "fe" as user "fe" on host "10.39.38.53" at port "5432".

let baas: DataSource = undefined!;
export default baas;

export const _lifecycle = makeTypeOrmDataSource({
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
