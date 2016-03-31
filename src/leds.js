// @flow

import fs from 'fs';
import { storyboard, chalk } from 'storyboard-core';

// ===============================================
// Helpers
// ===============================================
let _fbPath = null;

type Buffer = Object;

// const _pos = ((x: number, y: number): number) => 2 * (y * 8 + x);
const _pos = (x, y) => 2 * (y * 8 + x);

function _pack(rgb: Array<number>): Buffer {
  const r = (rgb[0] >> 3) & 0x1F;
  const g = (rgb[1] >> 2) & 0x3F;
  const b = (rgb[2] >> 3) & 0x1F;
  const bits = (r << 11) + (g << 5) + b;
  const buf = new Buffer(2);
  buf.writeUInt16LE(bits);
  return buf;
}


/*
 * 16-bit RGB565 -> [R, G, B]
_unpack = (bits) ->
  r = (n & 0xF800) >> 11
  g = (n & 0x7E0) >> 5
  b = (n & 0x1F)
  rgb = [ r << 3, g << 2, b << 3 ]
  rgb
 */

// ===============================================
// Init
// ===============================================
export function init() {
  let fb = null;
  let candidates;
  try {
    candidates = fs.readdirSync('/sys/class/graphics/');
  } catch (e) {
    storyboard.warn('sense-hat', 'Path does not exist: /sys/class/graphics/');
    candidates = [];
  }
  for (const candidate of candidates) {
    if (candidate.indexOf('fb') !== 0) {
      continue;
    }
    try {
      const name = fs.readFileSync(`/sys/class/graphics/${candidate}/name`);
      if (name.indexOf('RPi-Sense FB') === 0) {
        fb = candidate;
        break;
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  if (fb) {
    _fbPath = `/dev/${fb}`;
    storyboard.info('sense-hat', `Framebuffer file: ${chalk.cyan.bold(_fbPath)}`);
  } else {
    storyboard.error('sense-hat',
      chalk.red.bold('Could not find framebuffer file - LEDs will not work'));
  }
}


// ===============================================
// -- ### LEDs
// ===============================================

// ===============================================
// -- #### Pixel read/write
// ===============================================
// -- ##### setPixel()
//
export function setPixel(x: number, y: number, rgb: Array<number>) {
  if (x < 0 || x > 7 || y < 0 || y > 7) {
    throw new Error(`Invalid coordinates: ${x}, ${y}`);
  }
  if (!_fbPath) {
    return;
  }
  const fd = fs.openSync(_fbPath, 'w');
  const buf = _pack(rgb);
  fs.writeSync(fd, buf, 0, buf.length, _pos(x, y));
  fs.closeSync(fd);
}

// ===============================================
// Matrix write
// ===============================================
export function clearPixels() {
  if (!_fbPath) {
    return;
  }
  const fd = fs.openSync(_fbPath, 'w');
  let buf;
  for (let x = 0; x <= 7; x++) {
    for (let y = 0; y <= 7; y++) {
      buf = _pack([0, 0, 0]);
      fs.writeSync(fd, buf, 0, buf.length, _pos(x, y));
    }
  }
  fs.closeSync(fd);
}
