import { i18n } from 'src/i18n'

export const faas = async () => {
  const cfg = i18n();
  return `${cfg.hello} ${cfg.ncf}`;
}
