// @ts-check

describe('WebGPU spring bone backend with injected fakes', function () {
  class FakeBuffer {
    constructor(descriptor) {
      this.label = descriptor.label;
      this.size = descriptor.size;
      this.bytes = new Uint8Array(descriptor.size);
      this.destroyed = false;
    }
    mapAsync() {
      return Promise.resolve();
    }
    getMappedRange() {
      return this.bytes.buffer;
    }
    unmap() {}
    destroy() {
      this.destroyed = true;
    }
  }

  const copyBytes = (data) =>
    data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

  const makeManager = () => {
    const buffers = [];
    const dispatches = [];
    const encoder = {
      beginComputePass() {
        return {
          setPipeline() {},
          setBindGroup() {},
          dispatchWorkgroups(count) {
            dispatches.push(count);
          },
          end() {},
        };
      },
      copyBufferToBuffer(source, sourceOffset, destination, destinationOffset, size) {
        destination.bytes.set(
          source.bytes.subarray(sourceOffset, sourceOffset + size),
          destinationOffset
        );
      },
    };
    const device = {
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
      createShaderModule() {
        return {};
      },
      createComputePipeline() {
        return { getBindGroupLayout: () => ({}) };
      },
      createBindGroup(descriptor) {
        return { descriptor };
      },
    };
    return {
      device,
      getCommandEncoder: () => encoder,
      afterSubmit: (callback) => callback(),
      buffers,
      dispatches,
    };
  };

  const makeBackend = () => {
    const configuration = gdjs.parseSpringBoneConfiguration({
      formatVersion: 1,
      chains: [
        {
          name: 'Hair',
          bones: ['Root', 'End'],
          damping: 0.9,
          stiffness: 0.1,
          gravity: [0, 0, -600],
          maxAngleDegrees: 120,
        },
      ],
      colliders: [],
    });
    const state = {
      positions: new Float32Array([0, 0, 0, 0, 0, -10]),
      previousPositions: new Float32Array([0, 0, 0, 0, 0, -10]),
    };
    const manager = makeManager();
    const failures = [];
    const backend = gdjs.WebGpuSpringBoneBackend.create(
      /** @type {any} */ (manager),
      configuration,
      state,
      (reason) => failures.push(reason)
    );
    return { backend, configuration, state, manager, failures };
  };

  it('uses one chain workgroup and triple readback buffers', function () {
    const { backend, configuration, state, manager } = makeBackend();
    backend.setFrameData({
      targets: state.positions,
      colliderWorldData: new Float32Array(0),
      gravityScale: 1,
      windX: 0,
      windY: 0,
      windZ: 0,
    });
    backend.step(1 / 120);
    expect(manager.dispatches).to.eql([configuration.chains.length]);
    expect(
      manager.buffers.filter((buffer) =>
        buffer.label.startsWith('GDevelop spring bone readback')
      ).length
    ).to.be(3);
    backend.dispose();
  });

  it('publishes a finite asynchronously copied state', function () {
    const { backend, state } = makeBackend();
    backend.requestSnapshot(7);
    return Promise.resolve()
      .then(() => Promise.resolve())
      .then(() => {
        const snapshot = backend.getLatestSnapshot();
        if (!snapshot) throw new Error('Expected a spring-bone snapshot.');
        expect(snapshot.sequence).to.be(7);
        expect(Array.from(snapshot.positions)).to.eql(
          Array.from(state.positions)
        );
        backend.dispose();
      });
  });
});
