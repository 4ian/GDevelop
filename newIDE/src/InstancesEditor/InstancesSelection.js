import gesture from 'pixi-simple-gesture';
import transformRect from '../Utils/TransformRect';
const gd = global.gd;
const PIXI = global.PIXI;

const resizeButtonWidth = 18;
const resizeButtonHeight = 18;

export default class InstancesSelection {
    constructor({getInstanceWidth, getInstanceHeight, onResize, toCanvasCoordinates}) {
      this.getInstanceWidth = getInstanceWidth;
      this.getInstanceHeight = getInstanceHeight;
      this.onResize = onResize;
      this.toCanvasCoordinates = toCanvasCoordinates;

      this.selection = [];
      this.selectionOriginalPos = [];
      this.selectionOriginalHeight = [];
      this.selectionOriginalWidth = [];

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
      this.selectionOriginalPos.length = 0;
      this.selectionOriginalHeight.length = 0;
      this.selectionOriginalWidth.length = 0;
    }

    selectInstance(instance) {
      if (!this.isInstanceSelected(instance)) {
        this.selection.push(instance);
        this.selectionOriginalPos.push([instance.getX(), instance.getY()]);
        this.selectionOriginalWidth.push(this.getInstanceWidth(instance));
        this.selectionOriginalHeight.push(this.getInstanceHeight(instance));
      }
    }

    unselectInstance(instance) {
      if (this.isInstanceSelected(instance)) {
        var i = this.selection.length - 1;
        while (i >= -1 && this.selection[i].ptr !== instance.ptr) {
            --i;
        }

        this.selection.splice(i, 1);
        this.selectionOriginalPos.splice(i, 1);
        this.selectionOriginalWidth.splice(i, 1);
        this.selectionOriginalHeight.splice(i, 1);
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
        const width = this.getInstanceWidth(instance);
        const height = this.getInstanceHeight(instance);

        const selectionRectangle = transformRect(this.toCanvasCoordinates, {
            x: instance.getX(), y: instance.getY(), width, height
        });

        this.selectedRectangles[i].clear();
        this.selectedRectangles[i].beginFill(0x6868E8);
        this.selectedRectangles[i].lineStyle(1, 0x6868E8, 1);
        this.selectedRectangles[i].fillAlpha = 0.3;
        this.selectedRectangles[i].alpha = 0.8;
        this.selectedRectangles[i].drawRect(selectionRectangle.x, selectionRectangle.y,
            selectionRectangle.width, selectionRectangle.height);
        this.selectedRectangles[i].endFill();

        if ( x1 === undefined || instance.getX() < x1 ) x1 = instance.getX();
        if ( y1 === undefined || instance.getY() < y1 ) y1 = instance.getY();
        if ( x2 === undefined || instance.getX() + width > x2 )
            x2 = instance.getX() + width;
        if ( y2 === undefined || instance.getY() + height > y2 )
            y2 = instance.getY() + height;
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
