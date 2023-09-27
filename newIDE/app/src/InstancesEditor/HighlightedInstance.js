// @flow
import transformRect from '../Utils/TransformRect';
import * as PIXI from 'pixi.js-legacy';
import { type InstanceMeasurer } from './InstancesRenderer';
import Rectangle from '../Utils/Rectangle';

export default class HighlightedInstance {
  instanceMeasurer: InstanceMeasurer;
  toCanvasCoordinates: (x: number, y: number) => [number, number];
  isInstanceOf3DObject: gdInitialInstance => boolean;
  highlightedInstance: gdInitialInstance | null;
  isHighlightedInstanceOf3DObject: boolean;
  highlightRectangle: PIXI.Container;
  tooltipBackground: PIXI.Container;
  tooltipText: PIXI.Container;

  constructor({
    instanceMeasurer,
    toCanvasCoordinates,
    isInstanceOf3DObject,
  }: {
    instanceMeasurer: InstanceMeasurer,
    toCanvasCoordinates: (x: number, y: number) => [number, number],
    isInstanceOf3DObject: gdInitialInstance => boolean,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.toCanvasCoordinates = toCanvasCoordinates;
    this.isInstanceOf3DObject = isInstanceOf3DObject;

    this.highlightedInstance = null;
    this.isHighlightedInstanceOf3DObject = false;
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

  setInstance(instance: gdInitialInstance | null) {
    this.isHighlightedInstanceOf3DObject = instance
      ? this.isInstanceOf3DObject(instance)
      : false;
    this.highlightedInstance = instance;
  }

  getInstance(): ?gdInitialInstance {
    return this.highlightedInstance;
  }

  getPixiObject(): PIXI.Container {
    return this.highlightRectangle;
  }

  render() {
    const { highlightedInstance } = this;
    if (highlightedInstance === null) {
      this.highlightRectangle.visible = false;
      return;
    }

    const highlightRectangle = transformRect(
      this.toCanvasCoordinates,
      this.instanceMeasurer.getInstanceAABB(
        highlightedInstance,
        new Rectangle()
      )
    );

    this.highlightRectangle.visible = true;
    this.highlightRectangle.clear();
    this.highlightRectangle.beginFill(0xeeeeff);
    this.highlightRectangle.fill.alpha = 0.1;
    this.highlightRectangle.alpha = 0.8;
    this.highlightRectangle.lineStyle(1, 0x000000, 1);
    this.highlightRectangle.drawRect(
      highlightRectangle.left,
      highlightRectangle.top,
      highlightRectangle.width(),
      highlightRectangle.height()
    );
    this.highlightRectangle.endFill();

    const tooltipInfo =
      highlightedInstance.getObjectName() +
      '\n' +
      'X: ' +
      Math.round(highlightedInstance.getX() * 100) / 100 + // An instance position can have a lot of decimals, so round to 2 decimals.
      '  Y: ' +
      Math.round(highlightedInstance.getY() * 100) / 100 + // An instance position can have a lot of decimals, so round to 2 decimals.
      (this.isHighlightedInstanceOf3DObject
        ? '  Z: ' +
          // An instance position can have a lot of decimals, so round to 2 decimals.
          Math.round(highlightedInstance.getZ() * 100) / 100
        : '') +
      '\n' +
      'Layer: ' +
      (highlightedInstance.getLayer() || 'Base layer') +
      (this.isHighlightedInstanceOf3DObject
        ? ''
        : '\nZ order: ' + highlightedInstance.getZOrder()) +
      '\n';

    this.tooltipText.text = tooltipInfo;

    this.tooltipText.x = Math.round(
      highlightRectangle.left -
        this.tooltipText.width / 2 +
        highlightRectangle.width() / 2
    );
    this.tooltipText.y = Math.round(
      highlightRectangle.top - this.tooltipText.height
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
