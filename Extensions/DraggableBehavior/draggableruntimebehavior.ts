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
    _justDropped = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner
    ) {
      super(instanceContainer, behaviorData, owner);
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
        this._justDropped = true;
      }
      this._draggedByDraggableManager = null;
    }

    _dismissDrag() {
      this._draggedByDraggableManager = null;
    }

    _tryBeginDrag(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (this._draggedByDraggableManager) {
        return false;
      }
      const inputManager = instanceContainer.getGame().getInputManager();

      //Try mouse
      const mouseDraggableManager = DraggableManager.getMouseManager(
        instanceContainer
      );
      if (
        inputManager.isMouseButtonPressed(0) &&
        !mouseDraggableManager.isDragging(this)
      ) {
        if (mouseDraggableManager.tryAndTakeDragging(instanceContainer, this)) {
          this._draggedByDraggableManager = mouseDraggableManager;
          return true;
        }
      } else {
        //Try touches
        const touchIds = inputManager.getStartedTouchIdentifiers();
        for (let i = 0; i < touchIds.length; ++i) {
          const touchDraggableManager = DraggableManager.getTouchManager(
            instanceContainer,
            touchIds[i]
          );
          if (touchDraggableManager.isDragging(this)) {
            continue;
          }
          if (
            touchDraggableManager.tryAndTakeDragging(instanceContainer, this)
          ) {
            this._draggedByDraggableManager = touchDraggableManager;
            return true;
          }
        }
      }
      return false;
    }

    _shouldEndDrag(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (!this._draggedByDraggableManager) {
        return false;
      }
      return this._draggedByDraggableManager.shouldEndDrag(
        instanceContainer,
        this
      );
    }

    _updateObjectPosition(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (!this._draggedByDraggableManager) {
        return false;
      }
      this._draggedByDraggableManager.updateObjectPosition(
        instanceContainer,
        this
      );
      return true;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._tryBeginDrag(instanceContainer);
      if (this._shouldEndDrag(instanceContainer)) {
        this._endDrag();
      }
      this._updateObjectPosition(instanceContainer);
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const mouseDraggableManager = DraggableManager.getMouseManager(
        instanceContainer
      );
      mouseDraggableManager.leftPressedLastFrame = instanceContainer
        .getGame()
        .getInputManager()
        .isMouseButtonPressed(0);

      this._justDropped = false;
    }

    isDragged(): boolean {
      return !!this._draggedByDraggableManager;
    }

    wasJustDropped(): boolean {
      return this._justDropped;
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

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    /**
     * Get the platforms manager of an instance container.
     */
    static getMouseManager(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): MouseDraggableManager {
      // @ts-ignore
      if (!instanceContainer.mouseDraggableManager) {
        //Create the shared manager if necessary.
        // @ts-ignore
        instanceContainer.mouseDraggableManager = new MouseDraggableManager(
          instanceContainer
        );
      }
      // @ts-ignore
      return instanceContainer.mouseDraggableManager;
    }

    /**
     * Get the platforms manager of an instance container.
     */
    static getTouchManager(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      touchId: integer
    ): DraggableManager {
      // @ts-ignore
      if (!instanceContainer.touchDraggableManagers) {
        //Create the shared manager if necessary.
        // @ts-ignore
        instanceContainer.touchDraggableManagers = [];
      }
      // @ts-ignore
      if (!instanceContainer.touchDraggableManagers[touchId]) {
        //Create the shared manager if necessary.
        // @ts-ignore
        instanceContainer.touchDraggableManagers[
          touchId
        ] = new TouchDraggableManager(instanceContainer, touchId);
      }
      // @ts-ignore
      return instanceContainer.touchDraggableManagers[touchId];
    }

    tryAndTakeDragging(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ) {
      if (
        this._draggableBehavior &&
        draggableRuntimeBehavior.owner.getZOrder() <=
          this._draggableBehavior.owner.getZOrder()
      ) {
        return false;
      }
      const position = this.getPosition(
        instanceContainer,
        draggableRuntimeBehavior
      );
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
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ) {
      const position = this.getPosition(
        instanceContainer,
        draggableRuntimeBehavior
      );
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
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): boolean;
    abstract getPosition(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): FloatPoint;
  }

  /**
   * Handle the dragging by mouse
   */
  class MouseDraggableManager extends DraggableManager {
    /** Used to only start dragging when clicking. */
    leftPressedLastFrame = false;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {
      super(instanceContainer);
    }

    isDragging(draggableRuntimeBehavior: DraggableRuntimeBehavior): boolean {
      return this.leftPressedLastFrame || this._draggingSomething;
    }

    getPosition(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): FloatPoint {
      const workingPoint: FloatPoint = gdjs.staticArray(
        MouseDraggableManager.prototype.getPosition
      ) as FloatPoint;
      const inputManager = instanceContainer.getGame().getInputManager();
      return instanceContainer
        .getLayer(draggableRuntimeBehavior.owner.getLayer())
        .convertCoords(
          inputManager.getMouseX(),
          inputManager.getMouseY(),
          0,
          workingPoint
        );
    }

    shouldEndDrag(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): boolean {
      const inputManager = instanceContainer.getGame().getInputManager();
      return !inputManager.isMouseButtonPressed(0);
    }
  }

  /**
   * Handle the dragging by touch
   */
  class TouchDraggableManager extends DraggableManager {
    private _touchId: integer;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      touchId: integer
    ) {
      super(instanceContainer);
      this._touchId = touchId;
    }

    isDragging(draggableRuntimeBehavior: DraggableRuntimeBehavior): boolean {
      return this._draggingSomething;
    }

    getPosition(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): FloatPoint {
      const workingPoint: FloatPoint = gdjs.staticArray(
        TouchDraggableManager.prototype.getPosition
      ) as FloatPoint;
      const inputManager = instanceContainer.getGame().getInputManager();
      return instanceContainer
        .getLayer(draggableRuntimeBehavior.owner.getLayer())
        .convertCoords(
          inputManager.getTouchX(this._touchId),
          inputManager.getTouchY(this._touchId),
          0,
          workingPoint
        );
    }

    shouldEndDrag(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      draggableRuntimeBehavior: DraggableRuntimeBehavior
    ): boolean {
      const inputManager = instanceContainer.getGame().getInputManager();
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
