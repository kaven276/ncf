type FaasPath = string;

/** 使用 class 而非 interface 原因是可能因标记统一的类型有利于 v8 优化 */
export class Stat {
  constructor(
    public path: FaasPath,
    /** 首次记录时间点, Date.now() */
    public firstExecTime: number,
    /** 执行次数 */
    public times: number = 0,
    /** 最大执行时长, 单位 ms */
    public maxExecTime: number = 0,
    /** 总累计执行时长, 单位 ms */
    public totalExecTime: number = 0,
    /** 当前执行并行量 */
    public concurrency: number = 0,
    /** 最大并行量，这个记录也会被用于控制单个服务的最大并发量，因为该并发量可以对应数据库连接量，防止异常重试导致占用大量数据库连接，影响到其他服务 */
    public hwConcurrency: number = 0,
  ) { }
  onBefore() {
    this.concurrency += 1;
    if (this.concurrency > this.hwConcurrency) {
      this.hwConcurrency = this.concurrency;
    }
  }
  onAfter(startTime: number) {
    this.concurrency -= 1;
    const timeUsed = Date.now() - startTime;
    if (timeUsed > this.maxExecTime) {
      this.maxExecTime = timeUsed;
    }
    this.times += 1;
    this.totalExecTime += timeUsed;
  }
}
