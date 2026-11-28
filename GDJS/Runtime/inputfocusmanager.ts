/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Know which objects block the pointer (the cursor and the touches) and
   * which object has the keyboard and gamepad focus, so that only the
   * interface drawn on top (like a dialog opened over buttons or over another
   * dialog) reacts to the inputs.
   *
   * @category Core Engine > Input
   */
  export class InputFocusManager {
    private _pointerBlockingObjects = new Set<gdjs.RuntimeObject>();
    /** The objects that took the focus, the last one having it. */
    private _focusStack: gdjs.RuntimeObject[] = [];

    setBlockingPointer(object: gdjs.RuntimeObject, enable: boolean): void {
      if (enable) {
        this._pointerBlockingObjects.add(object);
      } else {
        this._pointerBlockingObjects.delete(object);
      }
    }

    isBlockingPointer(object: gdjs.RuntimeObject): boolean {
      return this._pointerBlockingObjects.has(object);
    }

    /**
     * Check if an object is covered, at a position of the pointer on the
     * canvas, by a visible object blocking the pointer and drawn above it.
     * The objects containing it (custom objects) or contained by it don't
     * cover it: a dialog doesn't cover its own buttons.
     */
    isCoveredAt(
      object: gdjs.RuntimeObject,
      canvasX: float,
      canvasY: float
    ): boolean {
      for (const blockingObject of this._pointerBlockingObjects) {
        if (
          blockingObject !== object &&
          isVisible(blockingObject) &&
          isUnderCanvasPosition(blockingObject, canvasX, canvasY) &&
          !isAncestorOf(blockingObject, object) &&
          !isAncestorOf(object, blockingObject) &&
          isDrawnAbove(blockingObject, object)
        ) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check if a visible object blocking the pointer is at a position of the
     * pointer on the canvas.
     */
    isBlockedAt(canvasX: float, canvasY: float): boolean {
      for (const blockingObject of this._pointerBlockingObjects) {
        if (
          isVisible(blockingObject) &&
          isUnderCanvasPosition(blockingObject, canvasX, canvasY)
        ) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check if the cursor or a touch is on a visible object blocking the
     * pointer.
     */
    isPointerBlocked(inputManager: gdjs.InputManager): boolean {
      if (this._pointerBlockingObjects.size === 0) {
        return false;
      }
      if (
        this.isBlockedAt(inputManager.getCursorX(), inputManager.getCursorY())
      ) {
        return true;
      }
      const touchIds = inputManager.getAllTouchIdentifiers();
      for (let i = 0; i < touchIds.length; ++i) {
        if (
          this.isBlockedAt(
            inputManager.getTouchX(touchIds[i]),
            inputManager.getTouchY(touchIds[i])
          )
        ) {
          return true;
        }
      }
      return false;
    }

    /**
     * Give the keyboard and gamepad focus to an object, above the objects that
     * took it before.
     */
    takeFocus(object: gdjs.RuntimeObject): void {
      this.releaseFocus(object);
      this._focusStack.push(object);
    }

    /**
     * Give the focus back to the object that had it before this one took it.
     */
    releaseFocus(object: gdjs.RuntimeObject): void {
      const index = this._focusStack.indexOf(object);
      if (index !== -1) {
        this._focusStack.splice(index, 1);
      }
    }

    /**
     * Check if an object has the keyboard and gamepad focus: no object took
     * it, or the last object that took it is this object or contains it.
     */
    hasFocus(object: gdjs.RuntimeObject): boolean {
      if (this._focusStack.length === 0) {
        return true;
      }
      const focusedObject = this._focusStack[this._focusStack.length - 1];
      return focusedObject === object || isAncestorOf(focusedObject, object);
    }

    onObjectDeleted(object: gdjs.RuntimeObject): void {
      this._pointerBlockingObjects.delete(object);
      this.releaseFocus(object);
    }
  }

  const workingPoint: FloatPoint = [0, 0];

  /** The custom object containing an object, if any. */
  const getParentObject = (
    object: gdjs.RuntimeObject
  ): gdjs.RuntimeObject | null => {
    const container = object.getInstanceContainer();
    return container instanceof gdjs.CustomRuntimeObjectInstanceContainer
      ? container.getOwner()
      : null;
  };

  const isAncestorOf = (
    ancestor: gdjs.RuntimeObject,
    object: gdjs.RuntimeObject
  ): boolean => {
    for (
      let parent = getParentObject(object);
      parent;
      parent = getParentObject(parent)
    ) {
      if (parent === ancestor) {
        return true;
      }
    }
    return false;
  };

  /** Check if an object, its layer and the custom objects containing it are visible. */
  const isVisible = (object: gdjs.RuntimeObject): boolean => {
    for (
      let current: gdjs.RuntimeObject | null = object;
      current;
      current = getParentObject(current)
    ) {
      if (
        current.isHidden() ||
        !current.getInstanceContainer().getLayer(current.getLayer()).isVisible()
      ) {
        return false;
      }
    }
    return true;
  };

  /** Same test as the condition "The cursor/touch is on an object". */
  const isUnderCanvasPosition = (
    object: gdjs.RuntimeObject,
    canvasX: float,
    canvasY: float
  ): boolean => {
    const position = object
      .getInstanceContainer()
      .getLayer(object.getLayer())
      .convertCoords(canvasX, canvasY, 0, workingPoint);
    return object.insideObject(position[0], position[1]);
  };

  /** The object and the custom objects containing it, from the scene. */
  const getObjectsFromScene = (
    object: gdjs.RuntimeObject
  ): gdjs.RuntimeObject[] => {
    const objects: gdjs.RuntimeObject[] = [];
    for (
      let current: gdjs.RuntimeObject | null = object;
      current;
      current = getParentObject(current)
    ) {
      objects.unshift(current);
    }
    return objects;
  };

  /**
   * Check if an object is drawn above another one (that is neither its
   * ancestor nor its descendant): compare, in the container where they (or the
   * custom objects containing them) are siblings, their layers then their
   * Z orders.
   */
  const isDrawnAbove = (
    object: gdjs.RuntimeObject,
    otherObject: gdjs.RuntimeObject
  ): boolean => {
    const objects = getObjectsFromScene(object);
    const otherObjects = getObjectsFromScene(otherObject);
    let level = 0;
    while (objects[level] === otherObjects[level]) {
      level++;
    }
    const sibling = objects[level];
    const otherSibling = otherObjects[level];
    const container = sibling.getInstanceContainer();
    const layerIndex = container.getLayerIndex(sibling.getLayer());
    const otherLayerIndex = container.getLayerIndex(otherSibling.getLayer());
    if (layerIndex !== otherLayerIndex) {
      return layerIndex > otherLayerIndex;
    }
    return sibling.getZOrder() > otherSibling.getZOrder();
  };
}
