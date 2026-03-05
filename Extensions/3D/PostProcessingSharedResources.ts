namespace gdjs {
  export type Scene3DPostProcessingQualityMode = 'low' | 'medium' | 'high';
  export type Scene3DPostProcessingPreset =
    | 'performance'
    | 'balanced'
    | 'cinematic'
    | 'custom';

  export interface Scene3DPostProcessingQualityProfile {
    captureScale: number;
    ssaoSamples: number;
    ssrSteps: number;
    fogSteps: number;
    dofSamples: number;
    dofBlurScale: number;
  }

  export interface Scene3DResolvedStackSettings {
    preset: Scene3DPostProcessingPreset;
    qualityMode: Scene3DPostProcessingQualityMode;
    adaptivePerformanceEnabled: boolean;
    targetFps: number;
    qualityCeilingMode: Scene3DPostProcessingQualityMode | null;
  }

  export interface Scene3DSharedCapture {
    colorTexture: THREE.Texture;
    depthTexture: THREE.DepthTexture | null;
    width: number;
    height: number;
    quality: Scene3DPostProcessingQualityProfile;
    qualityMode: Scene3DPostProcessingQualityMode;
    captureScale: number;
    captureIntervalFrames: number;
  }

  interface Scene3DSharedPostProcessingState {
    renderTarget: THREE.WebGLRenderTarget;
    renderSize: THREE.Vector2;
    previousViewport: THREE.Vector4;
    previousScissor: THREE.Vector4;
    lastCaptureTimeFromStartMs: number;
    qualityMode: Scene3DPostProcessingQualityMode;
    preset: Scene3DPostProcessingPreset;
    qualityCeilingMode: Scene3DPostProcessingQualityMode | null;
    hasStackController: boolean;
    stackEnabled: boolean;
    adaptivePerformanceEnabled: boolean;
    targetFps: number;
    smoothedFrameTimeMs: number;
    adaptivePressure: number;
    dynamicCaptureScaleMultiplier: number;
    captureIntervalFrames: number;
    adaptiveQualityDrop: number;
    frameIndex: number;
    lastCapturedFrameIndex: number;
    lastFrameTimeFromStartMs: number;
    lastPassOrderSignature: string;
    effectQualityOverrides: Record<string, Scene3DPostProcessingQualityMode>;
  }

  const qualityProfiles: {
    [key in Scene3DPostProcessingQualityMode]: Scene3DPostProcessingQualityProfile;
  } = {
    low: {
      captureScale: 0.45,
      ssaoSamples: 4,
      ssrSteps: 10,
      fogSteps: 12,
      dofSamples: 4,
      dofBlurScale: 0.6,
    },
    medium: {
      // Balanced quality/performance profile for 60 FPS targets on mid-range GPUs.
      captureScale: 0.6,
      ssaoSamples: 6,
      ssrSteps: 16,
      fogSteps: 22,
      dofSamples: 6,
      dofBlurScale: 0.85,
    },
    high: {
      captureScale: 0.85,
      ssaoSamples: 10,
      ssrSteps: 28,
      fogSteps: 40,
      dofSamples: 8,
      dofBlurScale: 1.1,
    },
  };
  const qualityRank: Record<Scene3DPostProcessingQualityMode, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };
  const qualityModesAscending: Scene3DPostProcessingQualityMode[] = [
    'low',
    'medium',
    'high',
  ];
  interface Scene3DPostProcessingPresetConfig {
    qualityMode: Scene3DPostProcessingQualityMode;
    adaptivePerformanceEnabled: boolean;
    targetFps: number;
    qualityCeilingMode: Scene3DPostProcessingQualityMode | null;
  }
  const presetConfigs: Record<
    Exclude<Scene3DPostProcessingPreset, 'custom'>,
    Scene3DPostProcessingPresetConfig
  > = {
    performance: {
      qualityMode: 'low',
      adaptivePerformanceEnabled: true,
      targetFps: 60,
      qualityCeilingMode: 'low',
    },
    balanced: {
      qualityMode: 'medium',
      adaptivePerformanceEnabled: true,
      targetFps: 60,
      qualityCeilingMode: 'high',
    },
    cinematic: {
      qualityMode: 'high',
      adaptivePerformanceEnabled: true,
      targetFps: 50,
      qualityCeilingMode: 'high',
    },
  };

  const managedPassOrder: string[] = [
    'SSAO',
    'RIM',
    'DOF',
    'SSR',
    'FOG',
    'RAIN',
    'BLOOM',
    'VIGNETTE',
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
  const normalizePreset = (value: string): Scene3DPostProcessingPreset => {
    const normalized = (value || '').toLowerCase();
    if (
      normalized === 'performance' ||
      normalized === 'cinematic' ||
      normalized === 'custom'
    ) {
      return normalized;
    }
    return 'balanced';
  };
  const getHigherQualityMode = (
    first: Scene3DPostProcessingQualityMode,
    second: Scene3DPostProcessingQualityMode
  ): Scene3DPostProcessingQualityMode => {
    return qualityRank[first] >= qualityRank[second] ? first : second;
  };
  const getLowerQualityBetween = (
    first: Scene3DPostProcessingQualityMode,
    second: Scene3DPostProcessingQualityMode
  ): Scene3DPostProcessingQualityMode => {
    return qualityRank[first] <= qualityRank[second] ? first : second;
  };
  const getLowerQualityMode = (
    mode: Scene3DPostProcessingQualityMode,
    steps: number
  ): Scene3DPostProcessingQualityMode => {
    const currentIndex = qualityRank[mode];
    const nextIndex = gdjs.evtTools.common.clamp(
      0,
      qualityModesAscending.length - 1,
      currentIndex - Math.max(0, Math.round(steps))
    );
    return qualityModesAscending[nextIndex];
  };
  const clampTargetFps = (value: number): number =>
    gdjs.evtTools.common.clamp(30, 240, Number.isFinite(value) ? value : 60);
  const applyPresetConfigToState = (
    state: Scene3DSharedPostProcessingState,
    preset: Scene3DPostProcessingPreset,
    qualityMode: string,
    adaptivePerformanceEnabled: boolean,
    targetFps: number
  ): void => {
    const resolved = resolveScene3DPostProcessingStackSettings(
      preset,
      qualityMode,
      adaptivePerformanceEnabled,
      targetFps
    );
    state.preset = resolved.preset;
    state.qualityMode = resolved.qualityMode;
    state.adaptivePerformanceEnabled = resolved.adaptivePerformanceEnabled;
    state.targetFps = resolved.targetFps;
    state.qualityCeilingMode = resolved.qualityCeilingMode;
  };
  export const resolveScene3DPostProcessingStackSettings = function (
    preset: string,
    qualityMode: string,
    adaptivePerformanceEnabled: boolean,
    targetFps: number
  ): Scene3DResolvedStackSettings {
    const normalizedPreset = normalizePreset(preset);
    if (normalizedPreset === 'custom') {
      return {
        preset: normalizedPreset,
        qualityMode: normalizeQualityMode(qualityMode),
        adaptivePerformanceEnabled: !!adaptivePerformanceEnabled,
        targetFps: clampTargetFps(targetFps),
        qualityCeilingMode: null,
      };
    }
    const presetConfig = presetConfigs[normalizedPreset];
    return {
      preset: normalizedPreset,
      qualityMode: presetConfig.qualityMode,
      adaptivePerformanceEnabled: presetConfig.adaptivePerformanceEnabled,
      targetFps: clampTargetFps(presetConfig.targetFps),
      qualityCeilingMode: presetConfig.qualityCeilingMode,
    };
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
      preset: 'balanced',
      qualityCeilingMode: 'high',
      hasStackController: false,
      stackEnabled: true,
      adaptivePerformanceEnabled: true,
      targetFps: 60,
      smoothedFrameTimeMs: 1000 / 60,
      adaptivePressure: 0,
      dynamicCaptureScaleMultiplier: 1,
      captureIntervalFrames: 1,
      adaptiveQualityDrop: 0,
      frameIndex: 0,
      lastCapturedFrameIndex: -1,
      lastFrameTimeFromStartMs: -1,
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

  const resetAdaptivePerformanceState = (
    state: Scene3DSharedPostProcessingState
  ): void => {
    state.adaptivePressure = 0;
    state.dynamicCaptureScaleMultiplier = 1;
    state.captureIntervalFrames = 1;
    state.adaptiveQualityDrop = 0;
  };

  const updateAdaptivePerformanceStateForFrame = (
    target: gdjs.Layer,
    state: Scene3DSharedPostProcessingState,
    timeFromStartMs: number
  ): void => {
    if (state.lastFrameTimeFromStartMs === timeFromStartMs) {
      return;
    }

    state.lastFrameTimeFromStartMs = timeFromStartMs;
    state.frameIndex += 1;

    const runtimeScene = target.getRuntimeScene();
    const frameTimeMs = Math.max(
      1,
      runtimeScene ? runtimeScene.getElapsedTime() : 1000 / state.targetFps
    );
    state.smoothedFrameTimeMs =
      state.smoothedFrameTimeMs > 0
        ? state.smoothedFrameTimeMs * 0.9 + frameTimeMs * 0.1
        : frameTimeMs;

    if (!state.adaptivePerformanceEnabled || !state.stackEnabled) {
      resetAdaptivePerformanceState(state);
      return;
    }

    const targetFrameTimeMs = 1000 / state.targetFps;
    const degradeThreshold = targetFrameTimeMs * 1.08;
    const recoverThreshold = targetFrameTimeMs * 0.92;

    if (state.smoothedFrameTimeMs > degradeThreshold) {
      const overload = Math.min(
        1,
        (state.smoothedFrameTimeMs - targetFrameTimeMs) / targetFrameTimeMs
      );
      state.adaptivePressure = Math.min(
        1,
        state.adaptivePressure + 0.07 + overload * 0.08
      );
    } else if (state.smoothedFrameTimeMs < recoverThreshold) {
      state.adaptivePressure = Math.max(0, state.adaptivePressure - 0.05);
    } else {
      state.adaptivePressure = Math.max(0, state.adaptivePressure - 0.012);
    }

    state.dynamicCaptureScaleMultiplier = Math.max(
      0.55,
      1 - state.adaptivePressure * 0.45
    );
    state.captureIntervalFrames =
      state.adaptivePressure >= 0.9 ? 3 : state.adaptivePressure >= 0.62 ? 2 : 1;
    state.adaptiveQualityDrop =
      state.adaptivePressure >= 0.88 ? 2 : state.adaptivePressure >= 0.58 ? 1 : 0;
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
    qualityMode: string,
    adaptivePerformanceEnabled: boolean = true,
    targetFps: number = 60,
    preset: string = 'balanced'
  ): void {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return;
    }

    state.hasStackController = true;
    state.stackEnabled = enabled;
    applyPresetConfigToState(
      state,
      normalizePreset(preset),
      qualityMode,
      adaptivePerformanceEnabled,
      targetFps
    );
    if (!state.adaptivePerformanceEnabled) {
      resetAdaptivePerformanceState(state);
    }
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
    state.preset = 'balanced';
    state.qualityCeilingMode = 'high';
    state.adaptivePerformanceEnabled = true;
    state.targetFps = 60;
    state.smoothedFrameTimeMs = 1000 / 60;
    state.lastCaptureTimeFromStartMs = -1;
    state.lastFrameTimeFromStartMs = -1;
    state.frameIndex = 0;
    state.lastCapturedFrameIndex = -1;
    resetAdaptivePerformanceState(state);
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

  const getRequestedScene3DQualityMode = (
    state: Scene3DSharedPostProcessingState
  ): Scene3DPostProcessingQualityMode => {
    let mode = state.qualityMode;
    for (const effectId in state.effectQualityOverrides) {
      mode = getHigherQualityMode(mode, state.effectQualityOverrides[effectId]);
    }
    if (state.qualityCeilingMode) {
      mode = getLowerQualityBetween(mode, state.qualityCeilingMode);
    }
    return mode;
  };
  const getEffectiveScene3DQualityMode = (
    state: Scene3DSharedPostProcessingState
  ): Scene3DPostProcessingQualityMode =>
    getLowerQualityMode(
      getRequestedScene3DQualityMode(state),
      state.adaptiveQualityDrop
    );

  export const getScene3DPostProcessingQualityProfileForMode = function (
    qualityMode: string
  ): Scene3DPostProcessingQualityProfile {
    return qualityProfiles[normalizeQualityMode(qualityMode)];
  };

  export const updateScene3DPostProcessingPerformance = function (
    target: gdjs.Layer
  ): void {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return;
    }
    updateAdaptivePerformanceStateForFrame(target, state, getTimeFromStartMs(target));
  };

  export const getScene3DPostProcessingQualityMode = function (
    target: gdjs.Layer
  ): Scene3DPostProcessingQualityMode {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return 'medium';
    }
    updateAdaptivePerformanceStateForFrame(target, state, getTimeFromStartMs(target));
    return getEffectiveScene3DQualityMode(state);
  };

  export const getScene3DPostProcessingQualityProfile = function (
    target: gdjs.Layer
  ): Scene3DPostProcessingQualityProfile {
    const state = getOrCreateSharedState(target);
    if (!state) {
      return qualityProfiles.medium;
    }
    updateAdaptivePerformanceStateForFrame(target, state, getTimeFromStartMs(target));
    return qualityProfiles[getEffectiveScene3DQualityMode(state)];
  };

  export function setScene3DPostProcessingEffectQualityMode(
    qualityMode: string
  ): Scene3DPostProcessingQualityMode;
  export function setScene3DPostProcessingEffectQualityMode(
    target: gdjs.Layer,
    effectId: string,
    qualityMode: string
  ): void;
  export function setScene3DPostProcessingEffectQualityMode(
    qualityModeOrTarget: string | gdjs.Layer,
    effectId?: string,
    qualityMode?: string
  ): Scene3DPostProcessingQualityMode | void {
    if (qualityModeOrTarget instanceof gdjs.Layer) {
      const state = getOrCreateSharedState(qualityModeOrTarget);
      if (!state || !effectId) {
        return;
      }
      state.effectQualityOverrides[effectId] = normalizeQualityMode(
        qualityMode || 'medium'
      );
      return;
    }
    return normalizeQualityMode(qualityModeOrTarget);
  }

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

    const timeFromStart = getTimeFromStartMs(target);
    updateAdaptivePerformanceStateForFrame(target, state, timeFromStart);

    const qualityMode = getEffectiveScene3DQualityMode(state);
    const quality = qualityProfiles[qualityMode];
    const effectiveCaptureScale =
      quality.captureScale * state.dynamicCaptureScaleMultiplier;
    const renderTarget = state.renderTarget;

    threeRenderer.getDrawingBufferSize(state.renderSize);
    const width = Math.max(
      1,
      Math.round(
        (state.renderSize.x || target.getWidth()) * effectiveCaptureScale
      )
    );
    const height = Math.max(
      1,
      Math.round(
        (state.renderSize.y || target.getHeight()) * effectiveCaptureScale
      )
    );

    let shouldCapture = false;
    if (renderTarget.width !== width || renderTarget.height !== height) {
      renderTarget.setSize(width, height);
      if (renderTarget.depthTexture) {
        renderTarget.depthTexture.needsUpdate = true;
      }
      shouldCapture = true;
    }
    renderTarget.texture.colorSpace = threeRenderer.outputColorSpace;

    if (state.lastCaptureTimeFromStartMs !== timeFromStart) {
      const framesSinceLastCapture =
        state.lastCapturedFrameIndex < 0
          ? Number.MAX_SAFE_INTEGER
          : state.frameIndex - state.lastCapturedFrameIndex;
      if (framesSinceLastCapture >= Math.max(1, state.captureIntervalFrames)) {
        shouldCapture = true;
      }
    }

    if (shouldCapture) {
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
      state.lastCapturedFrameIndex = state.frameIndex;
    }
    state.lastCaptureTimeFromStartMs = timeFromStart;

    return {
      colorTexture: renderTarget.texture,
      depthTexture: renderTarget.depthTexture,
      width,
      height,
      quality,
      qualityMode,
      captureScale: effectiveCaptureScale,
      captureIntervalFrames: state.captureIntervalFrames,
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

    const currentSignature = detectedPasses.map((entry) => entry.id).join('|');
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
