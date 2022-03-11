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
];
