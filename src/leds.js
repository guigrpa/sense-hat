// @flow

import fs from 'fs';
import { mainStory, chalk } from 'storyboard-core';
import letters from './letters';

// ===============================================
// Helpers
// ===============================================
type Buffer = Array<number>;
type RGBColor = [number, number, number];

export const BLACK = [0, 0, 0];
export const WHITE = [255, 255, 255];
export const RED = [255, 0, 0];
export const GREEN = [0, 255, 0];
export const BLUE = [0, 0, 255];
export const PINK = [255, 100, 100];

// const _pos = ((x: number, y: number): number) => 2 * ((7 - y) * 8 + (7 - x));
const _pos = (x, y) => 2 * ((7 - y) * 8 + (7 - x));

function _checkXY(x: number, y: number) {
  if (x < 0 || x > 7 || y < 0 || y > 7) {
    throw new Error(`Invalid coordinates: ${x}, ${y}`);
  }
}

// [R, G, B] -> 16-bit RGB[565]
function _rgbTo16(rgb: RGBColor): number {
  const r = (rgb[0] >> 3) & 0x1F;   // 5 MSBs
  const g = (rgb[1] >> 2) & 0x3F;   // 6 MSBs
  const b = (rgb[2] >> 3) & 0x1F;   // 5 MSBs
  const bits = (r << 11) + (g << 5) + b;
  return bits;
}

// 16-bit RGB[565] -> [R, G, B]
function _16ToRgb(bits: number): RGBColor {
  const r = (bits & 0xF800) >> 11;
  const g = (bits & 0x7E0) >> 5;
  const b = (bits & 0x1F);
  return [r << 3, g << 2, b << 3];
}

function _rgbToBuf(rgb: RGBColor): Buffer {
  const buf = new Buffer(2);
  buf.writeUInt16LE(_rgbTo16(rgb));
  return buf;
}

function _bufToRgb(buf: Buffer): RGBColor {
  const bits = buf.readUInt16LE();
  return _16ToRgb(bits);
}

// ===============================================
// Init
// ===============================================
let _fbPath = null;
const _letters = {};

export function init() {
  _initFb();
  _initLetters();
}

function _initFb() {
  let fb = null;
  let candidates;
  try {
    candidates = fs.readdirSync('/sys/class/graphics/');
  } catch (e) {
    mainStory.warn('sense-hat', 'Path does not exist: /sys/class/graphics/');
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
    mainStory.info('sense-hat', `Framebuffer file: ${chalk.cyan.bold(_fbPath)}`);
  } else {
    mainStory.error('sense-hat',
      chalk.red.bold('Could not find framebuffer file - LEDs will not work')
    );
  }
}

function _initLetters() {
  for (const key of Object.keys(letters)) {
    const letterShape = letters[key];
    _letters[key] = [];
    for (let n = 0; n < 64; n += 8) {
      const line = letterShape.slice(n, n + 8);
      _letters[key].push(line.split('').map(o => (o === '1' ? 1 : 0)));
    }
  }
}

// ===============================================
// -- ### LEDs
// ===============================================

// ===============================================
// -- #### Pixel read/write
// ===============================================
// -- **setPixel()**
// -- * Usage: `setPixel(x: number, y: number, rgb: RGBColor)`
export function setPixel(x: number, y: number, rgb: RGBColor) {
  _checkXY(x, y);
  if (!_fbPath) {
    return;
  }
  const fd = fs.openSync(_fbPath, 'w');
  const buf = _rgbToBuf(rgb);
  fs.writeSync(fd, buf, 0, buf.length, _pos(x, y));
  fs.closeSync(fd);
}

// -- **getPixel()**
// -- * Usage: `getPixel(x: number, y: number): RGBColor`
export function getPixel(x: number, y: number): RGBColor {
  _checkXY(x, y);
  if (!_fbPath) {
    return null;
  }
  const fd = fs.openSync(_fbPath, 'r');
  const buf = new Buffer(2);
  fs.readSync(fd, buf, 0, buf.length, _pos(x, y));
  fs.closeSync(fd);
  return _bufToRgb(buf);
}

// ===============================================
// -- #### Image read/write
// ===============================================
function _imgToBuf(img: Array<Array<RGBColor>>): Buffer {
  const buf = new Buffer(2 * 8 * 8);
  let offset = 0;
  for (let y = 0; y <= 7; y++) {
    for (let x = 0; x <= 7; x++) {
      buf.writeUInt16LE(_rgbTo16(img[7 - y][7 - x]), offset);
      offset += 2;
    }
  }
  return buf;
}

function _bufFilled(rgb: RGBColor): Buffer {
  const buf = new Buffer(2 * 8 * 8);
  let offset = 0;
  for (let y = 0; y <= 7; y++) {
    for (let x = 0; x <= 7; x++) {
      buf.writeUInt16LE(_rgbTo16(rgb), offset);
      offset += 2;
    }
  }
  return buf;
}

function _writeBuf(buf: Buffer) {
  if (!_fbPath) {
    return;
  }
  const fd = fs.openSync(_fbPath, 'w');
  fs.writeSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
}

export function setImage(img: Array<Array<RGBColor>>) {
  _writeBuf(_imgToBuf(img));
}

export function fill(rgb: RGBColor) {
  _writeBuf(_bufFilled(rgb));
}

export function clear() {
  fill(BLACK);
}

// ===============================================
// -- #### Write letter
// ===============================================
export function setLetter(key: string, options: ?Object) {
  const letterImg = _getLetterImg(key, options);
  if (!letterImg) return;
  setImage(letterImg);
}

export function getLetterImage(key: string): Array<Array<RGBColor>> {
  return _getLetterImg(key, WHITE);
}

function _getLetterImg(key: string, options = {}: ?Object): Array<Array<RGBColor>> {
  const letterShape = _letters[key];
  if (!letterShape) return null;
  const col = options.color || WHITE;
  const letterImg = letterShape.map(line =>
    line.map(pixel => (pixel ? col : BLACK))
  );
  return letterImg;
}
