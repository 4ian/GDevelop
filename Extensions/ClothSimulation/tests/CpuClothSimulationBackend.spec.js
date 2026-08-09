// @ts-check

describe('CPU cloth simulation backend', function () {
  const noForces = {
    stiffness: 0.2,
    damping: 0.99,
    accelerationX: 0,
    accelerationY: 0,
    accelerationZ: 0,
    sphereColliderEnabled: false,
    sphereCenterX: 0,
    sphereCenterY: 0,
    sphereCenterZ: 0,
    sphereRadius: 0,
  };

  /** @param {gdjs.ClothPinMode} pinMode */
  const makeBackend = (pinMode = 'None') => {
    const topology = gdjs.buildClothSimulationTopology(2, 2, 20, 20);
    const state = gdjs.makeRestClothSimulationState(
      topology,
      gdjs.buildClothPinMask(topology, pinMode, 1)
    );
    return {
      topology,
      backend: new gdjs.CpuClothSimulationBackend(topology, state, 1),
    };
  };

  it('keeps a force-free rest state finite and unchanged', function () {
    const { topology, backend } = makeBackend();
    backend.applyParameters(noForces);
    backend.step(1 / 60);
    backend.requestSnapshot(1);
    const snapshot = backend.getLatestSnapshot();
    expect(snapshot).not.to.be(null);
    if (!snapshot) throw new Error('Expected a CPU snapshot.');
    expect(Array.from(snapshot.positions)).to.eql(
      Array.from(topology.restPositions)
    );
    expect(backend.hasFiniteState()).to.be(true);
  });

  it('moves unpinned particles under acceleration and keeps pins exact', function () {
    const { topology, backend } = makeBackend('TopEdge');
    backend.applyParameters({
      ...noForces,
      accelerationZ: -600,
    });
    backend.step(1 / 60);
    const state = backend.exportLatestRecoverableState();
    for (let index = 0; index < topology.columns; index++) {
      expect(state.positions[index * 3 + 2]).to.be(0);
      expect(state.previousPositions[index * 3 + 2]).to.be(0);
    }
    const bottomMiddle = (topology.particleCount - 2) * 3 + 2;
    expect(state.positions[bottomMiddle]).to.be.lessThan(0);
  });

  it('applies equal and opposite spring corrections before integration', function () {
    const { topology, backend } = makeBackend();
    const state = backend.exportLatestRecoverableState();
    state.positions[0] -= 5;
    state.previousPositions.set(state.positions);
    backend.reset(state);
    backend.applyParameters({ ...noForces, stiffness: 1, damping: 0 });
    const before = backend.exportLatestRecoverableState().positions;
    backend.step(1 / 60);
    const after = backend.exportLatestRecoverableState().positions;
    let totalDeltaX = 0;
    for (let index = 0; index < topology.particleCount; index++) {
      totalDeltaX += after[index * 3] - before[index * 3];
    }
    expect(Math.abs(totalDeltaX)).to.be.lessThan(1e-5);
  });

  it('pins and unpins without stored release velocity', function () {
    const { backend } = makeBackend();
    backend.applyPinCommands([{ index: 4, pinned: true }]);
    let state = backend.exportLatestRecoverableState();
    expect(state.fixed[4]).to.be(1);
    expect(state.positions[12]).to.be(state.previousPositions[12]);
    backend.applyPinCommands([{ index: 4, pinned: false }]);
    state = backend.exportLatestRecoverableState();
    expect(state.fixed[4]).to.be(0);
    expect(state.positions[12]).to.be(state.previousPositions[12]);
  });

  it('handles a particle at the sphere center without NaN', function () {
    const { backend } = makeBackend();
    const state = backend.exportLatestRecoverableState();
    state.positions[0] = 0;
    state.positions[1] = 0;
    state.positions[2] = 0;
    state.previousPositions.set(state.positions);
    backend.reset(state);
    backend.applyParameters({
      ...noForces,
      stiffness: 0,
      sphereColliderEnabled: true,
      sphereRadius: 5,
    });
    backend.step(1 / 60);
    const result = backend.exportLatestRecoverableState();
    expect(result.positions[0]).to.be(0);
    expect(result.positions[1]).to.be(0);
    expect(result.positions[2]).to.be(5);
    expect(backend.hasFiniteState()).to.be(true);
  });

  it('does not replace working typed arrays during substeps', function () {
    const { backend } = makeBackend();
    const internals = /** @type {any} */ (backend);
    const positions = internals._positions;
    const corrections = internals._springCorrections;
    backend.applyParameters(noForces);
    for (let index = 0; index < 20; index++) backend.step(1 / 360);
    expect(internals._positions).to.be(positions);
    expect(internals._springCorrections).to.be(corrections);
  });
});
