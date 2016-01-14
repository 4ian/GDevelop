/**
GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The destroyOutsideRuntimeBehavior represents a behavior allowing objects to be
 * moved using the mouse.
 *
 * @class DestroyOutsideRuntimeBehavior
 * @constructor
 */
gdjs.DestroyOutsideRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    this._extraBorder = behaviorData.extraBorder;
};

gdjs.DestroyOutsideRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.DestroyOutsideRuntimeBehavior.thisIsARuntimeBehaviorConstructor = "DestroyOutsideBehavior::DestroyOutside";

gdjs.DestroyOutsideRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {

    var ow = this.owner.getWidth();
    var oh = this.owner.getHeight();
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

gdjs.DestroyOutsideRuntimeBehavior.prototype.setExtraBorder = function(val) {
    this._extraBorder = val;
};

gdjs.DestroyOutsideRuntimeBehavior.prototype.getExtraBorder = function() {
    return this._extraBorder;
};
