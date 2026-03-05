namespace gdjs {
  interface PointLightFilterNetworkSyncData {
    i: number;
    c: number;
    x: number;
    y: number;
    z: number;
    d: number;
    dc: number;
    sb: number;
    snb: number;
    sn: number;
    sf: number;
    sr?: number;
    ao?: string;
    ox?: number;
    oy?: number;
    oz?: number;
    ro?: boolean;
    sms?: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::PointLight',
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
          private _positionX: float = 0;
          private _positionY: float = 0;
          private _positionZ: float = 500;
          private _distance: float = 0;
          private _decay: float = 2;
          private _shadowMapSize: float = 1024;
          private _shadowBias: float = -0.001;
          private _shadowNormalBias: float = 0.02;
          private _shadowRadius: float = 1.5;
          private _shadowNear: float = 1;
          private _shadowFar: float = 10000;
          private _attachedObjectName: string = '';
          private _attachedOffsetX: float = 0;
          private _attachedOffsetY: float = 0;
          private _attachedOffsetZ: float = 0;
          private _rotateOffsetsWithObjectAngle: boolean = false;

          private _isEnabled: boolean = false;
          private _light: THREE.PointLight;
          private _shadowMapDirty = true;
          private _shadowCameraDirty = true;
          private _maxRendererShadowMapSize: integer = 2048;

          constructor() {
            this._light = new THREE.PointLight();
            this._light.position.set(
              this._positionX,
              this._positionY,
              this._positionZ
            );
            this._light.distance = this._distance;
            this._light.decay = this._decay;

            // Configure shadow defaults
            this._light.shadow.bias = this._shadowBias;
            this._light.shadow.normalBias = this._shadowNormalBias;
            this._light.shadow.radius = this._shadowRadius;
            this._light.shadow.camera.near = this._shadowNear;
            this._light.shadow.camera.far = this._shadowFar;
            this._light.shadow.camera.updateProjectionMatrix();
          }

          private _clampShadowMapSizeToRenderer(size: integer): integer {
            const safeRendererMax = Math.max(512, this._maxRendererShadowMapSize);
            let clampedSize = 512;
            while (clampedSize * 2 <= safeRendererMax) {
              clampedSize *= 2;
            }
            return Math.max(512, Math.min(size, clampedSize));
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

            if (!this._light.castShadow) {
              return;
            }

            threeRenderer.shadowMap.enabled = true;
            threeRenderer.shadowMap.autoUpdate = true;
            threeRenderer.shadowMap.type =
              this._shadowRadius > 1
                ? THREE.PCFShadowMap
                : THREE.PCFSoftShadowMap;
          }

          private _updateShadowMapSize(): void {
            if (!this._shadowMapDirty) {
              return;
            }
            this._shadowMapDirty = false;

            this._shadowMapSize = this._getClosestShadowMapSize(
              this._shadowMapSize
            );
            this._light.shadow.mapSize.set(
              this._shadowMapSize,
              this._shadowMapSize
            );

            // Force the recreation of the shadow map texture:
            this._light.shadow.map?.dispose();
            this._light.shadow.map = null;
            this._light.shadow.needsUpdate = true;
          }

          private _updateShadowCamera(): void {
            if (!this._shadowCameraDirty) {
              return;
            }
            this._shadowCameraDirty = false;

            const safeNear = Math.max(0.01, this._shadowNear);
            this._shadowNear = safeNear;
            
            // Auto-adjust far plane if distance is explicitly set
            const effectiveFar = (this._distance > 0) ? 
                Math.min(this._shadowFar, this._distance + Math.max(50, this._distance * 0.25)) : 
                this._shadowFar;

            this._light.shadow.camera.near = safeNear;
            this._light.shadow.camera.far = Math.max(safeNear + 1, effectiveFar);
            this._light.shadow.camera.updateProjectionMatrix();
          }

          private _setLightPosition(x: float, y: float, z: float): void {
            if (this._top === 'Y-') {
              this._light.position.set(
                x,
                -z,
                y
              );
            } else {
              this._light.position.set(
                x,
                y,
                z
              );
            }
          }

          private _updatePosition(): void {
            this._setLightPosition(
              this._positionX,
              this._positionY,
              this._positionZ
            );
          }

          private _getFirstObjectByName(
            target: EffectsTarget,
            objectName: string
          ): gdjs.RuntimeObject | null {
            if (!objectName) {
              return null;
            }
            const objects = target.getRuntimeScene().getObjects(objectName);
            if (!objects || objects.length === 0) {
              return null;
            }
            return objects[0];
          }

          private _getObjectCenterZ(object: gdjs.RuntimeObject): float {
            const object3D = object as gdjs.RuntimeObject & {
              getCenterZInScene?: () => float;
            };
            return typeof object3D.getCenterZInScene === 'function'
              ? object3D.getCenterZInScene()
              : 0;
          }

          private _getRotatedOffsets(
            object: gdjs.RuntimeObject,
            offsetX: float,
            offsetY: float
          ): [float, float] {
            if (!this._rotateOffsetsWithObjectAngle) {
              return [offsetX, offsetY];
            }
            const angleRad = gdjs.toRad(object.getAngle());
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            return [
              offsetX * cos - offsetY * sin,
              offsetX * sin + offsetY * cos,
            ];
          }

          private _applyAttachedPosition(target: EffectsTarget): boolean {
            const attachedObject = this._getFirstObjectByName(
              target,
              this._attachedObjectName
            );
            if (!attachedObject) {
              return false;
            }
            const [offsetX, offsetY] = this._getRotatedOffsets(
              attachedObject,
              this._attachedOffsetX,
              this._attachedOffsetY
            );
            this._setLightPosition(
              attachedObject.getCenterXInScene() + offsetX,
              attachedObject.getCenterYInScene() + offsetY,
              this._getObjectCenterZ(attachedObject) + this._attachedOffsetZ
            );
            return true;
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
            scene.add(this._light);
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
            scene.remove(this._light);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (
              !this._applyAttachedPosition(target) &&
              this._attachedObjectName !== ''
            ) {
              this._updatePosition();
            }

            this._ensureSoftShadowRenderer(target);
            if (!this._light.castShadow) {
              return;
            }
            this._updateShadowCamera();
            this._updateShadowMapSize();

            this._light.shadow.bias = this._shadowBias;
            this._light.shadow.normalBias = this._shadowNormalBias;
            this._light.shadow.radius = this._shadowRadius;
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._light.intensity = Math.max(0, value);
            } else if (parameterName === 'positionX') {
              this._positionX = value;
              this._updatePosition();
            } else if (parameterName === 'positionY') {
              this._positionY = value;
              this._updatePosition();
            } else if (parameterName === 'positionZ') {
              this._positionZ = value;
              this._updatePosition();
            } else if (parameterName === 'attachedOffsetX') {
              this._attachedOffsetX = value;
            } else if (parameterName === 'attachedOffsetY') {
              this._attachedOffsetY = value;
            } else if (parameterName === 'attachedOffsetZ') {
              this._attachedOffsetZ = value;
            } else if (parameterName === 'distance') {
              this._distance = Math.max(0, value);
              this._light.distance = this._distance;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'decay') {
              this._decay = Math.max(0, value);
              this._light.decay = this._decay;
            } else if (parameterName === 'shadowBias') {
              this._shadowBias = -Math.max(0, value);
            } else if (parameterName === 'shadowNormalBias') {
              this._shadowNormalBias = Math.max(0, value);
            } else if (parameterName === 'shadowRadius') {
              this._shadowRadius = Math.max(0, value);
            } else if (parameterName === 'shadowMapSize') {
              this._shadowMapSize = this._getClosestShadowMapSize(value);
              this._shadowMapDirty = true;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'shadowNear') {
              this._shadowNear = Math.max(0.01, value);
              this._shadowCameraDirty = true;
            } else if (parameterName === 'shadowFar') {
              this._shadowFar = Math.max(this._shadowNear + 1, value);
              this._shadowCameraDirty = true;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._light.intensity;
            } else if (parameterName === 'positionX') {
              return this._positionX;
            } else if (parameterName === 'positionY') {
              return this._positionY;
            } else if (parameterName === 'positionZ') {
              return this._positionZ;
            } else if (parameterName === 'attachedOffsetX') {
              return this._attachedOffsetX;
            } else if (parameterName === 'attachedOffsetY') {
              return this._attachedOffsetY;
            } else if (parameterName === 'attachedOffsetZ') {
              return this._attachedOffsetZ;
            } else if (parameterName === 'distance') {
              return this._distance;
            } else if (parameterName === 'decay') {
              return this._decay;
            } else if (parameterName === 'shadowBias') {
              return -this._shadowBias;
            } else if (parameterName === 'shadowNormalBias') {
              return this._shadowNormalBias;
            } else if (parameterName === 'shadowRadius') {
              return this._shadowRadius;
            } else if (parameterName === 'shadowMapSize') {
              return this._shadowMapSize;
            } else if (parameterName === 'shadowNear') {
              return this._shadowNear;
            } else if (parameterName === 'shadowFar') {
              return this._shadowFar;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._light.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
            if (parameterName === 'top') {
              this._top = value;
              this._updatePosition();
            }
            if (parameterName === 'attachedObject') {
              this._attachedObjectName = value;
            }
            if (parameterName === 'shadowQuality') {
              if (value === 'low' && this._shadowMapSize !== 512) {
                this._shadowMapSize = this._getClosestShadowMapSize(512);
                this._shadowMapDirty = true;
              }
              if (value === 'medium' && this._shadowMapSize !== 1024) {
                this._shadowMapSize = this._getClosestShadowMapSize(1024);
                this._shadowMapDirty = true;
              }
              if (value === 'high' && this._shadowMapSize !== 2048) {
                this._shadowMapSize = this._getClosestShadowMapSize(2048);
                this._shadowMapDirty = true;
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
              this._light.color.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._light.color.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'isCastingShadow') {
              this._light.castShadow = value;
              if (value) {
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
            } else if (parameterName === 'rotateOffsetsWithObjectAngle') {
              this._rotateOffsetsWithObjectAngle = value;
            }
          }
          getNetworkSyncData(): PointLightFilterNetworkSyncData {
            return {
              i: this._light.intensity,
              c: this._light.color.getHex(),
              x: this._positionX,
              y: this._positionY,
              z: this._positionZ,
              d: this._distance,
              dc: this._decay,
              sb: this._shadowBias,
              snb: this._shadowNormalBias,
              sn: this._shadowNear,
              sf: this._shadowFar,
              sr: this._shadowRadius,
              ao: this._attachedObjectName,
              ox: this._attachedOffsetX,
              oy: this._attachedOffsetY,
              oz: this._attachedOffsetZ,
              ro: this._rotateOffsetsWithObjectAngle,
              sms: this._shadowMapSize,
            };
          }
          updateFromNetworkSyncData(
            syncData: PointLightFilterNetworkSyncData
          ): void {
            this._light.intensity = syncData.i;
            this._light.color.setHex(syncData.c);
            this._positionX = syncData.x;
            this._positionY = syncData.y;
            this._positionZ = syncData.z;
            this._distance = syncData.d;
            this._decay = Math.max(0, syncData.dc);
            this._shadowBias = syncData.sb ?? -0.001;
            this._shadowNormalBias = Math.max(0, syncData.snb ?? 0.02);
            this._shadowNear = Math.max(0.01, syncData.sn ?? 1);
            this._shadowFar = Math.max(this._shadowNear + 1, syncData.sf ?? 10000);
            this._shadowRadius = Math.max(0, syncData.sr ?? 1.5);
            this._shadowMapSize = this._getClosestShadowMapSize(
              syncData.sms ?? 1024
            );
            this._attachedObjectName = syncData.ao || '';
            this._attachedOffsetX = syncData.ox ?? 0;
            this._attachedOffsetY = syncData.oy ?? 0;
            this._attachedOffsetZ = syncData.oz ?? 0;
            this._rotateOffsetsWithObjectAngle = syncData.ro ?? false;
            this._light.distance = syncData.d;
            this._light.decay = this._decay;
            this._updatePosition();
            this._shadowMapDirty = true;
            this._shadowCameraDirty = true;
          }
        })();
      }
    })()
  );
}
