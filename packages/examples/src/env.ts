import { JSONSchemaType } from 'ajv';
import Ajv from 'ajv';

/** 本应用需要使用的全部环境变量在此定义，这也是 full typescript coverage 的一部分 */
interface ENV {
  /** 默认第一个监听端口 */
  PORT: number,
  /** JWT 有效期(秒) */
  JWT_EFFECT_TIME: number,
  /** 范例用 BAAS 默认所在服务器 */
  BAAS_HOST: string,
};

const envSchema: JSONSchemaType<ENV> = {
  type: "object",
  properties: {
    PORT: { type: "integer", default: 8081, maximum: 65535, minimum: 8000 },
    JWT_EFFECT_TIME: { type: "integer", default: 24 * 60 * 60, maximum: 24 * 60 * 60, minimum: 10 * 60 },
    BAAS_HOST: { type: 'string', default: '127.0.0.1' },
  },
  required: ['PORT', 'JWT_EFFECT_TIME'],
  additionalProperties: false,
}

//@ts-ignore
let env: ENV = Object.assign({}, process.env);
const ajv = new Ajv({ useDefaults: true, coerceTypes: true, removeAdditional: true });
const validator = ajv.compile(envSchema);

try {
  if (validator(env) === false) {
    console.error(validator.errors);
    process.exit(1);
  }
} catch (e) {
  console.error(e);
  process.exit(2);
}

export { env };
