import { lifecycle } from './makeTypeOrmDataSource';

let baas = lifecycle(module, {
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

export default baas;
