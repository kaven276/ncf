import client from 'src/baas/elasticsearch/es1.baas';

interface IData {
  name: string,
  age: number,
}
const data: IData[] = [{
  name: '李勇',
  age: 100,
}, {
  name: '李宇泽',
  age: 4,
}]


/** 使用老 es client 测试到老 5x es 的联通性和批量插入*/
export async function faas() {
  await client.ping({ requestTimeout: 1000 }).catch((err) => {
    console.log('ping elastic server err', err);
  });
  await client.bulk({ body: data }).then(resp => {
    console.log('insert buld resp', resp);
  }).catch(console.error);
  return {
    'test': 'elastic',
  }
}
