// @flow
import * as PIXI from '../PIXI';
import transformRect from '../Utils/TransformRect';
import { rgbToHexNumber } from '../Utils/ColorTransformer';

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
  windowRectangle: { x: number, y: number, width: number, height: number };

  constructor({ project, layout, toCanvasCoordinates }: Props) {
    this.project = project;
    this.layout = layout;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
    this.windowRectangle = {
      x: 0,
      y: 0,
      width: this.project.getGameResolutionWidth(),
      height: this.project.getGameResolutionHeight(),
    };
  }

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    this.windowRectangle.width = this.project.getGameResolutionWidth();
    this.windowRectangle.height = this.project.getGameResolutionHeight();

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
      displayedRectangle.x,
      displayedRectangle.y,
      displayedRectangle.width,
      displayedRectangle.height
    );
    this.pixiRectangle.endFill();
  }
}
