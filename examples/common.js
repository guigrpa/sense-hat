'use strict';

const keypress  = require('keypress');
const storyboard = require('storyboard-core');
const sense = require('../lib/es5');
const leds = sense.leds;
const mainStory = storyboard.mainStory;
const chalk     = storyboard.chalk;

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
// Public API
// ---------------------------------
module.exports = {
  initKeys,
  onKeyPressed,
};
