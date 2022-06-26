import type { Pool, PoolClient } from 'pg';
import { createCfgItem } from '@ncf/microkernel';

type GetConnection = () => Pool | PoolClient;
export const cfgPgConnection = createCfgItem<GetConnection>(Symbol('PgConnection'));
