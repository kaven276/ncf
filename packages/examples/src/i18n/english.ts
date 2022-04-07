import type { I18nConfig } from './spec';

export const config: I18nConfig = {
  hello: (username) => `Welcome ${username ?? 'guest'}`,
  ncf: 'nodejs concise framework'
}
