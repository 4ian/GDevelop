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
    const backgroundRed = this.layout.getBackgroundColorRed();
    const backgroundBlue = this.layout.getBackgroundColorBlue();
    const backgroundGreen = this.layout.getBackgroundColorGreen();
    const isDark =
      Math.max(backgroundRed, backgroundBlue, backgroundGreen) < 128;
    this.pixiRectangle.lineStyle(
      1,
      rgbToHexNumber(
        ((isDark ? 255 : 0) + backgroundRed) / 2,
        ((isDark ? 255 : 0) + backgroundBlue) / 2,
        ((isDark ? 255 : 0) + backgroundGreen) / 2
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
