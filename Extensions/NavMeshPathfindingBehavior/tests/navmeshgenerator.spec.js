// @ts-check
describe('gdjs.NavMeshGeneration', function () {
  // When adding a new case, both can be invert to easily copy/paste results.
  // It's also useful for debugging.
  const logsResults = true;
  const checksResults = false;

  let createDiamond = (runtimeScene) => {
    const diamond = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'diamond',
      type: '',
      behaviors: [],
      animations: [
        {
          name: 'animation',
          directions: [
            {
              sprites: [
                {
                  originPoint: { x: 80, y: 80 },
                  centerPoint: { x: 80, y: 80 },
                  points: [
                    { name: 'Center', x: 80, y: 80 },
                    { name: 'Origin', x: 80, y: 80 },
                  ],
                  hasCustomCollisionMask: true,
                  customCollisionMask: [
                    [
                      { x: 160, y: 80 },
                      { x: 80, y: 160 },
                      { x: 0, y: 80 },
                      { x: 80, y: 0 },
                    ],
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    diamond.getWidth = function () {
      return 160;
    };
    diamond.getHeight = function () {
      return 160;
    };
    runtimeScene.addObject(diamond);
    return diamond;
  };

  let createRectangle = (runtimeScene, width, height) => {
    const square = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'square',
      type: '',
      behaviors: [],
      animations: [
        {
          name: 'animation',
          directions: [
            {
              sprites: [
                {
                  originPoint: { x: width / 2, y: height / 2 },
                  centerPoint: { x: width / 2, y: height / 2 },
                  points: [
                    { name: 'Center', x: width / 2, y: height / 2 },
                    { name: 'Origin', x: width / 2, y: height / 2 },
                  ],
                  hasCustomCollisionMask: false,
                },
              ],
            },
          ],
        },
      ],
    });
    square.getWidth = function () {
      return width;
    };
    square.getHeight = function () {
      return height;
    };
    runtimeScene.addObject(square);
    return square;
  };

  const makeTestRuntimeScene = () => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      resources: {
        resources: [],
      },
      properties: { windowWidth: 800, windowHeight: 600 },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
    return runtimeScene;
  };

  const checkObstacles = (grid, expectedGridString) => {
    const actualGridString =
      grid.cells
        .map((cellRow) =>
          cellRow
            .map((cell) => (cell.distanceToObstacle === 0 ? '#' : '.'))
            .join('')
        )
        .join('\n') + '\n';
    if (logsResults) {
      console.log('\n' + actualGridString);
    }
    if (checksResults) {
      expect(expectedGridString).to.be(actualGridString);
    }
  };

  const symbols =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const checkDistanceField = (grid, expectedGridString) => {
    const actualGridString =
      grid.cells
        .map((cellRow) =>
          cellRow
            .map((cell) =>
              cell.distanceToObstacle === 0
                ? '.'
                : symbols[cell.distanceToObstacle]
            )
            .join('')
        )
        .join('\n') + '\n';
    if (logsResults) {
      console.log('\n' + actualGridString);
    }
    if (checksResults) {
      expect(expectedGridString).to.be(actualGridString);
    }
  };

  const checkRegions = (grid, expectedGridString) => {
    const actualGridString =
      grid.cells
        .map((cellRow) =>
          cellRow
            .map((cell) => (cell.regionID === 0 ? '.' : symbols[cell.regionID]))
            .join('')
        )
        .join('\n') + '\n';
    if (logsResults) {
      console.log('\n' + actualGridString);
    }
    if (checksResults) {
      expect(expectedGridString).to.be(actualGridString);
    }
  };

  const checkPolygons = (actualPolygons, expectedPolygon) => {
    if (logsResults) {
      console.log(
        '[' +
          actualPolygons
            .map(
              (polygon) =>
                '[' +
                polygon
                  .map((point) => '[' + point[0] + ', ' + point[1] + ']')
                  .join(', ') +
                ',]'
            )
            .join(',\n') +
          ',]'
      );
    }
    if (checksResults) {
      expect(actualPolygons).to.eql(expectedPolygon);
    }
  };

  it('can build an empty mesh', function () {
    const runtimeScene = makeTestRuntimeScene();
    const rectangle = createRectangle(runtimeScene, 400, 400);
    rectangle.setPosition(160, 160);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 20, 20);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [rectangle]);
    checkObstacles(
      grid, //
      '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n' +
        '##################\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      []
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      []
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      []
    );
  });

  it('can build a mesh without any obstacle', function () {
    const runtimeScene = makeTestRuntimeScene();

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 20, 20);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, []);
    checkObstacles(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................\n' +
        '.2222222222222222.\n' +
        '.2444444444444442.\n' +
        '.2466666666666642.\n' +
        '.2468888888888642.\n' +
        '.2468aaaaaaaa8642.\n' +
        '.2468acccccca8642.\n' +
        '.2468aceeeeca8642.\n' +
        '.2468aceggeca8642.\n' +
        '.2468aceggeca8642.\n' +
        '.2468aceeeeca8642.\n' +
        '.2468acccccca8642.\n' +
        '.2468aaaaaaaa8642.\n' +
        '.2468888888888642.\n' +
        '.2466666666666642.\n' +
        '.2444444444444442.\n' +
        '.2222222222222222.\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 1],
          [1, 17],
          [17, 17],
          [17, 1],
        ],
      ]
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [1, 1],
          [1, 17],
          [17, 17],
          [17, 1],
        ],
      ]
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [0, 0],
          [0, 320],
          [320, 320],
          [320, 0],
        ],
      ]
    );
  });

  it('keeps the vertices of a square aligned on the grid', function () {
    const runtimeScene = makeTestRuntimeScene();
    const rectangle = createRectangle(runtimeScene, 200, 160);
    rectangle.setPosition(160, 160);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 10, 10);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [rectangle]);
    checkObstacles(
      grid, //
      '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '.......####################.......\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................................\n' +
        '.22222222222222222222222222222222.\n' +
        '.24444444444444444444444444444442.\n' +
        '.24666666666666666666666666666642.\n' +
        '.24688888888888888888888888888642.\n' +
        '.2468a9888888888888888888889a8642.\n' +
        '.24688766666666666666666666788642.\n' +
        '.24686544444444444444444444568642.\n' +
        '.24675322222222222222222222357642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.246642....................246642.\n' +
        '.24675322222222222222222222357642.\n' +
        '.24686544444444444444444444568642.\n' +
        '.24688766666666666666666666788642.\n' +
        '.2468a9888888888888888888889a8642.\n' +
        '.24688888888888888888888888888642.\n' +
        '.24666666666666666666666666666642.\n' +
        '.24444444444444444444444444444442.\n' +
        '.22222222222222222222222222222222.\n' +
        '..................................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................................\n' +
        '.11111111111111111111111111111111.\n' +
        '.11111111111111111111111111111111.\n' +
        '.11111111111111111111111111111111.\n' +
        '.11111111111111111111111111111111.\n' +
        '.11111111111111111111111111111111.\n' +
        '.11111111111111111111111111111111.\n' +
        '.11111111111111111111111111111111.\n' +
        '.11111111111111111111111111111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.111111....................111111.\n' +
        '.11112222222222222222222222221111.\n' +
        '.11122222222222222222222222222222.\n' +
        '.22222222222222222222222222222222.\n' +
        '.22222222222222222222222222222222.\n' +
        '.22222222222222222222222222222222.\n' +
        '.22222222222222222222222222222222.\n' +
        '.22222222222222222222222222222222.\n' +
        '.22222222222222222222222222222222.\n' +
        '..................................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 27],
          [7, 25],
          [7, 9],
          [27, 9],
          [27, 25],
          [33, 26],
          [33, 1],
          [1, 1],
        ],
        [
          [1, 27],
          [1, 33],
          [33, 33],
          [33, 26],
          [27, 25],
          [7, 25],
        ],
      ]
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [27, 9],
          [27, 25],
          [33, 26],
          [33, 1],
        ],
        [
          [1, 27],
          [7, 25],
          [7, 9],
          [1, 1],
        ],
        [
          [7, 9],
          [27, 9],
          [33, 1],
          [1, 1],
        ],
        [
          [1, 33],
          [33, 33],
          [33, 26],
          [27, 25],
          [7, 25],
          [1, 27],
        ],
      ]
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      // As the obstacle is a rectangle aligned on the grid,
      // the mesh must match its original vertices:
      // (60, 80), (60, 240), (240, 260), (260, 80)
      [
        [
          [260, 80],
          [260, 240],
          [320, 250],
          [320, 0],
        ],
        [
          [0, 260],
          [60, 240],
          [60, 80],
          [0, 0],
        ],
        [
          [60, 80],
          [260, 80],
          [320, 0],
          [0, 0],
        ],
        [
          [0, 320],
          [320, 320],
          [320, 250],
          [260, 240],
          [60, 240],
          [0, 260],
        ],
      ]
    );
  });

  it('keep obstacle region encompassed in another region', function () {
    const runtimeScene = makeTestRuntimeScene();
    const horizontalRectangle = createRectangle(runtimeScene, 200, 5);
    horizontalRectangle.setPosition(160, 160);
    horizontalRectangle.setAngle(45);
    const verticalRectangle = createRectangle(runtimeScene, 5, 200);
    verticalRectangle.setPosition(160, 160);
    verticalRectangle.setAngle(45);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 20, 20);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [
      horizontalRectangle,
      verticalRectangle,
    ]);
    checkObstacles(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '.....#......#.....\n' +
        '......#....#......\n' +
        '.......#..#.......\n' +
        '........##........\n' +
        '........##........\n' +
        '.......#..#.......\n' +
        '......#....#......\n' +
        '.....#......#.....\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................\n' +
        '.2222222222222222.\n' +
        '.2444444444444442.\n' +
        '.2465456666545642.\n' +
        '.2453235665323542.\n' +
        '.2442.235532.2442.\n' +
        '.24532.2332.23542.\n' +
        '.246532.22.235642.\n' +
        '.2466532..2356642.\n' +
        '.2466532..2356642.\n' +
        '.246532.22.235642.\n' +
        '.24532.2332.23542.\n' +
        '.2442.235532.2442.\n' +
        '.2453235665323542.\n' +
        '.2465456666545642.\n' +
        '.2444444444444442.\n' +
        '.2222222222222222.\n' +
        '..................\n'
    );

    // The flooding will make every cell in one region.
    // This region is splitted in 2 by ObstacleRegionBordersCleaner.partialFloodRegion
    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.2222222222222222.\n' +
        '.2222222222222222.\n' +
        '.2222222222222222.\n' +
        '.2222222222222222.\n' +
        '.2222.222222.1111.\n' +
        '.22222.2222.11111.\n' +
        '.222222.22.111111.\n' +
        '.2222222..1111111.\n' +
        '.2222222..1111111.\n' +
        '.222222.11.111111.\n' +
        '.22222.1111.11111.\n' +
        '.2222.111111.1111.\n' +
        '.2222111111111111.\n' +
        '.2222111111111111.\n' +
        '.2222111111111111.\n' +
        '.2222111111111111.\n' +
        '..................\n'
    );
    // No need to check the other steps.
  });

  it('can build a mesh for a plus', function () {
    const runtimeScene = makeTestRuntimeScene();
    const horizontalRectangle = createRectangle(runtimeScene, 160, 80);
    horizontalRectangle.setPosition(160, 160);
    const verticalRectangle = createRectangle(runtimeScene, 80, 160);
    verticalRectangle.setPosition(160, 160);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 10, 10);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [
      horizontalRectangle,
      verticalRectangle,
    ]);
    checkObstacles(
      grid, //
      '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '.............########.............\n' +
        '.............########.............\n' +
        '.............########.............\n' +
        '.............########.............\n' +
        '.........################.........\n' +
        '.........################.........\n' +
        '.........################.........\n' +
        '.........################.........\n' +
        '.........################.........\n' +
        '.........################.........\n' +
        '.........################.........\n' +
        '.........################.........\n' +
        '.............########.............\n' +
        '.............########.............\n' +
        '.............########.............\n' +
        '.............########.............\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................................\n' +
        '.22222222222222222222222222222222.\n' +
        '.24444444444444444444444444444442.\n' +
        '.24666666666666666666666666666642.\n' +
        '.24688888888888888888888888888642.\n' +
        '.2468aaaaaaa9888888889aaaaaaa8642.\n' +
        '.2468acccb98766666666789bccca8642.\n' +
        '.2468aceca86544444444568aceca8642.\n' +
        '.2468accb9753222222223579bcca8642.\n' +
        '.2468aba98642........24689aba8642.\n' +
        '.2468a9876642........2466789a8642.\n' +
        '.2468a8654442........2444568a8642.\n' +
        '.246897532222........222235798642.\n' +
        '.24688642................24688642.\n' +
        '.24688642................24688642.\n' +
        '.24688642................24688642.\n' +
        '.24688642................24688642.\n' +
        '.24688642................24688642.\n' +
        '.24688642................24688642.\n' +
        '.24688642................24688642.\n' +
        '.24688642................24688642.\n' +
        '.246897532222........222235798642.\n' +
        '.2468a8654442........2444568a8642.\n' +
        '.2468a9876642........2466789a8642.\n' +
        '.2468aba98642........24689aba8642.\n' +
        '.2468accb9753222222223579bcca8642.\n' +
        '.2468aceca86544444444568aceca8642.\n' +
        '.2468acccb98766666666789bccca8642.\n' +
        '.2468aaaaaaa9888888889aaaaaaa8642.\n' +
        '.24688888888888888888888888888642.\n' +
        '.24666666666666666666666666666642.\n' +
        '.24444444444444444444444444444442.\n' +
        '.22222222222222222222222222222222.\n' +
        '..................................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................................\n' +
        '.11111111111111111112222222222222.\n' +
        '.11111111111111111112222222222222.\n' +
        '.11111111111111111112222222222222.\n' +
        '.11111111111111111112222222222222.\n' +
        '.11111111111111111122222222222222.\n' +
        '.11111111111111111112222222222222.\n' +
        '.11111111111111111112222222222222.\n' +
        '.11111111111111111112222222222222.\n' +
        '.111111111111........222222222222.\n' +
        '.111111111111........222222222222.\n' +
        '.111111111111........222222222222.\n' +
        '.111111111111........222222222222.\n' +
        '.11111111................22222222.\n' +
        '.11111111................22222222.\n' +
        '.11111111................22222222.\n' +
        '.11111111................22222222.\n' +
        '.11111111................22222222.\n' +
        '.11111111................22222222.\n' +
        '.11111111................22222222.\n' +
        '.11111111................22222222.\n' +
        '.111111133333........444444222222.\n' +
        '.111111333333........444444422222.\n' +
        '.111133333333........444444444444.\n' +
        '.333333333333........444444444444.\n' +
        '.33333333333333333334444444444444.\n' +
        '.33333333333333333334444444444444.\n' +
        '.33333333333333333334444444444444.\n' +
        '.33333333333333333344444444444444.\n' +
        '.33333333333333333334444444444444.\n' +
        '.33333333333333333334444444444444.\n' +
        '.33333333333333333334444444444444.\n' +
        '.33333333333333333334444444444444.\n' +
        '..................................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 24],
          [9, 21],
          [9, 13],
          [13, 13],
          [13, 9],
          [20, 9],
          [20, 1],
          [1, 1],
        ],
        [
          [20, 9],
          [21, 13],
          [25, 13],
          [25, 21],
          [33, 23],
          [33, 1],
          [20, 1],
        ],
        [
          [1, 24],
          [1, 33],
          [20, 33],
          [20, 25],
          [13, 25],
          [13, 21],
          [9, 21],
        ],
        [
          [20, 25],
          [20, 33],
          [33, 33],
          [33, 23],
          [25, 21],
          [21, 21],
        ],
      ]
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [9, 13],
          [13, 13],
          [13, 9],
        ],
        [
          [13, 9],
          [20, 9],
          [20, 1],
        ],
        [
          [1, 24],
          [9, 21],
          [9, 13],
          [1, 1],
        ],
        [
          [13, 9],
          [20, 1],
          [1, 1],
          [9, 13],
        ],
        [
          [20, 9],
          [21, 13],
          [25, 13],
          [20, 1],
        ],
        [
          [25, 13],
          [25, 21],
          [33, 23],
        ],
        [
          [25, 13],
          [33, 23],
          [33, 1],
          [20, 1],
        ],
        [
          [13, 25],
          [13, 21],
          [9, 21],
        ],
        [
          [20, 33],
          [20, 25],
          [13, 25],
        ],
        [
          [13, 25],
          [9, 21],
          [1, 24],
          [1, 33],
          [20, 33],
        ],
        [
          [25, 21],
          [21, 21],
          [20, 25],
          [20, 33],
          [33, 33],
          [33, 23],
        ],
      ]
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [80, 120],
          [120, 120],
          [120, 80],
        ],
        [
          [120, 80],
          [190, 80],
          [190, 0],
        ],
        [
          [0, 230],
          [80, 200],
          [80, 120],
          [0, 0],
        ],
        [
          [120, 80],
          [190, 0],
          [0, 0],
          [80, 120],
        ],
        [
          [190, 80],
          [200, 120],
          [240, 120],
          [190, 0],
        ],
        [
          [240, 120],
          [240, 200],
          [320, 220],
        ],
        [
          [240, 120],
          [320, 220],
          [320, 0],
          [190, 0],
        ],
        [
          [120, 240],
          [120, 200],
          [80, 200],
        ],
        [
          [190, 320],
          [190, 240],
          [120, 240],
        ],
        [
          [120, 240],
          [80, 200],
          [0, 230],
          [0, 320],
          [190, 320],
        ],
        [
          [240, 200],
          [200, 200],
          [190, 240],
          [190, 320],
          [320, 320],
          [320, 220],
        ],
      ]
    );
  });

  it('can build a mesh for a plus thinner than the cell size', function () {
    const runtimeScene = makeTestRuntimeScene();
    const horizontalRectangle = createRectangle(runtimeScene, 160, 5);
    horizontalRectangle.setPosition(160, 160);
    const verticalRectangle = createRectangle(runtimeScene, 5, 160);
    verticalRectangle.setPosition(160, 160);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 20, 20);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [
      horizontalRectangle,
      verticalRectangle,
    ]);
    checkObstacles(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '.........#........\n' +
        '.........#........\n' +
        '.........#........\n' +
        '.........#........\n' +
        '.....########.....\n' +
        '.........#........\n' +
        '.........#........\n' +
        '.........#........\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................\n' +
        '.2222222222222222.\n' +
        '.2444444444444442.\n' +
        '.2466666545666642.\n' +
        '.2468875323578642.\n' +
        '.24688642.2468642.\n' +
        '.24676642.2467642.\n' +
        '.24654442.2445642.\n' +
        '.24532222.2223542.\n' +
        '.2442........2442.\n' +
        '.24532222.2223542.\n' +
        '.24654442.2445642.\n' +
        '.24676642.2467642.\n' +
        '.2468875323578642.\n' +
        '.2466666545666642.\n' +
        '.2444444444444442.\n' +
        '.2222222222222222.\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.1111111111222222.\n' +
        '.1111111111222222.\n' +
        '.1111111112222222.\n' +
        '.1111111112222222.\n' +
        '.11111111.2222222.\n' +
        '.11111111.2222222.\n' +
        '.11111111.2222222.\n' +
        '.11111111.2222222.\n' +
        '.1111........2222.\n' +
        '.11133333.4444222.\n' +
        '.11333333.4444444.\n' +
        '.33333333.4444444.\n' +
        '.3333333334444444.\n' +
        '.3333333334444444.\n' +
        '.3333333334444444.\n' +
        '.3333333334444444.\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 12],
          [5, 10],
          [9, 9],
          [10, 5],
          [11, 1],
          [1, 1],
        ],
        [
          [10, 5],
          [10, 9],
          [13, 10],
          [17, 11],
          [17, 1],
          [11, 1],
        ],
        [
          [1, 12],
          [1, 17],
          [10, 17],
          [10, 13],
          [9, 10],
          [5, 10],
        ],
        [
          [10, 13],
          [10, 17],
          [17, 17],
          [17, 11],
          [13, 10],
          [10, 10],
        ],
      ]
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [5, 10],
          [9, 9],
          [10, 5],
        ],
        [
          [5, 10],
          [10, 5],
          [11, 1],
          [1, 1],
          [1, 12],
        ],
        [
          [10, 5],
          [10, 9],
          [13, 10],
          [17, 11],
          [17, 1],
          [11, 1],
        ],
        [
          [10, 13],
          [9, 10],
          [5, 10],
          [1, 12],
          [1, 17],
          [10, 17],
        ],
        [
          [13, 10],
          [10, 10],
          [10, 13],
        ],
        [
          [17, 11],
          [13, 10],
          [10, 13],
          [10, 17],
          [17, 17],
        ],
      ]
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [80, 180],
          [160, 160],
          [180, 80],
        ],
        [
          [80, 180],
          [180, 80],
          [200, 0],
          [0, 0],
          [0, 220],
        ],
        [
          [180, 80],
          [180, 160],
          [240, 180],
          [320, 200],
          [320, 0],
          [200, 0],
        ],
        [
          [180, 240],
          [160, 180],
          [80, 180],
          [0, 220],
          [0, 320],
          [180, 320],
        ],
        [
          [240, 180],
          [180, 180],
          [180, 240],
        ],
        [
          [320, 200],
          [240, 180],
          [180, 240],
          [180, 320],
          [320, 320],
        ],
      ]
    );
  });

  it('can build a mesh for a cross thinner than the cell size', function () {
    const runtimeScene = makeTestRuntimeScene();
    const horizontalRectangle = createRectangle(runtimeScene, 200, 2);
    horizontalRectangle.setPosition(160, 160);
    horizontalRectangle.setAngle(45);
    const verticalRectangle = createRectangle(runtimeScene, 2, 200);
    verticalRectangle.setPosition(160, 160);
    verticalRectangle.setAngle(45);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 10, 10);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [
      horizontalRectangle,
      verticalRectangle,
    ]);
    checkObstacles(
      grid, //
      '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..........#............#..........\n' +
        '...........#..........#...........\n' +
        '............#........#............\n' +
        '.............#......#.............\n' +
        '..............#....#..............\n' +
        '...............#..#...............\n' +
        '................##................\n' +
        '................##................\n' +
        '...............#..#...............\n' +
        '..............#....#..............\n' +
        '.............#......#.............\n' +
        '............#........#............\n' +
        '...........#..........#...........\n' +
        '..........#............#..........\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n' +
        '..................................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................................\n' +
        '.22222222222222222222222222222222.\n' +
        '.24444444444444444444444444444442.\n' +
        '.24666666666666666666666666666642.\n' +
        '.24688888888888888888888888888642.\n' +
        '.2468aaaaaaaaaaaaaaaaaaaaaaaa8642.\n' +
        '.2468acba989abccccccba989abca8642.\n' +
        '.2468ab9876789bceecb9876789ba8642.\n' +
        '.2468aa86545689bccb98654568aa8642.\n' +
        '.2468a9753235689bb9865323579a8642.\n' +
        '.2468a8642.235689986532.2468a8642.\n' +
        '.2468a97532.2356886532.23579a8642.\n' +
        '.2468aa86532.23566532.23568aa8642.\n' +
        '.2468ab986532.235532.235689ba8642.\n' +
        '.2468acb986532.2332.235689bca8642.\n' +
        '.2468accb986532.22.235689bcca8642.\n' +
        '.2468acecb986532..235689bceca8642.\n' +
        '.2468acecb986532..235689bceca8642.\n' +
        '.2468accb986532.22.235689bcca8642.\n' +
        '.2468acb986532.2332.235689bca8642.\n' +
        '.2468ab986532.235532.235689ba8642.\n' +
        '.2468aa86532.23566532.23568aa8642.\n' +
        '.2468a97532.2356886532.23579a8642.\n' +
        '.2468a8642.235689986532.2468a8642.\n' +
        '.2468a9753235689bb9865323579a8642.\n' +
        '.2468aa86545689bccb98654568aa8642.\n' +
        '.2468ab9876789bceecb9876789ba8642.\n' +
        '.2468acba989abccccccba989abca8642.\n' +
        '.2468aaaaaaaaaaaaaaaaaaaaaaaa8642.\n' +
        '.24688888888888888888888888888642.\n' +
        '.24666666666666666666666666666642.\n' +
        '.24444444444444444444444444444442.\n' +
        '.22222222222222222222222222222222.\n' +
        '..................................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................................\n' +
        '.55555555555551111111666666666666.\n' +
        '.55555555555551111111666666666666.\n' +
        '.55555555555551111111666666666666.\n' +
        '.55555555555551111111666666666666.\n' +
        '.55555555555551111116666666666666.\n' +
        '.55555555555511111111666666666666.\n' +
        '.55555555555511111111666666666666.\n' +
        '.55555555555511111111666666666666.\n' +
        '.55555555555511111111666666666666.\n' +
        '.555555555.551111111166.666666666.\n' +
        '.5555555555.5111111116.6666666666.\n' +
        '.55555555555.11111111.66666666666.\n' +
        '.555552222222.111111.333333366666.\n' +
        '.2222222222222.1111.3333333333333.\n' +
        '.22222222222222.11.33333333333333.\n' +
        '.222222222222222..333333333333333.\n' +
        '.222222222222222..333333333333333.\n' +
        '.22222222222222.44.33333333333333.\n' +
        '.2222222222222.4444.3333333333333.\n' +
        '.222272222222.444444.333333383333.\n' +
        '.77777722222.44444444.33333888888.\n' +
        '.7777777772.4444444444.3888888888.\n' +
        '.777777777.744444444444.888888888.\n' +
        '.77777777777444444444488888888888.\n' +
        '.77777777777444444444488888888888.\n' +
        '.77777777777744444444488888888888.\n' +
        '.77777777777744444444888888888888.\n' +
        '.77777777777774444448888888888888.\n' +
        '.77777777777774444444888888888888.\n' +
        '.77777777777774444444888888888888.\n' +
        '.77777777777774444444888888888888.\n' +
        '.77777777777774444444888888888888.\n' +
        '..................................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 14],
          [12, 13],
          [10, 10],
          [13, 12],
          [14, 1],
          [1, 1],
        ],
        [
          [13, 12],
          [16, 16],
          [18, 16],
          [21, 12],
          [21, 1],
          [14, 1],
        ],
        [
          [21, 12],
          [24, 10],
          [22, 13],
          [33, 14],
          [33, 1],
          [21, 1],
        ],
        [
          [1, 14],
          [1, 21],
          [10, 23],
          [16, 18],
          [16, 16],
          [12, 13],
        ],
        [
          [24, 23],
          [33, 21],
          [33, 14],
          [22, 13],
          [18, 16],
          [18, 18],
        ],
        [
          [12, 23],
          [14, 33],
          [21, 33],
          [23, 24],
          [18, 18],
          [16, 18],
        ],
        [
          [1, 21],
          [1, 33],
          [14, 33],
          [12, 23],
          [10, 23],
        ],
        [
          [24, 23],
          [23, 24],
          [21, 33],
          [33, 33],
          [33, 21],
        ],
      ]
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [1, 14],
          [12, 13],
          [10, 10],
        ],
        [
          [10, 10],
          [13, 12],
          [14, 1],
        ],
        [
          [10, 10],
          [14, 1],
          [1, 1],
          [1, 14],
        ],
        [
          [13, 12],
          [16, 16],
          [18, 16],
          [21, 12],
          [21, 1],
          [14, 1],
        ],
        [
          [21, 1],
          [21, 12],
          [24, 10],
        ],
        [
          [24, 10],
          [22, 13],
          [33, 14],
        ],
        [
          [24, 10],
          [33, 14],
          [33, 1],
          [21, 1],
        ],
        [
          [16, 18],
          [16, 16],
          [12, 13],
          [1, 14],
          [1, 21],
          [10, 23],
        ],
        [
          [22, 13],
          [18, 16],
          [18, 18],
          [24, 23],
          [33, 21],
          [33, 14],
        ],
        [
          [18, 18],
          [16, 18],
          [12, 23],
          [14, 33],
          [21, 33],
          [23, 24],
        ],
        [
          [14, 33],
          [12, 23],
          [10, 23],
        ],
        [
          [1, 33],
          [14, 33],
          [10, 23],
          [1, 21],
        ],
        [
          [24, 23],
          [23, 24],
          [21, 33],
          [33, 33],
          [33, 21],
        ],
      ]
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [0, 130],
          [110, 120],
          [90, 90],
        ],
        [
          [90, 90],
          [120, 110],
          [130, 0],
        ],
        [
          [90, 90],
          [130, 0],
          [0, 0],
          [0, 130],
        ],
        [
          [120, 110],
          [150, 150],
          [170, 150],
          [200, 110],
          [200, 0],
          [130, 0],
        ],
        [
          [200, 0],
          [200, 110],
          [230, 90],
        ],
        [
          [230, 90],
          [210, 120],
          [320, 130],
        ],
        [
          [230, 90],
          [320, 130],
          [320, 0],
          [200, 0],
        ],
        [
          [150, 170],
          [150, 150],
          [110, 120],
          [0, 130],
          [0, 200],
          [90, 220],
        ],
        [
          [210, 120],
          [170, 150],
          [170, 170],
          [230, 220],
          [320, 200],
          [320, 130],
        ],
        [
          [170, 170],
          [150, 170],
          [110, 220],
          [130, 320],
          [200, 320],
          [220, 230],
        ],
        [
          [130, 320],
          [110, 220],
          [90, 220],
        ],
        [
          [0, 320],
          [130, 320],
          [90, 220],
          [0, 200],
        ],
        [
          [230, 220],
          [220, 230],
          [200, 320],
          [320, 320],
          [320, 200],
        ],
      ]
    );
  });

  it('can build a mesh for a diamond with vertices on cell border', function () {
    const runtimeScene = makeTestRuntimeScene();
    const diamond = createDiamond(runtimeScene);
    diamond.setPosition(160, 160);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 20, 20);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [diamond]);
    checkObstacles(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '.........#........\n' +
        '........###.......\n' +
        '.......#####......\n' +
        '......#######.....\n' +
        '......#######.....\n' +
        '.......#####......\n' +
        '........###.......\n' +
        '.........#........\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................\n' +
        '.2222222222222222.\n' +
        '.2444444444444442.\n' +
        '.2466666545666642.\n' +
        '.2468865323568642.\n' +
        '.24686532.2356642.\n' +
        '.2466532...235642.\n' +
        '.246532.....23542.\n' +
        '.24642.......2442.\n' +
        '.24642.......2442.\n' +
        '.246532.....23542.\n' +
        '.2466532...235642.\n' +
        '.24686532.2356642.\n' +
        '.2468865323568642.\n' +
        '.2466666545666642.\n' +
        '.2444444444444442.\n' +
        '.2222222222222222.\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.1111111111222222.\n' +
        '.1111111111222222.\n' +
        '.1111111112222222.\n' +
        '.1111111112222222.\n' +
        '.11111111.2222222.\n' +
        '.1111111...222222.\n' +
        '.111111.....22222.\n' +
        '.11111.......2222.\n' +
        '.11111.......2222.\n' +
        '.111111.....33222.\n' +
        '.1111111...333333.\n' +
        '.11111111.3333333.\n' +
        '.1111111113333333.\n' +
        '.1111111113333333.\n' +
        '.1111111113333333.\n' +
        '.1111111113333333.\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [10, 17],
          [10, 13],
          [6, 10],
          [6, 8],
          [10, 5],
          [11, 1],
          [1, 1],
          [1, 17],
        ],
        [
          [10, 5],
          [13, 8],
          [13, 10],
          [17, 11],
          [17, 1],
          [11, 1],
        ],
        [
          [10, 13],
          [10, 17],
          [17, 17],
          [17, 11],
          [13, 10],
        ],
      ]
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [10, 17],
          [10, 13],
          [6, 10],
          [1, 17],
        ],
        [
          [6, 8],
          [10, 5],
          [11, 1],
          [1, 1],
        ],
        [
          [6, 10],
          [6, 8],
          [1, 1],
          [1, 17],
        ],
        [
          [13, 8],
          [13, 10],
          [17, 11],
        ],
        [
          [11, 1],
          [10, 5],
          [13, 8],
          [17, 11],
          [17, 1],
        ],
        [
          [17, 11],
          [13, 10],
          [10, 13],
          [10, 17],
          [17, 17],
        ],
      ]
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [180, 320],
          [180, 240],
          [100, 180],
          [0, 320],
        ],
        [
          [100, 140],
          [180, 80],
          [200, 0],
          [0, 0],
        ],
        [
          [100, 180],
          [100, 140],
          [0, 0],
          [0, 320],
        ],
        [
          [240, 140],
          [240, 180],
          [320, 200],
        ],
        [
          [200, 0],
          [180, 80],
          [240, 140],
          [320, 200],
          [320, 0],
        ],
        [
          [320, 200],
          [240, 180],
          [180, 240],
          [180, 320],
          [320, 320],
        ],
      ]
    );
  });

  it('can build a mesh for diamond with vertices on cell center', function () {
    const runtimeScene = makeTestRuntimeScene();
    const diamond = createDiamond(runtimeScene);
    diamond.setPosition(170, 170);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 20, 20);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [diamond]);
    checkObstacles(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '.........##.......\n' +
        '........####......\n' +
        '.......######.....\n' +
        '......########....\n' +
        '.......######.....\n' +
        '........####......\n' +
        '.........##.......\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateDistanceField(grid);
    checkDistanceField(
      grid, //
      '..................\n' +
        '.2222222222222222.\n' +
        '.2444444444444442.\n' +
        '.2466666666666642.\n' +
        '.2468886544568642.\n' +
        '.2468865322356642.\n' +
        '.24686532..235642.\n' +
        '.2466532....23542.\n' +
        '.246532......2342.\n' +
        '.24642........242.\n' +
        '.246532......2342.\n' +
        '.2466532....23542.\n' +
        '.24686532..235642.\n' +
        '.2468865322356642.\n' +
        '.2466666544566642.\n' +
        '.2444444444444442.\n' +
        '.2222222222222222.\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.1111111111111111.\n' +
        '.11111111..111111.\n' +
        '.1111111....11111.\n' +
        '.111111......1121.\n' +
        '.11111........222.\n' +
        '.111111......2222.\n' +
        '.1111111....22222.\n' +
        '.11111111..222222.\n' +
        '.1111111122222222.\n' +
        '.1111111122222222.\n' +
        '.1111111222222222.\n' +
        '.1111111122222222.\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [9, 17],
          [9, 13],
          [6, 10],
          [9, 6],
          [11, 6],
          [14, 9],
          [17, 9],
          [17, 1],
          [1, 1],
          [1, 17],
        ],
        [
          [14, 9],
          [11, 13],
          [9, 13],
          [9, 17],
          [17, 17],
          [17, 9],
        ],
      ]
    );

    const convexPolygons = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
      contours,
      8
    );
    checkPolygons(
      convexPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [11, 6],
          [14, 9],
          [17, 9],
          [17, 1],
        ],
        [
          [9, 17],
          [9, 13],
          [6, 10],
        ],
        [
          [1, 17],
          [9, 17],
          [6, 10],
          [1, 1],
        ],
        [
          [9, 6],
          [11, 6],
          [17, 1],
          [1, 1],
        ],
        [
          [6, 10],
          [9, 6],
          [1, 1],
        ],
        [
          [11, 13],
          [9, 13],
          [9, 17],
        ],
        [
          [11, 13],
          [9, 17],
          [17, 17],
          [17, 9],
          [14, 9],
        ],
      ]
    );

    const scaledPolygons = gdjs.GridCoordinateConverter.convertFromGridBasis(
      grid,
      convexPolygons,
      1
    );
    checkPolygons(
      scaledPolygons.map((polygon) =>
        polygon.map((point) => [point.x, point.y])
      ),
      [
        [
          [200, 100],
          [260, 160],
          [320, 160],
          [320, 0],
        ],
        [
          [160, 320],
          [160, 240],
          [100, 180],
        ],
        [
          [0, 320],
          [160, 320],
          [100, 180],
          [0, 0],
        ],
        [
          [160, 100],
          [200, 100],
          [320, 0],
          [0, 0],
        ],
        [
          [100, 180],
          [160, 100],
          [0, 0],
        ],
        [
          [200, 240],
          [160, 240],
          [160, 320],
        ],
        [
          [200, 240],
          [160, 320],
          [320, 320],
          [320, 160],
          [260, 160],
        ],
      ]
    );
  });
});
