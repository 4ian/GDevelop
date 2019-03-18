import transformRect from '../Utils/TransformRect';
import * as PIXI from 'pixi.js';

export default class InstancesSelection {
  constructor({ instanceMeasurer, toCanvasCoordinates }) {
    this.instanceMeasurer = instanceMeasurer;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.highlightedInstance = null;
    this.highlightRectangle = new PIXI.Graphics();
    this.highlightRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  }

  setInstance(instance) {
    this.highlightedInstance = instance;
  }

  getInstance() {
    return this.highlightedInstance;
  }

  getPixiObject(instance) {
    return this.highlightRectangle;
  }

  render() {
    if (this.highlightedInstance === null) {
      this.highlightRectangle.visible = false;
      return;
    }

    const highlightRectangle = transformRect(
      this.toCanvasCoordinates,
      this.instanceMeasurer.getInstanceRect(this.highlightedInstance)
    );

    this.highlightRectangle.visible = true;
    this.highlightRectangle.clear();
    this.highlightRectangle.beginFill(0xeeeeff);
    this.highlightRectangle.fillAlpha = 0.1;
    this.highlightRectangle.alpha = 0.8;
    this.highlightRectangle.lineStyle(1, 0x000000, 1);
    this.highlightRectangle.drawRect(
      highlightRectangle.x,
      highlightRectangle.y,
      highlightRectangle.width,
      highlightRectangle.height
    );
    this.highlightRectangle.endFill();
  }
}
