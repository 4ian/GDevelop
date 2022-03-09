/*
GDevelop - Draggable Behavior Extension
Copyright (c) 2013-2021 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  /**
   * The DraggableRuntimeBehavior represents a behavior allowing objects to be
   * moved using the mouse.
   */
  export class DraggableRuntimeBehavior extends gdjs.RuntimeBehavior {
    /**
     * The manager that currently handles the dragging of the owner if any.
     * When the owner is being dragged, no other manager can start dragging it.
     */
    _draggedByDraggableManager: DraggableManager | null = null;
    _checkCollisionMask: boolean;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
      this._checkCollisionMask = behaviorData.checkCollisionMask ? true : false;
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
      if (this._draggedByDraggableManager) {
        this._draggedByDraggableManager.endDrag();
      }
      this._draggedByDraggableManager = null;
    }

    _dismissDrag() {
      this._draggedByDraggableManager = null;
    }

    _tryBeginDrag(runtimeScene) {
      if (this._draggedByDraggableManager) {
        return false;
      }
      const inputManager = runtimeScene.getGame().getInputManager();

      //Try mouse
      const mouseDraggableManager = DraggableManager.getMouseManager(
        runtimeScene
      );
      if (
        inputManager.isMouseButtonPressed(0) &&
        !mouseDraggableManager.isDragging(this)
      ) {
        if (mouseDraggableManager.tryAndTakeDragging(runtimeScene, this)) {
          this._draggedByDraggableManager = mouseDraggableManager;
          return true;
        }
      } else {
        //Try touches
        const touchIds = inputManager.getStartedTouchIdentifiers();
        for (let i = 0; i < touchIds.length; ++i) {
          const touchDraggableManager = DraggableManager.getTouchManager(
            runtimeScene,
            touchIds[i]
          );
          if (touchDraggableManager.isDragging(this)) {
            continue;
          }
          if (touchDraggableManager.tryAndTakeDragging(runtimeScene, this)) {
            this._draggedByDraggableManager = touchDraggableManager;
            return true;
          }
        }
      }
      return false;
    }

    _shouldEndDrag(runtimeScene) {
      if (!this._draggedByDraggableManager) {
        return false;
      }
      return this._draggedByDraggableManager.shouldEndDrag(runtimeScene, this);
    }

    _updateObjectPosition(runtimeScene) {
      if (!this._draggedByDraggableManager) {
        return false;
      }
      this._draggedByDraggableManager.updateObjectPosition(runtimeScene, this);
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
      const mouseDraggableManager = DraggableManager.getMouseManager(
        runtimeScene
      );
      mouseDraggableManager.leftPressedLastFrame = runtimeScene
        .getGame()
        .getInputManager()
        .isMouseButtonPressed(0);
    }

    isDragged(runtimeScene): boolean {
      return !!this._draggedByDraggableManager;
    }
  }

  /**
   * Handle the dragging
   */
  abstract class DraggableManager {
    /**
     * The object has left its original position.
     * When true, the search for the best object to drag has ended.
     */
    protected _draggingSomething = false;
    /**
     * The behavior of the object that is being dragged and that is the best one (i.e: highest Z order) found.
     */
    protected _draggableBehavior: gdjs.DraggableRuntimeBehavior | null = null;
    protected _xOffset: number = 0;
    protected _yOffset: number = 0;

    constructor(runtimeScene: gdjs.RuntimeScene) {}

    /**
     * Get the platforms manager of a scene.
     */
    static getMouseManager(
      runtimeScene: gdjs.RuntimeScene
    ): MouseDraggableManager {
      // @ts-ignore
      if (!runtimeScene.mouseDraggableManager) {
        //Create the shared manager if necessary.
        // @ts-ignore
        runtimeScene.mouseDraggableManager = new MouseDraggableManager(
          runtimeScene
        );
      }
      // @ts-ignore
      return runtimeScene.mouseDraggableManager;
    }

    /**
     * Get the platforms manager of a scene.
     */
    static getTouchManager(
      runtimeScene: gdjs.RuntimeScene,
      touchId: integer
    ): DraggableManager {
      // @ts-ignore
      if (!runtimeScene.touchDraggableManagers) {
        //Create the shared manager if necessary.
        // @ts-ignore
        runtimeScene.touchDraggableManagers = [];
      }
      // @ts-ignore
      if (!runtimeScene.touchDraggableManagers[touchId]) {
        //Create the shared manager if necessary.
        // @ts-ignore
        runtimeScene.touchDraggableManagers[
          touchId
        ] = new TouchDraggableManager(runtimeScene, touchId);
      }
      // @ts-ignore
      return runtimeScene.touchDraggableManagers[touchId];
    }

    tryAndTakeDragging(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ) {
      if (
        this._draggableBehavior &&
        draggableRuntimeBehavior.owner.getZOrder() <=
          this._draggableBehavior.owner.getZOrder()
      ) {
        return false;
      }
      const position = this.getPosition(runtimeScene, draggableRuntimeBehavior);
      if (
        !draggableRuntimeBehavior.owner.insideObject(position[0], position[1])
      ) {
        return false;
      } else if (
        draggableRuntimeBehavior._checkCollisionMask &&
        !draggableRuntimeBehavior.owner.isCollidingWithPoint(
          position[0],
          position[1]
        )
      ) {
        return false;
      }
      if (this._draggableBehavior) {
        // The previous best object to drag will not be dragged.
        this._draggableBehavior._dismissDrag();
      }
      this._draggableBehavior = draggableRuntimeBehavior;
      this._xOffset = position[0] - draggableRuntimeBehavior.owner.getX();
      this._yOffset = position[1] - draggableRuntimeBehavior.owner.getY();
      return true;
    }

    updateObjectPosition(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ) {
      const position = this.getPosition(runtimeScene, draggableRuntimeBehavior);
      if (
        draggableRuntimeBehavior.owner.getX() != position[0] - this._xOffset ||
        draggableRuntimeBehavior.owner.getY() != position[1] - this._yOffset
      ) {
        draggableRuntimeBehavior.owner.setX(position[0] - this._xOffset);
        draggableRuntimeBehavior.owner.setY(position[1] - this._yOffset);
        this._draggingSomething = true;
      }
    }

    endDrag() {
      this._draggingSomething = false;
      this._draggableBehavior = null;
    }

    abstract isDragging(
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): boolean;
    abstract shouldEndDrag(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): boolean;
    abstract getPosition(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): FloatPoint;
  }

  /**
   * Handle the dragging by mouse
   */
  class MouseDraggableManager extends DraggableManager {
    /** Used to only start dragging when clicking. */
    leftPressedLastFrame = false;

    constructor(runtimeScene: gdjs.RuntimeScene) {
      super(runtimeScene);
    }

    isDragging(draggableRuntimeBehavior: DraggableRuntimeBehavior): boolean {
      return this.leftPressedLastFrame || this._draggingSomething;
    }

    getPosition(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): FloatPoint {
      const inputManager = runtimeScene.getGame().getInputManager();
      return runtimeScene
        .getLayer(draggableRuntimeBehavior.owner.getLayer())
        .convertCoords(inputManager.getMouseX(), inputManager.getMouseY());
    }

    shouldEndDrag(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): boolean {
      const inputManager = runtimeScene.getGame().getInputManager();
      return !inputManager.isMouseButtonPressed(0);
    }
  }

  /**
   * Handle the dragging by touch
   */
  class TouchDraggableManager extends DraggableManager {
    private _touchId: integer;

    constructor(runtimeScene: gdjs.RuntimeScene, touchId: integer) {
      super(runtimeScene);
      this._touchId = touchId;
    }

    isDragging(draggableRuntimeBehavior: DraggableRuntimeBehavior): boolean {
      return this._draggingSomething;
    }

    getPosition(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): FloatPoint {
      const inputManager = runtimeScene.getGame().getInputManager();
      return runtimeScene
        .getLayer(draggableRuntimeBehavior.owner.getLayer())
        .convertCoords(
          inputManager.getTouchX(this._touchId),
          inputManager.getTouchY(this._touchId)
        );
    }

    shouldEndDrag(
      runtimeScene: gdjs.RuntimeScene,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): boolean {
      const inputManager = runtimeScene.getGame().getInputManager();
      return (
        inputManager.getAllTouchIdentifiers().indexOf(this._touchId) === -1
      );
    }
  }

  gdjs.registerBehavior(
    'DraggableBehavior::Draggable',
    gdjs.DraggableRuntimeBehavior
  );
}
