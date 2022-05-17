import { SaveErrorInfo, ErrorInfo } from './index';
/**
 * 捕获未处理的promise异常
 */
//   guid | userAgent | userName
//   唯一标识 | 浏览器信息 | 用户名

//   guid | type | message | createTime | errStack
//   唯一标识 | 类型 | 报错信息 | 创建时间 | 错误堆栈

// message：错误消息（字符串）。在HTML onerror=""处理程序event（sic！）中可用。
// source：引发错误的脚本的URL（字符串）
// lineno：发生错误的行号（数值）
// colno：发生错误的行的列号（数值）
// error：错误对象（对象）

// 获取堆栈信息
function getLines(stack: string) {
  return (
    stack &&
    stack
      .split('\n')
      .slice(1)
      .map((item) => item.replace(/^\s+at\s+/g, ''))
      .join('^')
  );
}

window.addEventListener(
  'unhandledrejection',
  function (event) {
    event.preventDefault();
    let message;
    let filename;
    let line = 0;
    let col = 0;
    let stack = '';
    let reason = event.reason;
    if (typeof reason === 'string') {
      message = reason;
    } else if (typeof reason === 'object') {
      message = reason.message;
      if (reason.stack) {
        let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
        filename = matchResult[1];
        line = matchResult[2];
        col = matchResult[3];
      }
      stack = reason.stack;
    }
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    if (typeof stack !== 'string') {
      stack = stack;
    }

    if (message && message !== '{}' && message !== '') {
      const errorInfo = {
        type: 'promise',
        message: message,
        stack: stack
      } as ErrorInfo
      SaveErrorInfo(errorInfo)
      console.log(errorInfo, 'promiseException.ts')
    }
  },
  true,
);