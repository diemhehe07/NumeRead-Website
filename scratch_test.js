const fs = require('fs');

console.log("Loading public/game-test-banks.js...");
global.window = global;
require('./public/game-test-banks.js');

const initialVal = window.NumeReadTestBanks.validate();
console.log("Initial validate():", initialVal);
if (!initialVal.valid) {
  console.error("FAIL: Initial validation errors:", initialVal.errors);
  process.exit(1);
}

console.log("PASS: Pre-check completed.");
