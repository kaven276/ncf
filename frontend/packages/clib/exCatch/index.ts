import { envConfig } from 'clib/env/index'
import './promiseException';
import { fetchEX } from 'clib/api/ExCatch';
export { ErrorBoundary } from './ErrorBoundary';
export { dvaException } from './dvaException';
export { mstException } from './mstException';
/**
 *
 * @returns 生成guid
 */

function Guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (
    S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4()
  );
}
export interface ErrorInfo {
  type: 'dva' | 'mst' | 'ErrorBoundary' | 'promise',
  message: string,
  stack?: string,
  state: string,
  route?: string
}

export interface ApiInfo {
  type: 'base' | 'AsyncTrack' 
  path: string,
  req: any,
  res: any,
}

interface BasicInfo {
  userAgent: string,
  userName: string,
  appcode: string,
  route: string,
  COMMITHASH: string,
  BRANCH: string,
}

export const getBasicInfo = () => {
  return {
    userAgent: navigator.userAgent,
    userName: localStorage.getItem('enncloud-username'),
    appcode: global.prefix || "",
    COMMITHASH: envConfig?.COMMITHASH || "",
    BRANCH: envConfig?.BRANCH || "",
  } as BasicInfo
}

export const SaveErrorInfo = (errorInfo: ErrorInfo, apiInfo?: ApiInfo) => {
  console.log({
    errorInfo: {...errorInfo,route:window.location.pathname},
    apiInfo,
    basicInfo: getBasicInfo()
  }, 'error info')
  fetchEX('post /logFrontError',{
    errorInfo: {...errorInfo,route:window.location.pathname},
    apiInfo,
  })
}

// export const ex_catch_init = () => {
//   // 初始化错误统计
//   callApi('', { 'basicInfo': getBasicInfo() }).then(res => {
//     return res.content && res.content;
//   }).then(data => {
//     console.log(data,'====data');
//     localStorage.setItem('errorID',data)
//   });
// }