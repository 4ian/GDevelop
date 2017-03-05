import gesture from 'pixi-simple-gesture';
import transformRect from '../Utils/TransformRect';
import PIXI from 'pixi.js';

const resizeButtonWidth = 18;
const resizeButtonHeight = 18;

export default class InstancesSelection {
  constructor({instancesSelection, instanceMeasurer, onResize, onResizeEnd, toCanvasCoordinates}) {
    this.instanceMeasurer = instanceMeasurer;
    this.onResize = onResize;
    this.onResizeEnd = onResizeEnd;
    this.toCanvasCoordinates = toCanvasCoordinates;
    this.instancesSelection = instancesSelection;

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
    this.resizeButton.on('panend', () => {
      this.onResizeEnd();
    });
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  render() {
    const selection = this.instancesSelection.getSelectedInstances();
    let x1;
    let y1;
    let x2;
    let y2;

    //Update the selection rectangle of each instance
    for (var i = 0; i < selection.length; i++) {
      if (this.selectedRectangles.length === i) {
        const newRectangle = new PIXI.Graphics();
        newRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
        this.selectedRectangles.push(newRectangle);
        this.rectanglesContainer.addChild(newRectangle);
      }

      const instance = selection[i];
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

    while (this.selectedRectangles.length > selection.length) {
      this.rectanglesContainer.removeChild(this.selectedRectangles.pop());
    }

    //Position the resize button.
    this.resizeButton.clear();
    this.resizeIcon.visible = false;
    if (selection.length !== 0) {
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
