'use strict';

require('./common');
const keypress  = require('keypress');
const storyboard = require('storyboard-core');
const sense     = require('../lib/es5');
const leds      = sense.leds;
const mainStory = storyboard.mainStory;
const chalk     = storyboard.chalk;

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
    leds.setLetter(letter);
  }
});
process.stdin.setRawMode(true);
process.stdin.resume();
