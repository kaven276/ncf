import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { User } from "src/entity/User";
import { Org } from "src/entity/Org";
import { asyncLocalStorage } from '@ncf/engine';
import { testTransactionQueryRunner } from 'src/services/testTransactionQueryRunner';

async function testUser(connection) {
  console.log("Inserting a new user into the database...");
  const user = new User();
  // user.id = Date.now();
  user.firstName = "Timber";
  user.lastName = "Saw";
  user.age = 25;
  user.names = 'kaven,kavn276,安德范,李勇'.split(',');
  await connection.manager.save(user);
  console.log("Saved a new user with id: " + user.id);

  console.log("Loading users from the database...");
  const users = await connection.manager.find(User);
  console.log("Loaded users: ", users);

  user.firstName = 'LiYong';
  user.age = 43;
  user.names.push('another');
  await connection.manager.save(user);
  // // await connection.manager.remove(users);

  const rawData = await connection.query(`SELECT * FROM "user"`);
  console.log('rawData');
  console.log(rawData);
}

async function testOrg(connection) {
  const Asiainfo = new Org();
  Asiainfo.orgName = '亚信科技';
  Asiainfo.orgId = '132.168.7.0/24';
  Asiainfo.rank = 1;
  Asiainfo.tags = ['IT', 'CT', 'BOSS'];
  // Asiainfo.formal = true;
  await connection.manager.save(Asiainfo);
  return;
  const ai = connection.manager.findOne(Asiainfo.orgId);
  console.log(ai);
}

function test1() {
  createConnection('postgres208').then(async connection => {
    console.log('connected');
    await testUser(connection);
    // await testOrg(connection);

    console.log("Here you can setup and run express/koa/any other framework.");

  }).catch(error => console.log(error));
}

function test2() {
  return createConnection('postgis').then(async connection => {
    console.log('connected', connection.isConnected);
    await testUser(connection);
    // await testOrg(connection);

    console.log("Here you can setup and run express/koa/any other framework.");

  }).catch(error => console.log(error));
}

function test3() {
  createConnection('oracle').then(async connection => {
    console.log('oracle done');
  });
}

function testTransaction() {
  const c = getConnection('postgis');
  c.transaction(async manager => {
    // 注意：你必须使用给定的管理器实例执行所有数据库操作，
    // 它是一个使用此事务的EntityManager的特殊实例，并且不要忘记在处理操作
    const ly = await manager.findOne(User, { where: { firstName: 'LiYong' } });
    ly.age++;
    await manager.save(ly);
    ly.age++;
    await manager.save(ly);
    // throw new Error('rollback');
  });
}

let idSeq = 0;
function test4() {
  createConnection('postgis');
  setTimeout(() => {
    const connection = getConnection('postgis');
    console.log('connected', connection.isConnected);

    // at service entrance, provide transaction commit automatically
    asyncLocalStorage.run({ id: ++idSeq, db: {} }, async () => {
      // testUser(connection);
      // testTransaction();
      await testTransactionQueryRunner();
      await testTransactionQueryRunner();
      const store = asyncLocalStorage.getStore()!;
      if (store.db) {
        //@ts-ignore
        await Promise.all(Object.values(store.db).map(db => db.commitTransaction()));
      }
    });

  }, 1000);
}

test4();
