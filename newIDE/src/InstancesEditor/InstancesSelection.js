import gesture from 'pixi-simple-gesture';
import transformRect from '../Utils/TransformRect';
const gd = global.gd;
const PIXI = global.PIXI;

const resizeButtonWidth = 18;
const resizeButtonHeight = 18;

export default class InstancesSelection {
    constructor({instanceMeasurer, onResize, toCanvasCoordinates}) {
      this.instanceMeasurer = instanceMeasurer;
      this.onResize = onResize;
      this.toCanvasCoordinates = toCanvasCoordinates;

      this.selection = [];

      this.pixiContainer = new PIXI.Container();
      this.rectanglesContainer = new PIXI.Container();
      this.selectedRectangles = [];
      this.resizeButton = new PIXI.Graphics();
      this.resizeIcon = new PIXI.Sprite.fromImage('res/actions/direction.png');
      this.pixiContainer.addChild(this.rectanglesContainer);
      this.pixiContainer.addChild(this.resizeButton);
      this.pixiContainer.addChild(this.resizeIcon);

      this.resizeButton.interactive = true;
      gesture.panable(this.resizeButton);
      this.resizeButton.on('panmove', (event) => {
        this.onResize(event.deltaX, event.deltaY);
      });
    }

    getSelectedInstances() {
      return this.selection;
    }

    isInstanceSelected(instance) {
      for (var i = 0; i < this.selection.length; i++) {
        if (gd.compare(this.selection[i], instance))
          return true;
      }

      return false;
    }

    clearSelection() {
      this.selection.length = 0;
    }

    selectInstance(instance) {
      if (!this.isInstanceSelected(instance)) {
        this.selection.push(instance);
      }
    }

    unselectInstance(instance) {
      if (this.isInstanceSelected(instance)) {
        var i = this.selection.length - 1;
        while (i >= -1 && this.selection[i].ptr !== instance.ptr) {
            --i;
        }

        this.selection.splice(i, 1);
      }
    }

    getPixiContainer() {
      return this.pixiContainer;
    }

    render() {
      let x1;
      let y1;
      let x2;
      let y2;

      //Update the selection rectangle of each instance
      for (var i = 0; i < this.selection.length; i++) {
        if (this.selectedRectangles.length === i) {
          const newRectangle = new PIXI.Graphics();
          newRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
          this.selectedRectangles.push(newRectangle);
          this.rectanglesContainer.addChild(newRectangle);
        }

        const instance = this.selection[i];
        const instanceRect = this.instanceMeasurer.getInstanceRect(instance);
        const selectionRectangle = transformRect(this.toCanvasCoordinates, instanceRect);

        this.selectedRectangles[i].clear();
        this.selectedRectangles[i].beginFill(0x6868E8);
        this.selectedRectangles[i].lineStyle(1, 0x6868E8, 1);
        this.selectedRectangles[i].fillAlpha = 0.3;
        this.selectedRectangles[i].alpha = 0.8;
        this.selectedRectangles[i].drawRect(selectionRectangle.x, selectionRectangle.y,
            selectionRectangle.width, selectionRectangle.height);
        this.selectedRectangles[i].endFill();

        if ( x1 === undefined || instanceRect.x < x1 ) x1 = instanceRect.x;
        if ( y1 === undefined || instanceRect.y < y1 ) y1 = instanceRect.y;
        if ( x2 === undefined || instanceRect.x + instanceRect.width > x2 )
            x2 = instanceRect.x + instanceRect.width;
        if ( y2 === undefined || instanceRect.y + instanceRect.height > y2 )
            y2 = instanceRect.y + instanceRect.height;
      }

      while (this.selectedRectangles.length > this.selection.length) {
        this.rectanglesContainer.removeChild(this.selectedRectangles.pop());
      }

      //Position the resize button.
      this.resizeButton.clear();
      this.resizeIcon.visible = false;
      if (this.selection.length !== 0) {
          const resizeButtonPos = this.toCanvasCoordinates(x2 + 5, y2 + 5);

          this.resizeIcon.visible = true;
          this.resizeIcon.position.x = resizeButtonPos[0] + 1;
          this.resizeIcon.position.y = resizeButtonPos[1] + 1;
          this.resizeButton.beginFill(0xFFFFFF);
          this.resizeButton.lineStyle(1, 0x6868E8, 1);
          this.resizeButton.fillAlpha = 0.9;
          this.resizeButton.drawRect(resizeButtonPos[0], resizeButtonPos[1], resizeButtonWidth, resizeButtonHeight);
          this.resizeButton.endFill();
          this.resizeButton.hitArea = new PIXI.Rectangle(resizeButtonPos[0], resizeButtonPos[1], resizeButtonWidth, resizeButtonHeight);
      } else {
        this.resizeButton.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
      }
    }
}
