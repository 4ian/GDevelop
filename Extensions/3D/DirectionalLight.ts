namespace gdjs {
  interface DirectionalLightFilterNetworkSyncData {
    i: number;
    c: number;
    e: number;
    r: number;
    t: string;
    msb?: number;
    snb?: number;
    sr?: number;
    ss?: boolean;
    sss?: number;
    dfc?: number;
    fs?: number;
    msd?: number;
    csl?: number;
    sms?: number;
    sfl?: number;
    sfc?: boolean;
  }

  const shadowHelper = false;
  const csmCascadeCount = 3;
  const csmIntensityWeights = [0.5, 0.3, 0.2];

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::DirectionalLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          private _top: string = 'Z+';
          private _elevation: float = 45;
          private _rotation: float = 0;
          private _shadowMapSize: float = 1024;
          private _minimumShadowBias: float = 0;
          private _shadowNormalBias: float = 0.02;
          private _shadowRadius: float = 2;
          private _shadowStabilizationEnabled: boolean = true;
          private _shadowStabilizationStep: float = 0;
          private _distanceFromCamera: float = 1500;
          private _frustumSize: float = 4000;
          private _maxShadowDistance: float = 2000;
          private _cascadeSplitLambda: float = 0.7;
          private _shadowFollowLead: float = 0.45;
          private _shadowFollowCamera: boolean = false;

          private _intensity: float = 0.5;
          private _colorHex: number = 0xffffff;
          private _shadowCastingEnabled: boolean = false;
          private _isEnabled: boolean = false;

          private _lights: THREE.DirectionalLight[] = [];
          private _shadowCameraHelpers: Array<THREE.CameraHelper | null> = [];
          private _shadowMapDirty = true;
          private _shadowCameraDirty = true;
          private _cascadeRanges: Array<{ near: float; far: float }> = [
            { near: 0, far: 200 },
            { near: 200, far: 800 },
            { near: 800, far: 2000 },
          ];
          private _cascadeFrustumSizes: float[] = [400, 1200, 2400];
          private _cascadeMapSizes: integer[] = [2048, 1024, 512];
          private _maxRendererShadowMapSize: integer = 2048;
          private _hadPreviousCameraPosition = false;
          private _previousCameraX: float = 0;
          private _previousCameraY: float = 0;
          private _previousCameraZ: float = 0;
          private _staticAnchorInitialized = false;
          private _staticAnchorX: float = 0;
          private _staticAnchorY: float = 0;
          private _staticAnchorZ: float = 0;

          constructor() {
            for (let i = 0; i < csmCascadeCount; i++) {
              const light = new THREE.DirectionalLight();
              light.castShadow = false;
              this._lights.push(light);
              if (shadowHelper) {
                this._shadowCameraHelpers.push(
                  new THREE.CameraHelper(light.shadow.camera)
                );
              } else {
                this._shadowCameraHelpers.push(null);
              }
            }
            this._setAllLightsColor(this._colorHex);
            this._setAllLightsIntensity(this._intensity);
            this._updateShadowCameraDirtyState();
          }

          private _updateShadowCameraDirtyState(): void {
            this._shadowCameraDirty = true;
            this._shadowMapDirty = true;
          }

          private _setAllLightsColor(colorHex: number): void {
            this._colorHex = colorHex;
            for (const light of this._lights) {
              light.color.setHex(colorHex);
            }
          }

          private _setAllLightsIntensity(intensity: float): void {
            this._intensity = Math.max(0, intensity);
            for (let i = 0; i < this._lights.length; i++) {
              const weight =
                csmIntensityWeights[i] !== undefined
                  ? csmIntensityWeights[i]
                  : 1 / csmCascadeCount;
              this._lights[i].intensity = this._intensity * weight;
            }
          }

          private _setShadowCastingEnabled(enabled: boolean): void {
            if (this._shadowCastingEnabled === enabled) {
              return;
            }
            this._shadowCastingEnabled = enabled;
            for (const light of this._lights) {
              light.castShadow = enabled;
              if (enabled) {
                light.shadow.needsUpdate = true;
              }
            }
            if (enabled) {
              this._updateShadowCameraDirtyState();
            }
          }

          private _getClosestShadowMapSize(value: float): integer {
            const supportedSizes = [512, 1024, 2048, 4096];
            const target = Math.max(512, value);
            let closestSize = supportedSizes[0];
            let closestDelta = Math.abs(target - closestSize);
            for (let i = 1; i < supportedSizes.length; i++) {
              const size = supportedSizes[i];
              const delta = Math.abs(target - size);
              if (delta < closestDelta) {
                closestDelta = delta;
                closestSize = size;
              }
            }
            return this._clampShadowMapSizeToRenderer(closestSize);
          }

          private _clampShadowMapSizeToRenderer(size: integer): integer {
            const safeRendererMax = Math.max(512, this._maxRendererShadowMapSize);
            let clampedSize = 512;
            while (clampedSize * 2 <= safeRendererMax) {
              clampedSize *= 2;
            }
            return Math.max(512, Math.min(size, clampedSize));
          }

          private _computeCascadeMapSize(cascadeIndex: integer): integer {
            const baseSize = this._getClosestShadowMapSize(this._shadowMapSize);
            if (cascadeIndex === 0) {
              return this._clampShadowMapSizeToRenderer(baseSize * 2);
            }
            if (cascadeIndex === 1) {
              return this._clampShadowMapSizeToRenderer(baseSize);
            }
            return this._clampShadowMapSizeToRenderer(
              Math.max(512, Math.floor(baseSize / 2))
            );
          }

          private _computePracticalSplit(
            splitFactor: float,
            nearDistance: float,
            maxDistance: float
          ): float {
            const safeSplitFactor = Math.max(0, Math.min(1, splitFactor));
            const safeNearDistance = Math.max(0.01, nearDistance);
            const safeMaxDistance = Math.max(64, maxDistance);
            const lambda = Math.max(0, Math.min(1, this._cascadeSplitLambda));

            const uniformSplit =
              safeNearDistance +
              (safeMaxDistance - safeNearDistance) * safeSplitFactor;
            const logarithmicSplit =
              safeNearDistance *
              Math.pow(safeMaxDistance / safeNearDistance, safeSplitFactor);

            return lambda * logarithmicSplit + (1 - lambda) * uniformSplit;
          }

          private _updateCascadeRanges(layer: gdjs.RuntimeLayer): void {
            const cameraNear = Math.max(0.01, layer.getCamera3DNearPlaneDistance());
            const cameraFar = Math.max(
              cameraNear + 1,
              layer.getCamera3DFarPlaneDistance()
            );
            const safeMaxShadowDistance = Math.max(
              cameraNear + 1,
              Math.min(this._maxShadowDistance, cameraFar)
            );

            const practicalSplit1 = this._computePracticalSplit(
              1 / csmCascadeCount,
              cameraNear,
              safeMaxShadowDistance
            );
            const practicalSplit2 = this._computePracticalSplit(
              2 / csmCascadeCount,
              cameraNear,
              safeMaxShadowDistance
            );

            const safeSplit1 = Math.max(
              cameraNear + 0.01,
              Math.min(safeMaxShadowDistance - 0.02, practicalSplit1)
            );
            const safeSplit2 = Math.max(
              safeSplit1 + 0.01,
              Math.min(safeMaxShadowDistance - 0.01, practicalSplit2)
            );

            this._cascadeRanges[0].near = cameraNear;
            this._cascadeRanges[0].far = safeSplit1;
            this._cascadeRanges[1].near = safeSplit1;
            this._cascadeRanges[1].far = safeSplit2;
            this._cascadeRanges[2].near = safeSplit2;
            this._cascadeRanges[2].far = safeMaxShadowDistance;
          }

          private _computeCascadeFrustumSize(
            layer: gdjs.RuntimeLayer,
            cascadeIndex: integer
          ): float {
            const range = this._cascadeRanges[cascadeIndex];
            const safeRangeFar = Math.max(range.far, range.near + 1);
            const rangeDepth = Math.max(1, range.far - range.near);

            const cameraHeight = Math.max(1, layer.getCameraHeight());
            const cameraAspect = Math.max(0.1, layer.getCameraWidth() / cameraHeight);
            const fovRad = gdjs.toRad(
              Math.max(1, layer.getInitialCamera3DFieldOfView())
            );
            const projectedHalfHeight = Math.tan(fovRad * 0.5) * safeRangeFar;
            const projectedHeight = Math.max(1, projectedHalfHeight * 2);
            const projectedWidth = projectedHeight * cameraAspect;

            const visibleCoverage = Math.max(projectedHeight, projectedWidth);
            const depthPadding = Math.max(32, rangeDepth * 0.65);

            // Keep compatibility with the legacy "frustumSize" parameter as a global multiplier.
            const frustumScale = Math.max(0.25, this._frustumSize / 4000);
            const cascadeScale =
              cascadeIndex === 0 ? 0.85 : cascadeIndex === 1 ? 1 : 1.2;

            return Math.max(
              64,
              (visibleCoverage + depthPadding) * frustumScale * cascadeScale
            );
          }

          private _updateShadowCamera(layer: gdjs.RuntimeLayer): void {
            if (!this._shadowCameraDirty) {
              return;
            }
            this._shadowCameraDirty = false;

            this._distanceFromCamera = Math.max(10, this._distanceFromCamera);
            this._frustumSize = Math.max(64, this._frustumSize);
            this._maxShadowDistance = Math.max(64, this._maxShadowDistance);
            this._cascadeSplitLambda = Math.max(
              0,
              Math.min(1, this._cascadeSplitLambda)
            );

            this._updateCascadeRanges(layer);

            const safeDistanceFromCamera = Math.max(10, this._distanceFromCamera);

            for (let cascadeIndex = 0; cascadeIndex < this._lights.length; cascadeIndex++) {
              const light = this._lights[cascadeIndex];
              const cascadeFrustumSize = this._computeCascadeFrustumSize(
                layer,
                cascadeIndex
              );
              this._cascadeFrustumSizes[cascadeIndex] = cascadeFrustumSize;
              const rangeDepth = Math.max(
                1,
                this._cascadeRanges[cascadeIndex].far -
                  this._cascadeRanges[cascadeIndex].near
              );
              // Tight depth range improves shadow precision and reduces acne.
              const depthExtent =
                rangeDepth + Math.max(100, cascadeFrustumSize * 0.7);

              light.shadow.camera.near = Math.max(
                0.5,
                safeDistanceFromCamera - depthExtent
              );
              light.shadow.camera.far = safeDistanceFromCamera + depthExtent;
              light.shadow.camera.right = cascadeFrustumSize / 2;
              light.shadow.camera.left = -cascadeFrustumSize / 2;
              light.shadow.camera.top = cascadeFrustumSize / 2;
              light.shadow.camera.bottom = -cascadeFrustumSize / 2;
              light.shadow.camera.updateProjectionMatrix();
              light.shadow.needsUpdate = true;
            }
          }

          private _updateShadowMapSize(): void {
            if (!this._shadowMapDirty) {
              return;
            }
            this._shadowMapDirty = false;

            for (let cascadeIndex = 0; cascadeIndex < this._lights.length; cascadeIndex++) {
              const light = this._lights[cascadeIndex];
              const cascadeMapSize = this._computeCascadeMapSize(cascadeIndex);
              this._cascadeMapSizes[cascadeIndex] = cascadeMapSize;

              light.shadow.mapSize.set(cascadeMapSize, cascadeMapSize);

              // Force recreation of shadow map texture.
              light.shadow.map?.dispose();
              light.shadow.map = null;
              light.shadow.needsUpdate = true;
            }
          }

          private _getEffectiveShadowStabilizationStep(
            cascadeIndex: integer
          ): float {
            if (!this._shadowStabilizationEnabled) {
              return 0;
            }
            if (this._shadowStabilizationStep > 0) {
              return this._shadowStabilizationStep;
            }
            const frustumSize = this._cascadeFrustumSizes[cascadeIndex];
            const shadowMapSize = this._cascadeMapSizes[cascadeIndex];
            return Math.max(0.25, frustumSize / Math.max(1, shadowMapSize));
          }

          private _computeDirectionalPosition(
            targetX: float,
            targetY: float,
            targetZ: float
          ): [float, float, float] {
            if (this._top === 'Y-') {
              return [
                targetX +
                  this._distanceFromCamera *
                    Math.cos(gdjs.toRad(-this._rotation + 90)) *
                    Math.cos(gdjs.toRad(this._elevation)),
                targetY -
                  this._distanceFromCamera *
                    Math.sin(gdjs.toRad(this._elevation)),
                targetZ +
                  this._distanceFromCamera *
                    Math.sin(gdjs.toRad(-this._rotation + 90)) *
                    Math.cos(gdjs.toRad(this._elevation)),
              ];
            }

            return [
              targetX +
                this._distanceFromCamera *
                  Math.cos(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
              targetY +
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
              targetZ +
                this._distanceFromCamera * Math.sin(gdjs.toRad(this._elevation)),
            ];
          }

          private _applyCascadeTransform(
            light: THREE.DirectionalLight,
            targetX: float,
            targetY: float,
            targetZ: float
          ): void {
            const [lightX, lightY, lightZ] = this._computeDirectionalPosition(
              targetX,
              targetY,
              targetZ
            );
            light.position.set(lightX, lightY, lightZ);
            light.target.position.set(targetX, targetY, targetZ);
          }

          private _applyCascadeShadowTuning(cascadeIndex: integer): void {
            const light = this._lights[cascadeIndex];
            const cascadeMapSize = this._cascadeMapSizes[cascadeIndex];
            const cascadeFrustumSize = this._cascadeFrustumSizes[cascadeIndex];
            const texelWorldSize = cascadeFrustumSize / Math.max(1, cascadeMapSize);

            const resolutionMultiplier =
              cascadeMapSize < 1024 ? 2 : cascadeMapSize < 2048 ? 1.25 : 1;
            const distanceMultiplier =
              cascadeIndex === 0 ? 1 : cascadeIndex === 1 ? 1.8 : 2.8;
            const automaticBias = Math.max(0.00005, texelWorldSize * 0.0008);

            const baseBias = Math.max(
              this._minimumShadowBias,
              automaticBias
            );
            light.shadow.bias = -baseBias * resolutionMultiplier * distanceMultiplier;

            const baseNormalBias = Math.max(0, this._shadowNormalBias);
            const automaticNormalBias = texelWorldSize * 0.03;
            light.shadow.normalBias = Math.max(
              baseNormalBias * (1 + cascadeIndex * 0.35),
              automaticNormalBias
            );

            const baseRadius = Math.max(0, this._shadowRadius);
            const radiusMultiplier =
              cascadeIndex === 0 ? 0.75 : cascadeIndex === 1 ? 1 : 1.35;
            light.shadow.radius = baseRadius * radiusMultiplier;
          }

          private _computeLightDirection(): [float, float, float] {
            let directionX = 0;
            let directionY = 0;
            let directionZ = 1;
            if (this._top === 'Y-') {
              directionX =
                Math.cos(gdjs.toRad(-this._rotation + 90)) *
                Math.cos(gdjs.toRad(this._elevation));
              directionY = -Math.sin(gdjs.toRad(this._elevation));
              directionZ =
                Math.sin(gdjs.toRad(-this._rotation + 90)) *
                Math.cos(gdjs.toRad(this._elevation));
            } else {
              directionX =
                Math.cos(gdjs.toRad(this._rotation)) *
                Math.cos(gdjs.toRad(this._elevation));
              directionY =
                Math.sin(gdjs.toRad(this._rotation)) *
                Math.cos(gdjs.toRad(this._elevation));
              directionZ = Math.sin(gdjs.toRad(this._elevation));
            }

            const directionLength = Math.sqrt(
              directionX * directionX +
                directionY * directionY +
                directionZ * directionZ
            );
            if (directionLength < 0.00001) {
              return [0, 0, 1];
            }
            return [
              directionX / directionLength,
              directionY / directionLength,
              directionZ / directionLength,
            ];
          }

          private _computeLightSpaceBasis(): {
            rightX: float;
            rightY: float;
            rightZ: float;
            upX: float;
            upY: float;
            upZ: float;
            forwardX: float;
            forwardY: float;
            forwardZ: float;
          } {
            const [forwardX, forwardY, forwardZ] = this._computeLightDirection();

            // Build a stable orthonormal basis around light direction.
            let referenceUpX = 0;
            let referenceUpY = 0;
            let referenceUpZ = 1;
            if (Math.abs(forwardZ) > 0.97) {
              referenceUpX = 0;
              referenceUpY = 1;
              referenceUpZ = 0;
            }

            let rightX =
              referenceUpY * forwardZ - referenceUpZ * forwardY;
            let rightY =
              referenceUpZ * forwardX - referenceUpX * forwardZ;
            let rightZ =
              referenceUpX * forwardY - referenceUpY * forwardX;
            let rightLength = Math.sqrt(
              rightX * rightX + rightY * rightY + rightZ * rightZ
            );
            if (rightLength < 0.00001) {
              rightX = 1;
              rightY = 0;
              rightZ = 0;
              rightLength = 1;
            }
            rightX /= rightLength;
            rightY /= rightLength;
            rightZ /= rightLength;

            let upX = forwardY * rightZ - forwardZ * rightY;
            let upY = forwardZ * rightX - forwardX * rightZ;
            let upZ = forwardX * rightY - forwardY * rightX;
            const upLength = Math.sqrt(upX * upX + upY * upY + upZ * upZ);
            if (upLength > 0.00001) {
              upX /= upLength;
              upY /= upLength;
              upZ /= upLength;
            } else {
              upX = 0;
              upY = 1;
              upZ = 0;
            }

            return {
              rightX,
              rightY,
              rightZ,
              upX,
              upY,
              upZ,
              forwardX,
              forwardY,
              forwardZ,
            };
          }

          private _stabilizeAnchorInLightSpace(
            x: float,
            y: float,
            z: float,
            step: float,
            basis: {
              rightX: float;
              rightY: float;
              rightZ: float;
              upX: float;
              upY: float;
              upZ: float;
              forwardX: float;
              forwardY: float;
              forwardZ: float;
            }
          ): [float, float, float] {
            if (step <= 0) {
              return [x, y, z];
            }
            const rightCoord = x * basis.rightX + y * basis.rightY + z * basis.rightZ;
            const upCoord = x * basis.upX + y * basis.upY + z * basis.upZ;
            const forwardCoord =
              x * basis.forwardX + y * basis.forwardY + z * basis.forwardZ;

            const stabilizedRight = Math.round(rightCoord / step) * step;
            const stabilizedUp = Math.round(upCoord / step) * step;

            return [
              stabilizedRight * basis.rightX +
                stabilizedUp * basis.upX +
                forwardCoord * basis.forwardX,
              stabilizedRight * basis.rightY +
                stabilizedUp * basis.upY +
                forwardCoord * basis.forwardY,
              stabilizedRight * basis.rightZ +
                stabilizedUp * basis.upZ +
                forwardCoord * basis.forwardZ,
            ];
          }

          private _computeShadowFollowAnchor(
            cameraX: float,
            cameraY: float,
            cameraZ: float
          ): [float, float, float] {
            if (!this._hadPreviousCameraPosition) {
              this._hadPreviousCameraPosition = true;
              this._previousCameraX = cameraX;
              this._previousCameraY = cameraY;
              this._previousCameraZ = cameraZ;
              return [cameraX, cameraY, cameraZ];
            }

            const deltaX = cameraX - this._previousCameraX;
            const deltaY = cameraY - this._previousCameraY;
            const deltaZ = cameraZ - this._previousCameraZ;
            const movementLength = Math.sqrt(
              deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
            );
            const safeMaxDistance = Math.max(64, this._maxShadowDistance);
            const adaptiveLead =
              movementLength <= 0
                ? this._shadowFollowLead
                : Math.min(
                    1.4,
                    this._shadowFollowLead + movementLength / safeMaxDistance
                  );

            this._previousCameraX = cameraX;
            this._previousCameraY = cameraY;
            this._previousCameraZ = cameraZ;

            return [
              cameraX + deltaX * adaptiveLead,
              cameraY + deltaY * adaptiveLead,
              cameraZ + deltaZ * adaptiveLead,
            ];
          }

          private _computeShadowAnchor(
            cameraX: float,
            cameraY: float,
            cameraZ: float
          ): [float, float, float] {
            if (this._shadowFollowCamera) {
              return this._computeShadowFollowAnchor(cameraX, cameraY, cameraZ);
            }

            if (!this._staticAnchorInitialized) {
              this._staticAnchorInitialized = true;
              this._staticAnchorX = cameraX;
              this._staticAnchorY = cameraY;
              this._staticAnchorZ = cameraZ;
            }
            return [
              this._staticAnchorX,
              this._staticAnchorY,
              this._staticAnchorZ,
            ];
          }

          private _ensureSoftShadowRenderer(target: gdjs.EffectsTarget): void {
            const runtimeScene = target.getRuntimeScene();
            if (!runtimeScene || !runtimeScene.getGame) {
              return;
            }
            const gameRenderer = runtimeScene.getGame().getRenderer();
            if (!gameRenderer || !(gameRenderer as any).getThreeRenderer) {
              return;
            }
            const threeRenderer = (gameRenderer as any).getThreeRenderer();
            if (!threeRenderer || !threeRenderer.shadowMap) {
              return;
            }
            const rendererMaxTextureSize =
              threeRenderer.capabilities &&
              typeof threeRenderer.capabilities.maxTextureSize === 'number'
                ? threeRenderer.capabilities.maxTextureSize
                : 2048;
            this._maxRendererShadowMapSize = Math.max(
              512,
              rendererMaxTextureSize
            );

            if (!this._shadowCastingEnabled) {
              return;
            }

            threeRenderer.shadowMap.enabled = true;
            threeRenderer.shadowMap.autoUpdate = true;
            // `radius` has effect with PCFShadowMap, while PCFSoftShadowMap gives built-in soft filtering.
            threeRenderer.shadowMap.type =
              this._shadowRadius > 1
                ? THREE.PCFShadowMap
                : THREE.PCFSoftShadowMap;
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
            } else {
              return this.removeEffect(target);
            }
          }
          applyEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }

            for (let i = 0; i < this._lights.length; i++) {
              const light = this._lights[i];
              scene.add(light);
              scene.add(light.target);
              const helper = this._shadowCameraHelpers[i];
              if (helper) {
                scene.add(helper);
              }
            }

            this._hadPreviousCameraPosition = false;
            this._staticAnchorInitialized = false;
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }

            for (let i = 0; i < this._lights.length; i++) {
              const light = this._lights[i];
              scene.remove(light);
              scene.remove(light.target);
              const helper = this._shadowCameraHelpers[i];
              if (helper) {
                scene.remove(helper);
              }
            }

            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!target.getRuntimeLayer) {
              return;
            }
            const layer = target.getRuntimeLayer();
            const cameraX = layer.getCameraX();
            const cameraY = layer.getCameraY();
            const cameraZ = layer.getCameraZ(layer.getInitialCamera3DFieldOfView());
            const [anchorX, anchorY, anchorZ] = this._computeShadowAnchor(
              cameraX,
              cameraY,
              cameraZ
            );

            // CSM requires per-cascade cameras and map sizing to be refreshed when settings change.
            this._ensureSoftShadowRenderer(target);
            this._updateShadowCamera(layer);
            this._updateShadowMapSize();
            const lightSpaceBasis = this._computeLightSpaceBasis();

            for (let cascadeIndex = 0; cascadeIndex < this._lights.length; cascadeIndex++) {
              const light = this._lights[cascadeIndex];
              const stabilizationStep = this._shadowCastingEnabled
                ? this._getEffectiveShadowStabilizationStep(cascadeIndex)
                : 0;
              const [stabilizedX, stabilizedY, stabilizedZ] =
                this._stabilizeAnchorInLightSpace(
                  anchorX,
                  anchorY,
                  anchorZ,
                  stabilizationStep,
                  lightSpaceBasis
                );

              this._applyCascadeTransform(light, stabilizedX, stabilizedY, stabilizedZ);

              if (this._shadowCastingEnabled) {
                this._applyCascadeShadowTuning(cascadeIndex);
              }

              const helper = this._shadowCameraHelpers[cascadeIndex];
              if (helper) {
                helper.update();
              }
            }
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._setAllLightsIntensity(value);
            } else if (parameterName === 'elevation') {
              this._elevation = value;
            } else if (parameterName === 'rotation') {
              this._rotation = value;
            } else if (parameterName === 'distanceFromCamera') {
              this._distanceFromCamera = Math.max(10, value);
              this._shadowCameraDirty = true;
            } else if (parameterName === 'frustumSize') {
              this._frustumSize = Math.max(64, value);
              this._shadowCameraDirty = true;
            } else if (parameterName === 'minimumShadowBias') {
              this._minimumShadowBias = Math.max(0, value);
            } else if (parameterName === 'shadowNormalBias') {
              this._shadowNormalBias = Math.max(0, value);
            } else if (parameterName === 'shadowRadius') {
              this._shadowRadius = Math.max(0, value);
            } else if (parameterName === 'shadowStabilizationStep') {
              this._shadowStabilizationStep = Math.max(0, value);
            } else if (parameterName === 'maxShadowDistance') {
              this._maxShadowDistance = Math.max(64, value);
              this._shadowCameraDirty = true;
            } else if (parameterName === 'cascadeSplitLambda') {
              this._cascadeSplitLambda = Math.max(0, Math.min(1, value));
              this._shadowCameraDirty = true;
            } else if (parameterName === 'shadowMapSize') {
              this._shadowMapSize = this._getClosestShadowMapSize(value);
              this._shadowMapDirty = true;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'shadowFollowLead') {
              this._shadowFollowLead = Math.max(0, Math.min(2, value));
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            } else if (parameterName === 'elevation') {
              return this._elevation;
            } else if (parameterName === 'rotation') {
              return this._rotation;
            } else if (parameterName === 'distanceFromCamera') {
              return this._distanceFromCamera;
            } else if (parameterName === 'frustumSize') {
              return this._frustumSize;
            } else if (parameterName === 'minimumShadowBias') {
              return this._minimumShadowBias;
            } else if (parameterName === 'shadowNormalBias') {
              return this._shadowNormalBias;
            } else if (parameterName === 'shadowRadius') {
              return this._shadowRadius;
            } else if (parameterName === 'shadowStabilizationStep') {
              return this._shadowStabilizationStep;
            } else if (parameterName === 'maxShadowDistance') {
              return this._maxShadowDistance;
            } else if (parameterName === 'cascadeSplitLambda') {
              return this._cascadeSplitLambda;
            } else if (parameterName === 'shadowMapSize') {
              return this._shadowMapSize;
            } else if (parameterName === 'shadowFollowLead') {
              return this._shadowFollowLead;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._setAllLightsColor(gdjs.rgbOrHexStringToNumber(value));
            }
            if (parameterName === 'top') {
              this._top = value;
            }
            if (parameterName === 'shadowQuality') {
              if (value === 'low' && this._shadowMapSize !== 512) {
                this._shadowMapSize = 512;
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
              if (value === 'medium' && this._shadowMapSize !== 1024) {
                this._shadowMapSize = 1024;
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
              if (value === 'high' && this._shadowMapSize !== 2048) {
                this._shadowMapSize = 2048;
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
            }
            if (parameterName === 'shadowMapSize') {
              const parsedValue = parseFloat(value);
              if (!isNaN(parsedValue)) {
                this._shadowMapSize = this._getClosestShadowMapSize(parsedValue);
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this._setAllLightsColor(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._colorHex;
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'isCastingShadow') {
              this._setShadowCastingEnabled(value);
            } else if (parameterName === 'shadowStabilization') {
              this._shadowStabilizationEnabled = value;
            } else if (parameterName === 'shadowFollowCamera') {
              this._shadowFollowCamera = value;
              this._hadPreviousCameraPosition = false;
              this._staticAnchorInitialized = false;
            }
          }
          getNetworkSyncData(): DirectionalLightFilterNetworkSyncData {
            return {
              i: this._intensity,
              c: this._colorHex,
              e: this._elevation,
              r: this._rotation,
              t: this._top,
              msb: this._minimumShadowBias,
              snb: this._shadowNormalBias,
              sr: this._shadowRadius,
              ss: this._shadowStabilizationEnabled,
              sss: this._shadowStabilizationStep,
              dfc: this._distanceFromCamera,
              fs: this._frustumSize,
              msd: this._maxShadowDistance,
              csl: this._cascadeSplitLambda,
              sms: this._shadowMapSize,
              sfl: this._shadowFollowLead,
              sfc: this._shadowFollowCamera,
            };
          }
          updateFromNetworkSyncData(
            syncData: DirectionalLightFilterNetworkSyncData
          ): void {
            this._setAllLightsIntensity(syncData.i);
            this._setAllLightsColor(syncData.c);
            this._elevation = syncData.e;
            this._rotation = syncData.r;
            this._top = syncData.t;
            this._minimumShadowBias = Math.max(0, syncData.msb ?? 0);
            this._shadowNormalBias = Math.max(0, syncData.snb ?? 0.02);
            this._shadowRadius = Math.max(0, syncData.sr ?? 2);
            this._shadowStabilizationEnabled = syncData.ss ?? true;
            this._shadowStabilizationStep = Math.max(0, syncData.sss ?? 0);
            this._distanceFromCamera = Math.max(10, syncData.dfc ?? 1500);
            this._frustumSize = Math.max(64, syncData.fs ?? 4000);
            this._maxShadowDistance = Math.max(64, syncData.msd ?? 2000);
            this._cascadeSplitLambda = Math.max(0, Math.min(1, syncData.csl ?? 0.7));
            this._shadowMapSize = this._getClosestShadowMapSize(
              syncData.sms ?? 1024
            );
            this._shadowFollowLead = Math.max(0, Math.min(2, syncData.sfl ?? 0.45));
            this._shadowFollowCamera = syncData.sfc ?? false;
            this._hadPreviousCameraPosition = false;
            this._staticAnchorInitialized = false;
            this._shadowMapDirty = true;
            this._shadowCameraDirty = true;
          }
        })();
      }
    })()
  );
}
