// @ts-check

describe('3D model bone attachments', function () {
  /** @returns {any} */
  const makeGltf = (bones, animations = []) => {
    const scene = new THREE.Group();
    scene.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 6),
        new THREE.MeshBasicMaterial()
      )
    );
    bones.forEach((bone) => scene.add(bone));
    return {
      scene,
      animations,
      cameras: [],
      scenes: [scene],
      asset: {},
      userData: {},
      parser: null,
    };
  };

  const makeBone = (runtimeName, authoredName) => {
    const bone = new THREE.Bone();
    bone.name = runtimeName;
    if (authoredName !== undefined) bone.userData.name = authoredName;
    return bone;
  };

  const add3DLayer = (runtimeScene, name) => {
    runtimeScene.addLayer({
      name,
      renderingType: '3d',
      cameraType: 'perspective',
      visibility: true,
      cameras: [],
      effects: [],
      ambientLightColorR: 0,
      ambientLightColorG: 0,
      ambientLightColorB: 0,
      isLightingLayer: false,
      followBaseLayerCamera: false,
    });
  };

  /** @returns {any} */
  const makeModelData = (name, width = 100, height = 100, depth = 100) => ({
    name,
    type: 'Scene3D::Model3DObject',
    effects: [],
    variables: [],
    behaviors: [
      {
        type: 'Scene3D::Base3DBehavior',
        name: 'Base3D',
      },
    ],
    content: {
      width,
      height,
      depth,
      modelResourceName: 'Rig',
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      keepAspectRatio: false,
      materialType: 'KeepOriginal',
      originLocation: 'ModelOrigin',
      centerLocation: 'ModelOrigin',
      animations: [],
      crossfadeDuration: 0,
      isCastingShadow: false,
      isReceivingShadow: false,
    },
  });

  const makeScene = (gltf) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    sinon.stub(runtimeGame.getModel3DManager(), 'getModel').returns(gltf);
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    add3DLayer(runtimeScene, '');
    add3DLayer(runtimeScene, 'Other');
    return runtimeScene;
  };

  const addModel = (container, data) => {
    const model = new gdjs.Model3DRuntimeObject(container, data);
    container.addObject(model);
    return model;
  };

  const getBase3D = (object) => object.getBehavior('Base3D');

  const addCustomObject3D = (container) => {
    const customObject = new gdjs.CustomRuntimeObject3D(container, {
      name: 'CustomObject',
      type: 'MyExtension::MyEventsBasedObject',
      variant: '',
      isInnerAreaFollowingParentSize: false,
      variables: [],
      behaviors: [],
      effects: [],
      content: { width: 0, height: 0, depth: 0 },
    });
    container.addObject(customObject);
    return customObject;
  };

  const expectClose = (actual, expected, epsilon = 1e-6) => {
    expect(Math.abs(actual - expected)).to.be.lessThan(epsilon);
  };

  const expectVectorClose = (actual, expected, epsilon = 1e-6) => {
    expectClose(actual.x, expected.x, epsilon);
    expectClose(actual.y, expected.y, epsilon);
    expectClose(actual.z, expected.z, epsilon);
  };

  it('extracts the closest proper rotation from scale, reflection and shear', function () {
    const extractor = new gdjs.Model3DScaleFreeRotationExtractor();
    const expectedQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.42, -0.31, 0.77, 'ZYX')
    );
    const expectedRotation = new THREE.Matrix4().makeRotationFromQuaternion(
      expectedQuaternion
    );
    const symmetricScaleAndShear = new THREE.Matrix4().set(
      2,
      0.3,
      0.1,
      0,
      0.3,
      3,
      0.2,
      0,
      0.1,
      0.2,
      4,
      0,
      0,
      0,
      0,
      1
    );
    const matrix = new THREE.Matrix4().multiplyMatrices(
      expectedRotation,
      symmetricScaleAndShear
    );
    const result = new THREE.Quaternion();
    expect(extractor.setQuaternionFromMatrix(matrix, result)).to.be(true);
    expect(result.angleTo(expectedQuaternion)).to.be.lessThan(1e-6);

    matrix.multiplyMatrices(
      expectedRotation,
      new THREE.Matrix4().makeScale(-2, 3, 4)
    );
    expect(extractor.setQuaternionFromMatrix(matrix, result)).to.be(true);
    expect(result.angleTo(expectedQuaternion)).to.be.lessThan(1e-6);
  });

  it('uses canonical authored names and rejects empty or ambiguous names', function () {
    const authoredBone = makeBone('HandSocket', 'Hand.Socket');
    const duplicate1 = makeBone('Duplicate');
    const duplicate2 = makeBone('Duplicate');
    const unnamed = makeBone('');
    const runtimeScene = makeScene(
      makeGltf([authoredBone, duplicate1, duplicate2, unnamed])
    );
    const model = addModel(runtimeScene, makeModelData('Model'));

    expect(model.hasBone('Hand.Socket')).to.be(true);
    expect(model.hasBone('HandSocket')).to.be(false);
    expect(model.hasBone('Duplicate')).to.be(false);
    expect(model.isBoneNameAmbiguous('Duplicate')).to.be(true);
    expect(model.hasBone('')).to.be(false);
    expect(model.hasBone('Bone 4')).to.be(false);
  });

  it('binds, captures and generation-checks spring bone chains', function () {
    const rootBone = makeBone('HairRoot');
    const endBone = makeBone('HairEnd');
    endBone.position.set(0, 0, -1);
    rootBone.add(endBone);
    const runtimeScene = makeScene(makeGltf([rootBone]));
    const modelData = makeModelData('Model');
    const model = addModel(runtimeScene, modelData);
    const renderer = model.getRenderer();
    const binding = renderer.createSpringBoneDynamicsBinding(
      [['HairRoot', 'HairEnd']],
      []
    );
    expect(binding).to.not.be(null);
    if (!binding) throw new Error('Expected a spring-bone binding.');
    const positions = new Float32Array(6);
    const quaternions = new Float32Array(8);
    expect(
      renderer.captureSpringBoneDynamicsPose(
        binding,
        positions,
        quaternions
      )
    ).to.be(true);
    const simulated = positions.slice();
    simulated[3] = positions[0] + 1;
    simulated[4] = positions[1];
    simulated[5] = positions[2];
    expect(
      renderer.applySpringBoneDynamicsPose(
        binding,
        simulated,
        quaternions,
        1
      )
    ).to.be(true);
    const clonedRoot = /** @type {any} */ (renderer)._bonesByCanonicalName.get(
      'HairRoot'
    );
    expect(clonedRoot.quaternion.angleTo(new THREE.Quaternion())).to.be.greaterThan(
      0.1
    );
    expect(
      renderer.restoreSpringBoneDynamicsAnimationPose(binding, quaternions)
    ).to.be(true);
    expect(
      clonedRoot.quaternion.angleTo(new THREE.Quaternion())
    ).to.be.lessThan(1e-6);

    renderer._updateModel(0, 0, 0, 100, 100, 100, false);
    expect(
      renderer.captureSpringBoneDynamicsPose(
        binding,
        positions,
        quaternions
      )
    ).to.be(false);
  });

  it('converts spring collider points from authored model coordinates', function () {
    const rootBone = makeBone('Root');
    const marker = new THREE.Object3D();
    marker.name = 'AuthoredColliderPoint';
    marker.position.set(0, 2, 0);
    rootBone.add(marker);
    const runtimeScene = makeScene(makeGltf([rootBone]));
    const modelData = makeModelData('Model', 20, 60, 40);
    modelData.content.rotationX = 90;
    const model = addModel(runtimeScene, modelData);
    model.setPosition(120, 230);
    model.setZ(340);
    const renderer = model.getRenderer();
    const binding = renderer.createSpringBoneDynamicsBinding([], ['Root']);
    expect(binding).to.not.be(null);
    if (!binding) throw new Error('Expected a spring-bone binding.');

    const localPoint = new Float32Array(3);
    expect(
      renderer.convertSpringBoneModelPointToBoneLocal(
        binding,
        'Root',
        0,
        0,
        2,
        localPoint,
        0
      )
    ).to.be(true);
    const resolvedPoint = new Float32Array(3);
    expect(
      renderer.getSpringBoneLocalPointInWorld(
        binding,
        'Root',
        localPoint[0],
        localPoint[1],
        localPoint[2],
        resolvedPoint,
        0
      )
    ).to.be(true);

    const clonedMarker = /** @type {any} */ (renderer)._clonedModelRoot.getObjectByName(
      'AuthoredColliderPoint'
    );
    clonedMarker.updateWorldMatrix(true, false);
    const expectedPoint = new THREE.Vector3().setFromMatrixPosition(
      clonedMarker.matrixWorld
    );
    expectVectorClose(
      new THREE.Vector3(
        resolvedPoint[0],
        resolvedPoint[1],
        resolvedPoint[2]
      ),
      expectedPoint
    );
  });

  it('synchronizes logical transforms without inheriting dimensions, flips or renderer parenting', function () {
    const bone = makeBone('Hand', 'Hand.Socket');
    const runtimeScene = makeScene(makeGltf([bone]));
    const target = addModel(runtimeScene, makeModelData('Target', 240, 90, 35));
    const attachment = addModel(
      runtimeScene,
      makeModelData('Attachment', 13, 17, 19)
    );
    target.setPosition(120, 230);
    target.setZ(340);
    target.setRotationX(15);
    target.setRotationY(-25);
    target.setAngle(35);
    target.flipX(true);

    const clonedBone = /** @type {any} */ (
      target.getRenderer()
    )._bonesByCanonicalName.get('Hand.Socket');
    clonedBone.position.set(0.5, 0.75, -0.25);
    clonedBone.rotation.set(0.2, -0.4, 0.6, 'ZYX');

    const layerGroup = runtimeScene.getLayer('').getRenderer().getThreeGroup();
    const pose = {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      quaternionX: 0,
      quaternionY: 0,
      quaternionZ: 0,
      quaternionW: 1,
    };
    expect(
      target.getBonePose(
        'Hand.Socket',
        /** @type {THREE.Object3D} */ (layerGroup),
        pose
      )
    ).to.be(true);

    const width = attachment.getWidth();
    const height = attachment.getHeight();
    const depth = attachment.getDepth();
    const behavior = getBase3D(attachment);
    behavior.attachToModelBone(target, 'Hand.Socket');

    expect(behavior.isAttachedToModelBone()).to.be(true);
    expect(behavior.isBoneAttachmentResolved()).to.be(true);
    expectClose(attachment.getX(), pose.positionX);
    expectClose(attachment.getY(), pose.positionY);
    expectClose(attachment.getZ(), pose.positionZ);
    expect(attachment.getWidth()).to.be(width);
    expect(attachment.getHeight()).to.be(height);
    expect(attachment.getDepth()).to.be(depth);
    expect(attachment.isFlippedX()).to.be(false);
    expect(attachment.get3DRendererObject().parent).to.be(layerGroup);

    behavior.setBoneAttachmentPositionOffset(4, -3, 2);
    behavior.setBoneAttachmentRotationOffset(10, 20, -30);
    const expectedPosition = new THREE.Vector3(4, -3, 2)
      .applyQuaternion(
        new THREE.Quaternion(
          pose.quaternionX,
          pose.quaternionY,
          pose.quaternionZ,
          pose.quaternionW
        )
      )
      .add(new THREE.Vector3(pose.positionX, pose.positionY, pose.positionZ));
    expectClose(attachment.getX(), expectedPosition.x);
    expectClose(attachment.getY(), expectedPosition.y);
    expectClose(attachment.getZ(), expectedPosition.z);
    expect(behavior.getBoneAttachmentOffsetX()).to.be(4);
    expect(behavior.getBoneAttachmentRotationOffsetZ()).to.be(-30);
    expect(attachment.get3DRendererObject().parent).to.be(layerGroup);
  });

  it('follows translation and rotation produced by the animation mixer', function () {
    const bone = makeBone('Hand');
    const animatedQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.3, -0.2, 0.6, 'ZYX')
    );
    const clip = new THREE.AnimationClip('Equip', 1, [
      new THREE.VectorKeyframeTrack(
        'Hand.position',
        [0, 1],
        [0, 0, 0, 1, 2, 3]
      ),
      new THREE.QuaternionKeyframeTrack(
        'Hand.quaternion',
        [0, 1],
        [
          0,
          0,
          0,
          1,
          animatedQuaternion.x,
          animatedQuaternion.y,
          animatedQuaternion.z,
          animatedQuaternion.w,
        ]
      ),
    ]);
    const runtimeScene = makeScene(makeGltf([bone], [clip]));
    const targetData = makeModelData('Target');
    targetData.content.animations = [
      { name: 'Equip', source: 'Equip', loop: false },
    ];
    const target = addModel(runtimeScene, targetData);
    const attachment = addModel(runtimeScene, makeModelData('Attachment'));
    const behavior = getBase3D(attachment);
    behavior.attachToModelBone(target, 'Hand');

    target.getRenderer().updateAnimation(0.5);
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);

    expect(behavior.isBoneAttachmentResolved()).to.be(true);
    expectClose(attachment.getX(), target.getBoneX('Hand'));
    expectClose(attachment.getY(), target.getBoneY('Hand'));
    expectClose(attachment.getZ(), target.getBoneZ('Hand'));
    expectClose(attachment.getRotationX(), target.getBoneRotationX('Hand'));
    expectClose(attachment.getRotationY(), target.getBoneRotationY('Hand'));
    expectClose(attachment.getAngle(), target.getBoneRotationZ('Hand'));
  });

  it('can disable root motion without disabling child bone animation', function () {
    const rootBone = makeBone('Root');
    const childBone = makeBone('Hand');
    rootBone.add(childBone);
    const clip = new THREE.AnimationClip('Walk', 1, [
      new THREE.VectorKeyframeTrack(
        'Root.position',
        [0, 1],
        [0, 0, 0, 10, 0, 0]
      ),
      new THREE.QuaternionKeyframeTrack(
        'Root.quaternion',
        [0, 1],
        [0, 0, 0, 1, 0, 0, 1, 0]
      ),
      new THREE.VectorKeyframeTrack(
        'Hand.position',
        [0, 1],
        [0, 0, 0, 0, 4, 0]
      ),
    ]);
    const runtimeScene = makeScene(makeGltf([rootBone], [clip]));
    const modelData = makeModelData('Model');
    modelData.content.animations = [
      {
        name: 'Walk',
        source: 'Walk',
        loop: false,
        useRootMotion: false,
      },
    ];
    const model = addModel(runtimeScene, modelData);
    const renderer = /** @type {any} */ (model.getRenderer());

    renderer.updateAnimation(0.5);

    const clonedRootBone = renderer._bonesByCanonicalName.get('Root');
    const clonedChildBone = renderer._bonesByCanonicalName.get('Hand');
    expectVectorClose(clonedRootBone.position, new THREE.Vector3(0, 0, 0));
    expect(clonedRootBone.quaternion.equals(new THREE.Quaternion())).to.be(
      true
    );
    expectVectorClose(clonedChildBone.position, new THREE.Vector3(0, 2, 0));
  });

  it('keeps root motion enabled when the option is omitted', function () {
    const rootBone = makeBone('Root');
    const clip = new THREE.AnimationClip('Walk', 1, [
      new THREE.VectorKeyframeTrack(
        'Root.position',
        [0, 1],
        [0, 0, 0, 10, 0, 0]
      ),
    ]);
    const runtimeScene = makeScene(makeGltf([rootBone], [clip]));
    const modelData = makeModelData('Model');
    modelData.content.animations = [
      { name: 'Walk', source: 'Walk', loop: false },
    ];
    const model = addModel(runtimeScene, modelData);
    const renderer = /** @type {any} */ (model.getRenderer());

    renderer.updateAnimation(0.5);

    const clonedRootBone = renderer._bonesByCanonicalName.get('Root');
    expectVectorClose(clonedRootBone.position, new THREE.Vector3(5, 0, 0));
  });

  it('matches a direct bone child with reflected model coordinates', function () {
    const bone = makeBone('Hand');
    const runtimeScene = makeScene(makeGltf([bone]));
    const targetData = makeModelData('Target', 20, 60, 40);
    targetData.content.rotationX = 90;
    const attachmentData = makeModelData('Attachment', 20, 60, 40);
    attachmentData.content.rotationX = 90;
    const target = addModel(runtimeScene, targetData);
    const attachment = addModel(runtimeScene, attachmentData);
    target.setPosition(120, 230);
    target.setZ(340);
    target.setRotationX(15);
    target.setRotationY(-25);
    target.setAngle(35);

    const clonedBone = /** @type {any} */ (
      target.getRenderer()
    )._bonesByCanonicalName.get('Hand');
    clonedBone.position.set(0.5, 0.75, -0.25);
    clonedBone.rotation.set(0.2, -0.4, 0.6, 'ZYX');

    const behavior = getBase3D(attachment);
    behavior.attachToModelBone(target, 'Hand');
    const layerGroup = /** @type {THREE.Object3D} */ (
      runtimeScene.getLayer('').getRenderer().getThreeGroup()
    );
    const attachmentModelRoot = /** @type {any} */ (attachment.getRenderer())
      ._clonedModelRoot;
    const localPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];
    const expectAttachmentToMatchDirectBoneChild = () => {
      layerGroup.updateMatrixWorld(true);
      localPoints.forEach((point) => {
        expectVectorClose(
          point.clone().applyMatrix4(attachmentModelRoot.matrixWorld),
          point.clone().applyMatrix4(clonedBone.matrixWorld)
        );
      });
    };

    expect(behavior.isBoneAttachmentResolved()).to.be(true);
    expectAttachmentToMatchDirectBoneChild();

    clonedBone.position.set(-0.25, 1.5, 0.35);
    clonedBone.rotation.set(-0.7, 0.35, -1.1, 'ZYX');
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
    expectAttachmentToMatchDirectBoneChild();
  });

  it('suspends on layer mismatch, resumes, detaches transactionally and cleans up target deletion', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Hand')]));
    const target = addModel(runtimeScene, makeModelData('Target'));
    const attachment = addModel(runtimeScene, makeModelData('Attachment'));
    const behavior = getBase3D(attachment);
    behavior.attachToModelBone(target, 'Hand');
    expect(behavior.isBoneAttachmentResolved()).to.be(true);

    attachment.setLayer('Other');
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
    const frozenX = attachment.getX();
    expect(behavior.isAttachedToModelBone()).to.be(true);
    expect(behavior.isBoneAttachmentResolved()).to.be(false);

    target.setX(target.getX() + 100);
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
    expect(attachment.getX()).to.be(frozenX);

    // Invalid reattachment leaves the existing unresolved relationship intact.
    behavior.attachToModelBone(target, 'Missing');
    expect(behavior.getAttachedBoneName()).to.be('Hand');

    attachment.setLayer('');
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
    expect(behavior.isBoneAttachmentResolved()).to.be(true);
    expect(attachment.getX()).not.to.be(frozenX);

    const detachedX = attachment.getX();
    behavior.detachFromModelBone();
    expect(behavior.isAttachedToModelBone()).to.be(false);
    expect(attachment.getX()).to.be(detachedX);

    behavior.attachToModelBone(target, 'Hand');
    target.deleteFromScene();
    runtimeScene._updateObjectsPreEvents();
    expect(behavior.isAttachedToModelBone()).to.be(false);
    expect(attachment.getX()).to.be(detachedX);
  });

  it('updates chains target-first and rejects self-links and cycles', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const first = addModel(runtimeScene, makeModelData('First'));
    const second = addModel(runtimeScene, makeModelData('Second'));
    const third = addModel(runtimeScene, makeModelData('Third'));
    const firstBehavior = getBase3D(first);
    const secondBehavior = getBase3D(second);
    const thirdBehavior = getBase3D(third);

    secondBehavior.attachToModelBone(first, 'Bone');
    thirdBehavior.attachToModelBone(second, 'Bone');
    first.setX(250);
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
    expect(secondBehavior.isBoneAttachmentResolved()).to.be(true);
    expect(thirdBehavior.isBoneAttachmentResolved()).to.be(true);

    firstBehavior.attachToModelBone(first, 'Bone');
    expect(firstBehavior.isAttachedToModelBone()).to.be(false);
    firstBehavior.attachToModelBone(third, 'Bone');
    expect(firstBehavior.isAttachedToModelBone()).to.be(false);
  });

  it('supports several attachments and replaces target callbacks safely', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const firstTarget = addModel(runtimeScene, makeModelData('FirstTarget'));
    const secondTarget = addModel(runtimeScene, makeModelData('SecondTarget'));
    const firstAttachment = addModel(
      runtimeScene,
      makeModelData('FirstAttachment')
    );
    const secondAttachment = addModel(
      runtimeScene,
      makeModelData('SecondAttachment')
    );
    const firstBehavior = getBase3D(firstAttachment);
    const secondBehavior = getBase3D(secondAttachment);

    firstBehavior.attachToModelBone(firstTarget, 'Bone');
    secondBehavior.attachToModelBone(firstTarget, 'Bone');
    expect(firstBehavior.isBoneAttachmentResolved()).to.be(true);
    expect(secondBehavior.isBoneAttachmentResolved()).to.be(true);

    firstBehavior.setBoneAttachmentPositionOffset(9, 8, 7);
    firstBehavior.attachToModelBone(firstTarget, 'Bone');
    expect(firstBehavior.getBoneAttachmentOffsetX()).to.be(9);

    firstBehavior.attachToModelBone(secondTarget, 'Bone');
    expect(firstBehavior.getBoneAttachmentOffsetX()).to.be(0);
    firstTarget.deleteFromScene();
    runtimeScene._updateObjectsPreEvents();
    expect(firstBehavior.isAttachedToModelBone()).to.be(true);
    expect(firstBehavior.isBoneAttachmentResolved()).to.be(true);
    expect(secondBehavior.isAttachedToModelBone()).to.be(false);
  });

  it('rejects cross-container replacement transactionally', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const otherRuntimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const attachment = addModel(runtimeScene, makeModelData('Attachment'));
    const originalTarget = addModel(runtimeScene, makeModelData('Target'));
    const otherTarget = addModel(
      otherRuntimeScene,
      makeModelData('OtherTarget')
    );
    const behavior = getBase3D(attachment);

    behavior.attachToModelBone(originalTarget, 'Bone');
    behavior.setBoneAttachmentPositionOffset(5, 6, 7);
    behavior.attachToModelBone(otherTarget, 'Bone');

    expect(behavior.getAttachedBoneName()).to.be('Bone');
    expect(behavior.getBoneAttachmentOffsetX()).to.be(5);
    expect(behavior._getModel3DBoneAttachment().target).to.be(originalTarget);
  });

  it('works in a custom 3D object container and unloads without manager entries', async function () {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    sinon
      .stub(runtimeGame.getModel3DManager(), 'getModel')
      .returns(makeGltf([makeBone('Hand')]));
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    add3DLayer(runtimeScene, '');
    const customObject = addCustomObject3D(runtimeScene);
    const childrenContainer = customObject.getChildrenContainer();
    const target = addModel(childrenContainer, makeModelData('Target'));
    const attachment = addModel(childrenContainer, makeModelData('Attachment'));
    const behavior = getBase3D(attachment);

    behavior.attachToModelBone(target, 'Hand');
    target.setPosition(41, 73);
    childrenContainer._updateObjectsPreEvents();
    expect(behavior.isBoneAttachmentResolved()).to.be(true);
    const childLayerGroup = childrenContainer
      .getLayer('')
      .getRenderer()
      .getThreeGroup();
    expect(attachment.get3DRendererObject().parent).to.be(childLayerGroup);

    const manager = gdjs.Model3DBoneAttachmentManager.getForScene(runtimeScene);
    expect(
      /** @type {any} */ (manager)._containerStates.has(childrenContainer)
    ).to.be(true);
    customObject.deleteFromScene();
    runtimeScene._updateObjectsPreEvents();
    expect(
      /** @type {any} */ (manager)._containerStates.has(childrenContainer)
    ).to.be(false);
    expect(behavior.isAttachedToModelBone()).to.be(false);
  });

  it('removes attachment entries on child deletion', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const target = addModel(runtimeScene, makeModelData('Target'));
    const attachment = addModel(runtimeScene, makeModelData('Attachment'));
    const behavior = getBase3D(attachment);
    behavior.attachToModelBone(target, 'Bone');
    const manager = gdjs.Model3DBoneAttachmentManager.getForScene(runtimeScene);

    attachment.deleteFromScene();
    runtimeScene._updateObjectsPreEvents();

    expect(behavior.isAttachedToModelBone()).to.be(false);
    expect(
      /** @type {any} */ (manager)._containerStates.has(runtimeScene)
    ).to.be(false);
  });

  it('rate-limits repeated unresolved warnings until resolution', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const target = addModel(runtimeScene, makeModelData('Target'));
    const attachment = addModel(runtimeScene, makeModelData('Attachment'));
    const behavior = getBase3D(attachment);
    const previousOutput = gdjs.Logger.getLoggerOutput();
    const warnings = [];
    gdjs.Logger.setLoggerOutput({
      log: (group, message, type) => {
        if (group === '3D bone attachments' && type === 'warning') {
          warnings.push(message);
        }
      },
    });

    try {
      behavior.attachToModelBone(target, 'Bone');
      attachment.setLayer('Other');
      gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
      gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
      expect(warnings.length).to.be(1);

      attachment.setLayer('');
      gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
      attachment.setLayer('Other');
      gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
      expect(warnings.length).to.be(2);
    } finally {
      gdjs.Logger.setLoggerOutput(previousOutput);
    }
  });

  it('runs synchronization after object updates and before object pre-render updates', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const attachment = addModel(runtimeScene, makeModelData('Attachment'));
    const target = addModel(runtimeScene, makeModelData('Target'));
    const behavior = getBase3D(attachment);
    behavior.attachToModelBone(target, 'Bone');

    const originalTargetUpdate = target.update.bind(target);
    target.update = (container) => {
      originalTargetUpdate(container);
      target.setX(321);
    };
    attachment.setX(-1000);
    runtimeScene._updateObjectsPreEvents();
    expect(attachment.getX()).not.to.be(-1000);

    target.setX(654);
    attachment.setX(-2000);
    runtimeScene._updateObjectsPreRender();
    expect(attachment.getX()).not.to.be(-2000);
  });

  it('retains a relationship by name across model rebuilds', function () {
    const firstGltf = makeGltf([makeBone('HandRuntime', 'Hand.Socket')]);
    const runtimeScene = makeScene(firstGltf);
    const modelManager = runtimeScene.getGame().getModel3DManager();
    const targetData = makeModelData('Target');
    const target = addModel(runtimeScene, targetData);
    const attachment = addModel(runtimeScene, makeModelData('Attachment'));
    const behavior = getBase3D(attachment);
    behavior.attachToModelBone(target, 'Hand.Socket');
    const oldBone = /** @type {any} */ (
      target.getRenderer()
    )._bonesByCanonicalName.get('Hand.Socket');
    const targetRenderer = /** @type {any} */ (target.getRenderer());
    const oldRoot = targetRenderer._clonedModelRoot;
    const oldMixer = targetRenderer._animationMixer;
    sinon.spy(oldMixer, 'stopAllAction');
    sinon.spy(oldMixer, 'uncacheRoot');

    const secondGltf = makeGltf([makeBone('SanitizedAgain', 'Hand.Socket')]);
    /** @type {any} */ (modelManager.getModel).returns(secondGltf);
    target._reloadModel(targetData);
    const newBone = /** @type {any} */ (
      target.getRenderer()
    )._bonesByCanonicalName.get('Hand.Socket');
    expect(newBone).not.to.be(oldBone);
    expect(oldMixer.stopAllAction.calledOnce).to.be(true);
    expect(oldMixer.uncacheRoot.calledOnceWith(oldRoot)).to.be(true);
    expect(oldRoot.parent).to.be(null);
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer(runtimeScene);
    expect(behavior.isAttachedToModelBone()).to.be(true);
    expect(behavior.isBoneAttachmentResolved()).to.be(true);
  });

  it('releases mixer bindings and the clone hierarchy when destroyed', function () {
    const runtimeScene = makeScene(makeGltf([makeBone('Bone')]));
    const target = addModel(runtimeScene, makeModelData('Target'));
    const renderer = /** @type {any} */ (target.getRenderer());
    const root = renderer._clonedModelRoot;
    const mixer = renderer._animationMixer;
    sinon.spy(mixer, 'stopAllAction');
    sinon.spy(mixer, 'uncacheRoot');

    target.onDestroyed();

    expect(mixer.stopAllAction.calledOnce).to.be(true);
    expect(mixer.uncacheRoot.calledOnceWith(root)).to.be(true);
    expect(root.parent).to.be(null);
    expect(renderer._clonedModelRoot).to.be(null);
    expect(renderer._bonesByCanonicalName.size).to.be(0);
  });
});
