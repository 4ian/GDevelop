// @flow
import * as PIXI from '../PIXI';
import transformRect from '../Utils/TransformRect';
import ViewPosition from './ViewPosition';
import { type InstancesEditorSettings } from './InstancesEditorSettings';

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
  windowRectangle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

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

    const width = this.project.getGameResolutionWidth();
    const height = this.project.getGameResolutionHeight();
    this.windowRectangle.x = this.viewPosition.getViewX() - width / 2;
    this.windowRectangle.y = this.viewPosition.getViewY() - height / 2;
    this.windowRectangle.width = width;
    this.windowRectangle.height = height;

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
      displayedRectangle.x,
      displayedRectangle.y,
      displayedRectangle.width,
      displayedRectangle.height
    );
    this.pixiRectangle.endFill();
  }
}
