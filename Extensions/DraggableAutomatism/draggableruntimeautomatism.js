/**
Game Develop - Draggable Automatism Extension
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)
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
    this._xOffset = 0;
    this._yOffset = 0;
};

gdjs.DraggableRuntimeAutomatism.prototype = Object.create( gdjs.RuntimeAutomatism.prototype );
gdjs.DraggableRuntimeAutomatism.thisIsARuntimeAutomatismConstructor = "DraggableAutomatism::Draggable";

gdjs.DraggableRuntimeAutomatism.prototype.onDeActivate = function() {
    if ( this._dragged ) gdjs.DraggableRuntimeAutomatism.draggingSomething = false;
    this._dragged = false;
};

gdjs.DraggableRuntimeAutomatism.prototype.doStepPreEvents = function(runtimeScene) {
    var mousePos = null;

    //Begin drag ?
    if ( !this._dragged && runtimeScene.getGame().isMouseButtonPressed(0) &&
         !gdjs.DraggableRuntimeAutomatism.draggingSomething ) {

        mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
            runtimeScene.getGame().getMouseX(),
            runtimeScene.getGame().getMouseY());

        if (this.owner.getDrawableX() <= mousePos[0]
            && this.owner.getDrawableX() + this.owner.getWidth() >= mousePos[0]
            && this.owner.getDrawableY() <= mousePos[1]
            && this.owner.getDrawableY() + this.owner.getHeight() >= mousePos[1] ) {

            mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
                runtimeScene.getGame().getMouseX(),
                runtimeScene.getGame().getMouseY());

            this._dragged = true;
            gdjs.DraggableRuntimeAutomatism.draggingSomething = true;
            this._xOffset = mousePos[0] - this.owner.getX();
            this._yOffset = mousePos[1] - this.owner.getY();
        }
    }
    //End dragging ?
    else if ( !runtimeScene.getGame().isMouseButtonPressed(0) ) {
        this._dragged = false;
        gdjs.DraggableRuntimeAutomatism.draggingSomething = false;
    }

    //Being dragging ?
    if ( this._dragged ) {
        if ( mousePos === null ) {
            mousePos = runtimeScene.getLayer(this.owner.getLayer()).convertCoords(
                runtimeScene.getGame().getMouseX(),
                runtimeScene.getGame().getMouseY());
        }

        this.owner.setX(mousePos[0]-this._xOffset);
        this.owner.setY(mousePos[1]-this._yOffset);

    }
};

gdjs.DraggableRuntimeAutomatism.prototype.isDragged = function(runtimeScene) {
    return this._dragged;
};

//Static property used to avoid start dragging an object while another is dragged.
gdjs.DraggableRuntimeAutomatism.draggingSomething = false;
