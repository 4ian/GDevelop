/**
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  /**
   * PathfindingRuntimeBehavior represents a behavior allowing objects to
   * follow a path computed to avoid obstacles.
   *
   * @class PathfindingRuntimeBehavior
   * @memberof gdjs
   */
  export class PathfindingRuntimeBehavior extends gdjs.RuntimeBehavior {
    _path: any = [];

    //Behavior configuration:
    _allowDiagonals: any;
    _acceleration: any;
    _maxSpeed: any;
    _angularMaxSpeed: any;
    _rotateObject: any;
    _angleOffset: any;
    _cellWidth: float;
    _cellHeight: float;
    _extraBorder: any;

    //Attributes used for traveling on the path:
    _pathFound: boolean = false;
    _speed: number = 0;
    _angularSpeed: number = 0;
    _timeOnSegment: number = 0;
    _totalSegmentTime: float = 0;
    _currentSegment: number = 0;
    _reachedEnd: boolean = false;
    _manager: any;
    _searchContext: any;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);

      //The path computed and followed by the object (Array of arrays containing x and y position)
      if (this._path === undefined) {
      } else {
        this._path.length = 0;
      }
      this._allowDiagonals = behaviorData.allowDiagonals;
      this._acceleration = behaviorData.acceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._angularMaxSpeed = behaviorData.angularMaxSpeed;
      this._rotateObject = behaviorData.rotateObject;
      this._angleOffset = behaviorData.angleOffset;
      this._cellWidth = behaviorData.cellWidth;
      this._cellHeight = behaviorData.cellHeight;
      this._extraBorder = behaviorData.extraBorder;
      this._manager = gdjs.PathfindingObstaclesManager.getManager(runtimeScene);
      if (this._searchContext === undefined) {
        this._searchContext = new gdjs.PathfindingRuntimeBehavior.SearchContext();
      }
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.allowDiagonals !== newBehaviorData.allowDiagonals) {
        this.allowDiagonals(newBehaviorData.allowDiagonals);
      }
      if (oldBehaviorData.acceleration !== newBehaviorData.acceleration) {
        this.setAcceleration(newBehaviorData.acceleration);
      }
      if (oldBehaviorData.maxSpeed !== newBehaviorData.maxSpeed) {
        this.setMaxSpeed(newBehaviorData.maxSpeed);
      }
      if (oldBehaviorData.angularMaxSpeed !== newBehaviorData.angularMaxSpeed) {
        this.setAngularMaxSpeed(newBehaviorData.angularMaxSpeed);
      }
      if (oldBehaviorData.rotateObject !== newBehaviorData.rotateObject) {
        this.setRotateObject(newBehaviorData.rotateObject);
      }
      if (oldBehaviorData.angleOffset !== newBehaviorData.angleOffset) {
        this.setAngleOffset(newBehaviorData.angleOffset);
      }
      if (oldBehaviorData.cellWidth !== newBehaviorData.cellWidth) {
        this.setCellWidth(newBehaviorData.cellWidth);
      }
      if (oldBehaviorData.cellHeight !== newBehaviorData.cellHeight) {
        this.setCellHeight(newBehaviorData.cellHeight);
      }
      if (oldBehaviorData.extraBorder !== newBehaviorData.extraBorder) {
        this.setExtraBorder(newBehaviorData.extraBorder);
      }
      return true;
    }

    setCellWidth(width): void {
      this._cellWidth = width;
    }

    getCellWidth(): float {
      return this._cellWidth;
    }

    setCellHeight(height): void {
      this._cellHeight = height;
    }

    getCellHeight(): float {
      return this._cellHeight;
    }

    setAcceleration(acceleration): void {
      this._acceleration = acceleration;
    }

    getAcceleration() {
      return this._acceleration;
    }

    setMaxSpeed(maxSpeed): void {
      this._maxSpeed = maxSpeed;
    }

    getMaxSpeed() {
      return this._maxSpeed;
    }

    setSpeed(speed): void {
      this._speed = speed;
    }

    getSpeed() {
      return this._speed;
    }

    setAngularMaxSpeed(angularMaxSpeed): void {
      this._angularMaxSpeed = angularMaxSpeed;
    }

    getAngularMaxSpeed() {
      return this._angularMaxSpeed;
    }

    setAngleOffset(angleOffset): void {
      this._angleOffset = angleOffset;
    }

    getAngleOffset() {
      return this._angleOffset;
    }

    setExtraBorder(extraBorder): void {
      this._extraBorder = extraBorder;
    }

    getExtraBorder() {
      return this._extraBorder;
    }

    allowDiagonals(allow) {
      this._allowDiagonals = allow;
    }

    diagonalsAllowed() {
      return this._allowDiagonals;
    }

    setRotateObject(allow): void {
      this._rotateObject = allow;
    }

    isObjectRotated(): boolean {
      return this._rotateObject;
    }

    getNodeX(index): float {
      if (index < this._path.length) {
        return this._path[index][0];
      }
      return 0;
    }

    getNodeY(index): float {
      if (index < this._path.length) {
        return this._path[index][1];
      }
      return 0;
    }

    getNextNodeIndex() {
      if (this._currentSegment + 1 < this._path.length) {
        return this._currentSegment + 1;
      } else {
        return this._path.length - 1;
      }
    }

    getNodeCount(): integer {
      return this._path.length;
    }

    getNextNodeX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      if (this._currentSegment + 1 < this._path.length) {
        return this._path[this._currentSegment + 1][0];
      } else {
        return this._path.back()[0];
      }
    }

    getNextNodeY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      if (this._currentSegment + 1 < this._path.length) {
        return this._path[this._currentSegment + 1][1];
      } else {
        return this._path.back()[1];
      }
    }

    getLastNodeX(): float {
      if (this._path.length < 2) {
        return 0;
      }
      if (this._currentSegment < this._path.length - 1) {
        return this._path[this._currentSegment][0];
      } else {
        return this._path[this._path.length - 1][0];
      }
    }

    getLastNodeY(): float {
      if (this._path.length < 2) {
        return 0;
      }
      if (this._currentSegment < this._path.length - 1) {
        return this._path[this._currentSegment][1];
      } else {
        return this._path[this._path.length - 1][1];
      }
    }

    getDestinationX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path.back()[0];
    }

    getDestinationY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path.back()[1];
    }

    /**
     * Return true if the latest call to moveTo succeeded.
     */
    pathFound() {
      return this._pathFound;
    }

    /**
     * Return true if the object reached its destination.
     */
    destinationReached() {
      return this._reachedEnd;
    }

    /**
     * Compute and move on the path to the specified destination.
     */
    moveTo(runtimeScene, x, y) {
      const owner = this.owner;

      //First be sure that there is a path to compute.
      const targetCellX = Math.round(x / this._cellWidth);
      const targetCellY = Math.round(y / this._cellHeight);
      const startCellX = Math.round(owner.getX() / this._cellWidth);
      const startCellY = Math.round(owner.getY() / this._cellHeight);
      if (startCellX == targetCellX && startCellY == targetCellY) {
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
      this._searchContext.setObjectSize(
        owner.getX() - owner.getDrawableX() + this._extraBorder,
        owner.getY() - owner.getDrawableY() + this._extraBorder,
        owner.getWidth() -
          (owner.getX() - owner.getDrawableX()) +
          this._extraBorder,
        owner.getHeight() -
          (owner.getY() - owner.getDrawableY()) +
          this._extraBorder
      );
      if (this._searchContext.computePathTo(x, y)) {
        //Path found: memorize it
        let node = this._searchContext.getFinalNode();
        let finalPathLength = 0;
        while (node) {
          if (finalPathLength === this._path.length) {
            this._path.push([0, 0]);
          }
          this._path[finalPathLength][0] = node.pos[0] * this._cellWidth;
          this._path[finalPathLength][1] = node.pos[1] * this._cellHeight;
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
    }

    _enterSegment(segmentNumber) {
      if (this._path.length === 0) {
        return;
      }
      this._currentSegment = segmentNumber;
      if (this._currentSegment < this._path.length - 1) {
        const pathX =
          this._path[this._currentSegment + 1][0] -
          this._path[this._currentSegment][0];
        const pathY =
          this._path[this._currentSegment + 1][1] -
          this._path[this._currentSegment][1];
        this._totalSegmentTime = Math.sqrt(pathX * pathX + pathY * pathY);
        this._timeOnSegment = 0;
        this._reachedEnd = false;
      } else {
        this._reachedEnd = true;
        this._speed = 0;
      }
    }

    doStepPreEvents(runtimeScene) {
      if (this._path.length === 0 || this._reachedEnd) {
        return;
      }

      //Update the speed of the object
      const timeDelta = this.owner.getElapsedTime(runtimeScene) / 1000;
      this._speed += this._acceleration * timeDelta;
      if (this._speed > this._maxSpeed) {
        this._speed = this._maxSpeed;
      }
      this._angularSpeed = this._angularMaxSpeed;

      //Update the time on the segment and change segment if needed
      this._timeOnSegment += this._speed * timeDelta;
      if (
        this._timeOnSegment >= this._totalSegmentTime &&
        this._currentSegment < this._path.length
      ) {
        this._enterSegment(this._currentSegment + 1);
      }

      //Position object on the segment and update its angle
      let newPos = [0, 0];
      let pathAngle = this.owner.getAngle();
      if (this._currentSegment < this._path.length - 1) {
        newPos[0] = gdjs.evtTools.common.lerp(
          this._path[this._currentSegment][0],
          this._path[this._currentSegment + 1][0],
          this._timeOnSegment / this._totalSegmentTime
        );
        newPos[1] = gdjs.evtTools.common.lerp(
          this._path[this._currentSegment][1],
          this._path[this._currentSegment + 1][1],
          this._timeOnSegment / this._totalSegmentTime
        );
        pathAngle =
          gdjs.toDegrees(
            Math.atan2(
              this._path[this._currentSegment + 1][1] -
                this._path[this._currentSegment][1],
              this._path[this._currentSegment + 1][0] -
                this._path[this._currentSegment][0]
            )
          ) + this._angleOffset;
      } else {
        newPos = this._path[this._path.length - 1];
      }
      this.owner.setX(newPos[0]);
      this.owner.setY(newPos[1]);
      if (this._rotateObject) {
        this.owner.rotateTowardAngle(
          pathAngle,
          this._angularSpeed,
          runtimeScene
        );
      }
    }

    doStepPostEvents(runtimeScene) {}

    /**
     * Compute the euclidean distance between two positions.
     * @memberof gdjs.PathfindingRuntimeBehavior
     */
    static euclideanDistance(a, b) {
      return Math.sqrt(
        (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])
      );
    }

    /**
     * Compute the taxi distance between two positions.
     * @memberof gdjs.PathfindingRuntimeBehavior
     */
    static manhattanDistance(a, b) {
      return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }
  }
  gdjs.registerBehavior(
    'PathfindingBehavior::PathfindingBehavior',
    gdjs.PathfindingRuntimeBehavior
  );

  export namespace PathfindingRuntimeBehavior {
    /**
     * Internal tool class representing a node when looking for a path
     */
    export class Node {
      pos: any;
      cost: number = 0;
      smallestCost: any = -1;
      estimateCost: any = -1;
      parent: any = null;
      open: boolean = true;

      constructor(xPos: float, yPos: float) {
        this.pos = [xPos, yPos];
      }

      reinitialize(xPos: float, yPos: float) {
        this.pos[0] = xPos;
        this.pos[1] = yPos;
        this.cost = 0;
        this.smallestCost = -1;
        this.estimateCost = -1;
        this.parent = null;
        this.open = true;
      }
    }

    /**
     * Internal tool class containing the structures used by A* and members functions related
     * to them.
     */
    export class SearchContext {
      _obstacles: any = null;
      _finalNode: any = null;
      _destination: any = [0, 0];
      _start: any = [0, 0];
      _startX: number = 0;
      _startY: number = 0;
      _allowDiagonals: boolean = true;
      _maxComplexityFactor: integer = 50;
      _cellWidth: float = 20;
      _cellHeight: float = 20;
      _leftBorder: integer = 0;
      _rightBorder: integer = 0;
      _topBorder: integer = 0;
      _bottomBorder: integer = 0;
      _distanceFunction: any;
      _allNodes: any = [];

      //An array of array. Nodes are indexed by their x position, and then by their y position.
      _openNodes: any = [];
      _closeObstacles: any = [];

      //Used by getNodes to temporarily store obstacles near a position.
      _nodeCache: any = [];

      constructor() {
        this._distanceFunction = PathfindingRuntimeBehavior.euclideanDistance;

        //An array of nodes sorted by their estimate cost (First node = Lower estimate cost).
      }

      //Old nodes constructed in a previous search are stored here to avoid temporary objects (see _freeAllNodes method).
      setObstacles(obstacles): PathfindingRuntimeBehavior.SearchContext {
        this._obstacles = obstacles;
        return this;
      }

      getFinalNode() {
        return this._finalNode;
      }

      allowDiagonals(allowDiagonals) {
        this._allowDiagonals = allowDiagonals;
        this._distanceFunction = allowDiagonals
          ? PathfindingRuntimeBehavior.euclideanDistance
          : PathfindingRuntimeBehavior.manhattanDistance;
        return this;
      }

      setStartPosition(x, y): PathfindingRuntimeBehavior.SearchContext {
        this._startX = x;
        this._startY = y;
        return this;
      }

      setObjectSize(
        leftBorder,
        topBorder,
        rightBorder,
        bottomBorder
      ): PathfindingRuntimeBehavior.SearchContext {
        this._leftBorder = leftBorder;
        this._rightBorder = rightBorder;
        this._topBorder = topBorder;
        this._bottomBorder = bottomBorder;
        return this;
      }

      setCellSize(
        cellWidth,
        cellHeight
      ): PathfindingRuntimeBehavior.SearchContext {
        this._cellWidth = cellWidth;
        this._cellHeight = cellHeight;
        return this;
      }

      computePathTo(targetX, targetY) {
        if (this._obstacles === null) {
          console.log(
            'You tried to compute a path without specifying the obstacles'
          );
          return;
        }
        this._destination[0] = Math.round(targetX / this._cellWidth);
        this._destination[1] = Math.round(targetY / this._cellHeight);
        this._start[0] = Math.round(this._startX / this._cellWidth);
        this._start[1] = Math.round(this._startY / this._cellHeight);

        //Initialize the algorithm
        this._freeAllNodes();
        const startNode = this._getNode(this._start[0], this._start[1]);
        startNode.smallestCost = 0;
        startNode.estimateCost =
          0 + this._distanceFunction(this._start, this._destination);
        this._openNodes.length = 0;
        this._openNodes.push(startNode);

        //A* algorithm main loop
        let iterationCount = 0;
        const maxIterationCount =
          startNode.estimateCost * this._maxComplexityFactor;
        while (this._openNodes.length !== 0) {
          if (iterationCount++ > maxIterationCount) {
            return false;
          }

          //Make sure we do not search forever.
          const n =
            //Get the most promising node...
            this._openNodes.shift();
          n.open = false;

          //...and flag it as explored

          //Check if we reached destination?
          if (
            n.pos[0] == this._destination[0] &&
            n.pos[1] == this._destination[1]
          ) {
            this._finalNode = n;
            return true;
          }

          //No, so add neighbors to the nodes to explore.
          this._insertNeighbors(n);
        }
        return false;
      }

      _freeAllNodes() {
        if (this._nodeCache.length <= 32000) {
          for (const i in this._allNodes) {
            if (this._allNodes.hasOwnProperty(i)) {
              const nodeArray = this._allNodes[i];
              for (const j in nodeArray) {
                if (nodeArray.hasOwnProperty(j)) {
                  this._nodeCache.push(nodeArray[j]);
                }
              }
            }
          }
        }
        this._allNodes = {};
      }

      /**
       * Insert the neighbors of the current node in the open list
       * (Only if they are not closed, and if the cost is better than the already existing smallest cost).
       */
      _insertNeighbors(currentNode) {
        this._addOrUpdateNode(
          currentNode.pos[0] + 1,
          currentNode.pos[1],
          currentNode,
          1
        );
        this._addOrUpdateNode(
          currentNode.pos[0] - 1,
          currentNode.pos[1],
          currentNode,
          1
        );
        this._addOrUpdateNode(
          currentNode.pos[0],
          currentNode.pos[1] + 1,
          currentNode,
          1
        );
        this._addOrUpdateNode(
          currentNode.pos[0],
          currentNode.pos[1] - 1,
          currentNode,
          1
        );
        if (this._allowDiagonals) {
          this._addOrUpdateNode(
            currentNode.pos[0] + 1,
            currentNode.pos[1] + 1,
            currentNode,
            1.414213562
          );
          this._addOrUpdateNode(
            currentNode.pos[0] + 1,
            currentNode.pos[1] - 1,
            currentNode,
            1.414213562
          );
          this._addOrUpdateNode(
            currentNode.pos[0] - 1,
            currentNode.pos[1] - 1,
            currentNode,
            1.414213562
          );
          this._addOrUpdateNode(
            currentNode.pos[0] - 1,
            currentNode.pos[1] + 1,
            currentNode,
            1.414213562
          );
        }
      }

      /**
       * Get (or dynamically construct) a node.
       *
       * *All* nodes should be created using this method: The cost of the node is computed thanks
       * to the objects flagged as obstacles.
       */
      _getNode(xPos, yPos): Node {
        //First check if their is a node a the specified position.
        if (this._allNodes.hasOwnProperty(xPos)) {
          if (this._allNodes[xPos].hasOwnProperty(yPos)) {
            return this._allNodes[xPos][yPos];
          }
        } else {
          this._allNodes[xPos] = [];
        }

        //No so construct a new node (or get it from the cache)...
        // @ts-ignore
        let newNode: gdjs.PathfindingRuntimeBehavior.Node = null;
        if (this._nodeCache.length !== 0) {
          newNode = this._nodeCache.shift();
          newNode.reinitialize(xPos, yPos);
        } else {
          newNode = new gdjs.PathfindingRuntimeBehavior.Node(xPos, yPos);
        }

        //...and update its cost according to obstacles
        let objectsOnCell = false;
        const radius =
          this._cellHeight > this._cellWidth
            ? this._cellHeight * 2
            : this._cellWidth * 2;
        this._obstacles.getAllObstaclesAround(
          xPos * this._cellWidth,
          yPos * this._cellHeight,
          radius,
          this._closeObstacles
        );
        for (let k = 0; k < this._closeObstacles.length; ++k) {
          const obj = this._closeObstacles[k].owner;
          const topLeftCellX = Math.floor(
            (obj.getDrawableX() - this._rightBorder) / this._cellWidth
          );
          const topLeftCellY = Math.floor(
            (obj.getDrawableY() - this._bottomBorder) / this._cellHeight
          );
          const bottomRightCellX = Math.ceil(
            (obj.getDrawableX() + obj.getWidth() + this._leftBorder) /
              this._cellWidth
          );
          const bottomRightCellY = Math.ceil(
            (obj.getDrawableY() + obj.getHeight() + this._topBorder) /
              this._cellHeight
          );
          if (
            topLeftCellX < xPos &&
            xPos < bottomRightCellX &&
            topLeftCellY < yPos &&
            yPos < bottomRightCellY
          ) {
            objectsOnCell = true;

            //The cell is impassable, stop here.

            //Superimpose obstacles
            if (this._closeObstacles[k].isImpassable()) {
              newNode.cost = -1;
              break;
            } else {
              newNode.cost += this._closeObstacles[k].getCost();
            }
          }
        }
        if (!objectsOnCell) {
          newNode.cost = 1;
        }

        //Default cost when no objects put on the cell.
        this._allNodes[xPos][yPos] = newNode;
        return newNode;
      }

      /**
       * Add a node to the openNodes (only if the cost to reach it is less than the existing cost, if any).
       */
      _addOrUpdateNode(newNodeX, newNodeY, currentNode, factor) {
        const neighbor = this._getNode(newNodeX, newNodeY);

        //cost < 0 means impassable obstacle
        if (!neighbor.open || neighbor.cost < 0) {
          return;
        }

        //Update the node costs and parent if the path coming from currentNode is better:
        if (
          neighbor.smallestCost === -1 ||
          neighbor.smallestCost >
            currentNode.smallestCost +
              ((currentNode.cost + neighbor.cost) / 2.0) * factor
        ) {
          if (neighbor.smallestCost != -1) {
            //The node is already in the open list..
            for (let i = 0; i < this._openNodes.length; ++i) {
              if (
                this._openNodes[i].pos[0] == neighbor.pos[0] &&
                this._openNodes[i].pos[1] == neighbor.pos[1]
              ) {
                this._openNodes.splice(
                  i,
                  //..so remove it as its estimate cost will be updated.
                  1
                );
                break;
              }
            }
          }
          neighbor.smallestCost =
            currentNode.smallestCost +
            ((currentNode.cost + neighbor.cost) / 2.0) * factor;
          neighbor.parent = currentNode;
          neighbor.estimateCost =
            neighbor.smallestCost +
            this._distanceFunction(neighbor.pos, this._destination);

          //Add the neighbor to open nodes, which are sorted by their estimate cost:
          if (
            this._openNodes.length === 0 ||
            this._openNodes[this._openNodes.length - 1].estimateCost <
              neighbor.estimateCost
          ) {
            this._openNodes.push(neighbor);
          } else {
            for (let i = 0; i < this._openNodes.length; ++i) {
              if (this._openNodes[i].estimateCost >= neighbor.estimateCost) {
                this._openNodes.splice(i, 0, neighbor);
                break;
              }
            }
          }
        }
      }
    }
  }
}
