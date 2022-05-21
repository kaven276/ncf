require('ts-node').register({
  transpileOnly: true,
  typeCheck: false,
  swc: false,
});
require('tsconfig-paths/register');

require('./index.ts');
