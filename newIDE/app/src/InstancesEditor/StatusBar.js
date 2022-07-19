// @flow
import * as PIXI from '../PIXI';

type Props = {
  getLastCursorSceneCoordinates: () => [number, number],
  width: number,
  height: number,
};

export default class StatusBar {
  _width: number;
  _height: number;
  _getLastCursorSceneCoordinates: () => [number, number];
  _statusBarContainer: PIXI.Container;
  _statusBarBackground: PIXI.Graphics;
  _statusBarText: PIXI.Text;

  constructor({ getLastCursorSceneCoordinates, width, height }: Props) {
    this._getLastCursorSceneCoordinates = getLastCursorSceneCoordinates;
    this._statusBarContainer = new PIXI.Container();
    this._statusBarContainer.alpha = 0.8;
    this._statusBarContainer.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
    this._statusBarBackground = new PIXI.Graphics();
    this._statusBarText = new PIXI.Text('', {
      fontSize: 15,
      fill: 0xffffff,
      align: 'left',
    });
    this._statusBarContainer.addChild(this._statusBarBackground);
    this._statusBarContainer.addChild(this._statusBarText);
    this.resize(width, height);
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  getPixiObject(): PIXI.Container {
    return this._statusBarContainer;
  }

  render() {
    const padding = 5;
    const borderRadius = 4;
    const [x, y] = this._getLastCursorSceneCoordinates();
    this._statusBarText.text = `${x.toFixed(0)};${y.toFixed(0)}`;
    this._statusBarText.position.x = 0 + padding;
    this._statusBarText.position.y = Math.round(
      this._height - padding - this._statusBarText.height
    );

    this._statusBarBackground.clear();
    this._statusBarBackground.beginFill(0x000000, 0.8);
    this._statusBarBackground.drawRoundedRect(
      0 - borderRadius,
      this._height - padding * 2 - this._statusBarText.height,
      this._statusBarText.width + padding * 2 + borderRadius,
      this._statusBarText.height + padding * 2 + borderRadius,
      borderRadius
    );
    this._statusBarBackground.endFill();
  }
}
