/**
GDevelop - Anchor Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * @class AnchorRuntimeBehavior
 * @constructor
 */
gdjs.AnchorRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    this._relativeToOriginalWindowSize = !!behaviorData.relativeToOriginalWindowSize;
    this._leftEdgeAnchor = behaviorData.leftEdgeAnchor;
    this._rightEdgeAnchor = behaviorData.rightEdgeAnchor;
    this._topEdgeAnchor = behaviorData.topEdgeAnchor;
    this._bottomEdgeAnchor = behaviorData.bottomEdgeAnchor;
    this._invalidDistances = true;
    this._leftEdgeDistance = 0;
    this._rightEdgeDistance = 0;
    this._topEdgeDistance = 0;
    this._bottomEdgeDistance = 0;
};

gdjs.AnchorRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.registerBehavior("AnchorBehavior::AnchorBehavior", gdjs.AnchorRuntimeBehavior);

gdjs.AnchorRuntimeBehavior.HorizontalAnchor = {
   NONE: 0,
   WINDOW_LEFT: 1,
   WINDOW_RIGHT: 2,
   PROPORTIONAL: 3
};

gdjs.AnchorRuntimeBehavior.VerticalAnchor = {
   NONE: 0,
   WINDOW_TOP: 1,
   WINDOW_BOTTOM: 2,
   PROPORTIONAL: 3
};

gdjs.AnchorRuntimeBehavior.prototype.onActivate = function() {
    this._invalidDistances = true;
};

gdjs.AnchorRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    var game = runtimeScene.getGame();
    var rendererWidth = game.getGameResolutionWidth();
    var rendererHeight = game.getGameResolutionHeight();
    var layer = runtimeScene.getLayer(this.owner.getLayer());

    if(this._invalidDistances)
    {
        if (this._relativeToOriginalWindowSize) {
            rendererWidth = game.getOriginalWidth();
            rendererHeight = game.getOriginalHeight();
        }

        //Calculate the distances from the window's bounds.
        var topLeftPixel = layer.convertCoords(
            this.owner.getDrawableX(),
            this.owner.getDrawableY()
        );

        //Left edge
        if(this._leftEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT)
            this._leftEdgeDistance = topLeftPixel[0];
        else if(this._leftEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT)
            this._leftEdgeDistance = rendererWidth - topLeftPixel[0];
        else if(this._leftEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL)
            this._leftEdgeDistance = topLeftPixel[0] / rendererWidth;

        //Top edge
        if(this._topEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP)
            this._topEdgeDistance = topLeftPixel[1];
        else if(this._topEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM)
            this._topEdgeDistance = rendererHeight - topLeftPixel[1];
        else if(this._topEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL)
            this._topEdgeDistance = topLeftPixel[1] / rendererHeight;

        var bottomRightPixel = layer.convertCoords(
            this.owner.getDrawableX() + this.owner.getWidth(),
            this.owner.getDrawableY() + this.owner.getHeight()
        );

        //Right edge
        if(this._rightEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT)
            this._rightEdgeDistance = bottomRightPixel[0];
        else if(this._rightEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT)
            this._rightEdgeDistance = rendererWidth - bottomRightPixel[0];
        else if(this._rightEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL)
            this._rightEdgeDistance = bottomRightPixel[0] / rendererWidth;

        //Bottom edge
        if(this._bottomEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP)
            this._bottomEdgeDistance = bottomRightPixel[1];
        else if(this._bottomEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM)
            this._bottomEdgeDistance = rendererHeight - bottomRightPixel[1];
        else if(this._bottomEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL)
            this._bottomEdgeDistance = bottomRightPixel[1] / rendererHeight;

        this._invalidDistances = false;
    }
    else
    {
        //Move and resize the object if needed
        var leftPixel = 0;
        var topPixel = 0;

        var rightPixel = 0;
        var bottomPixel = 0;

        //Left edge
        if(this._leftEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT)
            leftPixel = this._leftEdgeDistance;
        else if(this._leftEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT)
            leftPixel = rendererWidth - this._leftEdgeDistance;
        else if(this._leftEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL)
            leftPixel = this._leftEdgeDistance * rendererWidth;

        //Top edge
        if(this._topEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP)
            topPixel = this._topEdgeDistance;
        else if(this._topEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM)
            topPixel = rendererHeight - this._topEdgeDistance;
        else if(this._topEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL)
            topPixel = this._topEdgeDistance * rendererHeight;

        //Right edge
        if(this._rightEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT)
            rightPixel = this._rightEdgeDistance;
        else if(this._rightEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT)
            rightPixel = rendererWidth - this._rightEdgeDistance;
        else if(this._rightEdgeAnchor === gdjs.AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL)
            rightPixel = this._rightEdgeDistance * rendererWidth;

        //Bottom edge
        if(this._bottomEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP)
            bottomPixel = this._bottomEdgeDistance;
        else if(this._bottomEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM)
            bottomPixel = rendererHeight - this._bottomEdgeDistance;
        else if(this._bottomEdgeAnchor === gdjs.AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL)
            bottomPixel = this._bottomEdgeDistance * rendererHeight;

        var topLeftCoord = layer.convertInverseCoords(leftPixel, topPixel);
        var bottomRightCoord = layer.convertInverseCoords(rightPixel, bottomPixel);

        //Move and resize the object according to the anchors
        if(this._rightEdgeAnchor !== gdjs.AnchorRuntimeBehavior.HorizontalAnchor.NONE)
            this.owner.setWidth(bottomRightCoord[0] - topLeftCoord[0]);
        if(this._bottomEdgeAnchor !== gdjs.AnchorRuntimeBehavior.VerticalAnchor.NONE)
            this.owner.setHeight(bottomRightCoord[1] - topLeftCoord[1]);
        if(this._leftEdgeAnchor !== gdjs.AnchorRuntimeBehavior.HorizontalAnchor.NONE)
            this.owner.setX(topLeftCoord[0] + this.owner.getX() - this.owner.getDrawableX());
        if(this._topEdgeAnchor !== gdjs.AnchorRuntimeBehavior.VerticalAnchor.NONE)
            this.owner.setY(topLeftCoord[1] + this.owner.getY() - this.owner.getDrawableY());
    }
};

gdjs.AnchorRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
};
