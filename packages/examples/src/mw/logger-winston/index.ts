import { IMiddleWare, getConfig, getDebug } from '@ncf/microkernel';
import * as winston from 'winston';

const debug = getDebug(module);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'ncf' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'log/combined.log' }),
  ],
});

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple(),
//   }));
// }

/** 延迟开始执行不超过任意毫秒数  */
export const mwLoggerWinston: IMiddleWare = async (ctx, next) => {
  const { path, request } = ctx;
  // logger.info(`${ctx.path} ${JSON.stringify(ctx.request)}`);
  // logger.info({ path, request });
  await next().then(response => {
    logger.info({ path, request, response });
  }).catch(e => {
    logger.error({ path, request, error: e });
    throw e;
  });
}
