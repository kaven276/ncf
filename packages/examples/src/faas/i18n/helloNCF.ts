import { i18n } from 'src/i18n'
import { ctxJWTStruct } from '@ncf/mw-jwt';

export const faas = async () => {
  const cfg = i18n();
  return `${cfg.hello(ctxJWTStruct.get()?.user)}, ${cfg.ncf}.`;
}
