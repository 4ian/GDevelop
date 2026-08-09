// @ts-check

describe('Shared WebGPU compute device manager', function () {
  it('initializes one injected device and submits queued commands', function () {
    let requestDeviceCount = 0;
    let submitCount = 0;
    const device = {
      lost: new Promise(() => {}),
      queue: {
        submit() {
          submitCount++;
        },
      },
      createCommandEncoder() {
        return { finish: () => ({}) };
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
          requestDevice() {
            requestDeviceCount++;
            return Promise.resolve(device);
          },
        }),
    };
    const failures = [];
    const manager = new gdjs.WebGpuComputeDeviceManager(
      /** @type {any} */ (gpu)
    );
    manager.addFailureListener((reason) => failures.push(reason));
    return manager.initialize().then(() => {
      manager.beginFrame();
      manager.getCommandEncoder();
      manager.endFrame();
      expect(requestDeviceCount).to.be(1);
      expect(submitCount).to.be(1);
      expect(failures).to.eql([]);
      manager.dispose();
    });
  });

  it('reports stable unavailability', function () {
    const manager = new gdjs.WebGpuComputeDeviceManager(null);
    return manager.initialize().then(
      () => {
        throw new Error('Expected initialization to fail.');
      },
      (error) => {
        expect(error.reason).to.be('webgpu-unavailable');
        manager.dispose();
      }
    );
  });
});
