// @ts-check

describe('Cloth WebGPU compute and WebGL render coexistence', function () {
  it('computes a cloth snapshot and renders it with THREE.WebGLRenderer', function () {
    if (!navigator.gpu) {
      throw new Error(
        'This dedicated smoke test requires navigator.gpu. Run it only in a deliberately WebGPU-enabled environment.'
      );
    }
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const renderer = new THREE.WebGLRenderer({ canvas });
    const manager = new gdjs.WebGpuClothDeviceManager(navigator.gpu);
    let backend = null;
    const topology = gdjs.buildClothSimulationTopology(4, 4, 20, 20);
    const state = gdjs.makeRestClothSimulationState(
      topology,
      gdjs.buildClothPinMask(topology, 'TopCorners', 1)
    );

    return manager
      .initialize()
      .then(() => {
        backend = gdjs.WebGpuClothSimulationBackend.create(
          manager,
          topology,
          state,
          1,
          (reason) => {
            throw new Error(`Unexpected WebGPU failure: ${reason}`);
          }
        );
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
        manager.beginFrame();
        for (let index = 0; index < 4; index++) backend.step(1 / 60);
        backend.requestSnapshot(1);
        manager.endFrame();
        const startedAt = performance.now();
        return new Promise((resolve, reject) => {
          const checkSnapshot = () => {
            const snapshot = backend.getLatestSnapshot();
            if (snapshot) return resolve(snapshot);
            if (performance.now() - startedAt > 5000) {
              return reject(
                new Error('Timed out waiting for WebGPU readback.')
              );
            }
            setTimeout(checkSnapshot, 10);
          };
          checkSnapshot();
        });
      })
      .then((snapshot) => {
        expect(snapshot.positions[2]).to.be(0);
        expect(snapshot.positions[4 * 3 + 2]).to.be(0);
        expect(Number.isFinite(snapshot.positions[12 * 3 + 2])).to.be(true);
        expect(snapshot.positions[12 * 3 + 2]).to.be.lessThan(0);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(snapshot.positions, 3)
        );
        geometry.setAttribute('uv', new THREE.BufferAttribute(topology.uvs, 2));
        geometry.setIndex(new THREE.BufferAttribute(topology.indices, 1));
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        const scene = new THREE.Scene();
        scene.add(mesh);
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        camera.position.z = 50;
        renderer.render(scene, camera);
        geometry.dispose();
        material.dispose();
      })
      .finally(() => {
        if (backend) backend.dispose();
        manager.dispose();
        renderer.dispose();
      });
  });
});
