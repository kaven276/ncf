import { test } from '@ncf/microkernel';

test(module, { multi: 10}).then(console.dir);
test(module, { multi: 5}).then(console.dir);
