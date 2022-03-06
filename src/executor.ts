import { asyncLocalStorage } from 'src/lib/transaction';
import { ServiceError } from 'src/lib/registry';
import { watchHotUpdate, registerDep } from './hotUpdate';

watchHotUpdate();

let idSeq = 0;

interface IEntranceProps {
  jwtString: string,
  sub: string,
  faasPath: string,
}

/** 进入服务执行，提供执行环境，事务管理 */
export async function execute({ jwtString, sub, faasPath }: IEntranceProps) {

  // step1: 定位服务模块文件路径
  let resolvedPath: string;
  try {
    resolvedPath = require.resolve(`src/services${faasPath}`);
  } catch (e) {
    return {
      status: 404,
    }
  }
  console.log(`request ${idSeq + 1} ${faasPath} coming...`, resolvedPath);

  // step2: 加载服务模块
  const fassAsync = await import(resolvedPath).catch(e => {
    console.log('---- no found ---', e);
    return {};
  });
  const faas = fassAsync.faas;
  if (!faas) {
    return {
      status: 404,
    }
  }
  registerDep(resolvedPath);

  // 反向登记依赖的 children，child 改变时，可以将依赖服务删除
  console.log(resolvedPath);

  // step 3: 执行服务模块
  return asyncLocalStorage.run({ id: ++idSeq, db: {}, jwtString, jwt: { sub } }, async () => {
    const store = asyncLocalStorage.getStore()!;
    try {
      const result = await faas();
      if (store.db) {
        // @ts-ignore
        await Promise.all(Object.values(store.db).map(db => db.commitTransaction()));
      }
      console.log('res.end successfully');
      return { code: 0, data: result };
    } catch (e) {
      await Promise.all(Object.values(store.db).map(db => db.rollbackTransaction()));
      console.log('---------', e instanceof ServiceError, e);
      if (e instanceof ServiceError) {
        return { status: 500, code: e.code, msg: e.message };
      } else {
        console.log('--------- not ServiceError', e.code, e.message);
        return { status: 500, code: e.code, msg: e.message };
      }
    }
    // console.log(require.cache);
  });
}
