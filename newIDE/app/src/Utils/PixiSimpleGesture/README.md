
This code is a modified version of [pixi-simple-gesture](https://github.com/dekimasoon/pixi-simple-gesture) to work with Pixi 7.

# pixi-simple-gesture
Add Pinch, Pan, Tap gesture support to pixi.js sprites.

```
npm install --save pixi-simple-gesture
```

## Usage

### Pan

```js
var gesture = require('pixi-simple-gesture')
var inertiaMode = true

var sprite = new PIXI.Sprite(texture)
gesture.panable(sprite, inertiaMode)

sprite.on('panstart', function() {
  console.log('pan start')
})

sprite.on('panmove', function(event) {
  console.log('pan move', event)
})

sprite.on('panend', function() {
  console.log('pan end')
})
```

The 'panmove' handler receives an event object containing the following properties.

| Name    | Value                                 |
|:--------|:--------------------------------------|
| deltaX  | Movement of the X axis                |
| deltaY  | Movement of the Y axis                |
| velocity| Velocity in px/ms                     |
| data    | Original InteractionData from pixi.js |

### TODO

- Add Inertia Mode
- Add Complex? Tap, emits 'tapstart', 'tapcancel', 'tapend'. Could be useful to implement UI components which has active state style.
