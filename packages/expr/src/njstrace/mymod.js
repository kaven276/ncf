// *** mymod.js ***
exports.run = function(number) {
  number = first(number);
  printResult(number);
}

function first(i) {
  i *= 100;
  return second(i, 'sqrt');
}

function second(k, method) {
  return {input: k, output: parseFloat(Math.sqrt(k).toFixed(4)), method: method};
}

function printResult(res) {
  require('fs').writeFileSync('output.txt', JSON.stringify(res));
}
