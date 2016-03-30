fs = require 'fs'
path = require 'path'
chalk = require 'chalk'

# Look for framebuffer file
# -------------------------
candidates = fs.readdirSync '/sys/class/graphics/'
fb = null
for candidate in candidates
  continue unless candidate.indexOf('fb') is 0
  try
    name = fs.readFileSync "/sys/class/graphics/#{candidate}/name"
    if name.indexOf('RPi-Sense FB') is 0
      fb = candidate
      break
  catch e
    # ...
if not fb
  console.log chalk.red.bold "Could not find framebuffer file"
  process.exit()

fbPath = "/dev/#{fb}"
console.log "Framebuffer file: #{chalk.cyan.bold fbPath}"

# ===============================================
# Helpers
# ===============================================
_pos = (x, y) -> 2 * (y * 8 + x)

# [R, G, B] -> 16-bit RGB565
_pack = (rgb) ->
  r = (rgb[0] >> 3) & 0x1F
  g = (rgb[1] >> 2) & 0x3F
  b = (rgb[2] >> 3) & 0x1F
  bits = (r << 11) + (g << 5) + b
  buf = new Buffer 2
  buf.writeUInt16LE bits
  buf

###
# 16-bit RGB565 -> [R, G, B]
_unpack = (bits) ->
  r = (n & 0xF800) >> 11
  g = (n & 0x7E0) >> 5
  b = (n & 0x1F)
  rgb = [ r << 3, g << 2, b << 3 ]
  rgb
###

# ===============================================
# setPixel
# ===============================================
setPixel = (x, y, rgb) ->
  if x < 0 or x > 7 or y < 0 or y > 7
    throw new Error "Invalid coordinates: #{x}, #{y}"
  fd = fs.openSync fbPath, 'w'
  buf = _pack rgb
  fs.writeSync fd, buf, 0, buf.length, _pos(x, y)
  fs.closeSync fd
  return

clear = ->
  fd = fs.openSync fbPath, 'w'
  for x in [0..7]
    for y in [0..7]
      buf = _pack [0, 0, 0]
      fs.writeSync fd, buf, 0, buf.length, _pos(x, y)
  fs.closeSync fd
  return

module.exports = {
  setPixel,
  clear,
}
