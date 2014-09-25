/**
GDevelop - DestroyOutside Automatism Extension
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The destroyOutsideRuntimeAutomatism represents an automatism allowing objects to be
 * moved using the mouse.
 *
 * @class DestroyOutsideRuntimeAutomatism
 * @constructor
 */
gdjs.DestroyOutsideRuntimeAutomatism = function(runtimeScene, automatismData, owner)
{
    gdjs.RuntimeAutomatism.call(this, runtimeScene, automatismData, owner);

    this._extraBorder = automatismData.extraBorder;
};

gdjs.DestroyOutsideRuntimeAutomatism.prototype = Object.create( gdjs.RuntimeAutomatism.prototype );
gdjs.DestroyOutsideRuntimeAutomatism.thisIsARuntimeAutomatismConstructor = "DestroyOutsideAutomatism::DestroyOutside";

gdjs.DestroyOutsideRuntimeAutomatism.prototype.doStepPostEvents = function(runtimeScene) {

    var ow = this.owner.getWidth();
    var oh = this.owner.getWidth();
    var ocx = this.owner.getDrawableX()+this.owner.getCenterX();
    var ocy = this.owner.getDrawableY()+this.owner.getCenterY();
    var layer = runtimeScene.getLayer(this.owner.getLayer());

    var boundingCircleRadius = Math.sqrt(ow*ow+oh*oh)/2.0;
    if (   ocx+boundingCircleRadius+this._extraBorder < layer.getCameraX()-layer.getCameraWidth()/2
        || ocx-boundingCircleRadius-this._extraBorder > layer.getCameraX()+layer.getCameraWidth()/2
        || ocy+boundingCircleRadius+this._extraBorder < layer.getCameraY()-layer.getCameraHeight()/2
        || ocy-boundingCircleRadius-this._extraBorder > layer.getCameraY()+layer.getCameraHeight()/2 ) {
        //We are outside the camera area.
        this.owner.deleteFromScene(runtimeScene);
    }
};

gdjs.DestroyOutsideRuntimeAutomatism.prototype.setExtraBorder = function(val) {
    this._extraBorder = val;
};

gdjs.DestroyOutsideRuntimeAutomatism.prototype.getExtraBorder = function() {
    return this._extraBorder;
};
