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
  if (letter === 'TAB') {
    leds.setLetter(letter, { color: leds.RED });
  } else if (['E', 'F', 'T', 'I', 'L'].indexOf(letter) >= 0) {
    const colors = [h.getRandomColor(), h.getRandomColor()];
    const img = leds.getLetterImage(letter);
    let idx = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = img[y][x];
        if (!p[0] && !p[1] && !p[2]) continue;
        img[y][x] = colors[idx];
        idx = (idx + 1) % colors.length;
      }
    }
    leds.setImage(img);
  } else {
    const color = h.getRandomColor();
    leds.setLetter(letter, { color });
  }
});
