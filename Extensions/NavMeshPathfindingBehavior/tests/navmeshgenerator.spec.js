// @ts-check
describe.only('gdjs.NavMeshGeneration', function () {
  // When adding a new case, both can be invert to easily copy/paste results.
  // It's also useful for debugging.
  const logsResults = false;
  const checksResults = true;

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

  const checkDistanceField = (grid, expectedGridString) => {
    const actualGridString =
      grid.cells
        .map((cellRow) =>
          cellRow
            .map((cell) =>
              cell.distanceToObstacle === 0 ? '.' : cell.distanceToObstacle
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
            .map((cell) => (cell.regionID === 0 ? '.' : cell.regionID))
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

  it('keeps the vertices of a square aligned on the grid', function () {
    const runtimeScene = makeTestRuntimeScene();
    const square = createRectangle(runtimeScene, 160, 160);
    square.setPosition(160, 160);
    runtimeScene.renderAndStep(1000 / 60);

    const grid = new gdjs.RasterizationGrid(0, 0, 320, 320, 20, 20);

    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, [square]);
    checkObstacles(
      grid, //
      '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '..................\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
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
        '.2465444444445642.\n' +
        '.2453222222223542.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2453222222223542.\n' +
        '.2465444444445642.\n' +
        '.2444444444444442.\n' +
        '.2222222222222222.\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.1111111111111222.\n' +
        '.1111111111111222.\n' +
        '.1111111111112222.\n' +
        '.1111111111112222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1133333333334444.\n' +
        '.3333333333334444.\n' +
        '.3333333333334444.\n' +
        '.3333333333334444.\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 14],
          [5, 13],
          [5, 5],
          [13, 5],
          [14, 1],
          [1, 1],
        ],
        [
          [13, 5],
          [13, 13],
          [17, 13],
          [17, 1],
          [14, 1],
        ],
        [
          [1, 14],
          [1, 17],
          [13, 17],
          [13, 13],
          [5, 13],
        ],
        [
          [13, 17],
          [17, 17],
          [17, 13],
          [13, 13],
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
          [5, 13],
          [5, 5],
          [1, 1],
        ],
        [
          [5, 5],
          [13, 5],
          [14, 1],
          [1, 1],
        ],
        [
          [17, 1],
          [14, 1],
          [13, 5],
          [13, 13],
          [17, 13],
        ],
        [
          [5, 13],
          [1, 14],
          [1, 17],
          [13, 17],
          [13, 13],
        ],
        [
          [13, 17],
          [17, 17],
          [17, 13],
          [13, 13],
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
      // (80, 80), (80, 240), (240, 240), (240, 80)
      [
        [
          [0, 260],
          [80, 240],
          [80, 80],
          [0, 0],
        ],
        [
          [80, 80],
          [240, 80],
          [260, 0],
          [0, 0],
        ],
        [
          [320, 0],
          [260, 0],
          [240, 80],
          [240, 240],
          [320, 240],
        ],
        [
          [80, 240],
          [0, 260],
          [0, 320],
          [240, 320],
          [240, 240],
        ],
        [
          [240, 320],
          [320, 320],
          [320, 240],
          [240, 240],
        ],
      ]
    );
  });

  it('can build a mesh for a plus', function () {
    const runtimeScene = makeTestRuntimeScene();
    const horizontalRectangle = createRectangle(runtimeScene, 160, 80);
    horizontalRectangle.setPosition(160, 160);
    const verticalRectangle = createRectangle(runtimeScene, 80, 160);
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
        '.......####.......\n' +
        '.......####.......\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.....########.....\n' +
        '.......####.......\n' +
        '.......####.......\n' +
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
        '.2466654444566642.\n' +
        '.2467532222357642.\n' +
        '.246542....245642.\n' +
        '.245322....223542.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.2442........2442.\n' +
        '.245322....223542.\n' +
        '.246542....245642.\n' +
        '.2467532222357642.\n' +
        '.2466654444566642.\n' +
        '.2444444444444442.\n' +
        '.2222222222222222.\n' +
        '..................\n'
    );

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.1111111111122222.\n' +
        '.1111111111122222.\n' +
        '.1111111111222222.\n' +
        '.1111111111222222.\n' +
        '.111111....222222.\n' +
        '.111111....222222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.1111........2222.\n' +
        '.113333....444444.\n' +
        '.333333....444444.\n' +
        '.3333333333444444.\n' +
        '.3333333333444444.\n' +
        '.3333333333444444.\n' +
        '.3333333333444444.\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 12],
          [5, 11],
          [5, 7],
          [7, 7],
          [7, 5],
          [11, 5],
          [12, 1],
          [1, 1],
        ],
        [
          [11, 5],
          [11, 7],
          [13, 7],
          [13, 11],
          [17, 11],
          [17, 1],
          [12, 1],
        ],
        [
          [1, 12],
          [1, 17],
          [11, 17],
          [11, 13],
          [7, 13],
          [7, 11],
          [5, 11],
        ],
        [
          [11, 13],
          [11, 17],
          [17, 17],
          [17, 11],
          [13, 11],
          [11, 11],
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
          [5, 7],
          [7, 7],
          [7, 5],
          [1, 1],
        ],
        [
          [1, 12],
          [5, 11],
          [5, 7],
          [1, 1],
        ],
        [
          [7, 5],
          [11, 5],
          [12, 1],
          [1, 1],
        ],
        [
          [11, 5],
          [11, 7],
          [13, 7],
          [12, 1],
        ],
        [
          [13, 7],
          [13, 11],
          [17, 11],
        ],
        [
          [13, 7],
          [17, 11],
          [17, 1],
          [12, 1],
        ],
        [
          [7, 13],
          [7, 11],
          [5, 11],
          [1, 12],
        ],
        [
          [11, 17],
          [11, 13],
          [7, 13],
        ],
        [
          [1, 17],
          [11, 17],
          [7, 13],
          [1, 12],
        ],
        [
          [13, 11],
          [11, 11],
          [11, 13],
        ],
        [
          [17, 11],
          [13, 11],
          [11, 13],
          [11, 17],
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
          [80, 120],
          [120, 120],
          [120, 80],
          [0, 0],
        ],
        [
          [0, 220],
          [80, 200],
          [80, 120],
          [0, 0],
        ],
        [
          [120, 80],
          [200, 80],
          [220, 0],
          [0, 0],
        ],
        [
          [200, 80],
          [200, 120],
          [240, 120],
          [220, 0],
        ],
        [
          [240, 120],
          [240, 200],
          [320, 200],
        ],
        [
          [240, 120],
          [320, 200],
          [320, 0],
          [220, 0],
        ],
        [
          [120, 240],
          [120, 200],
          [80, 200],
          [0, 220],
        ],
        [
          [200, 320],
          [200, 240],
          [120, 240],
        ],
        [
          [0, 320],
          [200, 320],
          [120, 240],
          [0, 220],
        ],
        [
          [240, 200],
          [200, 200],
          [200, 240],
        ],
        [
          [320, 200],
          [240, 200],
          [200, 240],
          [200, 320],
          [320, 320],
        ],
      ]
    );
  });

  // We could scan a 2nd time on X, but I'm not sure that's worth it.
  // Obstacles will just have to be larger than on cell.
  it.skip('can build a mesh for a plus thinner than the cell size', function () {
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
        '.11333333.4444444.\n' +
        '.33333333.4444444.\n' +
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
          [1, 11],
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
          [17, 10],
          [17, 1],
          [11, 1],
        ],
        [
          [1, 11],
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
          [17, 10],
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
          [1, 11],
        ],
        [
          [10, 5],
          [10, 9],
          [13, 10],
          [17, 10],
          [17, 1],
          [11, 1],
        ],
        [
          [10, 13],
          [9, 10],
          [5, 10],
          [1, 11],
          [1, 17],
          [10, 17],
        ],
        [
          [13, 10],
          [10, 10],
          [10, 13],
        ],
        [
          [17, 10],
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
          [0, 200],
        ],
        [
          [180, 80],
          [180, 160],
          [240, 180],
          [320, 180],
          [320, 0],
          [200, 0],
        ],
        [
          [180, 240],
          [160, 180],
          [80, 180],
          [0, 200],
          [0, 320],
          [180, 320],
        ],
        [
          [240, 180],
          [180, 180],
          [180, 240],
        ],
        [
          [320, 180],
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

    gdjs.RegionGenerator.generateRegions(grid, 0);
    checkRegions(
      grid, //
      '..................\n' +
        '.1111112222222333.\n' +
        '.1111112222222333.\n' +
        '.1111122222223333.\n' +
        '.1111122222223333.\n' +
        '.1111.222222.3333.\n' +
        '.11444.2222.55555.\n' +
        '.444444.22.555555.\n' +
        '.4444444..5555555.\n' +
        '.4444444..5555555.\n' +
        '.444444.66.555555.\n' +
        '.44444.6666.55555.\n' +
        '.4444.666666.5555.\n' +
        '.4477766666668888.\n' +
        '.7777766666668888.\n' +
        '.7777766666668888.\n' +
        '.7777766666668888.\n' +
        '..................\n'
    );

    const contours = gdjs.ContourBuilder.buildContours(grid, 1);
    checkPolygons(
      contours.map((polygon) => polygon.map((point) => [point.x, point.y])),
      [
        [
          [1, 7],
          [5, 6],
          [6, 5],
          [7, 1],
          [1, 1],
        ],
        [
          [6, 5],
          [8, 8],
          [10, 8],
          [13, 5],
          [14, 1],
          [7, 1],
        ],
        [
          [13, 5],
          [13, 6],
          [17, 6],
          [17, 1],
          [14, 1],
        ],
        [
          [1, 7],
          [1, 14],
          [5, 13],
          [8, 10],
          [8, 8],
          [5, 6],
        ],
        [
          [13, 13],
          [17, 13],
          [17, 6],
          [13, 6],
          [10, 8],
          [10, 10],
        ],
        [
          [6, 13],
          [6, 17],
          [13, 17],
          [13, 13],
          [10, 10],
          [8, 10],
        ],
        [
          [1, 14],
          [1, 17],
          [6, 17],
          [6, 13],
          [5, 13],
        ],
        [
          [13, 17],
          [17, 17],
          [17, 13],
          [13, 13],
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
          [1, 7],
          [5, 6],
          [6, 5],
          [7, 1],
          [1, 1],
        ],
        [
          [6, 5],
          [8, 8],
          [10, 8],
          [13, 5],
          [14, 1],
          [7, 1],
        ],
        [
          [13, 5],
          [13, 6],
          [17, 6],
          [17, 1],
          [14, 1],
        ],
        [
          [8, 10],
          [8, 8],
          [5, 6],
          [1, 7],
          [1, 14],
          [5, 13],
        ],
        [
          [13, 6],
          [10, 8],
          [10, 10],
          [13, 13],
          [17, 13],
          [17, 6],
        ],
        [
          [10, 10],
          [8, 10],
          [6, 13],
          [6, 17],
          [13, 17],
          [13, 13],
        ],
        [
          [6, 17],
          [6, 13],
          [5, 13],
          [1, 14],
          [1, 17],
        ],
        [
          [13, 17],
          [17, 17],
          [17, 13],
          [13, 13],
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
          [0, 120],
          [80, 100],
          [100, 80],
          [120, 0],
          [0, 0],
        ],
        [
          [100, 80],
          [140, 140],
          [180, 140],
          [240, 80],
          [260, 0],
          [120, 0],
        ],
        [
          [240, 80],
          [240, 100],
          [320, 100],
          [320, 0],
          [260, 0],
        ],
        [
          [140, 180],
          [140, 140],
          [80, 100],
          [0, 120],
          [0, 260],
          [80, 240],
        ],
        [
          [240, 100],
          [180, 140],
          [180, 180],
          [240, 240],
          [320, 240],
          [320, 100],
        ],
        [
          [180, 180],
          [140, 180],
          [100, 240],
          [100, 320],
          [240, 320],
          [240, 240],
        ],
        [
          [100, 320],
          [100, 240],
          [80, 240],
          [0, 260],
          [0, 320],
        ],
        [
          [240, 320],
          [320, 320],
          [320, 240],
          [240, 240],
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
        '.111333.....44444.\n' +
        '.1113333...444444.\n' +
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
          [6, 10],
          [6, 8],
          [10, 5],
          [11, 1],
          [1, 1],
        ],
        [
          [10, 5],
          [13, 8],
          [13, 10],
          [17, 10],
          [17, 1],
          [11, 1],
        ],
        [
          [1, 12],
          [1, 17],
          [10, 17],
          [10, 13],
          [6, 10],
        ],
        [
          [10, 13],
          [10, 17],
          [17, 17],
          [17, 10],
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
          [1, 12],
          [6, 10],
          [6, 8],
          [1, 1],
        ],
        [
          [6, 8],
          [10, 5],
          [11, 1],
          [1, 1],
        ],
        [
          [13, 8],
          [13, 10],
          [17, 10],
        ],
        [
          [11, 1],
          [10, 5],
          [13, 8],
          [17, 10],
          [17, 1],
        ],
        [
          [10, 17],
          [10, 13],
          [6, 10],
          [1, 12],
          [1, 17],
        ],
        [
          [17, 10],
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
          [0, 220],
          [100, 180],
          [100, 140],
          [0, 0],
        ],
        [
          [100, 140],
          [180, 80],
          [200, 0],
          [0, 0],
        ],
        [
          [240, 140],
          [240, 180],
          [320, 180],
        ],
        [
          [200, 0],
          [180, 80],
          [240, 140],
          [320, 180],
          [320, 0],
        ],
        [
          [180, 320],
          [180, 240],
          [100, 180],
          [0, 220],
          [0, 320],
        ],
        [
          [320, 180],
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
        '.111333.....44444.\n' +
        '.1113333...444444.\n' +
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
          [6, 10],
          [6, 8],
          [10, 5],
          [11, 1],
          [1, 1],
        ],
        [
          [10, 5],
          [13, 8],
          [13, 10],
          [17, 10],
          [17, 1],
          [11, 1],
        ],
        [
          [1, 12],
          [1, 17],
          [10, 17],
          [10, 13],
          [6, 10],
        ],
        [
          [10, 13],
          [10, 17],
          [17, 17],
          [17, 10],
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
          [1, 12],
          [6, 10],
          [6, 8],
          [1, 1],
        ],
        [
          [6, 8],
          [10, 5],
          [11, 1],
          [1, 1],
        ],
        [
          [13, 8],
          [13, 10],
          [17, 10],
        ],
        [
          [11, 1],
          [10, 5],
          [13, 8],
          [17, 10],
          [17, 1],
        ],
        [
          [10, 17],
          [10, 13],
          [6, 10],
          [1, 12],
          [1, 17],
        ],
        [
          [17, 10],
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
          [0, 220],
          [100, 180],
          [100, 140],
          [0, 0],
        ],
        [
          [100, 140],
          [180, 80],
          [200, 0],
          [0, 0],
        ],
        [
          [240, 140],
          [240, 180],
          [320, 180],
        ],
        [
          [200, 0],
          [180, 80],
          [240, 140],
          [320, 180],
          [320, 0],
        ],
        [
          [180, 320],
          [180, 240],
          [100, 180],
          [0, 220],
          [0, 320],
        ],
        [
          [320, 180],
          [240, 180],
          [180, 240],
          [180, 320],
          [320, 320],
        ],
      ]
    );
  });
});
