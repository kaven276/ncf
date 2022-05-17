import { types, flow, Instance } from 'mobx-state-tree';
import { useState } from 'react';
import { faasCall as callApi } from 'clib/call/faasCall';
import { envType } from 'clib/env';
import { message } from 'antd'
import { ApiInfo, ErrorInfo, SaveErrorInfo } from 'clib/exCatch';

/*
* 提供对异步调用的集成，分为
1. 无参数，适合完全封装完的 thunk
2. 有参数；适合调用 browser dom async API
3. 有调用路径，有参数；适合调用后台

* 需要在 at 中跟踪调用的是哪个 API，如 key，或者是函数的名称取出来放到跟踪状态里面
* 如果 as 就在模型里面呢
*/

export interface IApi {
  path: string,
  request?: any,
  response: any,
}

/** 实现特定 API 规范的服务函数的 TS 函数类型 */
export type Service<T extends { path: string, request?: any, response?: any }> = {
  (path: T["path"], request: T["request"]): Promise<T["response"]>
}

export interface IAsyncCall0 {
  <T0 extends IApi>(): Promise<T0["response"]>;
}

export interface IAsyncCall1 {
  <T1 extends IApi>(req: T1["request"]): Promise<T1["response"]>;
}

export interface IAsyncCall2 {
  <T2 extends IApi>(path: T2["path"], req: T2["request"], onAsyncTrackResponse?: Function): Promise<T2["response"]>;
  responseStandardize: Function,
  onAsyncTrackResponse?: Function,
  /** 展示异常信息 */
  showError?: Function,
  /** 根据原始响应内容，判断业务层面执行成功还是失败 */
  hasError?: (resp: any) => boolean;
  /** 取出原始响应中的响应数据，其他 wrapper 字段一并返回 */
  extractData?: (resp: any) => [any, any],
}

type AsyncFunction = IAsyncCall0 | IAsyncCall1 | IAsyncCall2;

type CallOption = Partial<{
  force: boolean,
  keep: boolean,
  download: boolean,
}>
const defaultCallOption: Required<CallOption> = {
  force: false,
  keep: true,
  download: false,
};

let model: any;

/** 假装每次返回新的异步跟踪模型实例，但是其实只返回唯一的一份节约资源。 */
export function createAsyncTrackModel<T extends IApi>() {
  if (model) return model as typeof theModel;
  const theModel = types.model({
    /** api/async function name 调用函数的名称 */
    fn: '',
    /** uri 路径 */
    u: types.maybe(types.string),
    /** 请求数据 */
    r: types.frozen<T["request"]>(),
    /** sequence 调用序号，1开始 */
    s: 0,
    /** begin time */
    sTime: types.maybe(types.Date),
    /** end time */
    eTime: types.maybe(types.Date),
    /** pending 调用中 */
    p: false,
    /** ok 调用成功 */
    o: false,
    /** error 调用失败 */
    e: false,
    /** 非业务异常信息，如后台 500 或者 timeout 等等 */
    // E: types.frozen<any>(),
    /** ok count 成功执行的计数，经常用于 reaction 跟踪到成功后自动触发其他处理 */
    oc: 0,
    /** data 调用返回的响应数据 */
    d: types.maybe(types.frozen<T["response"]>()),
    /** 响应的 wrapper 数据，从原始响应去掉内容字段的 */
    w: types.frozen<any>(),
  })
    .views(self => {
      return ({
        /** 调用次数 */
        get sc() {
          return self.s - (self.p ? 1 : 0);
        },
        /** 是否是进行中或者是调用成功，可用于Button.disabled控制，防止重复提交 */
        get po() {
          return self.p || self.o;
        },
        /** 查看是否距离上次调用开始时间太近，单位秒 */
        isTooNearFromStart(seconds: number) {
          if (!self.sTime) return false;
          return (Date.now() < (self.sTime.getTime() + seconds * 1000));
        },
        /** 查看是否距离上次调用结束时间太近，单位秒 */
        isTooNearFromEnd(seconds: number) {
          if (!self.eTime) return false;
          return (Date.now() < (self.eTime.getTime() + seconds * 1000));
        },
      });
    })
    .actions(self => {
      return ({
        _markPending(fn: Function, req?: any, path?: string, opt?: CallOption) {
          // self.fn = fn.name;
          self.s++;
          self.sTime = new Date();
          self.eTime = undefined;
          self.p = true;
          self.o = false;
          self.e = false;
          // opt.keep=true 的话重新执行可能不清理，因为还需要留着在界面中展示
          if (opt && !opt.keep) {
            self.d = undefined;
          }

          if (req) {
            self.r = req;
          }
          if (path) {
            self.u = path;
          }
        },
        _markOk(data: any, wrapper: any, hasError: boolean) {
          self.eTime = new Date();
          self.p = false;
          self.o = !hasError;
          self.e = hasError;
          self.d = data;
          self.w = wrapper;
          self.oc++;
        },
        _markError(e: any, opt?: CallOption) {
          self.eTime = new Date();
          self.p = false;
          self.o = false;
          self.e = true;
          // self.E = e;
          // 失败了也可能不清除之前成功的结果数据，因为可以界面上还要看到老版本数据
          if (opt && !opt.keep) {
            self.d = undefined;
          }
        },
      })
    })
    .actions(self => {
      // const api: AsyncFunction = getEnv(self).api;
      let api: AsyncFunction;
      type OnError = (at: typeof self) => boolean | void;
      type CallOptionEx = CallOption & { onError?: OnError };
      return ({
        _setApi(_api: AsyncFunction) {
          api = _api;
        },
        call0() {
          const asyncCall0 = api as IAsyncCall0;
          self._markPending(asyncCall0);
          return asyncCall0()
            .then(resp => {
              self._markOk(resp, resp, false);
              return self;
            })
            .catch(e => {
              self._markError(e);
              throw self;
            });
        },
        call1(req: T["request"]) {
          const asyncCall1 = api as IAsyncCall1;
          self._markPending(asyncCall1, req);
          return asyncCall1(req)
            .then(resp => {
              self._markOk(resp, resp, false);
              return self;
            })
            .catch(e => {
              self._markError(e);
              throw self;
            });;
        },
        /** 老版本，在 flow 中调用的话，_markOk 会作为独立 action 而非 flow 中的一步执行，redux-devtools 中查看不好 */
        call_(path: T["path"], req: T["request"], options: any) {
          const asyncCall2 = api as IAsyncCall2;
          self._markPending(asyncCall2, req, path);
          return asyncCall2(path, req)
            .then(resp => {
              const [d, w] = asyncCall2.extractData?.(resp) || [resp];
              self._markOk(d, w, asyncCall2.hasError?.(resp) || false);
              return self;
            })
            .catch(e => {
              self._markError(e);
              throw self;
            });
        },
        /** 新版本，在 flow 中调用的话，_markOk 会作为 flow 中的一步执行，redux-devtools 中查看友好 */
        call: flow(function* call(path: T["path"], req: T["request"] = null, option?: CallOptionEx) {
          const opt: Required<CallOption> & { onError?: OnError } = { ...defaultCallOption, ...option };
          // 如果已经在执行中，没有设置强制执行的话，则不重复执行，直接抛出异常退出 flow
          // 如果在 flow 中执行 as.call，请在 flow 开始判断是否重复，或者系统自动控制 flow 不并行执行
          // 这里的控制只针对不在 flow 执行的 as.call, 对于 as.call(...).then().catch() 来说直接到 catch
          // if (self.p && !opt.force && envType !== 'prod') {
          if (self.p && !opt.force) {
            message.info(`在途请求处理中，请稍后再试！`, 3); // 提示
            console.warn(`应用系统缺陷！${self.u}正在执行中，不允许重复执行`); // 提示
            throw { type: 'overlap' }; // 确保不要执行 as.call().then()
          }
          const asyncCall2 = api as IAsyncCall2;
          self._markPending(asyncCall2, req, path, { keep: opt.keep });
          let resp;
          const currentSeq = self.s;
          try {
            // 参考 https://developer.mozilla.org/zh-CN/docs/Web/API/Response
            const onResponse = opt.download ? (resp: Promise<Response>) => resp.then(res => res.blob()) : asyncCall2.onAsyncTrackResponse;
            resp = yield asyncCall2(path, req, onResponse || ((rsp: unknown) => rsp));
          } catch (e: any) {
            if (currentSeq < self.s) {
              throw new Error('AsyncTrack abort'); // 有后面的 .call force 执行了
            }
            self._markError(e, { keep: opt.keep });
            if (envType !== 'prod') {
              alert(`${path}调用异常！\n(仅在非生产环境展示异常告警)`);
            }
            console.log('AsyncTrack 异常触发错误  AyncTrack.ts')
            // 接口调用异常时触发错误统计
            const errorInfo = {
              type: "promise", message: e.message, stack: e.stack
            } as ErrorInfo
            const requestInfo = {
              path, req: req, res: resp, type: 'AsyncTrack'
            } as ApiInfo
            SaveErrorInfo(errorInfo, requestInfo)
            throw self;
          }
          if (currentSeq < self.s) {
            throw new Error('AsyncTrack abort'); // 有后面的 .call force 执行了
          }
          if (!opt.download) {
            const hasError = asyncCall2.hasError?.(resp) || false;
            const [d, w] = asyncCall2.extractData?.(resp) || [resp];
            let willThrow = hasError; // 默认 hasError 就 throw
            if (hasError) {
              if (opt.onError) {
                willThrow = !!opt.onError(self); // 如果 onError 返回假值就不再 throw 了
              } else if (asyncCall2.showError) {
                asyncCall2.showError(w);
              } else {
                console.warn('no error handler!');
              }
              // AsyncTrack 调用接口报错触发错误统计
              console.log('AsyncTrack 接口报错触发错误  AyncTrack.ts')
              const errorInfo = {
                type: "promise", message: w
              } as ErrorInfo
              const requestInfo = {
                path, req: req, res: resp, type: 'AsyncTrack'
              } as ApiInfo
              SaveErrorInfo(errorInfo, requestInfo)
            }
            self._markOk(d, w, hasError);
            if (willThrow) {
              throw self;
            }
          } else {
            // download file 的整个 resp 作为 at.d，需自行 at.d.blob() 转换成 blob 数据
            self._markOk(resp, undefined, false);
          }
          return self;
        }),
        /**
         * 将 path 中待定变量 $xxx 用请求数据对应成员值替代，然后请求中该成员删除
         * @example
         * 将 as.callex('get /users/$uid/xxx/${p1}/yyy', { $uid: 123, $p1: 1, p2: 'abc' })
         * 转换为 as.call('get /users/123/xxx/1/yyy', { p2: 'abc' })
         */
        callex(path: T["path"], req: T["request"] = null, option?: CallOptionEx) {
          const req2 = { ...req };
          const sects = path.split('/');
          sects.forEach((sect, index) => {
            if (sect.startsWith('$')) {
              const paramName = sect;
              const paramValue = req2[paramName];
              sects[index] = paramValue;
              delete req2[paramName];
            }
          });
          return this.call(sects.join('/'), req2, option);
        },
        /** 按最近执行的请求路径和入参重新调用 at.call，适用于 get/post 查询和变更类请求。 */
        reCall(option?: CallOptionEx) {
          if (!self.u) {
            throw new Error('异步调用从没执行过，无法 reCall!');
          }
          return this.call(self.u, self.r, option);
        },
        /**
         * 直接设置数据字段
         * 场景一：设置初始默认值
         * 场景二：前台直接修改并在界面体现而不用等后台接口刷新
         */
        setd(d: T["response"]) {
          self.d = d;
        },
      })
    })
    .preProcessSnapshot((v: any) => {
      return v;
    });
  model = theModel;
  return theModel;
}

/** 用于在 Mst 树中定义项目类型为异步状态跟踪类型
 * @example
 * export const AsyncCallModel = types.model('createAsyncTrack<IService>', {
  // MST 模型中定义各个 async track 成员，清楚的标明各自使用了哪个接口规范
  atUserOrgs: createAsyncTrackModelWithOption<APIUserOrgs>(callApi),
  atUser: createAsyncTrackModelWithOption<ApiGetUser>(), // 不写 api 用哪个，则使用默认的(调用云平台gateway)
  atUserUcenter: createAsyncTrackModelWithOption<ApiUserUcenter>(callApi)
 }
*/
export function AsyncTrack<T extends IApi>(api?: any) {
  const model = createAsyncTrackModel<T>(); // 每次都返回同一个单例
  return types.optional(model, () => {
    const api2 = api || callApi;
    const inst = model.create({
      fn: api2.name || 'anonymous',
    });
    inst._setApi(api2);
    return inst;
  });
}

export type TAsyncTrack = Instance<ReturnType<typeof AsyncTrack>>;

/** 给 react 函数组件动态提供 AsyncTrack 变量 */
export function useAsyncTrack<T extends IApi>(api?: AsyncFunction) {
  return useState(() => AsyncTrack<T>(api).create())[0];
}
