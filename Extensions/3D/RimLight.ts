namespace gdjs {
  interface RimLightNetworkSyncData {
    i: number;
    c: number;
    o: number;
    s: number;
    p?: number;
    f?: number;
    e: boolean;
    d?: boolean;
  }

  type RimLightPatchedMaterial = THREE.Material & {
    onBeforeCompile?: (shader: any, renderer: THREE.WebGLRenderer) => void;
    customProgramCacheKey?: () => string;
    needsUpdate?: boolean;
    userData: {
      [key: string]: any;
    };
  };

  interface RimLightShaderUniforms {
    rimColor: { value: THREE.Color };
    rimIntensity: { value: number };
    rimOuterWrap: { value: number };
    rimPower: { value: number };
    rimFresnel0: { value: number };
    rimCameraPosition: { value: THREE.Vector3 };
    rimCameraMatrixWorld: { value: THREE.Matrix4 };
    rimDebugForceMax: { value: number };
  }

  interface RimLightPatchedMaterialState {
    originalOnBeforeCompile: (
      shader: any,
      renderer: THREE.WebGLRenderer
    ) => void;
    originalCustomProgramCacheKey?: (() => string) | undefined;
    uniforms: RimLightShaderUniforms | null;
    shaderInjected: boolean;
  }

  const rimLightShaderPatchKey = 'Scene3D_RimLight_Patch_v4';
  const rimLightShaderPatchToken = 'SCENE3D_RIM_LIGHT_PATCH';
  const rimMaterialScanIntervalFrames = 15;

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::RimLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }

        return new (class implements gdjs.PixiFiltersTools.Filter {
          _isEnabled: boolean;
          _effectEnabled: boolean;
          _intensity: number;
          _outerWrap: number;
          _power: number;
          _fresnel0: number;
          _shadowStrength: number;
          _colorHex: number;
          _debugForceMaxRim: boolean;
          _patchedMaterials: Map<RimLightPatchedMaterial, RimLightPatchedMaterialState>;
          _cameraPosition: THREE.Vector3;
          _cameraMatrixWorld: THREE.Matrix4;
          _materialScanCounter: number;
          _warnedNoMaterials: boolean;
          _warnedNoShaderInjection: boolean;

          constructor() {
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._intensity = Math.max(
              0,
              effectData.doubleParameters.intensity !== undefined
                ? effectData.doubleParameters.intensity
                : 0.8
            );
            this._outerWrap = Math.max(
              0,
              Math.min(
                1,
                effectData.doubleParameters.outerWrap !== undefined
                  ? effectData.doubleParameters.outerWrap
                  : 0.18
              )
            );
            this._power = Math.max(
              0.05,
              effectData.doubleParameters.power !== undefined
                ? effectData.doubleParameters.power
                : 2.2
            );
            this._fresnel0 = Math.max(
              0,
              Math.min(
                1,
                effectData.doubleParameters.fresnel0 !== undefined
                  ? effectData.doubleParameters.fresnel0
                  : 0.04
              )
            );
            // Kept for network sync compatibility with previous implementation.
            this._shadowStrength = 1.0;
            this._colorHex = gdjs.rgbOrHexStringToNumber(
              effectData.stringParameters.color || '255;255;255'
            );
            this._debugForceMaxRim =
              effectData.booleanParameters.debugForceMaxRim === undefined
                ? false
                : !!effectData.booleanParameters.debugForceMaxRim;

            this._patchedMaterials = new Map();
            this._cameraPosition = new THREE.Vector3();
            this._cameraMatrixWorld = new THREE.Matrix4();
            this._materialScanCounter = rimMaterialScanIntervalFrames;
            this._warnedNoMaterials = false;
            this._warnedNoShaderInjection = false;
          }

          private _isMaterialPatchable(material: RimLightPatchedMaterial): boolean {
            if (!material) {
              return false;
            }
            // ShaderMaterial is already user-defined; avoid mutating it unexpectedly.
            const typedMaterial = material as THREE.Material & {
              isShaderMaterial?: boolean;
              isMeshBasicMaterial?: boolean;
              isMeshLambertMaterial?: boolean;
              isMeshPhongMaterial?: boolean;
              isMeshStandardMaterial?: boolean;
              isMeshPhysicalMaterial?: boolean;
              isMeshToonMaterial?: boolean;
              isMeshMatcapMaterial?: boolean;
            };
            if (typedMaterial.isShaderMaterial) {
              return false;
            }
            return !!(
              typedMaterial.isMeshBasicMaterial ||
              typedMaterial.isMeshLambertMaterial ||
              typedMaterial.isMeshPhongMaterial ||
              typedMaterial.isMeshStandardMaterial ||
              typedMaterial.isMeshPhysicalMaterial ||
              typedMaterial.isMeshToonMaterial ||
              typedMaterial.isMeshMatcapMaterial
            );
          }

          private _injectShader(shader: any): boolean {
            if (shader.fragmentShader.indexOf(rimLightShaderPatchToken) !== -1) {
              return true;
            }

            if (
              shader.vertexShader.indexOf('#include <common>') === -1 ||
              shader.vertexShader.indexOf('#include <defaultnormal_vertex>') === -1 ||
              shader.vertexShader.indexOf('#include <project_vertex>') === -1 ||
              shader.fragmentShader.indexOf('#include <common>') === -1 ||
              shader.fragmentShader.indexOf('#include <output_fragment>') === -1
            ) {
              return false;
            }

            shader.vertexShader = shader.vertexShader.replace(
              '#include <common>',
              `#include <common>
uniform mat4 rimCameraMatrixWorld;
varying vec3 vScene3DRimWorldPosition;
varying vec3 vScene3DRimWorldNormal;`
            );

            shader.vertexShader = shader.vertexShader.replace(
              '#include <defaultnormal_vertex>',
              `#include <defaultnormal_vertex>
vScene3DRimWorldNormal = normalize(mat3(rimCameraMatrixWorld) * transformedNormal);`
            );

            shader.vertexShader = shader.vertexShader.replace(
              '#include <project_vertex>',
              `#include <project_vertex>
vScene3DRimWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <common>',
              `#include <common>
uniform vec3 rimColor;
uniform float rimIntensity;
uniform float rimOuterWrap;
uniform float rimPower;
uniform float rimFresnel0;
uniform vec3 rimCameraPosition;
uniform float rimDebugForceMax;
varying vec3 vScene3DRimWorldPosition;
varying vec3 vScene3DRimWorldNormal;

float scene3dPow5(float x) {
  float x2 = x * x;
  return x2 * x2 * x;
}

float scene3dSchlickFresnel(float ndv, float f0) {
  float clampedNdv = clamp(ndv, 0.0, 1.0);
  return f0 + (1.0 - f0) * scene3dPow5(1.0 - clampedNdv);
}

float scene3dComputeRimStrength(
  vec3 worldNormal,
  vec3 viewDirWorld,
  float outerWrap,
  float rimPower,
  float fresnel0
) {
  vec3 resolvedNormal = normalize(worldNormal);
  #ifdef DOUBLE_SIDED
    resolvedNormal = gl_FrontFacing ? resolvedNormal : -resolvedNormal;
  #endif

  float ndv = clamp(dot(resolvedNormal, normalize(viewDirWorld)), 0.0, 1.0);
  float oneMinusNdv = 1.0 - ndv;

  // Artistic shaping term used in most realtime rim-light implementations.
  float rimCore = pow(max(oneMinusNdv, 0.0), max(rimPower, 0.05));

  // "Outer wrap" broadens the highlighted zone away from the strict silhouette.
  float wrapped = clamp(oneMinusNdv + clamp(outerWrap, 0.0, 1.0) * 0.5, 0.0, 1.0);
  float rimEnvelope = smoothstep(0.0, 1.0, wrapped);

  // Physically-inspired angular response (Schlick Fresnel).
  float fresnel = scene3dSchlickFresnel(ndv, clamp(fresnel0, 0.0, 1.0));

  return clamp(rimCore * rimEnvelope * fresnel, 0.0, 1.0);
}`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <output_fragment>',
              `float scene3dRimStrength = 0.0;
if (rimDebugForceMax > 0.5) {
  // Debug mode: force full-rim contribution everywhere to verify shader reach.
  scene3dRimStrength = 1.0;
} else if (rimIntensity > 0.0) {
  vec3 scene3dViewDir = normalize(rimCameraPosition - vScene3DRimWorldPosition);
  scene3dRimStrength = scene3dComputeRimStrength(
    vScene3DRimWorldNormal,
    scene3dViewDir,
    rimOuterWrap,
    rimPower,
    rimFresnel0
  );
}
outgoingLight += rimColor * (rimIntensity * scene3dRimStrength);
// ${rimLightShaderPatchToken}
#include <output_fragment>`
            );

            return true;
          }

          private _updateUniformState(
            patchState: RimLightPatchedMaterialState
          ): void {
            const uniforms = patchState.uniforms;
            if (!uniforms) {
              return;
            }

            uniforms.rimColor.value.setHex(this._colorHex);
            uniforms.rimIntensity.value = this._effectEnabled
              ? this._debugForceMaxRim
                ? 1.0
                : this._intensity * Math.max(0, Math.min(1, this._shadowStrength))
              : 0;
            uniforms.rimOuterWrap.value = this._outerWrap;
            uniforms.rimPower.value = this._power;
            uniforms.rimFresnel0.value = this._fresnel0;
            uniforms.rimCameraPosition.value.copy(this._cameraPosition);
            uniforms.rimCameraMatrixWorld.value.copy(this._cameraMatrixWorld);
            uniforms.rimDebugForceMax.value = this._debugForceMaxRim ? 1.0 : 0.0;
          }

          private _patchMaterial(material: RimLightPatchedMaterial): void {
            if (this._patchedMaterials.has(material)) {
              return;
            }
            if (!this._isMaterialPatchable(material)) {
              return;
            }

            const originalOnBeforeCompile = material.onBeforeCompile
              ? material.onBeforeCompile
              : () => {};
            const originalCustomProgramCacheKey = material.customProgramCacheKey;

            const patchState: RimLightPatchedMaterialState = {
              originalOnBeforeCompile,
              originalCustomProgramCacheKey,
              uniforms: null,
              shaderInjected: false,
            };

            material.onBeforeCompile = (
              shader: any,
              renderer: THREE.WebGLRenderer
            ) => {
              patchState.originalOnBeforeCompile.call(material, shader, renderer);

              if (!this._injectShader(shader)) {
                return;
              }

              shader.uniforms.rimColor = {
                value: new THREE.Color(this._colorHex),
              };
              shader.uniforms.rimIntensity = {
                value: 0,
              };
              shader.uniforms.rimOuterWrap = {
                value: this._outerWrap,
              };
              shader.uniforms.rimPower = {
                value: this._power,
              };
              shader.uniforms.rimFresnel0 = {
                value: this._fresnel0,
              };
              shader.uniforms.rimCameraPosition = {
                value: new THREE.Vector3(),
              };
              shader.uniforms.rimCameraMatrixWorld = {
                value: new THREE.Matrix4(),
              };
              shader.uniforms.rimDebugForceMax = {
                value: this._debugForceMaxRim ? 1.0 : 0.0,
              };

              patchState.uniforms = shader.uniforms as RimLightShaderUniforms;
              patchState.shaderInjected = true;
              this._updateUniformState(patchState);
            };

            material.customProgramCacheKey = () => {
              const previousKey = patchState.originalCustomProgramCacheKey
                ? patchState.originalCustomProgramCacheKey.call(material)
                : '';
              return `${previousKey}|${rimLightShaderPatchKey}`;
            };

            material.needsUpdate = true;
            this._patchedMaterials.set(material, patchState);
          }

          private _unpatchMaterial(material: RimLightPatchedMaterial): void {
            const patchState = this._patchedMaterials.get(material);
            if (!patchState) {
              return;
            }

            material.onBeforeCompile = patchState.originalOnBeforeCompile;

            if (patchState.originalCustomProgramCacheKey) {
              material.customProgramCacheKey =
                patchState.originalCustomProgramCacheKey;
            } else {
              material.customProgramCacheKey = () => '';
            }

            material.needsUpdate = true;
            this._patchedMaterials.delete(material);
          }

          private _unpatchAllMaterials(): void {
            for (const material of Array.from(this._patchedMaterials.keys())) {
              this._unpatchMaterial(material);
            }
            this._patchedMaterials.clear();
          }

          private _applyToSceneMaterials(scene: THREE.Scene): void {
            let encounteredMaterials = 0;

            scene.traverse((object3D) => {
              const mesh = object3D as THREE.Mesh;
              if (!mesh || !mesh.isMesh || !mesh.material) {
                return;
              }

              const materials = Array.isArray(mesh.material)
                ? (mesh.material as RimLightPatchedMaterial[])
                : ([mesh.material] as RimLightPatchedMaterial[]);

              for (const material of materials) {
                if (!material) {
                  continue;
                }
                encounteredMaterials++;
                this._patchMaterial(material);
              }
            });

            if (encounteredMaterials === 0 && !this._warnedNoMaterials) {
              this._warnedNoMaterials = true;
              console.warn(
                '[Scene3D::RimLight] No mesh materials found on the target scene layer. Rim light was not applied.'
              );
            }
          }

          private _updatePatchedMaterialsUniforms(): void {
            let injectedMaterialCount = 0;
            for (const patchState of this._patchedMaterials.values()) {
              if (patchState.shaderInjected) {
                injectedMaterialCount++;
              }
              this._updateUniformState(patchState);
            }

            if (
              this._patchedMaterials.size > 0 &&
              injectedMaterialCount === 0 &&
              !this._warnedNoShaderInjection
            ) {
              this._warnedNoShaderInjection = true;
              console.warn(
                '[Scene3D::RimLight] Materials were found, but shader injection has not compiled yet. Enable debugForceMaxRim to validate when compilation occurs.'
              );
            }
          }

          isEnabled(target: EffectsTarget): boolean {
            return this._isEnabled;
          }

          setEnabled(target: EffectsTarget, enabled: boolean): boolean {
            if (this._isEnabled === enabled) {
              return true;
            }
            if (enabled) {
              return this.applyEffect(target);
            }
            return this.removeEffect(target);
          }

          applyEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as THREE.Scene | null;
            if (!scene) {
              return false;
            }

            this._materialScanCounter = rimMaterialScanIntervalFrames;
            this._warnedNoMaterials = false;
            this._warnedNoShaderInjection = false;
            this._applyToSceneMaterials(scene);
            this._isEnabled = true;
            return true;
          }

          removeEffect(target: EffectsTarget): boolean {
            this._unpatchAllMaterials();
            this._isEnabled = false;
            return true;
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            if (!(target instanceof gdjs.Layer)) {
              return;
            }

            const layerRenderer = target.getRenderer();
            const threeScene = layerRenderer.getThreeScene();
            const threeCamera = layerRenderer.getThreeCamera();

            if (!threeScene || !threeCamera) {
              return;
            }

            threeCamera.updateMatrixWorld();
            this._cameraMatrixWorld.copy(threeCamera.matrixWorld);
            this._cameraPosition.setFromMatrixPosition(threeCamera.matrixWorld);

            if (this._materialScanCounter >= rimMaterialScanIntervalFrames) {
              this._applyToSceneMaterials(threeScene);
              this._materialScanCounter = 0;
            } else {
              this._materialScanCounter++;
            }

            this._updatePatchedMaterialsUniforms();
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._intensity = Math.max(0, value);
            } else if (parameterName === 'outerWrap') {
              this._outerWrap = Math.max(0, Math.min(1, value));
            } else if (parameterName === 'power') {
              this._power = Math.max(0.05, value);
            } else if (parameterName === 'fresnel0') {
              this._fresnel0 = Math.max(0, Math.min(1, value));
            } else if (parameterName === 'shadowStrength') {
              this._shadowStrength = Math.max(0, Math.min(1, value));
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            }
            if (parameterName === 'outerWrap') {
              return this._outerWrap;
            }
            if (parameterName === 'power') {
              return this._power;
            }
            if (parameterName === 'fresnel0') {
              return this._fresnel0;
            }
            if (parameterName === 'shadowStrength') {
              return this._shadowStrength;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._colorHex = gdjs.rgbOrHexStringToNumber(value);
            }
          }

          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this._colorHex = value;
            }
          }

          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._colorHex;
            }
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
            } else if (parameterName === 'debugForceMaxRim') {
              this._debugForceMaxRim = value;
            }
          }

          getNetworkSyncData(): RimLightNetworkSyncData {
            return {
              i: this._intensity,
              c: this._colorHex,
              o: this._outerWrap,
              s: this._shadowStrength,
              p: this._power,
              f: this._fresnel0,
              e: this._effectEnabled,
              d: this._debugForceMaxRim,
            };
          }

          updateFromNetworkSyncData(syncData: RimLightNetworkSyncData): void {
            this._intensity = Math.max(0, syncData.i);
            this._colorHex = syncData.c;
            this._outerWrap = Math.max(0, Math.min(1, syncData.o));
            this._shadowStrength = Math.max(0, Math.min(1, syncData.s));
            if (syncData.p !== undefined) {
              this._power = Math.max(0.05, syncData.p);
            }
            if (syncData.f !== undefined) {
              this._fresnel0 = Math.max(0, Math.min(1, syncData.f));
            }
            this._effectEnabled = !!syncData.e;
            this._debugForceMaxRim = !!syncData.d;
          }
        })();
      }
    })()
  );
}
