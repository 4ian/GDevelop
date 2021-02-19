// I don't know how to share utility methods
const addObstacleSprite3 = (runtimeScene, objectCenteredOnCells) => {
  var obstacle = new gdjs.SpriteRuntimeObject(runtimeScene, {
    name: 'obstacle',
    type: '',
    animations: [
      {
        name: 'animation',
        directions: [
          {
            sprites: [
              {
                originPoint: objectCenteredOnCells
                  ? { x: 80, y: 80 }
                  : { x: 87, y: 87 },
                centerPoint: { x: 80, y: 80 },
                points: [
                  { name: 'Center', x: 80, y: 80 },
                  objectCenteredOnCells
                    ? { name: 'Origin', x: 80, y: 80 }
                    : { name: 'Origin', x: 87, y: 87 },
                ],
                hasCustomCollisionMask: false,
              },
            ],
          },
        ],
      },
    ],
    behaviors: [
      {
        type: 'PathfindingBehavior::PathfindingObstacleBehavior',
        impassable: true,
        cost: 2,
      },
    ],
  });
  obstacle.getWidth = function () {
    return 160;
  };
  obstacle.getHeight = function () {
    return 160;
  };
  runtimeScene.addObject(obstacle);

  return obstacle;
};

const doTestsLegacypathfindingruntimebehavior = (
  cellSize,
  objectCenteredOnCells,
  direction
) => {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: { resources: [] },
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [{ name: '', visibility: true, effects: [] }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
  });
  runtimeScene._timeManager.getElapsedTime = function () {
    return (1 / 60) * 1000;
  };

  const pathFindingName = 'auto1';
  const player = new gdjs.SpriteRuntimeObject(runtimeScene, {
    name: 'player',
    type: '',
    animations: [
      {
        name: 'animation',
        directions: [
          {
            sprites: [
              {
                originPoint: objectCenteredOnCells
                  ? { x: 80, y: 80 }
                  : { x: 87, y: 87 },
                centerPoint: { x: 80, y: 80 },
                points: [
                  { name: 'Center', x: 80, y: 80 },
                  objectCenteredOnCells
                    ? { name: 'Origin', x: 80, y: 80 }
                    : { name: 'Origin', x: 87, y: 87 },
                ],
                hasCustomCollisionMask: false,
              },
            ],
          },
        ],
      },
    ],
    behaviors: [
      {
        type: 'PathfindingBehavior::PathfindingBehavior',
        name: pathFindingName,
        allowDiagonals: false,
        acceleration: 400,
        maxSpeed: 200,
        angularMaxSpeed: 180,
        rotateObject: false,
        angleOffset: 0,
        cellWidth: cellSize,
        cellHeight: cellSize,
        extraBorder: 0
      },
    ],
  });
  player.getWidth = function () {
    return 160;
  };
  player.getHeight = function () {
    return 160;
  };
  runtimeScene.addObject(player);

  const obstacle = addObstacleSprite3(runtimeScene, objectCenteredOnCells);

  let playerLeftBorder;
  let playerRightBorder;
  let playerTopBorder;
  let playerBottomBorder;

  let obstacleLeftBorder;
  let obstacleRightBorder;
  let obstacleTopBorder;
  let obstacleBottomBorder;

  if (cellSize == 160) {
    if (objectCenteredOnCells) {
      playerLeftBorder = 80;
      playerRightBorder = 80;
      playerTopBorder = 80;
      playerBottomBorder = 80;
    } else {
      playerLeftBorder = 87;
      playerRightBorder = 73;
      playerTopBorder = 87;
      playerBottomBorder = 73;
    }
  } else {
    // The player radius is at most 2 cells
    playerLeftBorder = 2 * cellSize;
    playerRightBorder = 2 * cellSize;
    playerTopBorder = 2 * cellSize;
    playerBottomBorder = 2 * cellSize;
  }

  if (objectCenteredOnCells) {
    obstacleLeftBorder = 80;
    obstacleRightBorder = 80;
    obstacleTopBorder = 80;
    obstacleBottomBorder = 80;
  } else {
    obstacleLeftBorder = 87;
    obstacleRightBorder = 73;
    obstacleTopBorder = 87;
    obstacleBottomBorder = 73;
  }

  let inclusiveMargin;
  if (cellSize == 160) {
    // The collision is strict
    inclusiveMargin = 0;
  } else {
    // The collision is not strict
    inclusiveMargin = 1;
  }

  // multiple of 20 and 160
  const playerX = 480;
  const playerY = 320;

  it('can find a path with an obstacle near the start', function () {
    let obstacleX;
    let obstacleY;
    let targetX;
    let targetY;
    switch (direction) {
      case 'right':
        // right on the player right
        obstacleX = playerX + playerRightBorder + obstacleLeftBorder;
        obstacleY = playerY;
        targetX = playerX - 2 * cellSize;
        targetY = playerY;
        break;
      case 'left':
        obstacleX = playerX - playerLeftBorder - obstacleRightBorder;
        obstacleY = playerY;
        targetX = playerX + 2 * cellSize;
        targetY = playerY;
        break;
      case 'up':
        obstacleX = playerX;
        obstacleY = playerY - playerTopBorder - obstacleBottomBorder;
        targetX = playerX;
        targetY = playerY + 2 * cellSize;
        break;
      case 'down':
        obstacleX = playerX;
        obstacleY = playerY + playerBottomBorder + obstacleTopBorder;
        targetX = playerX;
        targetY = playerY - 2 * cellSize;
        break;
    }

    obstacle.setPosition(obstacleX, obstacleY);
    // so obstacles register
    runtimeScene.renderAndStep(1000 / 60);

    // move away from the obstacle
    player.setPosition(playerX, playerY);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, targetX, targetY);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(3);
  });

  it('can find a path when an obstacle is overlaping only at the start', function () {
    let obstacleX;
    let obstacleY;
    let targetX;
    let targetY;
    switch (direction) {
      case 'right':
        // The obstacle will be right on the player right after the first step.
        // So, it's overlaping the player by one cell lengt at start.
        obstacleX =
          playerX +
          playerRightBorder +
          obstacleLeftBorder -
          cellSize +
          inclusiveMargin;
        obstacleY = playerY;
        targetX = playerX - 2 * cellSize;
        targetY = playerY;
        break;
      case 'left':
        obstacleX =
          playerX -
          playerLeftBorder -
          obstacleRightBorder +
          cellSize -
          inclusiveMargin;
        obstacleY = playerY;
        targetX = playerX + 2 * cellSize;
        targetY = playerY;
        break;
      case 'up':
        obstacleX = playerX;
        obstacleY =
          playerY -
          playerTopBorder -
          obstacleBottomBorder +
          cellSize -
          inclusiveMargin;
        targetX = playerX;
        targetY = playerY + 2 * cellSize;
        break;
      case 'down':
        obstacleX = playerX;
        obstacleY =
          playerY +
          playerBottomBorder +
          obstacleTopBorder -
          cellSize +
          inclusiveMargin;
        targetX = playerX;
        targetY = playerY - 2 * cellSize;
        break;
    }

    obstacle.setPosition(obstacleX, obstacleY);
    // so obstacles register
    runtimeScene.renderAndStep(1000 / 60);

    // move away from the obstacle
    player.setPosition(playerX, playerY);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, targetX, targetY);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(3);
  });

  it("mustn't find a path when an obstacle is slightly overlaping the only first cell to go", function () {
    let obstacleX;
    let obstacleY;
    let targetX;
    let targetY;
    switch (direction) {
      case 'right':
        // The obstacle will be right on the player right after the first step.
        // So, it's overlaping the player by one cell lengt at start.
        obstacleX =
          playerX +
          playerRightBorder +
          obstacleLeftBorder -
          cellSize +
          inclusiveMargin -
          1;
        obstacleY = playerY;
        targetX = playerX - 2 * cellSize;
        targetY = playerY;
        break;
      case 'left':
        obstacleX =
          playerX -
          playerLeftBorder -
          obstacleRightBorder +
          cellSize -
          inclusiveMargin +
          1;
        obstacleY = playerY;
        targetX = playerX + 2 * cellSize;
        targetY = playerY;
        break;
      case 'up':
        obstacleX = playerX;
        obstacleY =
          playerY -
          playerTopBorder -
          obstacleBottomBorder +
          cellSize -
          inclusiveMargin +
          1;
        targetX = playerX;
        targetY = playerY + 2 * cellSize;
        break;
      case 'down':
        obstacleX = playerX;
        obstacleY =
          playerY +
          playerBottomBorder +
          obstacleTopBorder -
          cellSize +
          inclusiveMargin -
          1;
        targetX = playerX;
        targetY = playerY - 2 * cellSize;
        break;
    }

    obstacle.setPosition(obstacleX, obstacleY);
    // so obstacles register
    runtimeScene.renderAndStep(1000 / 60);

    // move away from the obstacle
    player.setPosition(playerX, playerY);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, targetX, targetY);
    if (cellSize == 160) {
      // The obstacle is the size of the cell so the player can bypass it.
      expect(player.getBehavior(pathFindingName).getNodeCount()).to.be.above(3);
    } else {
      expect(player.getBehavior(pathFindingName).pathFound()).to.be(false);
    }
  });

  it('can find a path with an obstacle adjacent to the target', function () {
    let obstacleX;
    let obstacleY;
    let targetX;
    let targetY;
    switch (direction) {
      case 'right':
        targetX = playerX + 2 * cellSize;
        targetY = playerY;
        // will be right on the player right at the end
        obstacleX =
          targetX + playerRightBorder + obstacleLeftBorder + inclusiveMargin;
        obstacleY = playerY;
        break;
      case 'left':
        targetX = playerX - 2 * cellSize;
        targetY = playerY;
        obstacleX =
          targetX - playerRightBorder - obstacleLeftBorder - inclusiveMargin;
        obstacleY = playerY;
        break;
      case 'up':
        targetX = playerX;
        targetY = playerY - 2 * cellSize;
        obstacleX = playerX;
        obstacleY =
          targetY - playerTopBorder - obstacleBottomBorder - inclusiveMargin;
        break;
      case 'down':
        targetX = playerX;
        targetY = playerY + 2 * cellSize;
        obstacleX = playerX;
        obstacleY =
          targetY + playerBottomBorder + obstacleTopBorder + inclusiveMargin;
        break;
    }

    obstacle.setPosition(obstacleX, obstacleY);
    // so obstacles register
    runtimeScene.renderAndStep(1000 / 60);

    // move as close as possible to the obstacle
    player.setPosition(playerX, playerY);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, targetX, targetY);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(3);
  });

  it("mustn't find a path with an obstacle slightly overlaping to the target", function () {
    let obstacleX;
    let obstacleY;
    let targetX;
    let targetY;
    switch (direction) {
      case 'right':
        targetX = playerX + 2 * cellSize;
        targetY = playerY;
        obstacleX =
          targetX +
          playerRightBorder +
          obstacleLeftBorder +
          inclusiveMargin -
          1;
        obstacleY = playerY;
        break;
      case 'left':
        targetX = playerX - 2 * cellSize;
        targetY = playerY;
        obstacleX =
          targetX -
          playerLeftBorder -
          obstacleRightBorder -
          inclusiveMargin +
          1;
        obstacleY = playerY;
        break;
      case 'up':
        targetX = playerX;
        targetY = playerY - 2 * cellSize;
        obstacleX = playerX;
        obstacleY =
          targetY -
          playerTopBorder -
          obstacleBottomBorder -
          inclusiveMargin +
          1;
        break;
      case 'down':
        targetX = playerX;
        targetY = playerY + 2 * cellSize;
        obstacleX = playerX;
        obstacleY =
          targetY +
          playerBottomBorder +
          obstacleTopBorder +
          inclusiveMargin -
          1;
        break;
    }

    obstacle.setPosition(obstacleX, obstacleY);
    // so obstacles register
    runtimeScene.renderAndStep(1000 / 60);

    // move as close as possible to the obstacle
    player.setPosition(playerX, playerY);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, targetX, targetY);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(false);
  });

  const obstacleTop = obstacle;
  const obstacleBottom = addObstacleSprite3(
    runtimeScene,
    objectCenteredOnCells
  );

  it('can find a path between 2 obstacles making a path perfectly ajusted to the object', function () {
    let topObstacleX;
    let bottomObstacleX;
    let topObstacleY;
    let bottomObstacleY;
    let targetX;
    let targetY;
    let straightLineCellCount;
    switch (direction) {
      case 'right': {
        const obstacleX =
          playerX + playerRightBorder + 2 * cellSize + obstacleLeftBorder;
        topObstacleX = obstacleX;
        bottomObstacleX = obstacleX;
        topObstacleY =
          playerY - playerTopBorder - obstacleBottomBorder - inclusiveMargin;
        bottomObstacleY =
          playerY + playerBottomBorder + obstacleTopBorder + inclusiveMargin;
        targetX =
          obstacleX + obstacleRightBorder + playerLeftBorder + 2 * cellSize;
        targetY = playerY;
        straightLineCellCount = (targetX - playerX) / cellSize + 1;
        break;
      }
      case 'left': {
        const obstacleX =
          playerX - playerLeftBorder - 2 * cellSize - obstacleRightBorder;
        topObstacleX = obstacleX;
        bottomObstacleX = obstacleX;
        topObstacleY =
          playerY - playerTopBorder - obstacleBottomBorder - inclusiveMargin;
        bottomObstacleY =
          playerY + playerBottomBorder + obstacleTopBorder + inclusiveMargin;
        targetX =
          obstacleX - obstacleLeftBorder - playerRightBorder - 2 * cellSize;
        targetY = playerY;
        straightLineCellCount = (playerX - targetX) / cellSize + 1;
        break;
      }
      case 'up': {
        // topObstacle and bottomObstacle are actually left and right but for convenience...
        const obstacleY =
          playerY - playerTopBorder - 2 * cellSize - obstacleBottomBorder;
        topObstacleY = obstacleY;
        bottomObstacleY = obstacleY;
        topObstacleX =
          playerX - playerLeftBorder - obstacleRightBorder - inclusiveMargin;
        bottomObstacleX =
          playerX + playerRightBorder + obstacleLeftBorder + inclusiveMargin;
        targetY =
          obstacleY - obstacleTopBorder - playerBottomBorder - 2 * cellSize;
        targetX = playerX;
        straightLineCellCount = (playerY - targetY) / cellSize + 1;
        break;
      }
      case 'down': {
        // topObstacle and bottomObstacle are actually left and right but for convenience...
        const obstacleY =
          playerY + playerBottomBorder + 2 * cellSize + obstacleTopBorder;
        topObstacleY = obstacleY;
        bottomObstacleY = obstacleY;
        topObstacleX =
          playerX - playerLeftBorder - obstacleRightBorder - inclusiveMargin;
        bottomObstacleX =
          playerX + playerRightBorder + obstacleLeftBorder + inclusiveMargin;
        targetY =
          obstacleY + obstacleBottomBorder + playerTopBorder + 2 * cellSize;
        targetX = playerX;
        straightLineCellCount = (targetY - playerY) / cellSize + 1;
        break;
      }
    }

    obstacleTop.setPosition(topObstacleX, topObstacleY);
    obstacleBottom.setPosition(bottomObstacleX, bottomObstacleY);
    // so obstacles register
    runtimeScene.renderAndStep(1000 / 60);

    player.setPosition(playerX, playerY);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, targetX, targetY);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(
      straightLineCellCount
    );
  });

  it("mustn't find a direct path between 2 obstacles making a path slightly too narrow.", function () {
    let topObstacleX;
    let bottomObstacleX;
    let topObstacleY;
    let bottomObstacleY;
    let targetX;
    let targetY;
    let straightLineCellCount;
    switch (direction) {
      case 'right': {
        const obstacleX =
          playerX + playerRightBorder + 2 * cellSize + obstacleLeftBorder;
        topObstacleX = obstacleX;
        bottomObstacleX = obstacleX;
        topObstacleY =
          playerY - playerTopBorder - obstacleBottomBorder - inclusiveMargin;
        bottomObstacleY =
          playerY +
          playerBottomBorder +
          obstacleTopBorder +
          inclusiveMargin -
          1;
        targetX =
          obstacleX + obstacleRightBorder + playerLeftBorder + 2 * cellSize;
        targetY = playerY;
        straightLineCellCount = (targetX - playerX) / cellSize + 1;
        break;
      }
      case 'left': {
        const obstacleX =
          playerX - playerLeftBorder - 2 * cellSize - obstacleRightBorder;
        topObstacleX = obstacleX;
        bottomObstacleX = obstacleX;
        topObstacleY =
          playerY - playerTopBorder - obstacleBottomBorder - inclusiveMargin;
        bottomObstacleY =
          playerY +
          playerBottomBorder +
          obstacleTopBorder +
          inclusiveMargin -
          1;
        targetX =
          obstacleX - obstacleLeftBorder - playerRightBorder - 2 * cellSize;
        targetY = playerY;
        straightLineCellCount = (playerX - targetX) / cellSize + 1;
        break;
      }
      case 'up': {
        const obstacleY =
          playerY - playerTopBorder - 2 * cellSize - obstacleBottomBorder;
        topObstacleY = obstacleY;
        bottomObstacleY = obstacleY;
        topObstacleX =
          playerX - playerLeftBorder - obstacleRightBorder - inclusiveMargin;
        bottomObstacleX =
          playerX +
          playerRightBorder +
          obstacleLeftBorder +
          inclusiveMargin -
          1;
        targetY =
          obstacleY - obstacleTopBorder - playerBottomBorder - 2 * cellSize;
        targetX = playerX;
        straightLineCellCount = (playerY - targetY) / cellSize + 1;
        break;
      }
      case 'down': {
        const obstacleY =
          playerY + playerBottomBorder + 2 * cellSize + obstacleTopBorder;
        topObstacleY = obstacleY;
        bottomObstacleY = obstacleY;
        topObstacleX =
          playerX - playerLeftBorder - obstacleRightBorder - inclusiveMargin;
        bottomObstacleX =
          playerX +
          playerRightBorder +
          obstacleLeftBorder +
          inclusiveMargin -
          1;
        targetY =
          obstacleY + obstacleBottomBorder + playerTopBorder + 2 * cellSize;
        targetX = playerX;
        straightLineCellCount = (targetY - playerY) / cellSize + 1;
        break;
      }
    }

    obstacleTop.setPosition(topObstacleX, topObstacleY);
    obstacleBottom.setPosition(bottomObstacleX, bottomObstacleY);
    // so obstacles register
    runtimeScene.renderAndStep(1000 / 60);

    player.setPosition(playerX, playerY);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, targetX, targetY);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    // had to do a little detour
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be.above(
      straightLineCellCount
    );
  });
};

// limit tests cases on the legacy collision methods.
describe('gdjs.PathfindingRuntimeBehavior', function () {
  describe('(collisionMethod: Legacy,', function () {
    // Small cells and cells the object size
    [20, 160].forEach((cellSize) => {
      describe(`cellSize: ${cellSize},`, function () {
        [false, true].forEach((objectCenteredOnCells) => {
          describe(`centered: ${objectCenteredOnCells},`, function () {
            ['left', 'right', 'down', 'up'].forEach((direction) => {
              describe(`direction: ${direction})`, function () {
                doTestsLegacypathfindingruntimebehavior(
                  cellSize,
                  objectCenteredOnCells,
                  direction
                );
              });
            });
          });
        });
      });
    });
  });
});
