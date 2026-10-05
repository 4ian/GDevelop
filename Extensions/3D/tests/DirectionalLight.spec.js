// @ts-check

describe('Scene3D::DirectionalLight', () => {
  /**
   * @param {'Z+' | 'Y-'} top
   * @returns {EffectData}
   */
  const makeDirectionalLightEffectData = (top) => ({
    name: 'Sun',
    effectType: 'Scene3D::DirectionalLight',
    stringParameters: { top, shadowQuality: 'medium' },
    booleanParameters: { isCastingShadow: true },
    doubleParameters: {
      // A vertical light is a special case for the "Y-" top.
      elevation: top === 'Y-' ? 90 : 37,
      rotation: 23,
      intensity: 1,
      frustumSize: 4000,
      distanceFromCamera: 1500,
      minimumShadowBias: 0,
      shadowIntensity: 0.6,
      shadowSoftness: 2.5,
    },
  });

  /**
   * @param {EffectData} effectData
   * @returns {gdjs.RuntimeLayer}
   */
  const make3DLayerWithEffect = (effectData) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    runtimeGame
      .getRenderer()
      .createStandardCanvas(document.createElement('div'));
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.addLayer({
      name: '',
      renderingType: '3d',
      visibility: true,
      effects: [effectData],
      cameras: [],
      ambientLightColorR: 0,
      ambientLightColorG: 0,
      ambientLightColorB: 0,
      isLightingLayer: false,
      followBaseLayerCamera: true,
    });
    return runtimeScene.getLayer('');
  };

  /**
   * @param {gdjs.RuntimeLayer} layer
   */
  const renderLayer = (layer) => {
    const runtimeScene = layer.getRuntimeScene();
    runtimeScene.render();
    // The scene renderer only renders layers having 3D objects with Three.js.
    const threeRenderer = runtimeScene
      .getGame()
      .getRenderer()
      .getThreeRenderer();
    const threeScene = layer.getRenderer().getThreeScene();
    const threeCamera = layer.getRenderer().getThreeCamera();
    if (!threeRenderer || !threeScene || !threeCamera) {
      throw new Error('The layer is not rendered with Three.js.');
    }
    threeRenderer.render(threeScene, threeCamera);
  };

  /**
   * @param {gdjs.RuntimeLayer} layer
   * @returns {THREE.DirectionalLight}
   */
  const getDirectionalLight = (layer) => {
    const threeScene = layer.getRenderer().getThreeScene();
    const light =
      threeScene &&
      threeScene.children.find(
        (child) => child instanceof THREE.DirectionalLight
      );
    if (!(light instanceof THREE.DirectionalLight)) {
      throw new Error('The directional light is not in the scene.');
    }
    return light;
  };

  /**
   * @param {THREE.DirectionalLight} light
   * @returns {[float, float]} The position of a fixed point in the shadow map,
   * inside the texel where it falls.
   */
  const getPositionInShadowMapTexel = (light) => {
    const position = new THREE.Vector4(0.1, -0.2, 0.03, 1).applyMatrix4(
      light.shadow.matrix
    );
    const x = position.x * light.shadow.mapSize.x;
    const y = position.y * light.shadow.mapSize.y;
    return [x - Math.floor(x), y - Math.floor(y)];
  };

  for (const top of /** @type {Array<'Z+' | 'Y-'>} */ (['Z+', 'Y-'])) {
    it(`keeps shadow map texels in place when the camera moves (top: ${top})`, () => {
      const layer = make3DLayerWithEffect(makeDirectionalLightEffectData(top));
      const light = getDirectionalLight(layer);
      const shadowCaster = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial()
      );
      shadowCaster.castShadow = true;
      layer.getRenderer().getThreeScene()?.add(shadowCaster);

      renderLayer(layer);
      const [initialX, initialY] = getPositionInShadowMapTexel(light);
      for (let i = 1; i < 6; i++) {
        layer.setCameraX(123.4 + i * 37.3, 0);
        layer.setCameraY(-55.1 + i * 13.7, 0);
        renderLayer(layer);

        const [x, y] = getPositionInShadowMapTexel(light);
        expect(Math.abs(x - initialX)).to.be.below(0.001);
        expect(Math.abs(y - initialY)).to.be.below(0.001);
      }
    });
  }

  it('applies the shadow intensity and softness', () => {
    const layer = make3DLayerWithEffect(makeDirectionalLightEffectData('Z+'));
    const light = getDirectionalLight(layer);
    expect(light.shadow.intensity).to.be(0.6);
    expect(light.shadow.radius).to.be(2.5);

    layer.setEffectDoubleParameter('Sun', 'shadowIntensity', 2);
    layer.setEffectDoubleParameter('Sun', 'shadowSoftness', 4);
    expect(light.shadow.intensity).to.be(1);
    expect(light.shadow.radius).to.be(4);
  });

  it('applies a shadow frustum size changed after the first rendering', () => {
    const layer = make3DLayerWithEffect(makeDirectionalLightEffectData('Z+'));
    const light = getDirectionalLight(layer);
    renderLayer(layer);
    // The world scale is 100.
    expect(light.shadow.camera.right).to.be(4000 / 2 / 100);

    layer.setEffectDoubleParameter('Sun', 'frustumSize', 1000);
    renderLayer(layer);
    expect(light.shadow.camera.right).to.be(1000 / 2 / 100);
  });
});
