namespace gdjs {
  interface SkyFilterNetworkSyncData {
    t: number;
    r: number;
    m: number;
    g: number;
    e: number;
    a: number;
    s: number;
    cs: number;
    csp: number;
    cc: number;
    cd: number;
    ce: number;
    ts: number;
  }

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::Sky',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined' || typeof THREE_ADDONS === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        if (!THREE_ADDONS.Sky) {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }

        return new (class implements gdjs.PixiFiltersTools.Filter {
          _sky: THREE_ADDONS.Sky;
          _sun: THREE.Vector3;
          _skyUp: THREE.Vector3;
          _cameraUp: THREE.Vector3;
          _cachedCameraUp: THREE.Vector3;
          _orientationQuat: THREE.Quaternion;
          _isEnabled: boolean = false;
          _time: number = 0;

          _turbidity: number = 2;
          _rayleigh: number = 1;
          _mieCoefficient: number = 0.005;
          _mieDirectionalG: number = 0.8;
          _sunElevation: number = 2;
          _sunAzimuth: number = 180;
          _scale: number = 10000;

          _cloudScale: number = 0.0002;
          _cloudSpeed: number = 0.0001;
          _cloudCoverage: number = 0.4;
          _cloudDensity: number = 0.4;
          _cloudElevation: number = 0.5;
          _timeScale: number = 1;

          constructor() {
            this._sky = new THREE_ADDONS.Sky();
            this._sky.frustumCulled = false;
            this._sky.scale.setScalar(this._scale);
            this._sun = new THREE.Vector3();
            this._skyUp = new THREE.Vector3(0, 1, 0);
            this._cameraUp = new THREE.Vector3(0, 1, 0);
            this._cachedCameraUp = new THREE.Vector3(0, 1, 0);
            this._orientationQuat = new THREE.Quaternion();
            this._applyUniforms();
          }

          _updateOrientation(target: EffectsTarget) {
            const layer = target.getRuntimeLayer?.();
            const renderer = layer ? layer.getRenderer?.() : null;
            const camera =
              renderer && (renderer as any).getThreeCamera
                ? (renderer as any).getThreeCamera()
                : null;
            if (!camera) return;

            this._cameraUp.copy(camera.up);
            if (this._cameraUp.lengthSq() === 0) return;
            this._cameraUp.normalize();

            if (
              this._cameraUp.distanceToSquared(this._cachedCameraUp) < 1e-10
            ) {
              return;
            }
            this._cachedCameraUp.copy(this._cameraUp);
            this._orientationQuat.setFromUnitVectors(
              this._skyUp,
              this._cachedCameraUp
            );
            this._sky.quaternion.copy(this._orientationQuat);
            this._updateSun();
          }

          _applyUniforms() {
            const uniforms = this._sky.material.uniforms;
            uniforms.turbidity.value = this._turbidity;
            uniforms.rayleigh.value = this._rayleigh;
            uniforms.mieCoefficient.value = this._mieCoefficient;
            uniforms.mieDirectionalG.value = this._mieDirectionalG;
            uniforms.cloudScale.value = this._cloudScale;
            uniforms.cloudSpeed.value = this._cloudSpeed;
            uniforms.cloudCoverage.value = this._cloudCoverage;
            uniforms.cloudDensity.value = this._cloudDensity;
            uniforms.cloudElevation.value = this._cloudElevation;
            this._updateSun();
          }

          _updateSun() {
            const phi = THREE.MathUtils.degToRad(90 - this._sunElevation);
            const theta = THREE.MathUtils.degToRad(this._sunAzimuth);
            this._sun
              .setFromSphericalCoords(1, phi, theta)
              .applyQuaternion(this._orientationQuat);
            this._sky.material.uniforms.sunPosition.value.copy(this._sun);
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
            scene.add(this._sky);
            this._updateOrientation(target);
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
            scene.remove(this._sky);
            this._isEnabled = false;
            return true;
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) return;
            this._updateOrientation(target);
            const dt = target.getElapsedTime() / 1000;
            this._time += dt * this._timeScale;
            this._sky.material.uniforms.time.value = this._time;
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            switch (parameterName) {
              case 'turbidity':
                this._turbidity = value;
                this._sky.material.uniforms.turbidity.value = value;
                break;
              case 'rayleigh':
                this._rayleigh = value;
                this._sky.material.uniforms.rayleigh.value = value;
                break;
              case 'mieCoefficient':
                this._mieCoefficient = value;
                this._sky.material.uniforms.mieCoefficient.value = value;
                break;
              case 'mieDirectionalG':
                this._mieDirectionalG = value;
                this._sky.material.uniforms.mieDirectionalG.value = value;
                break;
              case 'sunElevation':
                this._sunElevation = value;
                this._updateSun();
                break;
              case 'sunAzimuth':
                this._sunAzimuth = value;
                this._updateSun();
                break;
              case 'scale':
                this._scale = value;
                this._sky.scale.setScalar(value);
                break;
              case 'cloudScale':
                this._cloudScale = value;
                this._sky.material.uniforms.cloudScale.value = value;
                break;
              case 'cloudSpeed':
                this._cloudSpeed = value;
                this._sky.material.uniforms.cloudSpeed.value = value;
                break;
              case 'cloudCoverage':
                this._cloudCoverage = value;
                this._sky.material.uniforms.cloudCoverage.value = value;
                break;
              case 'cloudDensity':
                this._cloudDensity = value;
                this._sky.material.uniforms.cloudDensity.value = value;
                break;
              case 'cloudElevation':
                this._cloudElevation = value;
                this._sky.material.uniforms.cloudElevation.value = value;
                break;
              case 'timeScale':
                this._timeScale = value;
                break;
            }
          }

          getDoubleParameter(parameterName: string): number {
            switch (parameterName) {
              case 'turbidity':
                return this._turbidity;
              case 'rayleigh':
                return this._rayleigh;
              case 'mieCoefficient':
                return this._mieCoefficient;
              case 'mieDirectionalG':
                return this._mieDirectionalG;
              case 'sunElevation':
                return this._sunElevation;
              case 'sunAzimuth':
                return this._sunAzimuth;
              case 'scale':
                return this._scale;
              case 'cloudScale':
                return this._cloudScale;
              case 'cloudSpeed':
                return this._cloudSpeed;
              case 'cloudCoverage':
                return this._cloudCoverage;
              case 'cloudDensity':
                return this._cloudDensity;
              case 'cloudElevation':
                return this._cloudElevation;
              case 'timeScale':
                return this._timeScale;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {}
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}

          getNetworkSyncData(): SkyFilterNetworkSyncData {
            return {
              t: this._turbidity,
              r: this._rayleigh,
              m: this._mieCoefficient,
              g: this._mieDirectionalG,
              e: this._sunElevation,
              a: this._sunAzimuth,
              s: this._scale,
              cs: this._cloudScale,
              csp: this._cloudSpeed,
              cc: this._cloudCoverage,
              cd: this._cloudDensity,
              ce: this._cloudElevation,
              ts: this._timeScale,
            };
          }

          updateFromNetworkSyncData(data: SkyFilterNetworkSyncData): void {
            this._turbidity = data.t;
            this._rayleigh = data.r;
            this._mieCoefficient = data.m;
            this._mieDirectionalG = data.g;
            this._sunElevation = data.e;
            this._sunAzimuth = data.a;
            this._scale = data.s;
            this._cloudScale = data.cs;
            this._cloudSpeed = data.csp;
            this._cloudCoverage = data.cc;
            this._cloudDensity = data.cd;
            this._cloudElevation = data.ce;
            this._timeScale = data.ts;
            this._sky.scale.setScalar(this._scale);
            this._applyUniforms();
          }
        })();
      }
    })()
  );
}
