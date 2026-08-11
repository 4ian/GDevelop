// @ts-check

describe('Spring bone WebGPU compute and WebGL render coexistence', function () {
  it('computes a bone-chain snapshot and renders through THREE.WebGLRenderer', function () {
    if (!navigator.gpu) {
      throw new Error(
        'This dedicated smoke test requires navigator.gpu. Run it only in a deliberately WebGPU-enabled environment.'
      );
    }
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const renderer = new THREE.WebGLRenderer({ canvas });
    const manager = new gdjs.WebGpuComputeDeviceManager(navigator.gpu);
    let backend = null;
    const configuration = gdjs.parseSpringBoneConfiguration({
      formatVersion: 1,
      chains: [
        {
          name: 'Hair',
          bones: ['Root', 'Middle', 'End'],
          damping: 0.9,
          stiffness: 0.1,
          gravity: [0, 0, -600],
          maxAngleDegrees: 150,
        },
      ],
      colliders: [],
    });
    const state = {
      positions: new Float32Array([0, 0, 0, 0, 0, -10, 0, 0, -20]),
      previousPositions: new Float32Array([
        0, 0, 0, 0, 0, -10, 0, 0, -20,
      ]),
    };

    return manager
      .initialize()
      .then(() => {
        backend = gdjs.WebGpuSpringBoneBackend.create(
          manager,
          configuration,
          state,
          (reason) => {
            throw new Error(`Unexpected WebGPU failure: ${reason}`);
          }
        );
        backend.setFrameData({
          targets: state.positions,
          colliderWorldData: new Float32Array(0),
          gravityScale: 1,
          windX: 300,
          windY: 0,
          windZ: 0,
        });
        manager.beginFrame();
        for (let index = 0; index < 4; index++) backend.step(1 / 120);
        backend.requestSnapshot(1);
        manager.endFrame();
        const startedAt = performance.now();
        return new Promise((resolve, reject) => {
          const checkSnapshot = () => {
            const snapshot = backend.getLatestSnapshot();
            if (snapshot) return resolve(snapshot);
            if (performance.now() - startedAt > 5000) {
              return reject(
                new Error('Timed out waiting for spring-bone WebGPU readback.')
              );
            }
            setTimeout(checkSnapshot, 10);
          };
          checkSnapshot();
        });
      })
      .then((snapshot) => {
        expect(snapshot.positions[0]).to.be(0);
        expect(Number.isFinite(snapshot.positions[3])).to.be(true);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(snapshot.positions, 3)
        );
        const material = new THREE.LineBasicMaterial();
        const line = new THREE.Line(geometry, material);
        const scene = new THREE.Scene();
        scene.add(line);
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
