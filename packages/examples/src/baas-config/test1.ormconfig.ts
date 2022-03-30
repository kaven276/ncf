import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

const test1: DataSourceOptions = {
  type: "postgres",
  host: "127.0.0.1",
  port: 25432,
  database: 'pgsqlib',
  schema: 'test1',
  username: "test1",
  password: "test1",
  synchronize: true,
  logging: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
}

export const test1DataSource = new DataSource(test1);
