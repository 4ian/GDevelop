// @ts-check

/**
 * Micro benchmarks of the 3D picking done by the in-game editor.
 *
 * This is the cost of finding the object under the cursor, which is run at
 * every frame by the editor. It doesn't need a WebGL context: only the
 * Three.js scene graph and the raycaster are used.
 *
 * Two scene shapes are measured:
 * - flat meshes (like cubes),
 * - groups of meshes (like a GLTF model cloned for each instance).
 *
 * For each one, the brute force raycasting (what the editor did before) is
 * compared with the broad phase that skips the objects whose bounds are not
 * crossed by the ray.
 */
describe('In-game editor picking', function () {
  /**
   * @param {{instanceCount: number, meshesPerInstance: number}} options
   * @returns {{threeGroup: THREE.Group, raycaster: THREE.Raycaster, threeCamera: THREE.Camera}}
   */
  const createScene = ({ instanceCount, meshesPerInstance }) => {
    const threeGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(16, 16, 16);
    const material = new THREE.MeshBasicMaterial();

    // Spread the instances on a grid, on several depth slices, so that the
    // ray crosses the scene instead of always hitting the same object.
    const gridSize = Math.ceil(Math.cbrt(instanceCount));
    let addedCount = 0;
    for (let z = 0; z < gridSize && addedCount < instanceCount; z++) {
      for (let y = 0; y < gridSize && addedCount < instanceCount; y++) {
        for (let x = 0; x < gridSize && addedCount < instanceCount; x++) {
          const instanceX = (x - gridSize / 2) * 40;
          const instanceY = (y - gridSize / 2) * 40;
          const instanceZ = (z - gridSize / 2) * 40;

          if (meshesPerInstance === 1) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(instanceX, instanceY, instanceZ);
            threeGroup.add(mesh);
          } else {
            // Like a model: a group of meshes, cloned for each instance.
            const instanceGroup = new THREE.Group();
            instanceGroup.position.set(instanceX, instanceY, instanceZ);
            for (
              let meshIndex = 0;
              meshIndex < meshesPerInstance;
              meshIndex++
            ) {
              const mesh = new THREE.Mesh(geometry, material);
              mesh.position.set(
                ((meshIndex % 3) - 1) * 12,
                (Math.floor(meshIndex / 3) - 1) * 12,
                0
              );
              instanceGroup.add(mesh);
            }
            threeGroup.add(instanceGroup);
          }
          addedCount++;
        }
      }
    }
    threeGroup.updateMatrixWorld(true);

    const threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);
    threeCamera.position.set(0, 0, 1000);
    threeCamera.lookAt(0, 0, 0);
    threeCamera.updateMatrixWorld(true);

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(0);

    return { threeGroup, raycaster, threeCamera };
  };

  /**
   * @param {number} instanceCount
   * @param {number} meshesPerInstance
   */
  const benchmarkPicking = (instanceCount, meshesPerInstance) => {
    const { threeGroup, raycaster, threeCamera } = createScene({
      instanceCount,
      meshesPerInstance,
    });
    const screenCenter = new THREE.Vector2(0, 0);
    const meshCount = instanceCount * meshesPerInstance;

    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 30,
      iterationsCount: Math.max(50, Math.floor(50000 / meshCount)),
    });

    const pick = (useBroadPhase) => {
      gdjs.InGameEditorPicking.findClosestIntersection({
        raycaster,
        layers: [{ threeCamera, threeGroup }],
        setRay: (targetRaycaster, camera) => {
          targetRaycaster.setFromCamera(screenCenter, camera);
        },
        worldScale: 100,
        isThreeObjectVisible: () => true,
        getRuntimeObject: () => null,
        useBroadPhase,
      });
    };

    benchmarkSuite.add(
      `pick ${instanceCount} instances / ${meshCount} meshes without broad phase`,
      () => pick(false)
    );

    benchmarkSuite.add(
      `pick ${instanceCount} instances / ${meshCount} meshes with broad phase`,
      () => pick(true)
    );

    console.log(benchmarkSuite.run());
  };

  for (const instanceCount of [100, 500, 1000, 3000]) {
    it(`benchmark picking ${instanceCount} meshes`, function () {
      this.timeout(120000);
      benchmarkPicking(instanceCount, 1);
    });
  }

  for (const instanceCount of [300, 1000, 3000]) {
    it(`benchmark picking ${instanceCount} models of 3 meshes`, function () {
      this.timeout(120000);
      benchmarkPicking(instanceCount, 3);
    });
  }
});
