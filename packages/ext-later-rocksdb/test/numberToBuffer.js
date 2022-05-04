//@ts-check
const buffer = new ArrayBuffer(8);
const view = new DataView(buffer, 0);
const now = Date.now();
view.setFloat64(0, now);
console.log(now === view.getFloat64(0), view.getFloat64(0));
