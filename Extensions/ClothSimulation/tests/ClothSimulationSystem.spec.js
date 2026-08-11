// @ts-check

describe('Cloth simulation scene system', function () {
  const parameters = {
    stiffness: 0,
    damping: 0,
    accelerationX: 0,
    accelerationY: 0,
    accelerationZ: -60,
    sphereColliderEnabled: false,
    sphereCenterX: 0,
    sphereCenterY: 0,
    sphereCenterZ: 0,
    sphereRadius: 0,
  };

  /** @returns {any} */
  const makeObject = () => {
    const topology = gdjs.buildClothSimulationTopology(2, 2, 20, 20);
    const fixed = gdjs.buildClothPinMask(topology, 'TopEdge', 1);
    const renderer = {
      snapshots: /** @type {any[]} */ ([]),
      updateSnapshot(snapshot) {
        this.snapshots.push(snapshot);
      },
    };
    return {
      topology,
      renderer,
      budgetPaused: false,
      droppedTime: 0,
      fallbackReason: null,
      activeBackend: 'CPU',
      getSimulationTopology: () => topology,
      makeRestSimulationState: () =>
        gdjs.makeRestClothSimulationState(topology, fixed),
      getSimulationGeneration: () => 1,
      getBackendPreference: () => 'CPU',
      getSimulationFrequency: () => 360,
      getMaxSubsteps: () => 2,
      isSimulationEnabled: () => true,
      getStepParameters: () => parameters,
      _getPendingPinCommands: () => [],
      _clearPendingPinCommands: () => {},
      getRenderer: () => renderer,
      _setActiveBackend(kind) {
        this.activeBackend = kind;
      },
      _setFallbackReason(reason) {
        this.fallbackReason = reason;
      },
      hasWebGPUFallbackOccurred: () => false,
      _setBudgetPaused(paused) {
        this.budgetPaused = paused;
      },
      _addDroppedSimulationTime(seconds) {
        this.droppedTime += seconds;
      },
      _setDroppedSimulationTime(seconds) {
        this.droppedTime = seconds;
      },
    };
  };

  const makeSystem = () =>
    new gdjs.ClothSimulationSystem(
      /** @type {any} */ ({
        getGame() {
          throw new Error('CPU-only tests must not request a WebGPU device.');
        },
      })
    );

  it('uses stable creation-order admission and retries released capacity', function () {
    const system = makeSystem();
    const objects = [];
    for (let index = 0; index < 17; index++) {
      const object = makeObject();
      objects.push(object);
      system.registerObject(object);
    }
    expect(objects[15].budgetPaused).to.be(false);
    expect(objects[16].budgetPaused).to.be(true);
    system.unregisterObject(objects[0]);
    expect(objects[16].budgetPaused).to.be(false);
    system.dispose();
  });

  it('caps substeps and reports exactly discarded whole-step time', function () {
    const system = makeSystem();
    const object = makeObject();
    system.registerObject(object);
    system.step(1 / 15);
    expect(object.renderer.snapshots.length).to.be(1);
    expect(Math.abs(object.droppedTime - 22 / 360)).to.be.lessThan(1e-9);
    system.resetObject(object);
    expect(object.droppedTime).to.be(0);
    system.dispose();
  });

  it('reports time discarded by the frame-delta cap', function () {
    const system = makeSystem();
    const object = makeObject();
    system.registerObject(object);
    system.step(1);
    expect(
      Math.abs(object.droppedTime - (1 - 1 / 15 + 22 / 360))
    ).to.be.lessThan(1e-9);
    system.dispose();
  });

  it('disposes idempotently and stops advancing records', function () {
    const system = makeSystem();
    const object = makeObject();
    system.registerObject(object);
    system.dispose();
    system.dispose();
    system.step(1 / 60);
    expect(object.renderer.snapshots.length).to.be(0);
  });
});
