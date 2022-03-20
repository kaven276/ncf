import { JSONSchemaType } from 'ajv';
import Ajv from 'ajv';

/** 本应用需要使用的全部环境变量在此定义，这也是 full typescript coverage 的一部分 */
interface ENV {
  /** 默认第一个监听端口 */
  PORT: number,
};

const envSchema: JSONSchemaType<ENV> = {
  type: "object",
  properties: {
    PORT: { type: "integer", default: 8081, maximum: 65535, minimum: 8000 },
  },
  required: ['PORT'],
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
