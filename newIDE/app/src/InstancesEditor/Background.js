// @flow
import * as PIXI from 'pixi.js-legacy';

type Props = {
  width: number,
  height: number,
};

export default class Background {
  _checkeredBackground: PIXI.TilingSprite;

  constructor({ width, height, layout }: Props) {
    this._checkeredBackground = new PIXI.TilingSprite(
      new PIXI.Texture(PIXI.Texture.from('res/transparentback.png')),
      width,
      height
    );
    this._checkeredBackground.visible = !layout;
  }

  resize(width: number, height: number) {
    this._checkeredBackground.width = width;
    this._checkeredBackground.height = height;
  }

  getPixiObject(): PIXI.TilingSprite {
    return this._checkeredBackground;
  }

  render() {}
}
