三种方式为中间件提供配置

1. 中间件自己
  1.1 createXxxMiddleware(cfg) => IMiddleWare，这种方式在 koa 中间件中常用，但是无法中间修改配置
  2.2 new XxxMiddleWare(cfg) 然后后面可以调整配置，实现根据运行时状况动态调整配置适应负载 (推荐)
2. 在 faas 模块上配置 
  2.1 faas.xxx = config，这种可以区别对待每个 faas，读取配置也容易，ts 支持也容易
  2.2 为了解决挂载冲突，还是需要以 Symbol 作为配置项的 key
  2.3 faas 配置其实可以被目录配置取代的，目录配置只是开销可能更大，但是 cfgItem.get1 提供了只看 faas 级别配置，不看 prototype chain 的机制，从而避免了上述开销。因此，最终其实是不需要 faas 配置的，只有标准的目录配置也就是万能配置即可。
3. 目录配置，方便在各层级进行大范围配置，但是读取配置的开销可能会随着目录层级的加深有影响

考量：
* 需要能方便的控制每个目录的中间件开关 key=middleware 实例
