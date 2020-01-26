/**
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * PathfindingRuntimeBehavior represents a behavior allowing objects to
 * follow a path computed to avoid obstacles.
 *
 * @class PathfindingRuntimeBehavior
 * @memberof gdjs
 */
gdjs.PathfindingRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    if (this._path === undefined)
        this._path = []; //The path computed and followed by the object (Array of arrays containing x and y position)
    else
        this._path.length = 0;

    //Behavior configuration:
    this._allowDiagonals = behaviorData.allowDiagonals;
    this._acceleration = behaviorData.acceleration;
    this._maxSpeed = behaviorData.maxSpeed;
    this._angularMaxSpeed = behaviorData.angularMaxSpeed;
    this._rotateObject = behaviorData.rotateObject;
    this._angleOffset = behaviorData.angleOffset;
    this._cellWidth = behaviorData.cellWidth;
    this._cellHeight = behaviorData.cellHeight;
    this._extraBorder = behaviorData.extraBorder;

    //Attributes used for traveling on the path:
    this._pathFound = false;
    this._speed = 0;
    this._angularSpeed = 0;
    this._timeOnSegment = 0;
    this._totalSegmentTime = 0;
    this._currentSegment = 0;
    this._reachedEnd = false;

    this._manager = gdjs.PathfindingObstaclesManager.getManager(runtimeScene);

    if ( this._searchContext === undefined )
        this._searchContext = new gdjs.PathfindingRuntimeBehavior.SearchContext();
};

gdjs.PathfindingRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.registerBehavior("PathfindingBehavior::PathfindingBehavior", gdjs.PathfindingRuntimeBehavior);

gdjs.PathfindingRuntimeBehavior.prototype.setCellWidth = function(width) {
    this._cellWidth = width;
};
gdjs.PathfindingRuntimeBehavior.prototype.getCellWidth = function() {
    return this._cellWidth;
};
gdjs.PathfindingRuntimeBehavior.prototype.setCellHeight = function(height) {
    this._cellHeight = height;
};
gdjs.PathfindingRuntimeBehavior.prototype.getCellHeight = function() {
    return this._cellHeight;
};
gdjs.PathfindingRuntimeBehavior.prototype.setAcceleration = function(acceleration) {
    this._acceleration = acceleration;
};
gdjs.PathfindingRuntimeBehavior.prototype.getAcceleration = function() {
    return this._acceleration;
};
gdjs.PathfindingRuntimeBehavior.prototype.setMaxSpeed = function(maxSpeed) {
    this._maxSpeed = maxSpeed;
};
gdjs.PathfindingRuntimeBehavior.prototype.getMaxSpeed = function() {
    return this._maxSpeed;
};
gdjs.PathfindingRuntimeBehavior.prototype.setSpeed = function(speed) {
    this._speed = speed;
};
gdjs.PathfindingRuntimeBehavior.prototype.getSpeed = function() {
    return this._speed;
};
gdjs.PathfindingRuntimeBehavior.prototype.setAngularMaxSpeed = function(angularMaxSpeed) {
    this._angularMaxSpeed = angularMaxSpeed;
};
gdjs.PathfindingRuntimeBehavior.prototype.getAngularMaxSpeed = function() {
    return this._angularMaxSpeed;
};
gdjs.PathfindingRuntimeBehavior.prototype.setAngleOffset = function(angleOffset) {
    this._angleOffset = angleOffset;
};
gdjs.PathfindingRuntimeBehavior.prototype.getAngleOffset = function() {
    return this._angleOffset;
};
gdjs.PathfindingRuntimeBehavior.prototype.setExtraBorder = function(extraBorder) {
    this._extraBorder = extraBorder;
};
gdjs.PathfindingRuntimeBehavior.prototype.getExtraBorder = function() {
    return this._extraBorder;
};
gdjs.PathfindingRuntimeBehavior.prototype.allowDiagonals = function(allow) {
    this._allowDiagonals = allow;
};
gdjs.PathfindingRuntimeBehavior.prototype.diagonalsAllowed = function() {
    return this._allowDiagonals;
};
gdjs.PathfindingRuntimeBehavior.prototype.setRotateObject = function(allow) {
    this._rotateObject = allow;
};
gdjs.PathfindingRuntimeBehavior.prototype.isObjectRotated = function() {
    return this._rotateObject;
};

gdjs.PathfindingRuntimeBehavior.prototype.getNodeX = function(index) {
    if (index<this._path.length) return this._path[index][0];
    return 0;
};
gdjs.PathfindingRuntimeBehavior.prototype.getNodeY = function(index) {
    if (index<this._path.length) return this._path[index][1];
    return 0;
};
gdjs.PathfindingRuntimeBehavior.prototype.getNextNodeIndex = function() {
    if (this._currentSegment+1 < this._path.length)
        return this._currentSegment+1;
    else
        return this._path.length-1;
};
gdjs.PathfindingRuntimeBehavior.prototype.getNodeCount = function() {
    return this._path.length;
};
gdjs.PathfindingRuntimeBehavior.prototype.getNextNodeX = function() {
    if ( this._path.length === 0 ) return 0;

    if (this._currentSegment+1 < this._path.length)
        return this._path[this._currentSegment+1][0];
    else
        return this._path.back()[0];
};
gdjs.PathfindingRuntimeBehavior.prototype.getNextNodeY = function() {
    if ( this._path.length === 0 ) return 0;

    if (this._currentSegment+1 < this._path.length)
        return this._path[this._currentSegment+1][1];
    else
        return this._path.back()[1];
};
gdjs.PathfindingRuntimeBehavior.prototype.getLastNodeX = function() {
    if ( this._path.length < 2 ) return 0;

    if (this._currentSegment < this._path.length-1)
        return this._path[this._currentSegment][0];
    else
        return this._path[this._path.length-1][0];
};
gdjs.PathfindingRuntimeBehavior.prototype.getLastNodeY = function() {
    if ( this._path.length < 2 ) return 0;

    if (this._currentSegment < this._path.length-1)
        return this._path[this._currentSegment][1];
    else
        return this._path[this._path.length-1][1];
};
gdjs.PathfindingRuntimeBehavior.prototype.getDestinationX = function() {
    if ( this._path.length === 0 ) return 0;
    return this._path.back()[0];
};
gdjs.PathfindingRuntimeBehavior.prototype.getDestinationY = function() {
    if ( this._path.length === 0 ) return 0;
    return this._path.back()[1];
};

/**
 * Return true if the latest call to moveTo succeeded.
 */
gdjs.PathfindingRuntimeBehavior.prototype.pathFound = function() {
    return this._pathFound;
};

/**
 * Return true if the object reached its destination.
 */
gdjs.PathfindingRuntimeBehavior.prototype.destinationReached = function() {
    return this._reachedEnd;
};

/**
 * Compute and move on the path to the specified destination.
 */
gdjs.PathfindingRuntimeBehavior.prototype.moveTo = function(runtimeScene, x, y)
{
    var owner = this.owner;

    //First be sure that there is a path to compute.
    var targetCellX = Math.round(x/this._cellWidth);
    var targetCellY = Math.round(y/this._cellHeight);
    var startCellX = Math.round(owner.getX()/this._cellWidth);
    var startCellY = Math.round(owner.getY()/this._cellHeight);
    if ( startCellX == targetCellX && startCellY == targetCellY ) {
        this._path.length = 0;
        this._path.push([owner.getX(), owner.getY()]);
        this._path.push([x, y]);

        this._enterSegment(0);
        this._pathFound = true;

        return;
    }

    //Start searching for a path
    this._searchContext.allowDiagonals(this._allowDiagonals);
    this._searchContext.setObstacles(this._manager);
    this._searchContext.setCellSize(this._cellWidth, this._cellHeight);
    this._searchContext.setStartPosition(owner.getX(), owner.getY());
    this._searchContext.setObjectSize(owner.getX()-owner.getDrawableX()+this._extraBorder,
        owner.getY()-owner.getDrawableY()+this._extraBorder,
        owner.getWidth()-(owner.getX()-owner.getDrawableX())+this._extraBorder,
        owner.getHeight()-(owner.getY()-owner.getDrawableY())+this._extraBorder);

    if (this._searchContext.computePathTo(x, y))
    {
        //Path found: memorize it
        var node = this._searchContext.getFinalNode();
        var finalPathLength = 0;
        while (node) {
            if ( finalPathLength === this._path.length)
                this._path.push([0, 0]);

            this._path[finalPathLength][0] = node.pos[0]*this._cellWidth;
            this._path[finalPathLength][1] = node.pos[1]*this._cellHeight;

            node = node.parent;
            finalPathLength++;
        }
        this._path.length = finalPathLength;

        this._path.reverse();
        this._path[0][0] = owner.getX();
        this._path[0][1] = owner.getY();

        this._enterSegment(0);
        this._pathFound = true;
        return;
    }

    //Not path found
    this._pathFound = false;
};

gdjs.PathfindingRuntimeBehavior.prototype._enterSegment = function(segmentNumber)
{
    if (this._path.length === 0) return;

    this._currentSegment = segmentNumber;
    if (this._currentSegment < this._path.length-1) {
        var pathX = this._path[this._currentSegment + 1][0] - this._path[this._currentSegment][0];
        var pathY = this._path[this._currentSegment + 1][1] - this._path[this._currentSegment][1];
        this._totalSegmentTime = Math.sqrt(pathX*pathX+pathY*pathY);
        this._timeOnSegment = 0;
        this._reachedEnd = false;
    }
    else {
        this._reachedEnd = true;
        this._speed = 0;
    }
};

gdjs.PathfindingRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene)
{
    if (this._path.length === 0 || this._reachedEnd) return;

    //Update the speed of the object
    var timeDelta = this.owner.getElapsedTime(runtimeScene)/1000;
    this._speed += this._acceleration*timeDelta;
    if ( this._speed > this._maxSpeed ) this._speed = this._maxSpeed;
    this._angularSpeed = this._angularMaxSpeed;

    //Update the time on the segment and change segment if needed
    this._timeOnSegment += this._speed*timeDelta;
    if (this._timeOnSegment >= this._totalSegmentTime && this._currentSegment < this._path.length)
        this._enterSegment(this._currentSegment + 1);

    //Position object on the segment and update its angle
    var newPos = [0, 0];
    var pathAngle = this.owner.getAngle();
    if ( this._currentSegment < this._path.length-1 ) {
        newPos[0] = gdjs.evtTools.common.lerp(this._path[this._currentSegment][0],
            this._path[this._currentSegment + 1][0], this._timeOnSegment / this._totalSegmentTime);
        newPos[1] = gdjs.evtTools.common.lerp(this._path[this._currentSegment][1],
            this._path[this._currentSegment + 1][1], this._timeOnSegment / this._totalSegmentTime);

        pathAngle = gdjs.toDegrees(Math.atan2(this._path[this._currentSegment+1][1] - this._path[this._currentSegment][1],
            this._path[this._currentSegment+1][0] - this._path[this._currentSegment][0]))+this._angleOffset;
    }
    else
        newPos = this._path[this._path.length-1];

    this.owner.setX(newPos[0]);
    this.owner.setY(newPos[1]);

    if ( this._rotateObject ) {
        this.owner.rotateTowardAngle(pathAngle, this._angularSpeed, runtimeScene);
    }
};

gdjs.PathfindingRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    //Scene change is not supported
    /*
    if ( parentScene != &scene ) //Parent scene has changed
    {
        parentScene = &scene;
        sceneManager = parentScene ? &ScenePathfindingObstaclesManager::managers[&scene] : null;
        floorPlatform = null;
    }
    */
};

/**
 * Internal tool class representing a node when looking for a path
 * @private
 * @memberof gdjs.PathfindingRuntimeBehavior
 * @class Node
 */
gdjs.PathfindingRuntimeBehavior.Node = function(xPos, yPos)
{
    if ( this.pos === undefined)
        this.pos = [xPos, yPos];
    else {
        this.pos[0] = xPos;
        this.pos[1] = yPos;
    }

    this.cost = 0;
    this.smallestCost = -1;
    this.estimateCost = -1;
    this.parent = null;
    this.open = true;
};

/**
 * Compute the euclidean distance between two positions.
 * @private
 * @memberof gdjs.PathfindingRuntimeBehavior
 */
gdjs.PathfindingRuntimeBehavior.euclideanDistance = function(a, b)
{
    return Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]));
};

/**
 * Compute the taxi distance between two positions.
 * @private
 * @memberof gdjs.PathfindingRuntimeBehavior
 */
gdjs.PathfindingRuntimeBehavior.manhattanDistance = function(a, b)
{
    return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
};

/**
 * Internal tool class containing the structures used by A* and members functions related
 * to them.
 */
gdjs.PathfindingRuntimeBehavior.SearchContext = function()
{
    this._obstacles = null;
    this._finalNode = null;
    this._destination = [0,0];
    this._start = [0,0];
    this._startX = 0;
    this._startY = 0;
    this._allowDiagonals = true;
    this._maxComplexityFactor = 50;
    this._cellWidth = 20;
    this._cellHeight = 20;
    this._leftBorder = 0;
    this._rightBorder = 0;
    this._topBorder = 0;
    this._bottomBorder = 0;
    this._distanceFunction = gdjs.PathfindingRuntimeBehavior.euclideanDistance;
    this._allNodes = []; //An array of array. Nodes are indexed by their x position, and then by their y position.
    this._openNodes = []; //An array of nodes sorted by their estimate cost (First node = Lower estimate cost).

    this._closeObstacles = []; //Used by getNodes to temporarily store obstacles near a position.
    this._nodeCache = []; //Old nodes constructed in a previous search are stored here to avoid temporary objects (see _freeAllNodes method).
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype.setObstacles = function(obstacles)
{
    this._obstacles = obstacles;
    return this;
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype.getFinalNode = function()
{
    return this._finalNode;
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype.allowDiagonals = function(allowDiagonals)
{
    this._allowDiagonals = allowDiagonals;
    this._distanceFunction = allowDiagonals ? gdjs.PathfindingRuntimeBehavior.euclideanDistance :
        gdjs.PathfindingRuntimeBehavior.manhattanDistance;
    return this;
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype.setStartPosition = function(x, y)
{
    this._startX = x;
    this._startY = y;
    return this;
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype.setObjectSize = function(leftBorder, topBorder, rightBorder, bottomBorder)
{
    this._leftBorder = leftBorder;
    this._rightBorder = rightBorder;
    this._topBorder = topBorder;
    this._bottomBorder = bottomBorder;
    return this;
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype.setCellSize = function(cellWidth, cellHeight)
{
    this._cellWidth = cellWidth;
    this._cellHeight = cellHeight;
    return this;
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype.computePathTo = function(targetX, targetY)
{
    if (this._obstacles === null) {
        console.log("You tried to compute a path without specifying the obstacles");
        return;
    }

    this._destination[0] = Math.round(targetX/this._cellWidth);
    this._destination[1] = Math.round(targetY/this._cellHeight);
    this._start[0] = Math.round(this._startX/this._cellWidth);
    this._start[1] = Math.round(this._startY/this._cellHeight);

    //Initialize the algorithm
    this._freeAllNodes();
    var startNode = this._getNode(this._start[0], this._start[1]);
    startNode.smallestCost = 0;
    startNode.estimateCost = 0 + this._distanceFunction(this._start, this._destination);
    this._openNodes.length = 0;
    this._openNodes.push(startNode);

    //A* algorithm main loop
    var iterationCount = 0;
    var maxIterationCount = startNode.estimateCost*this._maxComplexityFactor;
    while (this._openNodes.length !== 0)
    {
        if (iterationCount++ > maxIterationCount) return false; //Make sure we do not search forever.

        var n = this._openNodes.shift(); //Get the most promising node...
        n.open = false;                 //...and flag it as explored

        //Check if we reached destination?
        if ( n.pos[0] == this._destination[0] && n.pos[1] == this._destination[1] )
        {
            this._finalNode = n;
            return true;
        }

        //No, so add neighbors to the nodes to explore.
        this._insertNeighbors(n);
    }

    return false;
};

gdjs.PathfindingRuntimeBehavior.SearchContext.prototype._freeAllNodes = function()
{
    if ( this._nodeCache.length <= 32000 ) {
        for( var i in this._allNodes ) {
            if ( this._allNodes.hasOwnProperty(i) ) {
                var nodeArray = this._allNodes[i];
                for( var j in nodeArray ) {
                    if ( nodeArray.hasOwnProperty(j) ) {
                        this._nodeCache.push(nodeArray[j]);
                    }
                }
            }
        }
    }

    this._allNodes = {};
};

/**
 * Insert the neighbors of the current node in the open list
 * (Only if they are not closed, and if the cost is better than the already existing smallest cost).
 */
gdjs.PathfindingRuntimeBehavior.SearchContext.prototype._insertNeighbors = function(currentNode)
{
    this._addOrUpdateNode(currentNode.pos[0]+1, currentNode.pos[1], currentNode, 1);
    this._addOrUpdateNode(currentNode.pos[0]-1, currentNode.pos[1], currentNode, 1);
    this._addOrUpdateNode(currentNode.pos[0], currentNode.pos[1]+1, currentNode, 1);
    this._addOrUpdateNode(currentNode.pos[0], currentNode.pos[1]-1, currentNode, 1);
    if ( this._allowDiagonals )
    {
        this._addOrUpdateNode(currentNode.pos[0]+1, currentNode.pos[1]+1, currentNode, 1.414213562);
        this._addOrUpdateNode(currentNode.pos[0]+1, currentNode.pos[1]-1, currentNode, 1.414213562);
        this._addOrUpdateNode(currentNode.pos[0]-1, currentNode.pos[1]-1, currentNode, 1.414213562);
        this._addOrUpdateNode(currentNode.pos[0]-1, currentNode.pos[1]+1, currentNode, 1.414213562);
    }
};

/**
 * Get (or dynamically construct) a node.
 *
 * *All* nodes should be created using this method: The cost of the node is computed thanks
 * to the objects flagged as obstacles.
 */
gdjs.PathfindingRuntimeBehavior.SearchContext.prototype._getNode = function(xPos, yPos)
{
    //First check if their is a node a the specified position.
    if (this._allNodes.hasOwnProperty(xPos)) {
        if ( this._allNodes[xPos].hasOwnProperty(yPos) )
            return this._allNodes[xPos][yPos];
    }
    else
        this._allNodes[xPos] = [];

    //No so construct a new node (or get it from the cache)...
    var newNode = null;
    if ( this._nodeCache.length !== 0) {
        newNode = this._nodeCache.shift();
        gdjs.PathfindingRuntimeBehavior.Node.call(newNode, xPos, yPos);
    }
    else
        newNode = new gdjs.PathfindingRuntimeBehavior.Node(xPos, yPos);

    //...and update its cost according to obstacles
    var objectsOnCell = false;
    var radius = this._cellHeight > this._cellWidth ? this._cellHeight*2 : this._cellWidth*2;
    this._obstacles.getAllObstaclesAround(xPos*this._cellWidth, yPos*this._cellHeight,
        radius, this._closeObstacles);

    for(var k = 0; k < this._closeObstacles.length; ++k ) {
        var obj = this._closeObstacles[k].owner;
        var topLeftCellX = Math.floor((obj.getDrawableX()-this._rightBorder)/this._cellWidth);
        var topLeftCellY = Math.floor((obj.getDrawableY()-this._bottomBorder)/this._cellHeight);
        var bottomRightCellX = Math.ceil((obj.getDrawableX()+obj.getWidth()+this._leftBorder)/this._cellWidth);
        var bottomRightCellY = Math.ceil((obj.getDrawableY()+obj.getHeight()+this._topBorder)/this._cellHeight);
        if ( topLeftCellX < xPos && xPos < bottomRightCellX
            && topLeftCellY < yPos && yPos < bottomRightCellY) {

            objectsOnCell = true;
            if ( this._closeObstacles[k].isImpassable() ) {
                newNode.cost = -1;
                break; //The cell is impassable, stop here.
            }
            else //Superimpose obstacles
                newNode.cost += this._closeObstacles[k].getCost();
        }
    }

    if (!objectsOnCell) newNode.cost = 1; //Default cost when no objects put on the cell.

    this._allNodes[xPos][yPos] = newNode;
    return newNode;
};

/**
 * Add a node to the openNodes (only if the cost to reach it is less than the existing cost, if any).
 */
gdjs.PathfindingRuntimeBehavior.SearchContext.prototype._addOrUpdateNode = function(newNodeX, newNodeY, currentNode, factor)
{
    var neighbor = this._getNode(newNodeX, newNodeY);
    if (!neighbor.open || neighbor.cost < 0 ) //cost < 0 means impassable obstacle
        return;

    //Update the node costs and parent if the path coming from currentNode is better:
    if (neighbor.smallestCost === -1
        || neighbor.smallestCost > currentNode.smallestCost + (currentNode.cost+neighbor.cost)/2.0*factor)
    {
        if (neighbor.smallestCost != -1) { //The node is already in the open list..
            for (var i =0;i<this._openNodes.length;++i) {
                if (this._openNodes[i].pos[0] == neighbor.pos[0] && this._openNodes[i].pos[1] == neighbor.pos[1]) {
                    this._openNodes.splice(i, 1); //..so remove it as its estimate cost will be updated.
                    break;
                }
            }
        }

        neighbor.smallestCost = currentNode.smallestCost + (currentNode.cost+neighbor.cost)/2.0*factor;
        neighbor.parent = currentNode;
        neighbor.estimateCost = neighbor.smallestCost + this._distanceFunction(neighbor.pos, this._destination);

        //Add the neighbor to open nodes, which are sorted by their estimate cost:
        if (this._openNodes.length === 0 || this._openNodes[this._openNodes.length-1].estimateCost < neighbor.estimateCost )
            this._openNodes.push(neighbor);
        else {
            for (var i = 0;i<this._openNodes.length;++i) {
                if (this._openNodes[i].estimateCost >= neighbor.estimateCost) {
                    this._openNodes.splice(i, 0, neighbor);
                    break;
                }
            }
        }
    }
};
