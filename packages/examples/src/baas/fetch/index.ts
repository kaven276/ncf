import { fetch as _fetch } from '@ncf/node-fetch';

// 注：只有在应用中导出，才能确保 NCF 给执行 lifecycle
/** 来自 node-fetch */
export const fetch = _fetch;
