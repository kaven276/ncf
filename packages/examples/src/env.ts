import { JSONSchemaType } from 'ajv';
import Ajv from 'ajv';
import type { Languages } from 'src/i18n'

/** 本应用需要使用的全部环境变量在此定义，这也是 full typescript coverage 的一部分 */
interface ENV {
  /** 默认第一个监听端口 */
  PORT: number,
  /** JWT 有效期(秒) */
  JWT_EFFECT_TIME: number,
  /** 范例用 BAAS 默认所在服务器 */
  BAAS_HOST: string,
  /** i18n 默认语言选择，不设置默认中文 */
  DEFAULT_LANG: Languages,

  // - 从下面开始都是 baas 连接定位信息
  /** typeorm 链接串 */
  TYPEORM_URL: string,
  /** ORM postgres schema */
  ORM_PG_SCHEMA: string,
  /** 按照每人一个 schema 创建的试验环境 */
  TYPEORM_URL3: string,
  ORM_PG_SCHEMA3: string,
  /** postgres 使用 pg 链接的 url */
  PG_URL: string,
  /** redis url */
  REDIS_URL: string,
  /** AMQP 也即是 rabbitmq url */
  AMQP_URL: string,
  /** elastic search url */
  ES_URL: string,
  /** ITSM 系统地址，用于代理 */
  ITSM_URL: string,
};

/** 默认各种后台服务的地址，方便从虚机访问本机实机上docker服务集 */
const DefaultBaasHost = '127.0.0.1';
const DefaultPostgresUrl = `postgresql://ncf:ncf2022@${DefaultBaasHost}:5432/postgres`;

/** 所有 baas 链接串默认值都是本机默认端口，无用户名密码的或者范例用户名密码的 */
const envSchema: JSONSchemaType<ENV> = {
  type: "object",
  properties: {
    PORT: { type: "integer", default: 8000, maximum: 65535, minimum: 8000 },
    JWT_EFFECT_TIME: { type: "integer", default: 24 * 60 * 60, maximum: 24 * 60 * 60, minimum: 10 * 60 },
    BAAS_HOST: { type: 'string', default: DefaultBaasHost },
    DEFAULT_LANG: { type: 'string', enum: ['chinese', 'english'], default: 'chinese' },

    TYPEORM_URL: { type: 'string', default: DefaultPostgresUrl },
    ORM_PG_SCHEMA: { type: 'string', default: 'public' },
    TYPEORM_URL3: { type: 'string', default: DefaultPostgresUrl },
    ORM_PG_SCHEMA3: { type: 'string', default: 'public' },
    PG_URL: { type: 'string', default: DefaultPostgresUrl },
    REDIS_URL: { type: 'string', default: `redis://${DefaultBaasHost}:6379/0` },
    AMQP_URL: { type: 'string', default: `amqp://admin:admin@${DefaultBaasHost}:5672` },
    ES_URL: { type: 'string', default: `http://${DefaultBaasHost}:9200` },
    ITSM_URL: { type: 'string' },
  },
  required: [
    'PORT',
    'JWT_EFFECT_TIME',
    'DEFAULT_LANG',
  ],
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

console.dir(env);
