import PIXI from 'pixi.js';

export default class SelectionRectangle {
  constructor({ viewPosition, options }) {
    this.viewPosition = viewPosition;
    this.options = options;

    this.pixiGrid = new PIXI.Graphics();
    this.pixiGrid.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  }

  setOptions(options) {
    this.options = options;
  }

  getPixiObject() {
    return this.pixiGrid;
  }

  render() {
    const options = this.options;

    if (!options.grid) {
      this.pixiGrid.visible = false;
      return;
    }

    this.pixiGrid.visible = true;
    this.pixiGrid.clear();
    this.pixiGrid.beginFill(0x6868e8);
    this.pixiGrid.lineStyle(1, 0x6868e8, 1);
    this.pixiGrid.fillAlpha = 0.1;
    this.pixiGrid.alpha = 0.8;

    const sceneStartPoint = this.viewPosition.toSceneCoordinates(0, 0);
    const sceneEndPoint = this.viewPosition.toSceneCoordinates(
      this.viewPosition.getWidth(),
      this.viewPosition.getHeight()
    );

    const startXPos =
      Math.floor(sceneStartPoint[0] / options.gridWidth) * options.gridWidth;
    const startYPos =
      Math.floor(sceneStartPoint[1] / options.gridHeight) * options.gridHeight;

    const endXPos =
      Math.ceil(sceneEndPoint[0] / options.gridWidth) * options.gridWidth;
    const endYPos =
      Math.ceil(sceneEndPoint[1] / options.gridHeight) * options.gridHeight;

    for (
      let Xpos = startXPos + options.gridOffsetX;
      Xpos < endXPos;
      Xpos += options.gridWidth
    ) {
      const start = this.viewPosition.toCanvasCoordinates(Xpos, startYPos);
      const end = this.viewPosition.toCanvasCoordinates(Xpos, endYPos);

      this.pixiGrid.moveTo(start[0], start[1]);
      this.pixiGrid.lineTo(end[0], end[1]);
    }

    for (
      let Ypos = startYPos + options.gridOffsetY;
      Ypos < endYPos;
      Ypos += options.gridHeight
    ) {
      const start = this.viewPosition.toCanvasCoordinates(startXPos, Ypos);
      const end = this.viewPosition.toCanvasCoordinates(endXPos, Ypos);

      this.pixiGrid.moveTo(start[0], start[1]);
      this.pixiGrid.lineTo(end[0], end[1]);
    }

    this.pixiGrid.endFill();
  }
}
