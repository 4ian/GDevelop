/**
GDevelop - Top-down movement Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * TopDownMovementRuntimeAutomatism represents an automatism allowing objects to
 * follow a path computed to avoid obstacles.
 *
 * @class TopDownMovementRuntimeAutomatism
 * @constructor
 */
gdjs.TopDownMovementRuntimeAutomatism = function(runtimeScene, automatismData, owner)
{
    gdjs.RuntimeAutomatism.call(this, runtimeScene, automatismData, owner);

    //Automatism configuration:
    this._allowDiagonals = automatismData.allowDiagonals;
    this._acceleration = automatismData.acceleration;
    this._deceleration = automatismData.deceleration;
    this._maxSpeed = automatismData.maxSpeed;
    this._angularMaxSpeed = automatismData.angularMaxSpeed;
    this._rotateObject = automatismData.rotateObject;
    this._angleOffset = automatismData.angleOffset;
    this._ignoreDefaultControls = automatismData.ignoreDefaultControls;

    //Attributes used when moving
    this._xVelocity = 0;
    this._yVelocity = 0;
    this._angularSpeed = 0;
    this._ignoreDefaultControls = false; ///< If set to true, do not track the default inputs.
    this._leftKey = false;
    this._rightKey = false;
    this._upKey = false;
    this._downKey = false;
};

gdjs.TopDownMovementRuntimeAutomatism.prototype = Object.create( gdjs.RuntimeAutomatism.prototype );
gdjs.TopDownMovementRuntimeAutomatism.thisIsARuntimeAutomatismConstructor = "TopDownMovementAutomatism::TopDownMovementAutomatism";

gdjs.TopDownMovementRuntimeAutomatism.prototype.setAcceleration = function(acceleration) {
    this._acceleration = acceleration;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.getAcceleration = function() {
    return this._acceleration;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.setDeceleration = function(deceleration) {
    this._deceleration = deceleration;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.getDeceleration = function() {
    return this._deceleration;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.setMaxSpeed = function(maxSpeed) {
    this._maxSpeed = maxSpeed;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.getMaxSpeed = function() {
    return this._maxSpeed;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.setAngularMaxSpeed = function(angularMaxSpeed) {
    this._angularMaxSpeed = angularMaxSpeed;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.getAngularMaxSpeed = function() {
    return this._angularMaxSpeed;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.setAngleOffset = function(angleOffset) {
    this._angleOffset = angleOffset;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.getAngleOffset = function() {
    return this._angleOffset;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.allowDiagonals = function(allow) {
    this._allowDiagonals = allow;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.diagonalsAllowed = function() {
    return this._allowDiagonals;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.setRotateObject = function(allow) {
    this._rotateObject = allow;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.isObjectRotated = function() {
    return this._rotateObject;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.isMoving = function() {
    return this._xVelocity !== 0 || this._yVelocity !== 0;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.getSpeed = function() {
    return Math.sqrt(this._xVelocity*this._xVelocity+this._yVelocity*this._yVelocity);
};

gdjs.TopDownMovementRuntimeAutomatism.prototype.doStepPreEvents = function(runtimeScene)
{
    var LEFTKEY = 37;
    var UPKEY = 38;
    var RIGHTKEY = 39;
    var DOWNKEY = 40;
    var SHIFTKEY = 16;
    var object = this.owner;
    var timeDelta = runtimeScene.getElapsedTime()/1000;

    //Get the player input:
    this._leftKey |= !this._ignoreDefaultControls && runtimeScene.getGame().isKeyPressed(LEFTKEY);
    this._rightKey |= !this._ignoreDefaultControls && runtimeScene.getGame().isKeyPressed(RIGHTKEY);
    this._downKey |= !this._ignoreDefaultControls && runtimeScene.getGame().isKeyPressed(DOWNKEY);
    this._upKey |= !this._ignoreDefaultControls && runtimeScene.getGame().isKeyPressed(UPKEY);

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

gdjs.TopDownMovementRuntimeAutomatism.prototype.simulateControl = function(input) {
    if ( input === "Left" ) this._leftKey = true;
    else if ( input === "Right" ) this._rightKey = true;
    else if ( input === "Up" ) this._upKey = true;
    else if ( input === "Down" ) this._downKey = true;
};

gdjs.TopDownMovementRuntimeAutomatism.prototype.ignoreDefaultControls = function(ignore)
{
    this._ignoreDefaultControls = ignore;
};

gdjs.TopDownMovementRuntimeAutomatism.prototype.simulateLeftKey = function()
{
    this._leftKey = true;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.simulateRightKey = function()
{
    this._rightKey = true;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.simulateUpKey = function()
{
    this._upKey = true;
};
gdjs.TopDownMovementRuntimeAutomatism.prototype.simulateDownKey = function()
{
    this._downKey = true;
};
