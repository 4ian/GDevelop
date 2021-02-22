/*
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * PathfindingRuntimeBehavior represents a behavior allowing objects to
   * follow a path computed to avoid obstacles.
   */
  export class PathfindingRuntimeBehavior extends gdjs.RuntimeBehavior {
    _path: Array<FloatPoint> = [];

    //Behavior configuration:
    _allowDiagonals: boolean;
    _acceleration: float;
    _maxSpeed: float;
    _angularMaxSpeed: float;
    _rotateObject: boolean;
    _angleOffset: float;
    _cellWidth: float;
    _cellHeight: float;
    _gridOffsetX: float;
    _gridOffsetY: float;
    _extraBorder: float;
    // @ts-ignore The setter "setCollisionMethod" is not detected as an affectation.
    _collisionMethod: integer;
    static LEGACY_COLLISION = 0;
    static HITBOX_COLLISION = 1;
    static AABB_COLLISION = 2;

    //Attributes used for traveling on the path:
    _pathFound: boolean = false;
    _speed: float = 0;
    _angularSpeed: float = 0;
    _timeOnSegment: float = 0;
    _totalSegmentTime: float = 0;
    _currentSegment: integer = 0;
    _reachedEnd: boolean = false;
    _manager: PathfindingObstaclesManager;
    _pathFinder: PathfindingRuntimeBehavior.AStarPathFinder;

    // @ts-ignore The setter "setViewpoint" is not detected as an affectation.
    _basisTransformation: PathfindingRuntimeBehavior.BasisTransformation;
    // @ts-ignore same
    _viewpoint: string;
    _temporaryPointForTransformations: FloatPoint = [0, 0];
    
    _graph: PathfindingRuntimeBehavior.GridGraph;
    _graphGrid: PathfindingRuntimeBehavior.RectangularGrid;
    _rectangularGraphGrid: PathfindingRuntimeBehavior.RectangularGrid;
    _nodeEvaluator: PathfindingRuntimeBehavior.CollisionNodeEvaluator;


    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
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
      this._gridOffsetX = behaviorData.gridOffsetX || 0;
      this._gridOffsetY = behaviorData.gridOffsetY || 0;
      this._extraBorder = behaviorData.extraBorder;
      this._manager = gdjs.PathfindingObstaclesManager.getManager(runtimeScene);
      
      this._rectangularGraphGrid = new PathfindingRuntimeBehavior.RectangularGrid();
      this._graphGrid = this._rectangularGraphGrid;
      this._graph = new PathfindingRuntimeBehavior.GridGraph(this._graphGrid);
      this._nodeEvaluator = new PathfindingRuntimeBehavior.CollisionNodeEvaluator(this._graph, this._manager);
      this._pathFinder = new gdjs.PathfindingRuntimeBehavior.AStarPathFinder(this._graph, this._nodeEvaluator);
      this._setViewpoint(
        behaviorData.viewpoint,
        behaviorData.cellWidth,
        behaviorData.cellHeight
      );
      this.setCollisionMethod(behaviorData.collisionMethod);
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
      if (oldBehaviorData.gridOffsetX !== newBehaviorData.gridOffsetX) {
        this._gridOffsetX = newBehaviorData.gridOffsetX;
      }
      if (oldBehaviorData.gridOffsetY !== newBehaviorData.gridOffsetY) {
        this._gridOffsetY = newBehaviorData.gridOffsetY;
      }
      if (oldBehaviorData.extraBorder !== newBehaviorData.extraBorder) {
        this.setExtraBorder(newBehaviorData.extraBorder);
      }
      if (
        oldBehaviorData.viewpoint !== newBehaviorData.viewpoint ||
        oldBehaviorData.cellWidth !== newBehaviorData.cellWidth ||
        oldBehaviorData.cellHeight !== newBehaviorData.cellHeight
      ) {
        this._setViewpoint(
          newBehaviorData.platformType,
          newBehaviorData.cellWidth,
          newBehaviorData.cellHeight
        );
      }
      if (oldBehaviorData.collisionMethod !== newBehaviorData.collisionMethod) {
        this.setCollisionMethod(newBehaviorData.collisionMethod);
      }
      return true;
    }

    _setViewpoint(
      viewpoint: string,
      cellWidth: float,
      cellHeight: float
    ): void {
      this._viewpoint = viewpoint;
      if (viewpoint == 'Isometry') {
        if (cellHeight >= cellWidth) {
          throw new RangeError(
            `The cell height (${cellHeight}) must be smaller than the cell width (${cellHeight}) for isometry.`
          );
        }
        this._basisTransformation = new PathfindingRuntimeBehavior.IsometryTransformation(
          Math.atan(cellHeight / cellWidth)
        );
        // calculate the square size from the diagonalX of the projected square
        // the square is 45° rotated, so 2 side length at 45° is:
        // 2*cos(pi/4) == sqrt(2)
        const isometricCellSize = cellWidth / Math.sqrt(2);
        // the ratio gives the isometry angle so it's always a square
        this._cellWidth = isometricCellSize;
        this._cellHeight = isometricCellSize;
      } else {
        this._basisTransformation = new PathfindingRuntimeBehavior.IdentityTransformation();
        this._cellWidth = cellWidth;
        this._cellHeight = cellHeight;
      }
    }

    setCollisionMethod(collisionMethod: string): void {
      if (collisionMethod == 'AABB') {
        this._collisionMethod = PathfindingRuntimeBehavior.AABB_COLLISION;
      } else if (collisionMethod == 'HitBoxes') {
        this._collisionMethod = PathfindingRuntimeBehavior.HITBOX_COLLISION;
      } else {
        this._collisionMethod = PathfindingRuntimeBehavior.LEGACY_COLLISION;
      }
    }

    setCellWidth(cellWidth: integer): void {
      this._setViewpoint(this._viewpoint, cellWidth, this._cellHeight);
    }

    getCellWidth(): integer {
      return this._cellWidth;
    }

    setCellHeight(cellHeight: integer): void {
      this._setViewpoint(this._viewpoint, this._cellWidth, cellHeight);
    }

    getCellHeight(): integer {
      return this._cellHeight;
    }

    getGridOffsetX(): integer {
      return this._gridOffsetX;
    }

    getGridOffsetY(): integer {
      return this._gridOffsetY;
    }

    setAcceleration(acceleration: float): void {
      this._acceleration = acceleration;
    }

    getAcceleration() {
      return this._acceleration;
    }

    setMaxSpeed(maxSpeed: float): void {
      this._maxSpeed = maxSpeed;
    }

    getMaxSpeed() {
      return this._maxSpeed;
    }

    setSpeed(speed: float): void {
      this._speed = speed;
    }

    getSpeed() {
      return this._speed;
    }

    setAngularMaxSpeed(angularMaxSpeed: float): void {
      this._angularMaxSpeed = angularMaxSpeed;
    }

    getAngularMaxSpeed() {
      return this._angularMaxSpeed;
    }

    setAngleOffset(angleOffset: float): void {
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

    allowDiagonals(allow: boolean) {
      this._allowDiagonals = allow;
    }

    diagonalsAllowed() {
      return this._allowDiagonals;
    }

    setRotateObject(allow: boolean): void {
      this._rotateObject = allow;
    }

    isObjectRotated(): boolean {
      return this._rotateObject;
    }

    getNodeX(index: integer): float {
      if (index < this._path.length) {
        return this._path[index][0];
      }
      return 0;
    }

    getNodeY(index: integer): float {
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
        return this._path[this._path.length - 1][0];
      }
    }

    getNextNodeY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      if (this._currentSegment + 1 < this._path.length) {
        return this._path[this._currentSegment + 1][1];
      } else {
        return this._path[this._path.length - 1][1];
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
      return this._path[this._path.length - 1][0];
    }

    getDestinationY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path[this._path.length - 1][1];
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
    moveTo(runtimeScene: gdjs.RuntimeScene, x: float, y: float) {
      const owner = this.owner;

      //First be sure that there is a path to compute.
      const tempPoint = this._temporaryPointForTransformations;
      tempPoint[0] = x;
      tempPoint[1] = y;
      this._graph.getCellIndex(tempPoint);
      const targetCellX = tempPoint[0];
      const targetCellY = tempPoint[1];
      
      tempPoint[0] = owner.getX();
      tempPoint[1] = owner.getY();
      this._graph.getCellIndex(tempPoint);
      const startCellX = tempPoint[0];
      const startCellY = tempPoint[1];
      
      if (startCellX == targetCellX && startCellY == targetCellY) {
        this._path.length = 0;
        this._path.push([owner.getX(), owner.getY()]);
        this._path.push([x, y]);
        this._enterSegment(0);
        this._pathFound = true;
        return;
      }

      //Start searching for a path
      
      this._rectangularGraphGrid._allowDiagonals = this._allowDiagonals;
      this._pathFinder.allowDiagonals(this._allowDiagonals);
      this._pathFinder.setStartPosition(owner.getX(), owner.getY());
      this._graphGrid.setOffset(this._gridOffsetX, this._gridOffsetY);
      this._graphGrid.setCellSize(this._cellWidth, this._cellHeight);
      this._graphGrid.setBasisTransformation(this._basisTransformation);
      this._nodeEvaluator.setCollisionMethod(this._collisionMethod);
      if (this._collisionMethod == PathfindingRuntimeBehavior.LEGACY_COLLISION) {
        this._nodeEvaluator.setObjectSize(
          owner.getX() - owner.getDrawableX() + this._extraBorder,
          owner.getY() - owner.getDrawableY() + this._extraBorder,
          owner.getWidth() -
            (owner.getX() - owner.getDrawableX()) +
            this._extraBorder,
          owner.getHeight() -
            (owner.getY() - owner.getDrawableY()) +
            this._extraBorder
        );
      } else {
        const copyHitboxes = PathfindingRuntimeBehavior.deepCloneHitboxes(
          owner.getHitBoxes()
        );
        for (let pi = 0; pi < copyHitboxes.length; ++pi) {
          copyHitboxes[pi].move(-owner.getX(), -owner.getY());
        }
        this._nodeEvaluator.setObjectHitBoxes(copyHitboxes);
        
        const aabb = owner.getAABB();
        this._nodeEvaluator.setObjectSize(
          owner.getX() - aabb.min[0] + this._extraBorder,
          owner.getY() - aabb.min[1] + this._extraBorder,
          aabb.max[0] - owner.getX() + this._extraBorder,
          aabb.max[1] - owner.getY() + this._extraBorder
        );
      }
      
      if (this._nodeEvaluator._obstacles === null) {
        console.log(
          'You tried to compute a path without specifying the obstacles'
        );
        return;
      }
      if (this._pathFinder.computePathTo(x, y)) {
        //Path found: memorize it
        let node = this._pathFinder.getFinalNode();
        let finalPathLength = 0;
        while (node) {
          if (finalPathLength === this._path.length) {
            this._path.push([0, 0]);
          }
          this._path[finalPathLength][0] = node.center[0];
          this._path[finalPathLength][1] = node.center[1];
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

    static deepCloneHitboxes(hitboxes: Polygon[]): Polygon[] {
      const copyHitboxes = new Array<gdjs.Polygon>(hitboxes.length);
      for (let pi = 0; pi < hitboxes.length; ++pi) {
        copyHitboxes[pi] = gdjs.Polygon.deepClone(hitboxes[pi]);
      }
      return copyHitboxes;
    }

    _enterSegment(segmentNumber: integer) {
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

    doStepPreEvents(runtimeScene: gdjs.RuntimeScene) {
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

    doStepPostEvents(runtimeScene: gdjs.RuntimeScene) {}

    /**
     * Compute the euclidean distance between two positions.
     * @memberof gdjs.PathfindingRuntimeBehavior
     */
    static euclideanDistance(a: FloatPoint, b: FloatPoint) {
      return Math.sqrt(
        (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])
      );
    }

    /**
     * Compute the taxi distance between two positions.
     * @memberof gdjs.PathfindingRuntimeBehavior
     */
    static manhattanDistance(a: FloatPoint, b: FloatPoint) {
      return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }
  }
  gdjs.registerBehavior(
    'PathfindingBehavior::PathfindingBehavior',
    gdjs.PathfindingRuntimeBehavior
  );

  export namespace PathfindingRuntimeBehavior {

    /**
     * A-Star path finding algorithm
     */
    export class AStarPathFinder {
      _graph: GridGraph;
      _nodeEvaluator: NodeEvaluator;
      _startX: float = 0;
      _startY: float = 0;
      _startIndex: FloatPoint = [0, 0];
      _destinationIndex: FloatPoint = [0, 0];
      _finalNode: Node | null = null;
      _maxComplexityFactor: integer = 50;
      _distanceFunction: (pt1: FloatPoint, pt2: FloatPoint) => float;
      /** Temporary variable that contains the neighbors to be evaluated */
      _neighbors: Node[] = [];
      /** An array of nodes sorted by their estimate cost (First node = Lower estimate cost). */
      _openNodes: Node[] = [];

      constructor(graph: GridGraph, nodeEvaluator: NodeEvaluator) {
        this._graph = graph;
        this._nodeEvaluator = nodeEvaluator;
        this._distanceFunction = PathfindingRuntimeBehavior.euclideanDistance;
      }

      getFinalNode() {
        return this._finalNode;
      }

      allowDiagonals(allowDiagonals: boolean) {
        this._distanceFunction = allowDiagonals
          ? PathfindingRuntimeBehavior.euclideanDistance
          : PathfindingRuntimeBehavior.manhattanDistance;
        return this;
      }

      setStartPosition(
        x: float,
        y: float
      ): PathfindingRuntimeBehavior.AStarPathFinder {
        this._startX = x;
        this._startY = y;
        return this;
      }

      computePathTo(targetX: float, targetY: float) {
        this._destinationIndex[0] = targetX;
        this._destinationIndex[1] = targetY;
        this._graph.getCellIndex(this._destinationIndex);
        this._startIndex[0] = this._startX;
        this._startIndex[1] = this._startY;
        this._graph.getCellIndex(this._startIndex);

        //Initialize the algorithm
        this._graph.freeAllNodes();
        const startNode = this._graph.getNode(this._startIndex[0], this._startIndex[1]);
        startNode.cost = this._nodeEvaluator.evaluateNode(startNode);
        startNode.smallestCost = 0;
        startNode.estimateCost =
          0 + this._distanceFunction(this._startIndex, this._destinationIndex);
        this._openNodes.length = 0;
        this._openNodes.push(startNode);

        //A* algorithm main loop
        let iterationCount = 0;
        const maxIterationCount =
          startNode.estimateCost * this._maxComplexityFactor;
        while (this._openNodes.length !== 0) {
          //console.log(`Open nodes: ${this._openNodes.length}`);
          //Make sure we do not search forever.
          if (iterationCount++ > maxIterationCount) {
            console.log(`Stop search at ${maxIterationCount} iterations`);
            return false;
          }

          //Get the most promising node...
          const n = this._openNodes.shift()!;
          //...and flag it as explored
          n.open = false;

          //Check if we reached destination?
          if (
            n.index[0] == this._destinationIndex[0] &&
            n.index[1] == this._destinationIndex[1]
          ) {
            this._finalNode = n;
            //TODO build the path to an out parameter
            return true;
          }

          //No, so add neighbors to the nodes to explore.
          this._neighbors.length = 0;
          this._graph.getNeighbors(n, this._neighbors);
          this._addNewOpenNodes(this._neighbors, n);
          
        }
        return false;
      }
      
      /**
       * Add a node to the openNodes (only if the cost to reach it is less than the existing cost, if any).
       */
      _addNewOpenNodes(
        neighbors: Node[],
        currentNode: Node
      ) {
        for (const neighbor of neighbors) {
          neighbor.cost = this._nodeEvaluator.evaluateNode(neighbor);
          //console.debug(`Add (${neighbor.pos[0]}, ${neighbor.pos[1]}) to open nodes?`);

          //cost < 0 means impassable obstacle
          if (!neighbor.open || neighbor.cost < 0) {
            continue;
          }
  
          //Update the node costs and parent if the path coming from currentNode is better:
          if (
            neighbor.smallestCost === -1 ||
            neighbor.smallestCost >
              currentNode.smallestCost +
                ((currentNode.cost + neighbor.cost) / 2.0) * neighbor.factor
          ) {
            if (neighbor.smallestCost != -1) {
              //The node is already in the open list..
              for (let i = 0; i < this._openNodes.length; ++i) {
                if (
                  this._openNodes[i].index[0] == neighbor.index[0] &&
                  this._openNodes[i].index[1] == neighbor.index[1]
                ) {
                  //..so remove it as its estimate cost will be updated.
                  this._openNodes.splice(i, 1);
                  break;
                }
              }
            }
            neighbor.smallestCost =
              currentNode.smallestCost +
              ((currentNode.cost + neighbor.cost) / 2.0) * neighbor.factor;
            neighbor.parent = currentNode;
            neighbor.estimateCost =
              neighbor.smallestCost +
              this._distanceFunction(neighbor.index, this._destinationIndex);
  
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
    
    /**
     * Decide which node is passable and it's cost
     */
    export interface NodeEvaluator {
      evaluateNode(node: Node): float;
    }
    
    /**
     * Decide which node is passable and it's cost according to obstacles defined in {@link PathfindingObstaclesManager}
     */
    export class CollisionNodeEvaluator implements NodeEvaluator {
      _graph: GridGraph;
      _obstacles: PathfindingObstaclesManager;
      _collisionMethod: integer = PathfindingRuntimeBehavior.AABB_COLLISION;
      
      // used for legacy and AABB collision methods
      _leftBorder: integer = 0;
      _rightBorder: integer = 0;
      _topBorder: integer = 0;
      _bottomBorder: integer = 0;
      /**
       * Translation image of the borders
       * moved from cell to cell to evaluate them
       */
      _stampAABB: AABB = { min: [0, 0], max: [0, 0] };
      
      /**
       * Hitboxes relative to the object origin
       * used for hitbox collision method
       */
      _objectHitboxes: Polygon[] = [];
      /**
       * Translation image of _objectHitboxes
       * moved from cell to cell to evaluate them
       */
      _stampHitboxes: Polygon[] = [];
      
      /** Used by evaluateNode to temporarily store obstacles near a position. */
      _closeObstacles: PathfindingObstacleRuntimeBehavior[] = [];
      
      constructor(graph: GridGraph, obstacles: PathfindingObstaclesManager) {
        this._graph = graph;
        this._obstacles = obstacles;
      }

      setObjectSize(
        leftBorder: integer,
        topBorder: integer,
        rightBorder: integer,
        bottomBorder: integer
      ) {
        this._leftBorder = leftBorder;
        this._rightBorder = rightBorder;
        this._topBorder = topBorder;
        this._bottomBorder = bottomBorder;
      }

      setObjectHitBoxes(objectHitboxes: Polygon[]) {
        this._objectHitboxes = objectHitboxes;
        this._stampHitboxes = PathfindingRuntimeBehavior.deepCloneHitboxes(this._objectHitboxes);
        // FIXME just for tests
        //console.debug("setObjectHitBoxes: %s", objectHitboxes[0].vertices);
      }
      
      setCollisionMethod(collisionMethod: integer) {
        this._collisionMethod = collisionMethod;
      }

      evaluateNode(node: Node): float {
        const indexX = node.index[0];
        const indexY = node.index[1];
        const nodeCenter = node.center;
        
        let objectsOnCell = false;
        
        if (this._collisionMethod == PathfindingRuntimeBehavior.LEGACY_COLLISION) {
          // The legacy will only be allowed on rectangular grid
          const grid = (this._graph!._grid! as RectangularGrid);
          // An evaluator should not depend on grid precision
          // this smells bad but well it's deprecated, no need to make it right
          const cellWidth = grid._cellWidth;
          const cellHeight = grid._cellHeight;
        
          const radius =
            cellHeight > cellWidth
              ? cellHeight * 2
              : cellWidth * 2;
          this._obstacles.getAllObstaclesAround(
            nodeCenter[0],
            nodeCenter[1],
            radius,
            this._closeObstacles
          );
        }
        else {
            this._stampAABB.min[0] = nodeCenter[0] - this._leftBorder;
            this._stampAABB.min[1] = nodeCenter[1] - this._topBorder;
            this._stampAABB.max[0] = nodeCenter[0] + this._rightBorder;
            this._stampAABB.max[1] = nodeCenter[1] + this._bottomBorder;
            this._obstacles.getAllObstaclesAroundAABB(this._stampAABB, this._closeObstacles);
        }
        //console.debug(`Evaluate (${xPos}, ${yPos}) center:${node.center} ${this._closeObstacles.length} obstacles`);
        
        let cost: float = 0;
        for (let k = 0; k < this._closeObstacles.length; ++k) {
          const obj = this._closeObstacles[k].owner;
          
          if (this._collisionMethod == PathfindingRuntimeBehavior.LEGACY_COLLISION) {
          // The legacy will only be allowed on rectangular grid
          const grid = (this._graph!._grid! as RectangularGrid);
          // An evaluator should not depend on grid precision
          // this smells bad but well it's deprecated, no need to make it right
          const cellWidth = grid._cellWidth;
          const cellHeight = grid._cellHeight;
          
          const topLeftCellX = Math.floor(
            (obj.getDrawableX() - this._rightBorder) / cellWidth
          );
          const topLeftCellY = Math.floor(
            (obj.getDrawableY() - this._bottomBorder) / cellHeight
          );
          const bottomRightCellX = Math.ceil(
            (obj.getDrawableX() + obj.getWidth() + this._leftBorder) /
              cellWidth
          );
          const bottomRightCellY = Math.ceil(
            (obj.getDrawableY() + obj.getHeight() + this._topBorder) /
              cellHeight
          );

          objectsOnCell = topLeftCellX < indexX &&
            indexX < bottomRightCellX &&
            topLeftCellY < indexY &&
            indexY < bottomRightCellY;
          }
          else {
            if (this._collisionMethod == PathfindingRuntimeBehavior.HITBOX_COLLISION) {
              this._moveStampHitBoxesTo(nodeCenter[0], nodeCenter[1]);
              objectsOnCell = this._checkCollisionWithStamp(obj.getHitBoxes());
              
            }
            else if (this._collisionMethod == PathfindingRuntimeBehavior.AABB_COLLISION) {
              // this is needed to exclude touching edges
              const obstacleAABB = obj.getAABB();
              objectsOnCell = 
              obstacleAABB.min[0] < this._stampAABB.max[0]
            && obstacleAABB.max[0] > this._stampAABB.min[0]
            && obstacleAABB.min[1] < this._stampAABB.max[1]
            && obstacleAABB.max[1] > this._stampAABB.min[1];
            }
          }
          if (objectsOnCell) {
            if (this._closeObstacles[k].isImpassable()) {
              //The cell is impassable, stop here.
              cost = -1;
              break;
            } else {
              //Superimpose obstacles
              cost += this._closeObstacles[k].getCost();
            }
          }
        }
        if (!objectsOnCell) {
          cost = 1;
        }

        return cost;
      }
      
      _moveStampHitBoxesTo(x: float, y: float) {
        for (let pi = 0; pi < this._objectHitboxes.length; ++pi) {
          const objectPolygon = this._objectHitboxes[pi];
          const stampPolygon = this._stampHitboxes[pi];
          for (let vi = 0; vi < objectPolygon.vertices.length; ++vi) {
            const objectPoint = objectPolygon.vertices[vi];
            const stampPoint = stampPolygon.vertices[vi];
            stampPoint[0] = objectPoint[0] + x;
            stampPoint[1] = objectPoint[1] + y;
          }
        }
      }

      _checkCollisionWithStamp(hitboxes: Polygon[]): boolean {
        const hitBoxes1 = this._stampHitboxes;
        const hitBoxes2 = hitboxes;
        for (let k = 0, lenBoxes1 = hitBoxes1.length; k < lenBoxes1; ++k) {
          for (let l = 0, lenBoxes2 = hitBoxes2.length; l < lenBoxes2; ++l) {
            if (
              gdjs.Polygon.collisionTest(hitBoxes1[k], hitBoxes2[l], true)
                .collision
            ) {
              return true;
            }
          }
        }
        return false;
      }
    }

    /**
     * Internal tool class representing a node when looking for a path
     */
    export class Node {
      index: FloatPoint;
      center: FloatPoint = [0, 0];
      cost: integer = 0;
      smallestCost: integer = -1;
      estimateCost: integer = -1;
      parent: Node | null = null;
      open: boolean = true;
      factor: float = 1;

      constructor(xPos: integer, yPos: integer) {
        this.index = [xPos, yPos];
      }

      reinitialize(xPos: integer, yPos: integer) {
        this.index[0] = xPos;
        this.index[1] = yPos;
        this.cost = 0;
        this.smallestCost = -1;
        this.estimateCost = -1;
        this.parent = null;
        this.open = true;
      }
    }
    
    /**
     * Data structure of a graph with nodes organized into a grid.
     * The grid logic is delegated to a {@link Grid}.
     */
    export class GridGraph {
      /** An array of array. Nodes are indexed by their x position, and then by their y position. */
      _allNodes: Node[][] = [];
      /** Old nodes constructed in a previous search are stored here to avoid temporary objects (see freeAllNodes method). */
      _nodeCache: Node[] = [];
      
      _grid: Grid;
      
      constructor(grid: Grid) {
        this._grid = grid;
        this._grid.setGraph(this);
      }

      /**
       * Get (or dynamically construct) a node.
       *
       * *All* nodes should be created using this method
       */
      getNode(xPos: integer, yPos: integer): Node {
        //First check if their is a node a the specified position.
        if (this._allNodes.hasOwnProperty(xPos)) {
          if (this._allNodes[xPos].hasOwnProperty(yPos)) {
            return this._allNodes[xPos][yPos];
          }
        } else {
          this._allNodes[xPos] = [];
        }

        //No so construct a new node (or get it from the cache)...
        let newNode: Node;
        if (this._nodeCache.length !== 0) {
          newNode = this._nodeCache.shift()!;
          newNode.reinitialize(xPos, yPos);
        } else {
          newNode = new Node(xPos, yPos);
        }

        //Default cost when no objects put on the cell.
        this._allNodes[xPos][yPos] = newNode;
        return newNode;
      }
      
      getNeighbors(currentNode: Node, result: Node[]) {
        this._grid.getNeighbors(currentNode, result);
      }
      
      getCellIndex(position: FloatPoint, index?: FloatPoint) {
        this._grid.getCellIndex(position, index);
      }
      
      getCellCenter(index: FloatPoint, position?: FloatPoint) {
        this._grid.getCellCenter(index, position);
      }
      
      freeAllNodes() {
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
        this._allNodes = [];
      }
    }

    /**
     * The grid logic of the graph.
     * Define how nodes are linked to one another
     * and the mapping between coordinates and node indexes.
     */
    export interface Grid {
      getCellIndex(position: FloatPoint, index?: FloatPoint): void;
      getCellCenter(index: FloatPoint, position?: FloatPoint): void;
      getNeighbors(currentNode: Node, result: Node[]): void;
      setGraph(graph: GridGraph): void;
    }
    
    /**
     * A rectangular grid logic.
     * Define how nodes are linked to one another
     * and the mapping between coordinates and node indexes.
     */
    export class RectangularGrid implements Grid {
      static _withoutDiagonalsDeltas: FloatPoint[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      static _withDiagonalsDeltas: FloatPoint[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]];
      
      _graph: GridGraph | null = null;
      _allowDiagonals: boolean = true;
      _offsetX: float = 0;
      _offsetY: float = 0;
      _cellWidth: float = 20;
      _cellHeight: float = 20;
      _basisTransformation: PathfindingRuntimeBehavior.BasisTransformation = new PathfindingRuntimeBehavior.IdentityTransformation();
      
      setGraph(graph: GridGraph) {
        this._graph = graph;
      }
      
      setBasisTransformation(basisTransformation: PathfindingRuntimeBehavior.BasisTransformation) {
        this._basisTransformation = basisTransformation;
      }
      
      setCellSize(
        cellWidth: float,
        cellHeight: float
      ) {
        this._cellWidth = cellWidth;
        this._cellHeight = cellHeight;
      }

      setOffset(
        offsetX: float,
        offsetY: float
      ) {
        this._offsetX = offsetX;
        this._offsetY = offsetY;
      }

      getCellIndex(position: FloatPoint, index?: FloatPoint) {
        if (!index) {
          index = position;
        }
        position[0] -= this._offsetX;
        position[1] -= this._offsetY;
        this._basisTransformation.toWorld(position, index);
        index[0] = Math.round(index[0] / this._cellWidth);
        index[1] = Math.round(index[1] / this._cellHeight);
      }
      
      getCellCenter(index: FloatPoint, position?: FloatPoint) {
        if (!position) {
          position = index;
        }
        position[0] = index[0] * this._cellWidth;
        position[1] = index[1] * this._cellHeight;
        this._basisTransformation.toScreen(position);
        position[0] += this._offsetX;
        position[1] += this._offsetY;
      }

      getNeighbors(currentNode: Node, result: Node[]) {
        const deltas: FloatPoint[] = this._allowDiagonals ? RectangularGrid._withDiagonalsDeltas
                                                          : RectangularGrid._withoutDiagonalsDeltas;
        for (const delta of deltas) {
          let node = this._graph!.getNode(
            currentNode.index[0] + delta[0],
            currentNode.index[1] + delta[1]
          );
          node.factor = 1;
          this.getCellCenter(node.index, node.center);
          result.push(node);
        }
      }
    }

    export interface BasisTransformation {
      toScreen(worldPoint: FloatPoint, screenPoint: FloatPoint): void;

      toWorld(screenPoint: FloatPoint, worldPoint: FloatPoint): void;

      toScreen(worldPoint: FloatPoint): void;

      toWorld(screenPoint: FloatPoint): void;
    }

    export class IdentityTransformation implements BasisTransformation {
      toScreen(worldPoint: FloatPoint, screenPoint?: FloatPoint): void {
        if (screenPoint) {
          screenPoint[0] = worldPoint[0];
          screenPoint[1] = worldPoint[1];
        }
      }

      toWorld(screenPoint: FloatPoint, worldPoint?: FloatPoint): void {
        if (worldPoint) {
          worldPoint[0] = screenPoint[0];
          worldPoint[1] = screenPoint[1];
        }
      }
    }

    export class IsometryTransformation implements BasisTransformation {
      _screen: float[][];
      _world: float[][];

      /**
       * @param angle between the x axis and the projected isometric x axis.
       * @throws if the angle is not in ]0; pi/4[. Note that 0 is a front viewpoint and pi/4 a top-down viewpoint.
       */
      constructor(angle: float) {
        if (angle <= 0 || angle >= Math.PI / 4)
          throw new RangeError(
            'An isometry angle must be in ]0; pi/4] but was: ' + angle
          );

        const alpha = Math.asin(Math.tan(angle));
        const sinA = Math.sin(alpha);
        const cosB = Math.cos(Math.PI / 4);
        const sinB = Math.sin(Math.PI / 4);
        /* https://en.wikipedia.org/wiki/Isometric_projection
         *
         *   / 1     0    0 \ / cosB 0 -sinB \ / 1 0  0 \
         *   | 0  cosA sinA | |    0 1     0 | | 0 0 -1 |
         *   \ 0 -sinA cosA / \ sinB 0  cosB / \ 0 1  0 /
         */
        this._screen = [
          [cosB, -sinB],
          [sinA * sinB, sinA * cosB],
        ];
        // invert
        this._world = [
          [cosB, sinB / sinA],
          [-sinB, cosB / sinA],
        ];
      }

      toScreen(worldPoint: FloatPoint, screenPoint?: FloatPoint): void {
        if (!screenPoint) {
          screenPoint = worldPoint;
        }
        const x =
          this._screen[0][0] * worldPoint[0] +
          this._screen[0][1] * worldPoint[1];
        const y =
          this._screen[1][0] * worldPoint[0] +
          this._screen[1][1] * worldPoint[1];
        screenPoint[0] = x;
        screenPoint[1] = y;
      }

      toWorld(screenPoint: FloatPoint, worldPoint?: FloatPoint): void {
        if (!worldPoint) {
          worldPoint = screenPoint;
        }
        const x =
          this._world[0][0] * screenPoint[0] +
          this._world[0][1] * screenPoint[1];
        const y =
          this._world[1][0] * screenPoint[0] +
          this._world[1][1] * screenPoint[1];
        worldPoint[0] = x;
        worldPoint[1] = y;
      }
    }
  }
}
