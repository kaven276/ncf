import { resolved } from '@ncf/microkernel';

/** 演示其他模块的 lifecycle resolved 函数中要用到本模块的 resolved 导出值 */
export let EXAMPLE_PG_DB_PASSWORD = resolved<string>(() => new Promise(r => setTimeout(() => r('test1'), 1000)))
