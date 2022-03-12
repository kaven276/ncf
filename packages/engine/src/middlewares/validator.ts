import { IMiddleWare } from '../lib/middleware';
import Ajv from 'ajv';

/** 校验请求响应规格，内置 ajv 校验 json schema 配置 */
export const validate: IMiddleWare = async (ctx, cfg, next) => {
  const fassModule = ctx.fassModule;

  // // 校验请求规格
  if (fassModule.requestSchema && !fassModule.checkRequest) {
    const ajv = new Ajv({ useDefaults: true, coerceTypes: true });
    fassModule.checkRequest = ajv.compile(fassModule.requestSchema);
    // console.log('fassAsync.checkRequest', fassAsync.requestSchema, request);
  }

  if (fassModule.checkRequest) {
    try {
      if (fassModule.checkRequest(ctx.request) === false) {
        throw {
          status: 400,
          msg: 'request invalid',
          errors: fassModule.checkRequest.errors,
        }
      }
    } catch (e) {
      throw {
        status: 400,
        msg: e.toString(),
      }
    }
  }

  // 调用下一个
  await next();

  // 校验结果规格
  if (fassModule.responseSchema && !fassModule.checkResponse) {
    const ajv = new Ajv();
    fassModule.checkResponse = ajv.compile(fassModule.responseSchema);
  }
  if (fassModule.checkResponse) {
    try {
      if (fassModule.checkResponse(ctx.response) === false) {
        throw {
          status: 500,
          msg: 'response invalid',
          errors: fassModule.checkResponse.errors,
        }
      }
    } catch (e) {
      throw {
        status: 500,
        msg: e.toString(),
      }
    }
  }
}
