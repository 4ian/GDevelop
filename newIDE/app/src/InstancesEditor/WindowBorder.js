// @flow
import * as PIXI from 'pixi.js-legacy';
import transformRect from '../Utils/TransformRect';
import { rgbToHexNumber } from '../Utils/ColorTransformer';
import Rectangle from '../Utils/Rectangle';

type Props = {|
  project: gdProject,
  layout: gdLayout | null,
  eventsBasedObject: gdEventsBasedObject | null,
  toCanvasCoordinates: (x: number, y: number) => [number, number],
|};

export default class WindowBorder {
  project: gdProject;
  layout: gdLayout | null;
  eventsBasedObject: gdEventsBasedObject | null;
  toCanvasCoordinates: (x: number, y: number) => [number, number];
  pixiRectangle = new PIXI.Graphics();
  windowRectangle: Rectangle = new Rectangle();

  constructor({
    project,
    layout,
    eventsBasedObject,
    toCanvasCoordinates,
  }: Props) {
    this.project = project;
    this.layout = layout;
    this.eventsBasedObject = eventsBasedObject;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  }

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    const { layout, eventsBasedObject } = this;

    this.windowRectangle.set(
      eventsBasedObject
        ? {
            left: eventsBasedObject.getAreaMinX(),
            top: eventsBasedObject.getAreaMinY(),
            right: eventsBasedObject.getAreaMaxX(),
            bottom: eventsBasedObject.getAreaMaxY(),
          }
        : {
            left: 0,
            top: 0,
            right: this.project.getGameResolutionWidth(),
            bottom: this.project.getGameResolutionHeight(),
          }
    );
    const displayedRectangle = transformRect(
      this.toCanvasCoordinates,
      this.windowRectangle
    );

    this.pixiRectangle.clear();
    this.pixiRectangle.beginFill(0x000000);
    if (layout) {
      const backgroundRed = layout.getBackgroundColorRed();
      const backgroundBlue = layout.getBackgroundColorBlue();
      const backgroundGreen = layout.getBackgroundColorGreen();
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
    } else {
      this.pixiRectangle.lineStyle(1, 0x888888, 1);
    }
    this.pixiRectangle.alpha = 1;
    this.pixiRectangle.fill.alpha = 0;
    this.pixiRectangle.drawRect(
      displayedRectangle.left,
      displayedRectangle.top,
      displayedRectangle.width(),
      displayedRectangle.height()
    );
    if (eventsBasedObject) {
      const origin = this.toCanvasCoordinates(0, 0);
      this.pixiRectangle.drawRect(origin[0] - 8, origin[1] - 1, 16, 2);
      this.pixiRectangle.drawRect(origin[0] - 1, origin[1] - 8, 2, 16);
    }
    this.pixiRectangle.endFill();
  }
}
