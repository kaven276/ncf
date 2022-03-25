import { ConnectionOptions } from 'typeorm';

export type PoolNames = 'postgis' | 'test1';

export const ormconfig: ConnectionOptions[] = [{
  name: "postgresmac",
  type: "postgres",
  host: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgre276",
  database: 'db1',
  synchronize: true,
  logging: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
}, {
  name: "postgis",
  type: "postgres",
  host: "127.0.0.1",
  port: 25432,
  username: "echarts",
  password: "echarts",
  database: 'echarts',
  synchronize: false,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
}, {
  name: "test1",
  type: "postgres",
  host: "127.0.0.1",
  port: 25432,
  database: 'pgsqlib',
  username: "test1",
  password: "test1",
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
}, {
  name: "postgres208",
  type: "postgres",
  host: "127.0.0.1",
  port: 15432,
  username: "postgres",
  password: "postgis",
  database: 'test1',
  synchronize: true,
  logging: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
}];
