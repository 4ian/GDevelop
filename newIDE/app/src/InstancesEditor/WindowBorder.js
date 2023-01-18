// @flow
import * as PIXI from 'pixi.js-legacy';
import transformRect from '../Utils/TransformRect';
import { rgbToHexNumber } from '../Utils/ColorTransformer';
import Rectangle from '../Utils/Rectangle';

type Props = {|
  project: gdProject,
  layout: gdLayout,
  toCanvasCoordinates: (x: number, y: number) => [number, number],
|};

export default class WindowBorder {
  project: gdProject;
  layout: gdLayout;
  toCanvasCoordinates: (x: number, y: number) => [number, number];
  pixiRectangle = new PIXI.Graphics();
  windowRectangle: Rectangle = new Rectangle();

  constructor({ project, layout, toCanvasCoordinates }: Props) {
    this.project = project;
    this.layout = layout;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  }

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    this.windowRectangle.set({
      left: 0,
      top: 0,
      right: this.project.getGameResolutionWidth(),
      bottom: this.project.getGameResolutionHeight(),
    });
    const displayedRectangle = transformRect(
      this.toCanvasCoordinates,
      this.windowRectangle
    );

    this.pixiRectangle.clear();
    this.pixiRectangle.beginFill(0x000000);
    this.pixiRectangle.lineStyle(
      1,
      rgbToHexNumber(
        128 + (this.layout.getBackgroundColorRed() % 256),
        128 + (this.layout.getBackgroundColorBlue() % 256),
        128 + (this.layout.getBackgroundColorGreen() % 256)
      ),
      1
    );
    this.pixiRectangle.alpha = 1;
    this.pixiRectangle.fill.alpha = 0;
    this.pixiRectangle.drawRect(
      displayedRectangle.left,
      displayedRectangle.top,
      displayedRectangle.width(),
      displayedRectangle.height()
    );
    this.pixiRectangle.endFill();
  }
}
