const gd = global.gd;
const PIXI = global.PIXI;

export default class InstancesSelection {
    constructor({getInstanceWidth, getInstanceHeight}) {
      this.getInstanceWidth = getInstanceWidth;
      this.getInstanceHeight = getInstanceHeight;

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

      this.highlightRectangle.visible = true;
      this.highlightRectangle.clear();
      this.highlightRectangle.beginFill(0xEEEEFF);
      this.highlightRectangle.fillAlpha = 0.1;
      this.highlightRectangle.alpha = 0.8;
      this.highlightRectangle.lineStyle(1, 0x000000, 1);
      this.highlightRectangle.drawRect(this.highlightedInstance.getX(), this.highlightedInstance.getY(),
        this.getInstanceWidth(this.highlightedInstance),
        this.getInstanceHeight(this.highlightedInstance));
      this.highlightRectangle.endFill();
    }
}
