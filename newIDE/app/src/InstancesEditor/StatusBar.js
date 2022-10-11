// @flow
import * as PIXI from 'pixi.js-legacy';

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
    const textPadding = 5;
    const statusBarPadding = 15;
    const borderRadius = 6;
    const textXPosition = Math.round(
      this._width - statusBarPadding - textPadding - this._statusBarText.width
    );
    const textYPosition = Math.round(
      this._height - textPadding - statusBarPadding - this._statusBarText.height
    );

    const [x, y] = this._getLastCursorSceneCoordinates();
    this._statusBarText.text = `${x.toFixed(0)};${y.toFixed(0)}`;
    this._statusBarText.position.x = textXPosition;
    this._statusBarText.position.y = textYPosition;

    const statusBarXPosition =
      this._width -
      statusBarPadding -
      textPadding * 2 -
      this._statusBarText.width;
    const statusBarYPosition =
      this._height -
      statusBarPadding -
      textPadding * 2 -
      this._statusBarText.height;
    const statusBarWidth = this._statusBarText.width + textPadding * 2;
    const statusBarHeight = this._statusBarText.height + textPadding * 2;

    this._statusBarBackground.clear();
    this._statusBarBackground.beginFill(0x000000, 0.8);
    this._statusBarBackground.drawRoundedRect(
      statusBarXPosition,
      statusBarYPosition,
      statusBarWidth,
      statusBarHeight,
      borderRadius
    );
    this._statusBarBackground.endFill();
  }
}
