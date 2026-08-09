// @ts-check

describe('WebGPU cloth simulation backend with injected fakes', function () {
  class FakeBuffer {
    constructor(descriptor) {
      this.label = descriptor.label;
      this.size = descriptor.size;
      this.usage = descriptor.usage;
      this.bytes = new Uint8Array(descriptor.size);
      this.destroyCount = 0;
    }
    mapAsync() {
      return Promise.resolve();
    }
    getMappedRange() {
      return this.bytes.buffer;
    }
    unmap() {}
    destroy() {
      this.destroyCount++;
    }
  }

  const copyBytes = (data) => {
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  };

  const makeFakeManager = (limits) => {
    const buffers = [];
    const passOrder = [];
    const dispatches = [];
    const device = {
      limits: {
        maxBufferSize: 1 << 24,
        maxStorageBufferBindingSize: 1 << 24,
        ...limits,
      },
      queue: {
        writeBuffer(buffer, offset, data) {
          buffer.bytes.set(copyBytes(data), offset);
        },
      },
      createBuffer(descriptor) {
        const buffer = new FakeBuffer(descriptor);
        buffers.push(buffer);
        return buffer;
      },
      createBindGroup(descriptor) {
        return { descriptor };
      },
    };
    const makePipeline = (name) => ({
      name,
      getBindGroupLayout: () => ({ name }),
    });
    const encoder = {
      beginComputePass(descriptor) {
        passOrder.push(descriptor.label);
        return {
          setPipeline() {},
          setBindGroup() {},
          dispatchWorkgroups(count) {
            dispatches.push(count);
          },
          end() {},
        };
      },
      copyBufferToBuffer(
        source,
        sourceOffset,
        destination,
        destinationOffset,
        size
      ) {
        destination.bytes.set(
          source.bytes.subarray(sourceOffset, sourceOffset + size),
          destinationOffset
        );
      },
    };
    return {
      device,
      springPipeline: makePipeline('spring'),
      particlePipeline: makePipeline('particle'),
      pinPipeline: makePipeline('pin'),
      bindGroupLayout: {},
      getCommandEncoder: () => encoder,
      afterSubmit: (callback) => callback(),
      buffers,
      passOrder,
      dispatches,
    };
  };

  const makeBackend = (manager) => {
    const topology = gdjs.buildClothSimulationTopology(3, 5, 30, 50);
    const state = gdjs.makeRestClothSimulationState(
      topology,
      gdjs.buildClothPinMask(topology, 'TopCorners', 1)
    );
    const failures = [];
    const backend = gdjs.WebGpuClothSimulationBackend.create(
      manager,
      topology,
      state,
      4,
      (reason) => failures.push(reason)
    );
    return { topology, state, backend, failures };
  };

  it('uses aligned buffer layouts and ceiling workgroup dispatches', function () {
    const manager = makeFakeManager();
    const { topology, backend } = makeBackend(manager);
    const positionBuffer = manager.buffers.find(
      (buffer) => buffer.label === 'GDevelop cloth positions'
    );
    const springBuffer = manager.buffers.find(
      (buffer) => buffer.label === 'GDevelop cloth springs'
    );
    const uniformBuffer = manager.buffers.find(
      (buffer) => buffer.label === 'GDevelop cloth parameters'
    );
    expect(positionBuffer.size).to.be(topology.particleCount * 16);
    expect(springBuffer.size).to.be(topology.springCount * 16);
    expect(uniformBuffer.size).to.be(64);
    backend.applyParameters({
      stiffness: 0.2,
      damping: 0.99,
      accelerationX: 0,
      accelerationY: 0,
      accelerationZ: -600,
      sphereColliderEnabled: false,
      sphereCenterX: 0,
      sphereCenterY: 0,
      sphereCenterZ: 0,
      sphereRadius: 0,
    });
    backend.step(1 / 60);
    expect(manager.passOrder).to.eql([
      'GDevelop cloth springs',
      'GDevelop cloth particles',
    ]);
    expect(manager.dispatches).to.eql([
      Math.ceil(topology.springCount / 64),
      Math.ceil(topology.particleCount / 64),
    ]);
    backend.dispose();
  });

  it('publishes copied snapshots without retaining mapped memory', function () {
    const manager = makeFakeManager();
    const { state, backend } = makeBackend(manager);
    backend.requestSnapshot(7);
    return Promise.resolve()
      .then(() => Promise.resolve())
      .then(() => {
        const snapshot = backend.getLatestSnapshot();
        if (!snapshot) throw new Error('Expected a WebGPU snapshot.');
        expect(snapshot.sequence).to.be(7);
        expect(Array.from(snapshot.positions)).to.eql(
          Array.from(state.positions)
        );
        backend.dispose();
      });
  });

  it('retains the authoritative GPU position as a newly captured pin target', function () {
    const manager = makeFakeManager();
    const { topology, backend } = makeBackend(manager);
    const index = topology.particleCount - 1;
    backend.applyPinCommands([{ index, pinned: true }]);
    const positionBuffer = manager.buffers.find(
      (buffer) => buffer.label === 'GDevelop cloth positions'
    );
    const positions = new Float32Array(positionBuffer.bytes.buffer);
    positions[index * 4] = 7;
    positions[index * 4 + 1] = 8;
    positions[index * 4 + 2] = 9;
    backend.requestSnapshot(3);
    return Promise.resolve()
      .then(() => Promise.resolve())
      .then(() => {
        const state = backend.exportLatestRecoverableState();
        expect(state.fixed[index]).to.be(1);
        expect(
          Array.from(state.pinTargets.slice(index * 3, index * 3 + 3))
        ).to.eql([7, 8, 9]);
        backend.dispose();
      });
  });

  it('ignores a readback that completes after a reset', function () {
    const manager = makeFakeManager();
    const { state, backend } = makeBackend(manager);
    const readbackBuffer = manager.buffers.find(
      (buffer) => buffer.label === 'GDevelop cloth readback'
    );
    const deferred = {
      /** @type {null | (() => void)} */
      resolve: null,
    };
    readbackBuffer.mapAsync = () =>
      new Promise((resolve) => {
        deferred.resolve = () => resolve(undefined);
      });
    backend.requestSnapshot(1);
    const resetState = {
      positions: state.positions.slice(),
      previousPositions: state.previousPositions.slice(),
      fixed: state.fixed.slice(),
      pinTargets: state.pinTargets.slice(),
    };
    resetState.positions.fill(42);
    resetState.previousPositions.fill(42);
    backend.reset(resetState);
    if (!deferred.resolve)
      throw new Error('Expected readback mapping to start.');
    deferred.resolve();
    return Promise.resolve()
      .then(() => Promise.resolve())
      .then(() => {
        const recovered = backend.exportLatestRecoverableState();
        expect(Array.from(recovered.positions)).to.eql(
          Array.from(resetState.positions)
        );
        expect(backend.getLatestSnapshot()).to.be(null);
        backend.dispose();
      });
  });

  it('rejects insufficient buffer limits before allocation', function () {
    const manager = makeFakeManager({
      maxBufferSize: 16,
      maxStorageBufferBindingSize: 16,
    });
    expect(() => makeBackend(manager)).to.throwException((error) => {
      expect(error.reason).to.be('webgpu-limit-insufficient');
    });
    expect(manager.buffers.length).to.be(0);
  });

  it('uses reviewed static WGSL and a fixed workgroup size', function () {
    expect(gdjs.clothSimulationWgsl).to.contain('@workgroup_size(64)');
    expect(gdjs.clothSimulationWgsl).to.contain(
      'springIndex >= parameters.counts.y'
    );
    expect(gdjs.clothSimulationWgsl).not.to.contain('${');
  });

  it('reports an unavailable WebGPU implementation as a stable failure', function () {
    const manager = new gdjs.WebGpuClothDeviceManager(null);
    return manager.initialize().then(
      () => {
        throw new Error('Expected WebGPU initialization to fail.');
      },
      (error) => {
        expect(error.reason).to.be('webgpu-unavailable');
        manager.dispose();
      }
    );
  });

  it('builds one explicit reviewed layout for all three pipelines', function () {
    const layouts = [];
    const pipelineDescriptors = [];
    const device = {
      lost: new Promise(() => {}),
      pushErrorScope() {},
      popErrorScope: () => Promise.resolve(null),
      createShaderModule: (descriptor) => descriptor,
      createBindGroupLayout(descriptor) {
        layouts.push(descriptor);
        return descriptor;
      },
      createPipelineLayout: (descriptor) => descriptor,
      createComputePipeline(descriptor) {
        pipelineDescriptors.push(descriptor);
        return descriptor;
      },
      destroy() {},
    };
    const gpu = {
      requestAdapter: () =>
        Promise.resolve({
          limits: {
            maxComputeWorkgroupSizeX: 64,
            maxComputeInvocationsPerWorkgroup: 64,
            maxStorageBuffersPerShaderStage: 8,
          },
          requestDevice: () => Promise.resolve(device),
        }),
    };
    const manager = new gdjs.WebGpuClothDeviceManager(/** @type {any} */ (gpu));
    return manager.initialize().then(() => {
      expect(layouts.length).to.be(1);
      expect(layouts[0].entries.length).to.be(9);
      expect(pipelineDescriptors.length).to.be(3);
      expect(pipelineDescriptors[0].layout).to.be(
        pipelineDescriptors[1].layout
      );
      expect(pipelineDescriptors[1].layout).to.be(
        pipelineDescriptors[2].layout
      );
      manager.dispose();
    });
  });
});
