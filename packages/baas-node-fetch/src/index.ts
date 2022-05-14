import type { RequestInfo, RequestInit, Response } from 'node-fetch';
type Fetch = (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

import { fetch_ } from './fetch';

export const fetch: Fetch = fetch_;
export const awaitModule = true;
