import type { I18nConfig } from './spec';
import { config as chinese } from './chinese';
import { config as english } from './english';
import { getCallState, IMiddleWare } from '@ncf/microkernel';

type Languages = 'chinese' | 'english';

const langMap = new Map<Languages, I18nConfig>();
langMap.set('chinese', chinese);
langMap.set('english', english);



declare module '@ncf/microkernel' {
  interface ICallState {
    lang?: Languages,
    i18nConfig?: I18nConfig,
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
        lang = 'chinese'; // 找不到指示，默认中文
      }
    } else {
      lang = 'chinese'; // 找不到指示，默认中文
    }
  }

  cs.lang = lang;
  cs.i18nConfig = langMap.get(lang);
}

/** 需要使用 i18n 配置的代码调用 i18n() 获取当前选择语言的配置 */
export function i18n(): I18nConfig {
  const cs = getCallState();
  return cs.i18nConfig ?? chinese;
}


export const i18nMiddleware: IMiddleWare = async (ctx, next) => {
  setLanguage();
  await next();
}
