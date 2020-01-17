/**
GDevelop - Draggable Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The DraggableRuntimeBehavior represents a behavior allowing objects to be
 * moved using the mouse.
 *
 * @class DraggableRuntimeBehavior
 * @constructor
 */
gdjs.DraggableRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    this._dragged = false;
    this._touchId = null;
    this._mouse = false;

    this._xOffset = 0;
    this._yOffset = 0;
};

gdjs.DraggableRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.registerBehavior("DraggableBehavior::Draggable", gdjs.DraggableRuntimeBehavior);

gdjs.DraggableRuntimeBehavior.prototype.onDeActivate = function() {
    this._endDrag();
};

gdjs.DraggableRuntimeBehavior.prototype.onDestroy = function() {
    this.onDeActivate();
};

gdjs.DraggableRuntimeBehavior.prototype._endDrag = function() {
    if ( this._dragged && this._mouse ) gdjs.DraggableRuntimeBehavior.mouseDraggingSomething = false;
    if ( this._dragged && this._touchId !== null ) gdjs.DraggableRuntimeBehavior.touchDraggingSomething[this._touchId] = false;

    this._dragged = false;
    this._mouse = false;
    this._touchId = null;
}

gdjs.DraggableRuntimeBehavior.prototype._tryBeginDrag = function(runtimeScene) {
    if (this._dragged) return false;

    var inputManager = runtimeScene.getGame().getInputManager();

    //Try mouse
    if (inputManager.isMouseButtonPressed(0) &&
         !gdjs.DraggableRuntimeBehavior.leftPressedLastFrame &&
         !gdjs.DraggableRuntimeBehavior.mouseDraggingSomething) {

        mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
            inputManager.getMouseX(),
            inputManager.getMouseY());

        if (this.owner.insideObject(mousePos[0], mousePos[1])) {
            this._dragged = true;
            this._mouse = true;
            this._xOffset = mousePos[0] - this.owner.getX();
            this._yOffset = mousePos[1] - this.owner.getY();
            gdjs.DraggableRuntimeBehavior.mouseDraggingSomething = true;

            return true;
        }
    } else { //Try touches
        var touchIds = inputManager.getStartedTouchIdentifiers();
        for(var i = 0;i<touchIds.length;++i) {
            if (gdjs.DraggableRuntimeBehavior.touchDraggingSomething[touchIds[i]])
                continue;

            touchPos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
                inputManager.getTouchX(touchIds[i]),
                inputManager.getTouchY(touchIds[i]));

            if (this.owner.insideObject(touchPos[0], touchPos[1])) {
                this._dragged = true;
                this._touchId = touchIds[i];
                this._xOffset = touchPos[0] - this.owner.getX();
                this._yOffset = touchPos[1] - this.owner.getY();
                gdjs.DraggableRuntimeBehavior.touchDraggingSomething[touchIds[i]] = true;

                return true;
            }
        }
    }

    return false;
}

gdjs.DraggableRuntimeBehavior.prototype._shouldEndDrag = function(runtimeScene) {
    if (!this._dragged) return false;
    var inputManager = runtimeScene.getGame().getInputManager();

    if (this._mouse)
        return !inputManager.isMouseButtonPressed(0);
    else if (this._touchId !== null) {
        return inputManager.getAllTouchIdentifiers().indexOf(this._touchId) === -1;
    }

    return false;
}

gdjs.DraggableRuntimeBehavior.prototype._updateObjectPosition = function(runtimeScene) {
    if (!this._dragged) return false;
    var inputManager = runtimeScene.getGame().getInputManager();

    if (this._mouse) {
        mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
            inputManager.getMouseX(),
            inputManager.getMouseY());

        this.owner.setX(mousePos[0] - this._xOffset);
        this.owner.setY(mousePos[1] - this._yOffset);
    }
    else if (this._touchId !== null) {
        touchPos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
            inputManager.getTouchX(this._touchId),
            inputManager.getTouchY(this._touchId));

        this.owner.setX(touchPos[0] - this._xOffset);
        this.owner.setY(touchPos[1] - this._yOffset);
    }

    return true;
}

gdjs.DraggableRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    this._tryBeginDrag(runtimeScene);

    if (this._shouldEndDrag(runtimeScene)) {
        this._endDrag();
    }

    this._updateObjectPosition(runtimeScene);
};

gdjs.DraggableRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    gdjs.DraggableRuntimeBehavior.leftPressedLastFrame =
        runtimeScene.getGame().getInputManager().isMouseButtonPressed(0);
};

gdjs.DraggableRuntimeBehavior.prototype.isDragged = function(runtimeScene) {
    return this._dragged;
};

//Static property used to avoid start dragging an object while another is dragged.
gdjs.DraggableRuntimeBehavior.mouseDraggingSomething = false;

//Static property used to avoid start dragging an object while another is dragged by the same touch.
gdjs.DraggableRuntimeBehavior.touchDraggingSomething = [];

//Static property used to only start dragging when clicking.
gdjs.DraggableRuntimeBehavior.leftPressedLastFrame = false;
