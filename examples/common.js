'use strict';

const sense = require('../lib/es5');
const leds = sense.leds;

leds.clear();
process.on('SIGINT', () => {
  leds.clear();
  process.exit();
});
