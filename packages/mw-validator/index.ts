import { IMiddleWare } from '@ncf/engine';
import { throwServiceError } from '@ncf/engine';
import Ajv from 'ajv';

/** 校验请求响应规格，内置 ajv 校验 json schema 配置 */
export const validate: IMiddleWare = async (ctx, next) => {
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
        throwServiceError(400, 'request invalid', {
          errors: fassModule.checkRequest.errors
        })
      }
    } catch (e) {
      throwServiceError(400, e.toString());
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
        throwServiceError(500, 'response invalid', {
          errors: fassModule.checkResponse.errors,
        });
      }
    } catch (e) {
      throwServiceError(500, e.toString());
    }
  }
}
