# guards #

JavaScript library for data type & data structure validations providing a
runtime analog of types. Check out [docs] for more details.

## Install ##

    npm install guards

## Require ##

    // Full version inculding String / Number / Function guards.
    var guards = require('https!raw.github.com/Gozala/guards/v0.2.0/guards.js')

    // Core version without dependencies and type specific guards.
    var guards = require('https!raw.github.com/Gozala/guards/v0.2.0/core.js')

## Example ##

    var guards = require('https!raw.github.com/Gozala/guards/v0.2.0/guards.js')
    var Point = guards.Schema({
      x: guards.Number(0),
      y: guards.Number(0)
    })

    function color(value) {
      if (typeof value === "number" && value <= 255 && value >= 0) return value
      throw new TypeError("Color is a number between 0 and 255")
    }

    var RGB = guards.Tuple([ color, color, color ])
    var Segment = guards.Schema({
      start: Point,
      end: Point,
      color: RGB,
    })

    var segment = Segment({ end: { y: 23 }, color: [17, 255, 0] })
    // { start: { x: 0, y: 0 }, end: { x: 0, y: 23 }, color: [ 17, 255, 0 ] }

## Prior art ##

- [EcmaScript Guards proposal]
- [StructsJS]

[EcmaScript Guards proposal]:http://wiki.ecmascript.org/doku.php?id=strawman:guards
[StructsJS]:https://github.com/dherman/structsjs
[docs]:http://jeditoolkit.com/guards/docs/

