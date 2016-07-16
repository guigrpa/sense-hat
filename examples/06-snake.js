'use strict';

const leds      = require('../lib/es5').leds;
const h         = require('./common');
const program   = require('commander');

program
  .option('-l, --len [pixels]', 'Snake length in pixels')
  .parse(process.argv);

const SNAKE_LENGTH = program.len || 3;

const snake = [];

for (let x = SNAKE_LENGTH - 1; x >= 0; x--) {
  snake.push([x, 4]);
}

let col = leds.BLUE;
function drawSnake() {
  leds.clear();
  for (let i = 0; i < snake.length; i++) {
    const x = snake[i][0];
    const y = snake[i][1];
    leds.setPixel(x, y, col);
  }
}
function invalidMovement() {
  col = leds.PINK;
  drawSnake();
  setTimeout(() => {
    col = leds.BLUE;
    drawSnake();
  }, 800);
}

function isLegal(x, y) {
  // Out of bounds?
  if (x > 7 || x < 0 || y > 7 || y < 0) return false;

  // Biting itself?
  for (let i = 1; i < SNAKE_LENGTH; i++) {
    if (snake[i][0] === x && snake[i][1] === y) {
      return false;
    }
  }

  return true;
}

function calcNewPosition(letter) {
  const x0 = snake[0][0];
  const y0 = snake[0][1];
  let x = x0;
  let y = y0;
  switch (letter) {
    case 'UP': y--; break;
    case 'DOWN': y++; break;
    case 'LEFT': x--; break;
    case 'RIGHT': x++; break;
    default: return;
  }
  return [x, y];
}

h.initKeys();
h.onKeyPressed((letter) => {
  let tempPos = calcNewPosition(letter);
  if (!tempPos) return;
  let x = tempPos[0];
  let y = tempPos[1];

  if (!isLegal(x, y)) {
    snake.reverse();
    tempPos = calcNewPosition(letter);
    x = tempPos[0];
    y = tempPos[1];
    if (!isLegal(x, y)) {
      snake.reverse();
      invalidMovement();
      return;
    }
  }

  // Move!
  snake.unshift([x, y]);
  snake.splice(SNAKE_LENGTH);
  drawSnake();
});

drawSnake();
