'use strict';

const sense     = require('../lib/es5');
const leds      = sense.leds;
const h         = require('./common');

/*
let col = tinycolor('#902323');
function update() {
  col = col.spin(5);
  const rgbObj = col.toRgb();
  const rgb = [rgbObj.r, rgbObj.g, rgbObj.b];
  leds.fill(rgb);
}

setInterval(update, 150);
*/

h.initKeys();
h.onKeyPressed((letter) => {
  let color;
  if (letter === 'TAB') color = leds.RED;
  leds.setLetter(letter, { color });
});
