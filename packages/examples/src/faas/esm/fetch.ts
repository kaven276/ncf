import type { RequestInfo, RequestInit, Response } from 'fetch3';
type Fetch = (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

//@ts-ignore
import { fetch_ } from './fetch_';

export const fetch: Fetch = fetch_;
