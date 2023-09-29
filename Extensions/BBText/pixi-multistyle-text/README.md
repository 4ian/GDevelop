# pixi-multistyle-text

[![NPM](https://nodei.co/npm/pixi-multistyle-text.png)](https://nodei.co/npm/pixi-multistyle-text/)

Add a `MultiStyleText` object inside [pixi.js](https://github.com/GoodBoyDigital/pixi.js) to easily create text using different styles.

## Example

In the example below, we are defining 4 text styles.
`default` is the default style for the text, and the others matches the tags inside the text.

```js
let text = new MultiStyleText("Let's make some <ml>multiline</ml>\nand <ms>multistyle</ms> text for\n<pixi>Pixi.js!</pixi>",
{
    "default": {
        fontFamily: "Arial",
        fontSize: "24px",
        fill: "#cccccc",
        align: "center"
    },
    "ml": {
        fontStyle: "italic",
        fill: "#ff8888"
    },
    "ms": {
        fontStyle: "italic",
        fill: "#4488ff"
    },
    "pixi": {
        fontSize: "64px",
        fill: "#efefef"
    }
});
```

## Build instructions

The library is no longer maintain and need this fix to work with Pixi 7: 
- [Fix empty color attribute errors with Pixi 7](https://github.com/D8H/pixi-multistyle-text/pull/1)

```bash
yarn install
yarn build
```

## Usage

### `text = new MultiStyleText(text, textStyles)`

Creates a new `MultiStyleText` with the given text and styles.

#### `textStyles`

Type: `{ [key: string]: ExtendedTextStyle }`

Each key of this dictionary should match with a tag in the text. Use the key `default` for the default style.

Each `ExtendedTextStyle` object can have [any of the properties of a standard PIXI text style](http://pixijs.download/release/docs/PIXI.TextStyle.html), in addition to a `valign` property that allows you to specify where text is rendered relative to larger text on the same line (`"top"`, `"middle"`, or `"bottom"`).

The `align`, `wordWrap`, `wordWrapWidth`, and `breakWord` properties are ignored on all styles _except for the `default` style_, which controls those properties for the entire text object.

If text is rendered without any value assigned to a given parameter, Pixi's defaults are used.

## Demo

```bash
yarn demo
```

## License

MIT, see [LICENSE.md](http://github.com/tleunen/pixi-multistyle-text/blob/master/LICENSE.md) for details.
