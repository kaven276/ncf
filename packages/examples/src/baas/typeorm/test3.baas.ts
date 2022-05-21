import { DataSource } from 'typeorm';
import { resolved } from '@ncf/microkernel';
import { env } from 'src/env';
import { pathPattern } from '@ncf/microkernel';

// psql -h $PGHOST -p 5432 -U postgres -d postgres
// create user fe CREATEDB CREATEROLE LOGIN CONNECTION LIMIT 80;
// alter user fe password 'typeorm2022';
// psql -h $PGHOST -p 5432 -U fe -d postgres
// create database fe OWNER fe;
// psql -h $PGHOST -p 5432 -U fe -d fe
// create schema test1 AUTHORIZATION fe;
// set search_path= 'test1';
// You are connected to database "fe" as user "fe" on host "$PGHOST" at port "5432".

let ds = resolved<DataSource>(async () => {
  const baas = new DataSource({
    type: "postgres",
    url: env.TYPEORM_URL3,
    schema: env.ORM_PG_SCHEMA3,
    synchronize: true,
    logging: true,
    entities: [pathPattern("baas/typeorm/entity/**/*")],
    migrations: [pathPattern("baas/typeorm/migration/**/*")],
    subscribers: [pathPattern("baas/typeorm/subscriber/**/*")],
  });
  await baas.initialize();
  return baas;
});

export default ds;
