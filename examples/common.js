'use strict';

const keypress  = require('keypress');
const storyboard = require('storyboard-core');
const mainStory = storyboard.mainStory;
const chalk     = storyboard.chalk;
const sense = require('../lib/es5');
const leds = sense.leds;
const tinycolor = require('tinycolor2');

leds.clear();
process.on('SIGINT', () => {
  leds.clear();
  process.exit();
});

// ---------------------------------
// Key presses
// ---------------------------------
const _keyListeners = [];

function initKeys() {
  keypress(process.stdin);
  process.stdin.on('keypress', (ch, key) => {
    let letter = null;
    if (key) {
      if (key.ctrl && key.name === 'c') {
        process.stdin.pause();
        leds.clear();
      } else {
        letter = key.name;
      }
    } else {
      letter = ch;
    }
    if (letter != null) {
      letter = letter.toUpperCase();
      mainStory.info('letters', `Pressed: ${chalk.cyan.bold(letter)}`);
      for (const listener of _keyListeners) {
        listener(letter);
      }
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

function onKeyPressed(listener) {
  _keyListeners.push(listener);
}


// ---------------------------------
// Random color
// ---------------------------------
const baseCol = tinycolor('#902323');
function getRandomColor() {
  if (Math.random() >= 0.991) return leds.WHITE;
  const rgbObj = baseCol.spin(Math.random() * 360).toRgb();
  return [rgbObj.r, rgbObj.g, rgbObj.b];
}

// ---------------------------------
// Public API
// ---------------------------------
module.exports = {
  initKeys,
  onKeyPressed,

  getRandomColor,
};
