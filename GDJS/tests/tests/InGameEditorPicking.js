// @ts-check

describe('gdjs.InGameEditorPicking', function () {
  /**
   * @returns {{threeGroup: THREE.Group, raycaster: THREE.Raycaster, threeCamera: THREE.Camera, frontMesh: THREE.Mesh, sideMesh: THREE.Mesh, backMesh: THREE.Mesh}}
   */
  const createScene = () => {
    const threeGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial();

    const frontMesh = new THREE.Mesh(geometry, material);
    frontMesh.position.set(0, 0, 0);
    threeGroup.add(frontMesh);

    const backMesh = new THREE.Mesh(geometry, material);
    backMesh.position.set(0, 0, -30);
    threeGroup.add(backMesh);

    const sideMesh = new THREE.Mesh(geometry, material);
    sideMesh.position.set(100, 0, 0);
    threeGroup.add(sideMesh);

    threeGroup.updateMatrixWorld(true);

    const threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    threeCamera.position.set(0, 0, 100);
    threeCamera.lookAt(0, 0, 0);
    threeCamera.updateMatrixWorld(true);

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(0);

    return {
      threeGroup,
      raycaster,
      threeCamera,
      frontMesh,
      sideMesh,
      backMesh,
    };
  };

  /**
   * @param {{threeGroup: THREE.Group, raycaster: THREE.Raycaster, threeCamera: THREE.Camera}} scene
   * @param {boolean} useBroadPhase
   * @returns {{intersect: THREE.Intersection, runtimeObject: gdjs.RuntimeObject | null} | null}
   */
  const pick = (scene, useBroadPhase) =>
    gdjs.InGameEditorPicking.findClosestIntersection({
      raycaster: scene.raycaster,
      layers: [
        { threeCamera: scene.threeCamera, threeGroup: scene.threeGroup },
      ],
      setRay: (raycaster, camera) =>
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera),
      worldScale: 1,
      isThreeObjectVisible: () => true,
      getRuntimeObject: () => null,
      useBroadPhase,
    });

  it('finds the same intersection with and without the broad phase', () => {
    const scene = createScene();

    const hitWithBroadPhase = pick(scene, true);
    const hitWithoutBroadPhase = pick(scene, false);

    expect(hitWithBroadPhase).not.to.be(null);
    expect(hitWithoutBroadPhase).not.to.be(null);
    if (!hitWithBroadPhase || !hitWithoutBroadPhase) return;

    expect(hitWithBroadPhase.intersect.object).to.be(scene.frontMesh);
    expect(hitWithoutBroadPhase.intersect.object).to.be(scene.frontMesh);
    expect(hitWithBroadPhase.intersect.distance).to.be(
      hitWithoutBroadPhase.intersect.distance
    );
  });

  it('updates the cached bounds when an object moves', () => {
    const scene = createScene();

    // The side object is not on the ray: the broad phase skips it and caches
    // its bounds.
    expect(pick(scene, true)?.intersect.object).to.be(scene.frontMesh);

    // Move the side object in front of the camera: the cached bounds must be
    // invalidated, otherwise it would still be skipped.
    scene.sideMesh.position.set(0, 0, 50);
    scene.sideMesh.updateMatrixWorld(true);

    const hitAfterMove = pick(scene, true);
    expect(hitAfterMove).not.to.be(null);
    if (!hitAfterMove) return;
    expect(hitAfterMove.intersect.object).to.be(scene.sideMesh);
  });

  it('can hit an object hidden behind another one if the first is ignored', () => {
    const scene = createScene();

    const hit = gdjs.InGameEditorPicking.findClosestIntersection({
      raycaster: scene.raycaster,
      layers: [
        { threeCamera: scene.threeCamera, threeGroup: scene.threeGroup },
      ],
      setRay: (raycaster, camera) =>
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera),
      worldScale: 1,
      isThreeObjectVisible: () => true,
      getRuntimeObject: (object) => /** @type {any} */ (object),
      isRuntimeObjectIgnored: (runtimeObject) =>
        /** @type {any} */ (runtimeObject) === scene.frontMesh,
    });

    expect(hit).not.to.be(null);
    if (!hit) return;
    expect(hit.intersect.object).to.be(scene.backMesh);
  });
});
