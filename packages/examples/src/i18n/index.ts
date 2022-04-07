import type { I18nConfig } from './spec';
import { config as chinese } from './chinese';
import { config as english } from './english';
import { getCallState, IMiddleWare } from '@ncf/microkernel';
import { env } from 'src/env';

export type Languages = 'chinese' | 'english';
const { DEFAULT_LANG } = env;

const langMap = new Map<Languages, I18nConfig>();
langMap.set('chinese', chinese);
langMap.set('english', english);

const sLang = Symbol('lang');
const sI18nConfig = Symbol('I18nConfig');

declare module '@ncf/microkernel' {
  interface ICallState {
    [sLang]?: Languages,
    [sI18nConfig]?: I18nConfig,
  }
}

/** 请求调用开始基于 http request headr 设置调用期间使用的特定语言配置 */
export function setLanguage(lang?: Languages) {
  const cs = getCallState();
  if (!lang) {
    // like zh-CN,zh;q=0.9,en;q=0.8
    const al = cs.http.req.headers['accept-language'];
    if (al) {
      const first = al.split(';')[0];
      if (first === 'zh-CN,zh') {
        lang = 'chinese';
      } else if (first.startsWith('en-US')) {
        lang = 'english';
      } else {
        lang = DEFAULT_LANG; // 找不到指示，使用默认
      }
    } else {
      lang = DEFAULT_LANG; // 找不到指示，使用默认
    }
  }

  cs[sLang] = lang;
  cs[sI18nConfig] = langMap.get(lang);
}

/** 需要使用 i18n 配置的代码调用 i18n() 获取当前选择语言的配置 */
export function i18n(): I18nConfig {
  const cs = getCallState();
  if (!cs[sI18nConfig]) {
    setLanguage(); // 这是设置好 i18n 配置了，后面再取就有数据了
  }
  return cs[sI18nConfig]!;
}

export const i18nMiddleware: IMiddleWare = async (ctx, next) => {
  setLanguage();
  await next();
}
