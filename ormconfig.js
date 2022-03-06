console.error('use ormcofig.js root');

module.exports = [
  {
    name: "oracle",
    type: "oracle",
    host: "127.0.0.1",
    port: 57613,
    username: "ucr_o2o_order",
    password: "nE6fRC_L",
    connectString: "127.0.0.1:56053/tjo2odb",
    synchronize: true,
    entityPrefix: 'osql_',
    logging: true,
    entities: ["credit/entity/**/*.ts"],
    migrations: ["credit/migration/**/*.ts"],
    subscribers: ["credit/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "credit/entity",
      migrationsDir: "credit/migration",
      subscribersDir: "credit/subscriber"
    }
  },
  {
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
  },
  {
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
  },
  {
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
  }
];
