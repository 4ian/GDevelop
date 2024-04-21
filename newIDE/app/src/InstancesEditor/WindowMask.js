// @flow
import * as PIXI from 'pixi.js-legacy';
import transformRect from '../Utils/TransformRect';
import ViewPosition from './ViewPosition';
import { type InstancesEditorSettings } from './InstancesEditorSettings';
import Rectangle from '../Utils/Rectangle';

type Props = {|
  project: gdProject,
  instancesEditorSettings: InstancesEditorSettings,
  viewPosition: ViewPosition,
|};

export default class WindowMask {
  project: gdProject;
  instancesEditorSettings: InstancesEditorSettings;
  viewPosition: ViewPosition;
  pixiRectangle = new PIXI.Graphics();
  windowRectangle: Rectangle = new Rectangle();

  constructor({ project, viewPosition, instancesEditorSettings }: Props) {
    this.project = project;
    this.viewPosition = viewPosition;
    this.instancesEditorSettings = instancesEditorSettings;

    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  }

  setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings) {
    this.instancesEditorSettings = instancesEditorSettings;
  }

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    if (!this.instancesEditorSettings.windowMask) {
      this.pixiRectangle.visible = false;
      return;
    }

    this.windowRectangle.setThroughCenter({
      centerX: this.viewPosition.getViewX(),
      centerY: this.viewPosition.getViewY(),
      width: this.project.getGameResolutionWidth(),
      height: this.project.getGameResolutionHeight(),
    });

    const displayedRectangle = transformRect(
      this.viewPosition.toCanvasCoordinates,
      this.windowRectangle
    );

    this.pixiRectangle.visible = true;
    this.pixiRectangle.clear();
    this.pixiRectangle.beginFill(0x000000);
    this.pixiRectangle.lineStyle(1, 0x000000, 1);
    this.pixiRectangle.alpha = 1;
    this.pixiRectangle.fill.alpha = 0;
    this.pixiRectangle.drawRect(
      displayedRectangle.left,
      displayedRectangle.top,
      displayedRectangle.width(),
      displayedRectangle.height()
    );
    this.pixiRectangle.endFill();
  }
}
