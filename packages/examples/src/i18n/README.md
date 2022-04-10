这里演示对应用中用到的字符串资源进行多语言配置。

* 其中中文配置 chinese.ts 作为基础配置，其他语言基于其 typeof
* 提供语言设置中间件，自动根据 http 请求头 Accept-Language 来选择调用启用使用的语言配置
* 提供通过环境来选择默认语言集的支持
* i18n 配置不仅可以配置字符串，还可以配置带参数返回字符库的函数 