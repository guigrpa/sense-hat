'use strict';

require('./common');
const tinycolor = require('tinycolor2');
const sense     = require('../lib/es5');
const leds      = sense.leds;

let col = tinycolor('#902323');
function update() {
  col = col.spin(5);
  const rgbObj = col.toRgb();
  const rgb = [rgbObj.r, rgbObj.g, rgbObj.b];
  leds.fill(rgb);
}

setInterval(update, 150);
