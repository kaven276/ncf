import { resolved } from '@ncf/microkernel';

import type { RequestInfo, RequestInit, Response } from 'fetch3';
type Fetch = (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

// export const fetch1 = resolved(() => import('fetch3').then(m => m.default));

//@ts-ignore
import { fetch_ } from './fetch_';

export const fetch: Fetch = fetch_;
