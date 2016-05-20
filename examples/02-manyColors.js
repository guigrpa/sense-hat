'use strict';

require('./common');
const sense = require('../lib/es5');
const leds = sense.leds;

const COLORS = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
];

let x = 0;
let y = 0;
let idx = 0;
function updatePos() {
  idx++;
  const rgb = COLORS[idx % COLORS.length];
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

setInterval(updatePos, 150);
