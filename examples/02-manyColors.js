'use strict';

require('./common');
const sense = require('../lib/es5');
const leds = sense.leds;

let x = 0;
let y = 0;
function updatePos() {
  const rgb = [
    50 + Math.random() * 100,
    50 + Math.random() * 80,
    180 + Math.random() * 75,
  ];
  leds.setPixel(x, y, rgb);
  x++;
  if (x > 7) {
    x = 0;
    y++;
  }
  if (y > 7) {
    y = 0;
  }
}

setInterval(updatePos, 30);
