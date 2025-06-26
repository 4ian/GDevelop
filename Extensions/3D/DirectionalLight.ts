namespace gdjs {
  interface DirectionalLightFilterNetworkSyncData {
    i: number;
    c: number;
    e: number;
    r: number;
    t: string;
  }
  const shadowHelper = false;
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
          light: THREE.DirectionalLight;
          _isEnabled: boolean = false;
          top: string = 'Y-';
          elevation: float = 45;
          rotation: float = 0;
          shadowSize: float = 1024;

          constructor() {
            this.light = new THREE.DirectionalLight();
            this.light.shadow.mapSize.width = this.shadowSize;
            this.light.shadow.mapSize.height = this.shadowSize;
            this.light.shadow.camera.near = 1;
            this.light.shadow.camera.far = 10000;
            this.light.shadow.camera.right = 1000;
            this.light.shadow.camera.left = -1000;
            this.light.shadow.camera.top = 1000;
            this.light.shadow.camera.bottom = -1000;

            this.light.shadow.camera.updateProjectionMatrix();
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
            scene.add(this.light);
            scene.add(this.light.target);
            if (shadowHelper) {
              const shadowCameraHelper = new THREE.CameraHelper(
                this.light.shadow.camera
              );
              scene.add(shadowCameraHelper);
            }

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
            scene.remove(this.light);
            scene.remove(this.light.target);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            const layer = target.getRuntimeLayer();
            const x = layer.getCameraX();
            const y = -layer.getCameraY();
            const z = layer.getCameraZ(layer.getInitialCamera3DFieldOfView());

            if (this.top === 'Y-') {
              const posLightX =
                x +
                1000 *
                  Math.cos(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              const posLightY = y + 1000 * Math.sin(gdjs.toRad(this.elevation));
              const posLightZ =
                z +
                1000 *
                  Math.sin(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              this.light.position.set(posLightX, -posLightY, posLightZ);
              this.light.target.position.set(x, -y, z);
            } else {
              const posLightX =
                x +
                1000 *
                  Math.cos(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              const posLightY =
                y -
                1000 *
                  Math.sin(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              const posLightZ = z + 1000 * Math.sin(gdjs.toRad(this.elevation));

              this.light.position.set(posLightX, -posLightY, posLightZ);
              this.light.target.position.set(x, -y, z);
            }
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this.light.intensity = value;
            } else if (parameterName === 'elevation') {
              this.elevation = value;
            } else if (parameterName === 'rotation') {
              this.rotation = value;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this.light.intensity;
            } else if (parameterName === 'elevation') {
              return this.elevation;
            } else if (parameterName === 'rotation') {
              return this.rotation;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this.light.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
            if (parameterName === 'shadowQuality') {
              if (value === 'Low') {
                this.light.shadow.mapSize.set(512, 512);
                this.light.shadow.map?.dispose(); //force the recreation of the shadow texture
                this.light.shadow.map = null;
                this.light.shadow.needsUpdate = true;
              }
              if (value === 'Medium') {
                this.light.shadow.mapSize.set(1024, 1024);
                this.light.shadow.map?.dispose(); //force the recreation of the shadow texture
                this.light.shadow.map = null;
                this.light.shadow.needsUpdate = true;
              }
              if (value === 'High') {
                this.light.shadow.mapSize.set(2048, 2048);
                this.light.shadow.map?.dispose(); //force the recreation of the shadow texture
                this.light.shadow.map = null;
                this.light.shadow.needsUpdate = true;
              }
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this.light.color.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this.light.color.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'isCastingShadow') {
              this.light.castShadow = value;
            }
          }

          getNetworkSyncData(): DirectionalLightFilterNetworkSyncData {
            return {
              i: this.light.intensity,
              c: this.light.color.getHex(),
              e: this.elevation,
              r: this.rotation,
              t: this.top,
            };
          }
          updateFromNetworkSyncData(syncData: any): void {
            this.light.intensity = syncData.i;
            this.light.color.setHex(syncData.c);
            this.elevation = syncData.e;
            this.rotation = syncData.r;
            this.top = syncData.t;
          }
        })();
      }
    })()
  );
}
