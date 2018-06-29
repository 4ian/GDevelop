import PIXI from 'pixi.js';
const gd = global.gd;

export default class SelectionRectangle {
  constructor({
    instances,
    instanceMeasurer,
    toSceneCoordinates,
    toCanvasCoordinates,
  }) {
    this.instances = instances;
    this.instanceMeasurer = instanceMeasurer;
    this.toSceneCoordinates = toSceneCoordinates;

    this.pixiRectangle = new PIXI.Graphics();
    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
    this.selectionRectangleStart = null;
    this.selectionRectangleEnd = null;
    this._instancesInSelectionRectangle = [];

    this.selector = new gd.InitialInstanceJSFunctor();
    this.selector.invoke = instancePtr => {
      const instance = gd.wrapPointer(instancePtr, gd.InitialInstance);
      const x = this.instanceMeasurer.getInstanceLeft(instance);
      const y = this.instanceMeasurer.getInstanceTop(instance);
      const instanceHeight = this.instanceMeasurer.getInstanceHeight(instance);
      const instanceWidth = this.instanceMeasurer.getInstanceWidth(instance);

      if (!this.selectionRectangleStart || !this.selectionRectangleEnd) return;

      const selectionSceneStart = toSceneCoordinates(
        this.selectionRectangleStart.x,
        this.selectionRectangleStart.y
      );
      const selectionSceneEnd = toSceneCoordinates(
        this.selectionRectangleEnd.x,
        this.selectionRectangleEnd.y
      );

      if (
        selectionSceneStart[0] <= x &&
        x + instanceWidth <= selectionSceneEnd[0] &&
        selectionSceneStart[1] <= y &&
        y + instanceHeight <= selectionSceneEnd[1]
      ) {
        this._instancesInSelectionRectangle.push(instance);
      }
    };
  }

  makeSelectionRectangle = (lastX, lastY) => {
    if (!this.selectionRectangleStart)
      this.selectionRectangleStart = { x: lastX, y: lastY };

    this.selectionRectangleEnd = { x: lastX, y: lastY };
  };

  endSelectionRectangle = () => {
    if (!this.selectionRectangleStart) return [];

    this._instancesInSelectionRectangle.length = 0;
    if (this.selectionRectangleStart.x > this.selectionRectangleEnd.x) {
      const tmp = this.selectionRectangleStart.x;
      this.selectionRectangleStart.x = this.selectionRectangleEnd.x;
      this.selectionRectangleEnd.x = tmp;
    }
    if (this.selectionRectangleStart.y > this.selectionRectangleEnd.y) {
      const tmp = this.selectionRectangleStart.y;
      this.selectionRectangleStart.y = this.selectionRectangleEnd.y;
      this.selectionRectangleEnd.y = tmp;
    }

    this.instances.iterateOverInstances(this.selector);

    this.selectionRectangleStart = null;
    return this._instancesInSelectionRectangle;
  };

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    if (!this.selectionRectangleStart) {
      this.pixiRectangle.visible = false;
      return;
    }

    let x1 = this.selectionRectangleStart.x;
    let y1 = this.selectionRectangleStart.y;
    let x2 = this.selectionRectangleEnd.x;
    let y2 = this.selectionRectangleEnd.y;

    this.pixiRectangle.visible = true;
    this.pixiRectangle.clear();
    this.pixiRectangle.beginFill(0x6868e8);
    this.pixiRectangle.lineStyle(1, 0x6868e8, 1);
    this.pixiRectangle.fillAlpha = 0.1;
    this.pixiRectangle.alpha = 0.8;
    this.pixiRectangle.drawRect(
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.abs(x2 - x1),
      Math.abs(y2 - y1)
    );
    this.pixiRectangle.endFill();
  }

  delete() {
    this.selector.delete();
  }
}
