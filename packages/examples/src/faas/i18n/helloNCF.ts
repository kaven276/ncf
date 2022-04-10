import { i18n } from 'src/i18n'
import { getJWTStruct } from '@ncf/mw-jwt';

export const faas = async () => {
  const cfg = i18n();
  return `${cfg.hello(getJWTStruct()?.user)}, ${cfg.ncf}.`;
}
