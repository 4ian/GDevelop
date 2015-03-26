/**
GDevelop - Draggable Automatism Extension
Copyright (c) 2013-2015 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The draggableRuntimeAutomatism represents an automatism allowing objects to be
 * moved using the mouse.
 *
 * @class DraggableRuntimeAutomatism
 * @constructor
 */
gdjs.DraggableRuntimeAutomatism = function(runtimeScene, automatismData, owner)
{
    gdjs.RuntimeAutomatism.call(this, runtimeScene, automatismData, owner);

    this._dragged = false;
    this._touchId = null;
    this._mouse = false;

    this._xOffset = 0;
    this._yOffset = 0;
};

gdjs.DraggableRuntimeAutomatism.prototype = Object.create( gdjs.RuntimeAutomatism.prototype );
gdjs.DraggableRuntimeAutomatism.thisIsARuntimeAutomatismConstructor = "DraggableAutomatism::Draggable";

gdjs.DraggableRuntimeAutomatism.prototype.onDeActivate = function() {
    this._endDrag();
};

gdjs.DraggableRuntimeAutomatism.prototype._endDrag = function() {
    if ( this._dragged && this._mouse ) gdjs.DraggableRuntimeAutomatism.mouseDraggingSomething = false;
    if ( this._dragged && this._touchId !== null ) gdjs.DraggableRuntimeAutomatism.touchDraggingSomething[this._touchId] = false;

    this._dragged = false;
    this._mouse = false;
    this._touchId = null;
}

gdjs.DraggableRuntimeAutomatism.prototype._tryBeginDrag = function(runtimeScene) {
    if (this._dragged) return false;

    var inputManager = runtimeScene.getGame().getInputManager();

    //Try mouse
    if (inputManager.isMouseButtonPressed(0) &&
         !gdjs.DraggableRuntimeAutomatism.leftPressedLastFrame &&
         !gdjs.DraggableRuntimeAutomatism.mouseDraggingSomething) {

        mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
            inputManager.getMouseX(),
            inputManager.getMouseY());

        if (this.owner.insideObject(mousePos[0], mousePos[1])) {
            this._dragged = true;
            this._mouse = true;
            this._xOffset = mousePos[0] - this.owner.getX();
            this._yOffset = mousePos[1] - this.owner.getY();
            gdjs.DraggableRuntimeAutomatism.mouseDraggingSomething = true;

            return true;
        }
    } else { //Try touches
        var touchIds = inputManager.getStartedTouchIdentifiers();
        for(var i = 0;i<touchIds.length;++i) {
            if (gdjs.DraggableRuntimeAutomatism.touchDraggingSomething[touchIds[i]])
                continue;

            touchPos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
                inputManager.getTouchX(touchIds[i]),
                inputManager.getTouchY(touchIds[i]));

            if (this.owner.insideObject(touchPos[0], touchPos[1])) {
                this._dragged = true;
                this._touchId = touchIds[i];
                this._xOffset = touchPos[0] - this.owner.getX();
                this._yOffset = touchPos[1] - this.owner.getY();
                gdjs.DraggableRuntimeAutomatism.touchDraggingSomething[touchIds[i]] = true;

                return true;
            }
        }
    }

    return false;
}

gdjs.DraggableRuntimeAutomatism.prototype._shouldEndDrag = function(runtimeScene) {
    if (!this._dragged) return false;
    var inputManager = runtimeScene.getGame().getInputManager();

    if (this._mouse)
        return !inputManager.isMouseButtonPressed(0);
    else if (this._touchId !== null) {
        return inputManager.getAllTouchIdentifiers().indexOf(this._touchId) === -1;
    }

    return false;
}

gdjs.DraggableRuntimeAutomatism.prototype._updateObjectPosition = function(runtimeScene) {
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

gdjs.DraggableRuntimeAutomatism.prototype.doStepPreEvents = function(runtimeScene) {
    this._tryBeginDrag(runtimeScene);

    if (this._shouldEndDrag(runtimeScene)) {
        this._endDrag();
    }

    this._updateObjectPosition(runtimeScene);
};

gdjs.DraggableRuntimeAutomatism.prototype.doStepPostEvents = function(runtimeScene) {
    gdjs.DraggableRuntimeAutomatism.leftPressedLastFrame =
        runtimeScene.getGame().getInputManager().isMouseButtonPressed(0);
};

gdjs.DraggableRuntimeAutomatism.prototype.isDragged = function(runtimeScene) {
    return this._dragged;
};

//Static property used to avoid start dragging an object while another is dragged.
gdjs.DraggableRuntimeAutomatism.mouseDraggingSomething = false;

//Static property used to avoid start dragging an object while another is dragged by the same touch.
gdjs.DraggableRuntimeAutomatism.touchDraggingSomething = [];

//Static property used to only start dragging when clicking.
gdjs.DraggableRuntimeAutomatism.leftPressedLastFrame = false;
