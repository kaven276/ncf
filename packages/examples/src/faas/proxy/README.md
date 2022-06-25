代理和faas共存的要求：

1. 先尝试找到 faas，如果找到，有 export faas 保持，没有的话，自动设置成目录配置中的 faas
2. 没有找到 faas 的话，就虚拟一个 faas 模块，不落盘
3. faas module 中定义的 config 都生效，测试也生效
4. 如果想要测试被代理的 faas，必须写 faas 模块，并且 export const faas = proxy

* ./implement.ts 是一个直接实现接口，而不再走代理的服务
* ./hr/findUsers.ts 是一个依然走代理实现 faas，但是对该服务进行配置和测试
