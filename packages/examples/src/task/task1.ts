import { runFaasAsTask } from '@ncf/microkernel';

// import { faas } from '../services/nested/start';

// 需要先初始化指定的模块，然后对齐调用 innerCall

runFaasAsTask('/nested/start').then(rsp => console.dir(rsp, { depth: 7 }));
