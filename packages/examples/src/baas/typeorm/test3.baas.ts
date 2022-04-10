import { DataSource } from 'typeorm';
import { resolved } from '@ncf/microkernel';

// psql -h 10.39.38.53 -p 5432 -U postgres -d postgres
// create user fe CREATEDB CREATEROLE LOGIN CONNECTION LIMIT 80;
// alter user fe password 'typeorm2022';
// psql -h 10.39.38.53 -p 5432 -U fe -d postgres
// create database fe OWNER fe;
// psql -h 10.39.38.53 -p 5432 -U fe -d fe
// create schema test1 AUTHORIZATION fe;
// set search_path= 'test1';
// You are connected to database "fe" as user "fe" on host "10.39.38.53" at port "5432".

let ds = resolved<DataSource>(async () => {
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
    entities: ["src/baas/typeorm/entity/**/*.ts"],
    migrations: ["src/baas/typeorm/migration/**/*.ts"],
    subscribers: ["src/baas/typeorm/subscriber/**/*.ts"],
  });
  await baas.initialize();
  return baas;
});

export default ds;
