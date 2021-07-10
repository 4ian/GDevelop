describe.only('gdjs.NavMeshGeneration', function () {
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
          cellRow.map((cell) => (cell.isObstacle ? '#' : '.')).join('')
        )
        .join('\n') + '\n';
    console.log('\n' + actualGridString);
    expect(expectedGridString).to.be(actualGridString);
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
    console.log('\n' + actualGridString);
    expect(expectedGridString).to.be(actualGridString);
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
    console.log('\n' + actualGridString);
    expect(expectedGridString).to.be(actualGridString);
  };

  describe('Diamond at the center', function () {
    let runtimeScene;
    it('can work', function (runtimeScene) {
      runtimeScene = makeTestRuntimeScene();
      const diamond = createDiamond(runtimeScene);
      diamond.setPosition(160, 160);
      runtimeScene.renderAndStep(1000 / 60);

      const grid = new gdjs.RasterizationGrid(0, 0, 340, 340, 20);

      gdjs.NavMeshGenerator.rasterizeObstacles(grid, [diamond]);
      checkObstacles(
        grid, //
        '...................\n' +
          '...................\n' +
          '...................\n' +
          '...................\n' +
          '...................\n' +
          '.........#.........\n' +
          '........###........\n' +
          '.......#####.......\n' +
          '......#######......\n' +
          '.....#########.....\n' +
          '......#######......\n' +
          '.......#####.......\n' +
          '........###........\n' +
          '.........#.........\n' +
          '...................\n' +
          '...................\n' +
          '...................\n' +
          '...................\n' +
          '...................\n'
      );

      gdjs.NavMeshGenerator.generateDistanceField(grid);
      checkDistanceField(
        grid, //
        '...................\n' +
          '.22222222222222222.\n' +
          '.24444444444444442.\n' +
          '.24666665456666642.\n' +
          '.24688653235688642.\n' +
          '.24686532.23568642.\n' +
          '.2466532...2356642.\n' +
          '.246532.....235642.\n' +
          '.24532.......23542.\n' +
          '.2442.........2442.\n' +
          '.24532.......23542.\n' +
          '.246532.....235642.\n' +
          '.2466532...2356642.\n' +
          '.24686532.23568642.\n' +
          '.24688653235688642.\n' +
          '.24666665456666642.\n' +
          '.24444444444444442.\n' +
          '.22222222222222222.\n' +
          '...................\n'
      );

      gdjs.NavMeshGenerator.generateRegions(grid);
      checkRegions(
        grid, //
        '...................\n' +
          '.11111111112222222.\n' +
          '.11111111112222222.\n' +
          '.11111111122222222.\n' +
          '.11111111122222222.\n' +
          '.11111111.22222222.\n' +
          '.1111111...2222222.\n' +
          '.111111.....222222.\n' +
          '.11111.......22222.\n' +
          '.1111.........2222.\n' +
          '.11333.......44444.\n' +
          '.333333.....444444.\n' +
          '.3333333...4444444.\n' +
          '.33333333.44444444.\n' +
          '.33333333344444444.\n' +
          '.33333333344444444.\n' +
          '.33333333344444444.\n' +
          '.33333333344444444.\n' +
          '...................\n'
      );

      const contours = gdjs.NavMeshGenerator.buildContours(grid);
      console.log(
        contours
          .map((contour) =>
            contour
              .map((point) => '(' + point.x + ' ' + point.y + ')')
              .join(', ')
          )
          .join('\n')
      );
      const points = contours.map((contour) =>
        contour.map((point) => [point.x, point.y])
      );
      expect(points[0]).to.eql([
        [1, 11],
        [5, 10],
        [10, 5],
        [11, 1],
        [1, 1],
      ]);

      expect(points[1]).to.eql([
        [10, 5],
        [14, 10],
        [18, 10],
        [18, 1],
        [11, 1],
      ]);

      expect(points[2]).to.eql([
        [1, 11],
        [1, 18],
        [10, 18],
        [10, 14],
        [5, 10],
      ]);

      
      expect(points[3]).to.eql([
        [10, 14],
        [10, 18],
        [18, 18],
        [18, 10],
        [14, 10],
      ]);
    });
  });
});
