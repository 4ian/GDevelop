/**
GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * TopDownMovementRuntimeBehavior represents a behavior allowing objects to
 * follow a path computed to avoid obstacles.
 *
 * @class TopDownMovementRuntimeBehavior
 * @constructor
 */
gdjs.TopDownMovementRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    //Behavior configuration:
    this._allowDiagonals = behaviorData.allowDiagonals;
    this._acceleration = behaviorData.acceleration;
    this._deceleration = behaviorData.deceleration;
    this._maxSpeed = behaviorData.maxSpeed;
    this._angularMaxSpeed = behaviorData.angularMaxSpeed;
    this._rotateObject = behaviorData.rotateObject;
    this._angleOffset = behaviorData.angleOffset;
    this._ignoreDefaultControls = behaviorData.ignoreDefaultControls;

    //Attributes used when moving
    this._xVelocity = 0;
    this._yVelocity = 0;
    this._angularSpeed = 0;
    this._leftKey = false;
    this._rightKey = false;
    this._upKey = false;
    this._downKey = false;
};

gdjs.TopDownMovementRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.TopDownMovementRuntimeBehavior.thisIsARuntimeBehaviorConstructor = "TopDownMovementBehavior::TopDownMovementBehavior";

gdjs.TopDownMovementRuntimeBehavior.prototype.setAcceleration = function(acceleration) {
    this._acceleration = acceleration;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.getAcceleration = function() {
    return this._acceleration;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.setDeceleration = function(deceleration) {
    this._deceleration = deceleration;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.getDeceleration = function() {
    return this._deceleration;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.setMaxSpeed = function(maxSpeed) {
    this._maxSpeed = maxSpeed;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.getMaxSpeed = function() {
    return this._maxSpeed;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.setAngularMaxSpeed = function(angularMaxSpeed) {
    this._angularMaxSpeed = angularMaxSpeed;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.getAngularMaxSpeed = function() {
    return this._angularMaxSpeed;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.setAngleOffset = function(angleOffset) {
    this._angleOffset = angleOffset;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.getAngleOffset = function() {
    return this._angleOffset;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.allowDiagonals = function(allow) {
    this._allowDiagonals = allow;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.diagonalsAllowed = function() {
    return this._allowDiagonals;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.setRotateObject = function(allow) {
    this._rotateObject = allow;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.isObjectRotated = function() {
    return this._rotateObject;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.isMoving = function() {
    return this._xVelocity !== 0 || this._yVelocity !== 0;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.getSpeed = function() {
    return Math.sqrt(this._xVelocity*this._xVelocity+this._yVelocity*this._yVelocity);
};

gdjs.TopDownMovementRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene)
{
    var LEFTKEY = 37;
    var UPKEY = 38;
    var RIGHTKEY = 39;
    var DOWNKEY = 40;
    var SHIFTKEY = 16;
    var object = this.owner;
    var timeDelta = this.owner.getElapsedTime(runtimeScene)/1000;

    //Get the player input:
    this._leftKey |= !this._ignoreDefaultControls && runtimeScene.getGame().getInputManager().isKeyPressed(LEFTKEY);
    this._rightKey |= !this._ignoreDefaultControls && runtimeScene.getGame().getInputManager().isKeyPressed(RIGHTKEY);
    this._downKey |= !this._ignoreDefaultControls && runtimeScene.getGame().getInputManager().isKeyPressed(DOWNKEY);
    this._upKey |= !this._ignoreDefaultControls && runtimeScene.getGame().getInputManager().isKeyPressed(UPKEY);

    var direction = -1;
    var directionInRad = 0;
    var directionInDeg = 0;
    if (!this._allowDiagonals) {
        if (this._upKey && !this._downKey) direction = 6;
        else if (!this._upKey && this._downKey) direction = 2;

        if (!this._upKey && !this._downKey) {
            if (this._leftKey && !this._rightKey) direction = 4;
            else if (!this._leftKey && this._rightKey) direction = 0;
        }
    } else {
        if (this._upKey && !this._downKey) {
            if (this._leftKey && !this._rightKey) direction = 5;
            else if (!this._leftKey && this._rightKey) direction = 7;
            else direction = 6;
        } else if (!this._upKey && this._downKey) {
            if (this._leftKey && !this._rightKey) direction = 3;
            else if (!this._leftKey && this._rightKey) direction = 1;
            else direction = 2;
        } else {
            if (this._leftKey && !this._rightKey) direction = 4;
            else if (!this._leftKey && this._rightKey) direction = 0;
        }
    }

    //Update the speed of the object
    if (direction != -1) {
        directionInRad = direction*Math.PI/4.0;
        directionInDeg = direction*45;

        this._xVelocity += this._acceleration*timeDelta*Math.cos(directionInRad);
        this._yVelocity += this._acceleration*timeDelta*Math.sin(directionInRad);
    } else {
        directionInRad = Math.atan2(this._yVelocity, this._xVelocity);
        directionInDeg = Math.atan2(this._yVelocity, this._xVelocity)*180.0/Math.PI;

        var xVelocityWasPositive = this._xVelocity >= 0;
        var yVelocityWasPositive = this._yVelocity >= 0;
        this._xVelocity -= this._deceleration*timeDelta*Math.cos(directionInRad);
        this._yVelocity -= this._deceleration*timeDelta*Math.sin(directionInRad);
        if ( this._xVelocity > 0 ^ xVelocityWasPositive ) this._xVelocity = 0;
        if ( this._yVelocity > 0 ^ yVelocityWasPositive ) this._yVelocity = 0;
    }

    var speed = Math.sqrt(this._xVelocity*this._xVelocity+this._yVelocity*this._yVelocity);
    if ( speed > this._maxSpeed ) {
        this._xVelocity = this._maxSpeed*Math.cos(directionInRad);
        this._yVelocity = this._maxSpeed*Math.sin(directionInRad);
    }
    this._angularSpeed = this._angularMaxSpeed; //No acceleration for angular speed for now

    //Position object
    object.setX(object.getX()+this._xVelocity*timeDelta);
    object.setY(object.getY()+this._yVelocity*timeDelta);

    //Also update angle if needed
    if ( (this._xVelocity !== 0 || this._yVelocity !== 0) && this._rotateObject ) {
        object.rotateTowardAngle(directionInDeg+this._angleOffset, this._angularSpeed, runtimeScene);
    }

    this._leftKey = false;
    this._rightKey = false;
    this._upKey = false;
    this._downKey = false;
};

gdjs.TopDownMovementRuntimeBehavior.prototype.simulateControl = function(input) {
    if ( input === "Left" ) this._leftKey = true;
    else if ( input === "Right" ) this._rightKey = true;
    else if ( input === "Up" ) this._upKey = true;
    else if ( input === "Down" ) this._downKey = true;
};

gdjs.TopDownMovementRuntimeBehavior.prototype.ignoreDefaultControls = function(ignore)
{
    this._ignoreDefaultControls = ignore;
};

gdjs.TopDownMovementRuntimeBehavior.prototype.simulateLeftKey = function()
{
    this._leftKey = true;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.simulateRightKey = function()
{
    this._rightKey = true;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.simulateUpKey = function()
{
    this._upKey = true;
};
gdjs.TopDownMovementRuntimeBehavior.prototype.simulateDownKey = function()
{
    this._downKey = true;
};
