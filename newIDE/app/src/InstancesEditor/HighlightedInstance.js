import transformRect from '../Utils/TransformRect';
import * as PIXI from 'pixi.js';

export default class InstancesSelection {
  constructor({ instanceMeasurer, toCanvasCoordinates }) {
    this.instanceMeasurer = instanceMeasurer;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.highlightedInstance = null;
    this.highlightRectangle = new PIXI.Graphics();
    this.highlightRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);

    this.tooltipBG = new PIXI.Graphics();
    this.tooltip = new PIXI.Text('', {
      fontSize: 17,
      fill: 0xffffff,
      align: 'center',
    });
    this.highlightRectangle.addChild(this.tooltipBG);
    this.highlightRectangle.addChild(this.tooltip);
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

    const tooltipInfo =
      'Object: ' +
      this.highlightedInstance.getObjectName() +
      '\n' +
      'X: ' +
      parseInt(this.highlightedInstance.getX()) +
      '  Y: ' +
      parseInt(this.highlightedInstance.getY()) +
      '\n' +
      'Layer: ' +
      this.highlightedInstance.getLayer() +
      '  Z: ' +
      this.highlightedInstance.getZOrder() +
      '\n';
    this.tooltip.text = tooltipInfo;
    this.tooltip.x = //alternatively we could draw it at mouse position instead. Would help for big objects
      highlightRectangle.x -
      this.tooltip.width / 2 +
      highlightRectangle.width / 2;
    this.tooltip.y = highlightRectangle.y - 60;

    this.tooltipBG.clear();
    this.tooltipBG.beginFill(0x000000, 0.8);
    this.tooltipBG.drawRoundedRect(
      this.tooltip.x - 5,
      this.tooltip.y - 5,
      this.tooltip.width + 10,
      this.tooltip.height - 5,
      16
    );
    this.tooltipBG.endFill();
  }
}
