// @ts-check

describe('Spring bone CPU solver', function () {
  const makeConfiguration = (withCollider = false) =>
    gdjs.parseSpringBoneConfiguration({
      formatVersion: 1,
      chains: [
        {
          name: 'Hair',
          bones: ['Root', 'Middle', 'End'],
          damping: 0.9,
          stiffness: 0.05,
          gravity: [0, 0, -600],
          maxAngleDegrees: 150,
          collisionMargin: 0,
          collisionPointCount: 2,
        },
      ],
      colliders: withCollider
        ? [
            {
              name: 'Sphere',
              type: 'sphere',
              bone: 'Root',
              center: [0, 0, -10],
              radius: 8,
            },
          ]
        : [],
    });

  const makeState = () => ({
    positions: new Float32Array([0, 0, 0, 0, 0, -10, 0, 0, -20]),
    previousPositions: new Float32Array([
      0, 0, 0, 0, 0, -10, 0, 0, -20,
    ]),
  });

  it('keeps exact animated segment lengths while gravity moves the chain', function () {
    const configuration = makeConfiguration();
    const solver = new gdjs.SpringBoneSolver(configuration, makeState());
    solver.setFrameData({
      targets: makeState().positions,
      colliderWorldData: new Float32Array(0),
      gravityScale: 1,
      windX: 250,
      windY: 0,
      windZ: 0,
    });
    for (let index = 0; index < 12; index++) solver.step(1 / 120);
    expect(Math.hypot(...Array.from(solver.positions.slice(3, 6)))).to.be.within(
      9.999,
      10.001
    );
    expect(solver.positions[3]).to.be.greaterThan(0);
    expect(solver.hasFiniteState()).to.be(true);
  });

  it('creates root-motion lag when the animated model moves', function () {
    const configuration = makeConfiguration();
    const solver = new gdjs.SpringBoneSolver(configuration, makeState());
    const movedTargets = new Float32Array([
      20, 0, 0, 20, 0, -10, 20, 0, -20,
    ]);
    solver.setFrameData({
      targets: movedTargets,
      colliderWorldData: new Float32Array(0),
      gravityScale: 0,
      windX: 0,
      windY: 0,
      windZ: 0,
    });
    solver.step(1 / 120);
    expect(solver.positions[0]).to.be(20);
    expect(solver.positions[3]).to.be.lessThan(20);
  });

  it('projects selected points outside a sphere proxy', function () {
    const configuration = makeConfiguration(true);
    const solver = new gdjs.SpringBoneSolver(configuration, makeState());
    solver.setFrameData({
      targets: makeState().positions,
      colliderWorldData: new Float32Array([0, 0, -10, 8, 0, 0, -10, 8]),
      gravityScale: 0,
      windX: 0,
      windY: 0,
      windZ: 0,
    });
    solver.step(1 / 120);
    expect(
      Math.hypot(
        solver.positions[3],
        solver.positions[4],
        solver.positions[5] + 10
      )
    ).to.be.greaterThan(7.999);
  });
});
