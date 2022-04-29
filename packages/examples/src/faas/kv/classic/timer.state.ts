import type { } from 'node:timers';
export const state: {
  timer?: NodeJS.Timer,
} = {
  /** setInterval 返回的 timer */
  timer: undefined,
}
