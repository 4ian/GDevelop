import transformRect from '../Utils/TransformRect';
import * as PIXI from '../PIXI';

export default class InstancesSelection {
  constructor({ instanceMeasurer, toCanvasCoordinates }) {
    this.instanceMeasurer = instanceMeasurer;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.highlightedInstance = null;
    this.highlightRectangle = new PIXI.Graphics();
    this.highlightRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);

    this.tooltipBackground = new PIXI.Graphics();
    this.tooltipText = new PIXI.Text('', {
      fontSize: 15,
      fill: 0xffffff,
      align: 'center',
    });
    this.highlightRectangle.addChild(this.tooltipBackground);
    this.highlightRectangle.addChild(this.tooltipText);
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
    this.highlightRectangle.fill.alpha = 0.1;
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
    this.tooltipText.text = tooltipInfo;

    this.tooltipText.x = Math.round(
      highlightRectangle.x -
        this.tooltipText.width / 2 +
        highlightRectangle.width / 2
    );
    this.tooltipText.y = Math.round(
      highlightRectangle.y - this.tooltipText.height
    );

    const padding = 5;
    this.tooltipBackground.clear();
    this.tooltipBackground.beginFill(0x000000, 0.8);
    this.tooltipBackground.drawRoundedRect(
      this.tooltipText.x - padding,
      this.tooltipText.y - padding,
      this.tooltipText.width + padding * 2,
      this.tooltipText.height - padding,
      4
    );
    this.tooltipBackground.endFill();
  }
}
