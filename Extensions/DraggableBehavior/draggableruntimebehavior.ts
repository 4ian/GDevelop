/**
GDevelop - Draggable Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {

/**
 * The DraggableRuntimeBehavior represents a behavior allowing objects to be
 * moved using the mouse.
 *
 * @class DraggableRuntimeBehavior
 */
export class DraggableRuntimeBehavior extends gdjs.RuntimeBehavior {
  _dragged: boolean = false;
  _touchId: any = null;
  _mouse: boolean = false;
  _xOffset: number = 0;
  _yOffset: number = 0;

  constructor(runtimeScene, behaviorData, owner) {
    super(runtimeScene, behaviorData, owner);
  }

  updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
    // Nothing to update.
    return true;
  }

  onDeActivate() {
    this._endDrag();
  }

  onDestroy() {
    this.onDeActivate();
  }

  _endDrag() {
    if (this._dragged && this._mouse) {
      DraggableRuntimeBehavior.mouseDraggingSomething = false;
    }
    if (this._dragged && this._touchId !== null) {
      DraggableRuntimeBehavior.touchDraggingSomething[this._touchId] = false;
    }
    this._dragged = false;
    this._mouse = false;
    this._touchId = null;
  }

  _tryBeginDrag(runtimeScene) {
    if (this._dragged) {
      return false;
    }
    const inputManager = runtimeScene.getGame().getInputManager();

    //Try mouse
    if (inputManager.isMouseButtonPressed(0) && !DraggableRuntimeBehavior.leftPressedLastFrame && !DraggableRuntimeBehavior.mouseDraggingSomething) {
      const mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(inputManager.getMouseX(), inputManager.getMouseY());
      if (this.owner.insideObject(mousePos[0], mousePos[1])) {
        this._dragged = true;
        this._mouse = true;
        this._xOffset = mousePos[0] - this.owner.getX();
        this._yOffset = mousePos[1] - this.owner.getY();
        DraggableRuntimeBehavior.mouseDraggingSomething = true;
        return true;
      }
    } else {

      //Try touches
      const touchIds = inputManager.getStartedTouchIdentifiers();
      for (let i = 0; i < touchIds.length; ++i) {
        if (DraggableRuntimeBehavior.touchDraggingSomething[touchIds[i]]) {
          continue;
        }
        const touchPos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(inputManager.getTouchX(touchIds[i]), inputManager.getTouchY(touchIds[i]));
        if (this.owner.insideObject(touchPos[0], touchPos[1])) {
          this._dragged = true;
          this._touchId = touchIds[i];
          this._xOffset = touchPos[0] - this.owner.getX();
          this._yOffset = touchPos[1] - this.owner.getY();
          DraggableRuntimeBehavior.touchDraggingSomething[touchIds[i]] = true;
          return true;
        }
      }
    }
    return false;
  }

  _shouldEndDrag(runtimeScene) {
    if (!this._dragged) {
      return false;
    }
    const inputManager = runtimeScene.getGame().getInputManager();
    if (this._mouse) {
      return !inputManager.isMouseButtonPressed(0);
    } else {
      if (this._touchId !== null) {
        return inputManager.getAllTouchIdentifiers().indexOf(this._touchId) === -1;
      }
    }
    return false;
  }

  _updateObjectPosition(runtimeScene) {
    if (!this._dragged) {
      return false;
    }
    const inputManager = runtimeScene.getGame().getInputManager();
    if (this._mouse) {
      const mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(inputManager.getMouseX(), inputManager.getMouseY());
      this.owner.setX(mousePos[0] - this._xOffset);
      this.owner.setY(mousePos[1] - this._yOffset);
    } else {
      if (this._touchId !== null) {
        const touchPos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(inputManager.getTouchX(this._touchId), inputManager.getTouchY(this._touchId));
        this.owner.setX(touchPos[0] - this._xOffset);
        this.owner.setY(touchPos[1] - this._yOffset);
      }
    }
    return true;
  }

  doStepPreEvents(runtimeScene) {
    this._tryBeginDrag(runtimeScene);
    if (this._shouldEndDrag(runtimeScene)) {
      this._endDrag();
    }
    this._updateObjectPosition(runtimeScene);
  }

  doStepPostEvents(runtimeScene) {
    DraggableRuntimeBehavior.leftPressedLastFrame = runtimeScene.getGame().getInputManager().isMouseButtonPressed(0);
  }

  isDragged(runtimeScene): boolean {
    return this._dragged;
  }

  //Static property used to avoid start dragging an object while another is dragged.
  static mouseDraggingSomething = false;

  //Static property used to avoid start dragging an object while another is dragged by the same touch.
  static touchDraggingSomething = [];

  //Static property used to only start dragging when clicking.
  static leftPressedLastFrame = false;
}
gdjs.registerBehavior('DraggableBehavior::Draggable', gdjs.DraggableRuntimeBehavior);


}
