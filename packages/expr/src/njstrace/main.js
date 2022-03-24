// *** main.js ***
var njstrace = require('njstrace').inject(),
    mymod = require('./mymod.js');

// Use only 4 digits so the output would be easier to read
mymod.run(parseFloat(Math.random().toFixed(4)));
