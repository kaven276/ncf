import { IMiddleWare } from '@ncf/microkernel';
import { throwServiceError, IApi } from '@ncf/microkernel';
import Ajv from 'ajv';
import { JSONSchemaType, ValidateFunction } from 'ajv';

export interface Schema<T extends IApi> {
  checkRequest?: ValidateFunction<T["request"]>,
  checkResponse?: ValidateFunction<T["response"]>,
  requestSchema?: JSONSchemaType<T["request"]>,
  responseSchema?: JSONSchemaType<T["response"]>,
}

declare module '@ncf/microkernel' {
  export interface IFaasModule<T> {
    schema?: Schema<T>,
  }
}

export const showApiJsonSchema: IMiddleWare = async (ctx, next) => {
  const isShow = '$schema' in ctx.request;
  if (isShow) {
    ctx.response = ctx.fassModule.schema;
  } else {
    await next();
  }
}

/** 校验请求响应规格，内置 ajv 校验 json schema 配置 */
export const validate: IMiddleWare = async (ctx, next) => {
  const fassModule = ctx.fassModule;
  const schema = fassModule.schema;
  if (!schema) {
    await next();
    return;
  }

  // // 校验请求规格
  if (schema.requestSchema && !schema.checkRequest) {
    const ajv = new Ajv({ useDefaults: true, coerceTypes: true });
    schema.checkRequest = ajv.compile(schema.requestSchema);
    // console.log('fassAsync.checkRequest', fassAsync.requestSchema, request);
  }

  if (schema.checkRequest) {
    try {
      if (schema.checkRequest(ctx.request) === false) {
        throwServiceError(400, 'request invalid', {
          errors: schema.checkRequest.errors
        })
      }
    } catch (e: any) {
      throwServiceError(400, e.toString());
    }
  }

  // 调用下一个
  await next();

  // 校验结果规格
  if (schema.responseSchema && !schema.checkResponse) {
    const ajv = new Ajv();
    schema.checkResponse = ajv.compile(schema.responseSchema);
  }
  if (schema.checkResponse) {
    try {
      if (schema.checkResponse(ctx.response) === false) {
        throwServiceError(500, 'response invalid', {
          errors: schema.checkResponse.errors,
        });
      }
    } catch (e: any) {
      throwServiceError(500, e.toString());
    }
  }
}
