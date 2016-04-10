'use strict';

const sense     = require('../lib/es5');
const leds      = sense.leds;
const h         = require('./common');

let x = 4;
let y = 4;
let col = leds.BLUE;
function _showCursor() {
  leds.clear();
  leds.setPixel(x, y, col);
}
function _warnCursor() {
  col = leds.PINK;
  _showCursor();
  setTimeout(() => {
    col = leds.BLUE;
    _showCursor();
  }, 800);
}

h.initKeys();
h.onKeyPressed((letter) => {
  switch (letter) {
    case 'UP':
      y--;
      break;
    case 'DOWN':
      y++;
      break;
    case 'LEFT':
      x--;
      break;
    case 'RIGHT':
      x++;
      break;
    default:
      break;
  }
  if (x > 7 || x < 0 || y > 7 || y < 0) {
    x = Math.max(Math.min(x, 7), 0);
    y = Math.max(Math.min(y, 7), 0);
    _warnCursor();
  } else {
    _showCursor();
  }
});

_showCursor();
