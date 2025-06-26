namespace gdjs {
  interface DirectionalLightFilterNetworkSyncData {
    i: number;
    c: number;
    e: number;
    r: number;
    t: string;
  }
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
          rotationObject: THREE.Group;
          _isEnabled: boolean = false;
          top: string = 'Y-';
          elevation: float = 45;
          rotation: float = 0;
          shadowSize: float = 1024; //1024 == medium quality

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
            this.rotationObject = new THREE.Group();
            this.rotationObject.position.set(0, 0, 0);
            this.rotationObject.rotation.set(0, 0, 0);
            this.rotationObject.add(this.light);
            const shadowCameraHelper = new THREE.CameraHelper(
              this.light.shadow.camera
            );
            this.rotationObject.add(shadowCameraHelper);
            this.light.shadow.camera.updateProjectionMatrix();
            this.updateRotation();
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
            scene.add(this.rotationObject);
            scene.add(this.light.target);
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
            scene.remove(this.rotationObject);
            scene.remove(this.light.target);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            const layer = target.getRuntimeLayer();
            const x = layer.getCameraX();
            const y = -layer.getCameraY();
            const z = layer.getCameraZ(layer.getInitialCamera3DFieldOfView());
            console.log(
              'position du rotationObject : ' + this.rotationObject.position.x,
              this.rotationObject.position.y,
              this.rotationObject.position.z
            );

            if (this.top === 'Y-') {
              const posLightX =
                x +
                1000 *
                  Math.cos(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              const posLightY = y - 1000 * Math.sin(gdjs.toRad(this.elevation));
              const posLightZ =
                z +
                1000 *
                  Math.sin(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              this.light.position.set(posLightX, -posLightY, posLightZ);
              console.log('position de la camera :' + x, y, z);
              console.log(
                'position de la light :' + this.light.position.x,
                this.light.position.y,
                this.light.position.z
              );

              this.light.target.position.set(x, -y, z);
              console.log(
                'position de la target :' + this.light.target.position.x,
                this.light.target.position.y,
                this.light.target.position.z
              );
            } else {
              const posLightX =
                x +
                1000 *
                  Math.cos(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              const posLightY =
                y +
                1000 *
                  Math.sin(gdjs.toRad(this.rotation + 90)) *
                  Math.cos(gdjs.toRad(this.elevation));
              const posLightZ = z + 1000 * Math.sin(gdjs.toRad(this.elevation));

              this.light.position.set(posLightX, -posLightY, posLightZ);
              console.log('position de la camera :' + x, y, z);
              console.log(
                'position de la light :' + this.light.position.x,
                this.light.position.y,
                this.light.position.z
              );

              this.light.target.position.set(x, -y, z);
            }
            console.log(
              'position de la target :' + this.light.target.position.x,
              this.light.target.position.y,
              this.light.target.position.z
            );

            console.log('élévation : ' + this.elevation);
            console.log('rotation :' + this.rotation);
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this.light.intensity = value;
            } else if (parameterName === 'elevation') {
              this.elevation = value;
              this.updateRotation();
            } else if (parameterName === 'rotation') {
              this.rotation = value;
              this.updateRotation();
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
            if (parameterName === 'top') {
              this.top = value;
              this.updateRotation();
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

          updateRotation() {
            // if (this.top === 'Z+') {
            //   // 0° is a light from the right of the screen.
            //   this.rotationObject.rotation.z = gdjs.toRad(this.rotation);
            //   this.rotationObject.rotation.y = -gdjs.toRad(this.elevation);
            // } else {
            //   // 0° becomes a light from Z+.
            //   this.rotationObject.rotation.y = gdjs.toRad(this.rotation - 90);
            //   this.rotationObject.rotation.z = -gdjs.toRad(this.elevation);
            // }
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
            this.updateRotation();
          }
        })();
      }
    })()
  );
}
