// @flow
import * as PIXI from 'pixi.js-legacy';
import {
  getBasicProfilingCountersText,
  type BasicProfilingCounters,
} from './InstancesRenderer/BasicProfilingCounters';

export default class ProfilerBar {
  _profilerBarContainer: PIXI.Container;
  _profilerBarBackground: PIXI.Graphics;
  _profilerBarText: PIXI.Text;

  constructor() {
    this._profilerBarContainer = new PIXI.Container();
    this._profilerBarContainer.alpha = 0.8;
    this._profilerBarContainer.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
    this._profilerBarBackground = new PIXI.Graphics();
    this._profilerBarText = new PIXI.Text('', {
      fontSize: 12,
      fill: 0xffffff,
      align: 'left',
    });
    this._profilerBarContainer.addChild(this._profilerBarBackground);
    this._profilerBarContainer.addChild(this._profilerBarText);
  }

  getPixiObject(): PIXI.Container {
    return this._profilerBarContainer;
  }

  render({
    basicProfilingCounters,
    display,
  }: {|
    basicProfilingCounters: BasicProfilingCounters,
    display: boolean,
  |}) {
    if (!display) {
      this._profilerBarContainer.visible = false;
      return;
    }

    this._profilerBarContainer.visible = true;
    const textPadding = 5;
    const profilerBarPadding = 15;
    const borderRadius = 6;
    const textXPosition = profilerBarPadding + textPadding;
    const textYPosition = profilerBarPadding + textPadding;

    this._profilerBarText.text = getBasicProfilingCountersText(
      basicProfilingCounters
    );
    this._profilerBarText.position.x = textXPosition;
    this._profilerBarText.position.y = textYPosition;

    const profilerBarXPosition = profilerBarPadding;
    const profilerBarYPosition = profilerBarPadding;
    const profilerBarWidth = this._profilerBarText.width + textPadding * 2;
    const profilerBarHeight = this._profilerBarText.height + textPadding * 2;

    this._profilerBarBackground.clear();
    this._profilerBarBackground.beginFill(0x000000, 0.8);
    this._profilerBarBackground.drawRoundedRect(
      profilerBarXPosition,
      profilerBarYPosition,
      profilerBarWidth,
      profilerBarHeight,
      borderRadius
    );
    this._profilerBarBackground.endFill();
  }
}
