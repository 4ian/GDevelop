namespace gdjs {
  export type Scene3DPostProcessingQualityMode = 'low' | 'medium' | 'high';

  export interface Scene3DPostProcessingQualityProfile {
    captureScale: number;
    ssaoSamples: number;
    ssrSteps: number;
    fogSteps: number;
    dofSamples: number;
    dofBlurScale: number;
  }

  export interface Scene3DSharedCapture {
    colorTexture: THREE.Texture;
    depthTexture: THREE.DepthTexture | null;
    width: number;
    height: number;
    quality: Scene3DPostProcessingQualityProfile;
  }

  interface Scene3DSharedPostProcessingState {
    renderTarget: THREE.WebGLRenderTarget;
    renderSize: THREE.Vector2;
    previousViewport: THREE.Vector4;
    previousScissor: THREE.Vector4;
    lastCaptureTimeFromStartMs: number;
    qualityMode: Scene3DPostProcessingQualityMode;
    hasStackController: boolean;
    stackEnabled: boolean;
    lastPassOrderSignature: string;
    effectQualityOverrides: Record<string, Scene3DPostProcessingQualityMode>;
  }

  const qualityProfiles: {
    [key in Scene3DPostProcessingQualityMode]: Scene3DPostProcessingQualityProfile;
  } = {
    low: {
      captureScale: 0.5,
      ssaoSamples: 4,
      ssrSteps: 10,
      fogSteps: 14,
      dofSamples: 4,
      dofBlurScale: 0.65,
    },
    medium: {
      // Medium defaults to half-resolution to keep effects usable on mid-range GPUs.
      captureScale: 0.5,
      ssaoSamples: 4,
      ssrSteps: 14,
      fogSteps: 20,
      dofSamples: 4,
      dofBlurScale: 0.85,
    },
    high: {
      captureScale: 0.75,
      ssaoSamples: 8,
      ssrSteps: 24,
      fogSteps: 34,
      dofSamples: 8,
      dofBlurScale: 1.05,
    },
  };
  const qualityRank: Record<Scene3DPostProcessingQualityMode, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  const managedPassOrder: string[] = [
    'SSAO',
    'RIM',
    'DOF',
    'SSR',
    'FOG',
    'BLOOM',
  ];
  const managedPassOrderMap = new Map<string, number>(
    managedPassOrder.map((id, index) => [id, index])
  );

  const sharedStateByLayerRenderer = new WeakMap<
    object,
    Scene3DSharedPostProcessingState
  >();

  const normalizeQualityMode = (
    value: string
  ): Scene3DPostProcessingQualityMode => {
    const normalized = (value || '').toLowerCase();
    if (normalized === 'low' || normalized === 'high') {
      return normalized;
    }
    return 'medium';
  };
  const getHigherQualityMode = (
    first: Scene3DPostProcessingQualityMode,
    second: Scene3DPostProcessingQualityMode
  ): Scene3DPostProcessingQualityMode => {
    return qualityRank[first] >= qualityRank[second] ? first : second;
  };

  const getLayerRendererKey = (target: gdjs.Layer): object | null => {
    const renderer = target.getRenderer();
    if (!renderer) {
      return null;
    }
    return renderer as unknown as object;
  };

  const createSharedState = (): Scene3DSharedPostProcessingState => {
    const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      stencilBuffer: false,
    });
    renderTarget.texture.generateMipmaps = false;
    renderTarget.depthTexture = new THREE.DepthTexture(1, 1);
    renderTarget.depthTexture.format = THREE.DepthFormat;
    renderTarget.depthTexture.type = THREE.UnsignedIntType;
    renderTarget.depthTexture.needsUpdate = true;

    return {
      renderTarget,
      renderSize: new THREE.Vector2(),
      previousViewport: new THREE.Vector4(),
      previousScissor: new THREE.Vector4(),
      lastCaptureTimeFromStartMs: -1,
      qualityMode: 'medium',
      hasStackController: false,
      stackEnabled: true,
      lastPassOrderSignature: '',
      effectQualityOverrides: {},
    };
  };

  const getOrCreateSharedState = (
    target: gdjs.Layer
  ): Scene3DSharedPostProcessingState | null => {
    const key = getLayerRendererKey(target);
    if (!key) {
      return null;
    }

    const existingState = sharedStateByLayerRenderer.get(key);
    if (existingState) {
      return existingState;
    }

    const newState = createSharedState();
    sharedStateByLayerRenderer.set(key, newState);
    return newState;
  };

  const getTimeFromStartMs = (target: gdjs.Layer): number => {
    const runtimeScene: any = target.getRuntimeScene();
    if (!runtimeScene) {
      return 0;
    }

    const scene =
      typeof runtimeScene.getScene === 'function'
        ? runtimeScene.getScene()
        : runtimeScene;
    if (!scene || typeof scene.getTimeManager !== 'function') {
      return 0;
    }
    return scene.getTimeManager().getTimeFromStart();
  };

  export const markScene3DPostProcessingPass = function (
    pass: THREE_ADDONS.Pass,
    passId: string
  ): void {
    (pass as any).__scene3dEffectId = passId;
  };

  export const setScene3DPostProcessingStackConfig = function (
    target: gdjs.Layer,
    enabled: boolean,
    qualityMode: string
  ): void {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return;
    }

    state.hasStackController = true;
    state.stackEnabled = enabled;
    state.qualityMode = normalizeQualityMode(qualityMode);
  };

  export const setScene3DPostProcessingEffectQualityMode = function (
    target: gdjs.Layer,
    effectId: string,
    qualityMode: string
  ): void {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return;
    }

    if (!effectId) {
      return;
    }

    state.effectQualityOverrides[effectId] = normalizeQualityMode(qualityMode);
  };

  export const clearScene3DPostProcessingEffectQualityMode = function (
    target: gdjs.Layer,
    effectId: string
  ): void {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return;
    }
    if (!effectId) {
      return;
    }
    delete state.effectQualityOverrides[effectId];
  };

  export const clearScene3DPostProcessingStackConfig = function (
    target: gdjs.Layer
  ): void {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return;
    }

    state.hasStackController = false;
    state.stackEnabled = true;
    state.qualityMode = 'medium';
    state.lastPassOrderSignature = '';
    state.effectQualityOverrides = {};
  };

  export const isScene3DPostProcessingEnabled = function (
    target: gdjs.Layer
  ): boolean {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return true;
    }
    return !state.hasStackController || state.stackEnabled;
  };

  const getEffectiveScene3DQualityMode = (
    state: Scene3DSharedPostProcessingState
  ): Scene3DPostProcessingQualityMode => {
    let mode = state.qualityMode;
    for (const effectId in state.effectQualityOverrides) {
      mode = getHigherQualityMode(mode, state.effectQualityOverrides[effectId]);
    }
    return mode;
  };

  export const getScene3DPostProcessingQualityProfileForMode = function (
    qualityMode: string
  ): Scene3DPostProcessingQualityProfile {
    return qualityProfiles[normalizeQualityMode(qualityMode)];
  };

  export const getScene3DPostProcessingQualityProfile = function (
    target: gdjs.Layer
  ): Scene3DPostProcessingQualityProfile {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return qualityProfiles.medium;
    }
    return qualityProfiles[getEffectiveScene3DQualityMode(state)];
  };

  export const captureScene3DSharedTextures = function (
    target: gdjs.Layer,
    threeRenderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ): Scene3DSharedCapture | null {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return null;
    }

    const quality = getScene3DPostProcessingQualityProfile(target);
    const renderTarget = state.renderTarget;

    threeRenderer.getDrawingBufferSize(state.renderSize);
    const width = Math.max(
      1,
      Math.round((state.renderSize.x || target.getWidth()) * quality.captureScale)
    );
    const height = Math.max(
      1,
      Math.round((state.renderSize.y || target.getHeight()) * quality.captureScale)
    );

    if (renderTarget.width !== width || renderTarget.height !== height) {
      renderTarget.setSize(width, height);
      if (renderTarget.depthTexture) {
        renderTarget.depthTexture.needsUpdate = true;
      }
    }
    renderTarget.texture.colorSpace = threeRenderer.outputColorSpace;

    const timeFromStart = getTimeFromStartMs(target);
    if (state.lastCaptureTimeFromStartMs !== timeFromStart) {
      const previousRenderTarget = threeRenderer.getRenderTarget();
      const previousAutoClear = threeRenderer.autoClear;
      const previousScissorTest = threeRenderer.getScissorTest();
      const previousXrEnabled = threeRenderer.xr.enabled;
      threeRenderer.getViewport(state.previousViewport);
      threeRenderer.getScissor(state.previousScissor);

      threeRenderer.xr.enabled = false;
      threeRenderer.autoClear = true;
      threeRenderer.setRenderTarget(renderTarget);
      threeRenderer.setViewport(0, 0, renderTarget.width, renderTarget.height);
      threeRenderer.setScissor(0, 0, renderTarget.width, renderTarget.height);
      threeRenderer.setScissorTest(false);
      threeRenderer.clear(true, true, true);
      threeRenderer.render(scene, camera);

      threeRenderer.setRenderTarget(previousRenderTarget);
      threeRenderer.setViewport(state.previousViewport);
      threeRenderer.setScissor(state.previousScissor);
      threeRenderer.setScissorTest(previousScissorTest);
      threeRenderer.autoClear = previousAutoClear;
      threeRenderer.xr.enabled = previousXrEnabled;

      state.lastCaptureTimeFromStartMs = timeFromStart;
    }

    return {
      colorTexture: renderTarget.texture,
      depthTexture: renderTarget.depthTexture,
      width,
      height,
      quality,
    };
  };

  export const reorderScene3DPostProcessingPasses = function (
    target: gdjs.Layer
  ): void {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return;
    }

    const layerRenderer: any = target.getRenderer();
    if (
      !layerRenderer ||
      typeof layerRenderer.getThreeEffectComposer !== 'function'
    ) {
      return;
    }
    const composer = layerRenderer.getThreeEffectComposer();
    if (!composer || !composer.passes) {
      return;
    }

    const composerPasses = composer.passes as Array<THREE_ADDONS.Pass & any>;
    const detectedPasses = composerPasses
      .map((pass, index) => ({
        pass,
        index,
        id: (pass as any).__scene3dEffectId as string | undefined,
      }))
      .filter((entry) => !!entry.id && managedPassOrderMap.has(entry.id));

    if (detectedPasses.length <= 1) {
      return;
    }

    const currentSignature = detectedPasses
      .map((entry) => entry.id)
      .join('|');
    if (state.lastPassOrderSignature === currentSignature) {
      return;
    }

    const sorted = detectedPasses
      .slice()
      .sort((a, b) => {
        const orderA = managedPassOrderMap.get(a.id || '') || 999;
        const orderB = managedPassOrderMap.get(b.id || '') || 999;
        if (orderA === orderB) {
          return a.index - b.index;
        }
        return orderA - orderB;
      })
      .map((entry) => entry.pass);

    const renderer = target.getRenderer();
    for (const pass of detectedPasses) {
      renderer.removePostProcessingPass(pass.pass);
    }
    for (const pass of sorted) {
      renderer.addPostProcessingPass(pass);
    }

    state.lastPassOrderSignature = sorted
      .map((pass) => (pass as any).__scene3dEffectId as string)
      .join('|');
  };

  export const hasManagedScene3DPostProcessingPass = function (
    target: gdjs.Layer
  ): boolean {
    const layerRenderer: any = target.getRenderer();
    if (
      !layerRenderer ||
      typeof layerRenderer.getThreeEffectComposer !== 'function'
    ) {
      return false;
    }
    const composer = layerRenderer.getThreeEffectComposer();
    if (!composer || !composer.passes) {
      return false;
    }

    const composerPasses = composer.passes as Array<THREE_ADDONS.Pass & any>;
    return composerPasses.some((pass) => {
      const passId = (pass as any).__scene3dEffectId as string | undefined;
      return (
        !!passId &&
        managedPassOrderMap.has(passId) &&
        (pass as any).enabled !== false
      );
    });
  };
}
