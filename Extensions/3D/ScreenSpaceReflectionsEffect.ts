namespace gdjs {
  interface ScreenSpaceReflectionsNetworkSyncData {
    i: number;
    md: number;
    t: number;
    e: boolean;
    q?: string;
  }

  const ssrExcludeUserDataKey = '__gdScene3dSsrExclude';

  const screenSpaceReflectionsShader = {
    uniforms: {
      tDiffuse: { value: null },
      tSceneColor: { value: null },
      tDepth: { value: null },
      tSSRExcludeMask: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      intensity: { value: 0.75 },
      maxDistance: { value: 420.0 },
      thickness: { value: 4.0 },
      maxSteps: { value: 24.0 },
      cameraProjectionMatrix: { value: new THREE.Matrix4() },
      cameraProjectionMatrixInverse: { value: new THREE.Matrix4() },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform sampler2D tDiffuse;
      uniform sampler2D tSceneColor;
      uniform sampler2D tDepth;
      uniform sampler2D tSSRExcludeMask;
      uniform vec2 resolution;
      uniform float intensity;
      uniform float maxDistance;
      uniform float thickness;
      uniform float maxSteps;
      uniform mat4 cameraProjectionMatrix;
      uniform mat4 cameraProjectionMatrixInverse;
      varying vec2 vUv;

      const int SSR_STEPS = 64;
      const int SSR_REFINEMENT_STEPS = 5;

      vec3 viewPositionFromDepth(vec2 uv, float depth) {
        vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 view = cameraProjectionMatrixInverse * clip;
        return view.xyz / max(view.w, 0.00001);
      }

      vec3 reconstructNormal(vec2 uv, float depth) {
        vec2 texel = 1.0 / resolution;
        vec2 uvLeft = clamp(uv - vec2(texel.x, 0.0), vec2(0.0), vec2(1.0));
        vec2 uvRight = clamp(uv + vec2(texel.x, 0.0), vec2(0.0), vec2(1.0));
        vec2 uvDown = clamp(uv - vec2(0.0, texel.y), vec2(0.0), vec2(1.0));
        vec2 uvUp = clamp(uv + vec2(0.0, texel.y), vec2(0.0), vec2(1.0));

        float depthLeft = texture2D(tDepth, uvLeft).x;
        float depthRight = texture2D(tDepth, uvRight).x;
        float depthDown = texture2D(tDepth, uvDown).x;
        float depthUp = texture2D(tDepth, uvUp).x;

        vec3 center = viewPositionFromDepth(uv, depth);
        vec3 left = viewPositionFromDepth(uvLeft, depthLeft);
        vec3 right = viewPositionFromDepth(uvRight, depthRight);
        vec3 down = viewPositionFromDepth(uvDown, depthDown);
        vec3 up = viewPositionFromDepth(uvUp, depthUp);

        // Select derivatives with the most consistent depth variation to reduce
        // noisy normals near depth discontinuities.
        vec3 dxForward = right - center;
        vec3 dxBackward = center - left;
        vec3 dyForward = up - center;
        vec3 dyBackward = center - down;
        vec3 dx = abs(dxForward.z) < abs(dxBackward.z) ? dxForward : dxBackward;
        vec3 dy = abs(dyForward.z) < abs(dyBackward.z) ? dyForward : dyBackward;

        vec3 normal = normalize(cross(dx, dy));
        if (length(normal) < 0.0001) {
          normal = normalize(cross(right - center, up - center));
        }
        if (dot(normal, -normalize(center)) < 0.0) {
          normal = -normal;
        }
        return normal;
      }

      vec2 projectToUv(vec3 viewPosition) {
        vec4 clip = cameraProjectionMatrix * vec4(viewPosition, 1.0);
        return clip.xy / max(clip.w, 0.00001) * 0.5 + 0.5;
      }

      float estimateRoughness(vec3 normal, vec3 viewPos) {
        float facing = clamp(dot(normal, -normalize(viewPos)), 0.0, 1.0);
        return clamp(1.0 - facing * facing, 0.08, 0.8);
      }

      vec3 sampleReflectionColor(vec2 uv, float roughness) {
        vec2 texel = 1.0 / resolution;
        vec3 currentCenter = texture2D(tDiffuse, uv).rgb;
        vec3 currentXPos = texture2D(
          tDiffuse,
          clamp(uv + vec2(texel.x, 0.0), vec2(0.0), vec2(1.0))
        ).rgb;
        vec3 currentXNeg = texture2D(
          tDiffuse,
          clamp(uv - vec2(texel.x, 0.0), vec2(0.0), vec2(1.0))
        ).rgb;
        vec3 currentYPos = texture2D(
          tDiffuse,
          clamp(uv + vec2(0.0, texel.y), vec2(0.0), vec2(1.0))
        ).rgb;
        vec3 currentYNeg = texture2D(
          tDiffuse,
          clamp(uv - vec2(0.0, texel.y), vec2(0.0), vec2(1.0))
        ).rgb;

        vec3 neighborhoodMin = min(
          min(currentCenter, currentXPos),
          min(min(currentXNeg, currentYPos), currentYNeg)
        );
        vec3 neighborhoodMax = max(
          max(currentCenter, currentXPos),
          max(max(currentXNeg, currentYPos), currentYNeg)
        );

        vec3 capturedCenter = texture2D(tSceneColor, uv).rgb;
        capturedCenter = clamp(
          capturedCenter,
          neighborhoodMin - vec3(0.08),
          neighborhoodMax + vec3(0.08)
        );

        vec2 blurOffset = texel * mix(0.5, 2.0, roughness);
        vec3 capturedBlurred =
          capturedCenter +
          texture2D(
            tSceneColor,
            clamp(uv + vec2(blurOffset.x, 0.0), vec2(0.0), vec2(1.0))
          ).rgb +
          texture2D(
            tSceneColor,
            clamp(uv - vec2(blurOffset.x, 0.0), vec2(0.0), vec2(1.0))
          ).rgb +
          texture2D(
            tSceneColor,
            clamp(uv + vec2(0.0, blurOffset.y), vec2(0.0), vec2(1.0))
          ).rgb +
          texture2D(
            tSceneColor,
            clamp(uv - vec2(0.0, blurOffset.y), vec2(0.0), vec2(1.0))
          ).rgb;
        capturedBlurred *= 0.2;

        float currentFrameWeight = 0.04 + 0.08 * (1.0 - roughness);
        vec3 reflectionColor = mix(capturedBlurred, currentCenter, currentFrameWeight);
        return min(reflectionColor, vec3(4.0));
      }

      vec4 refineHit(
        vec3 originVS,
        vec3 lowPos,
        vec3 highPos,
        float roughness,
        vec3 reflectedDirVS
      ) {
        vec3 a = lowPos;
        vec3 b = highPos;
        vec3 mid = highPos;

        for (int i = 0; i < SSR_REFINEMENT_STEPS; ++i) {
          mid = (a + b) * 0.5;
          vec2 midUv = projectToUv(mid);
          if (midUv.x <= 0.0 || midUv.x >= 1.0 || midUv.y <= 0.0 || midUv.y >= 1.0) {
            b = mid;
            continue;
          }
          float sampledDepth = texture2D(tDepth, midUv).x;
          if (sampledDepth >= 1.0) {
            a = mid;
            continue;
          }
          vec3 depthViewPos = viewPositionFromDepth(midUv, sampledDepth);
          float signedDepth = depthViewPos.z - mid.z;
          float hitThickness = max(thickness, maxDistance / max(maxSteps, 1.0));
          if (signedDepth > -hitThickness * (1.0 + roughness)) {
            b = mid;
          } else {
            a = mid;
          }
        }

        vec2 finalUv = projectToUv(mid);
        if (finalUv.x <= 0.0 || finalUv.x >= 1.0 || finalUv.y <= 0.0 || finalUv.y >= 1.0) {
          return vec4(0.0);
        }
        float finalDepth = texture2D(tDepth, finalUv).x;
        if (finalDepth >= 1.0) {
          return vec4(0.0);
        }

        vec3 hitNormal = reconstructNormal(finalUv, finalDepth);
        float normalAlignment = clamp(dot(hitNormal, -reflectedDirVS), 0.0, 1.0);
        if (normalAlignment <= 0.05) {
          return vec4(0.0);
        }

        vec3 finalDepthViewPos = viewPositionFromDepth(finalUv, finalDepth);
        float finalDepthError = abs(finalDepthViewPos.z - mid.z);
        float finalHitThickness =
          max(thickness, maxDistance / max(maxSteps, 1.0)) * (1.0 + roughness * 0.45);
        float depthConfidence = 1.0 - smoothstep(
          finalHitThickness * 0.5,
          finalHitThickness * 2.5,
          finalDepthError
        );
        float angleConfidence = smoothstep(0.08, 0.45, normalAlignment);
        float hitConfidence = clamp(depthConfidence * angleConfidence, 0.0, 1.0);
        if (hitConfidence <= 0.02) {
          return vec4(0.0);
        }

        vec3 hitColor = sampleReflectionColor(finalUv, roughness) * hitConfidence;
        float hitDistance = length(mid - originVS);
        return vec4(hitColor * normalAlignment, hitDistance);
      }

      vec4 traceReflection(vec3 originVS, vec3 reflectedDirVS, float roughness) {
        float clampedSteps = clamp(maxSteps, 8.0, float(SSR_STEPS));
        float stepSize = maxDistance / clampedSteps;
        vec3 rayPos = originVS;
        vec3 previousRayPos = rayPos;
        vec4 hit = vec4(0.0);

        for (int i = 0; i < SSR_STEPS; ++i) {
          if (float(i) >= clampedSteps) {
            break;
          }

          previousRayPos = rayPos;
          rayPos += reflectedDirVS * stepSize;
          vec2 uv = projectToUv(rayPos);
          if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) {
            break;
          }

          float sampledDepth = texture2D(tDepth, uv).x;
          if (sampledDepth >= 1.0) {
            continue;
          }

          vec3 depthViewPos = viewPositionFromDepth(uv, sampledDepth);
          float signedDepth = depthViewPos.z - rayPos.z;
          float hitThickness =
            max(thickness, stepSize * 0.95) * (1.0 + roughness * 0.35);

          if (signedDepth >= -hitThickness && signedDepth <= hitThickness) {
            hit = refineHit(
              originVS,
              previousRayPos,
              rayPos,
              roughness,
              reflectedDirVS
            );
            break;
          }
        }

        return hit;
      }

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        if (intensity <= 0.0 || maxDistance <= 0.0) {
          gl_FragColor = baseColor;
          return;
        }

        float depth = texture2D(tDepth, vUv).x;
        if (depth >= 1.0) {
          gl_FragColor = baseColor;
          return;
        }
        float excludeMask = texture2D(tSSRExcludeMask, vUv).r;
        if (excludeMask > 0.5) {
          gl_FragColor = baseColor;
          return;
        }

        vec3 viewPos = viewPositionFromDepth(vUv, depth);
        vec3 normal = reconstructNormal(vUv, depth);
        vec3 reflectedDir = normalize(reflect(normalize(viewPos), normal));

        float roughness = estimateRoughness(normal, viewPos);
        vec4 hit = traceReflection(viewPos, reflectedDir, roughness);
        vec3 reflectionColor = hit.rgb;
        float rayDistance = hit.a;

        if (rayDistance <= 0.0) {
          vec2 fallbackUv = clamp(
            vUv + reflectedDir.xy * (0.045 + 0.035 * (1.0 - roughness)),
            vec2(0.0),
            vec2(1.0)
          );
          reflectionColor = sampleReflectionColor(fallbackUv, roughness);
          rayDistance = maxDistance * 0.45;
        }

        float fresnel = pow(1.0 - max(dot(normal, -normalize(viewPos)), 0.0), 4.0);
        float viewFacing = clamp(dot(normal, -normalize(viewPos)), 0.0, 1.0);
        float distanceFade = clamp(1.0 - rayDistance / maxDistance, 0.0, 1.0);
        float edgeFade =
          smoothstep(0.02, 0.16, vUv.x) *
          smoothstep(0.02, 0.16, vUv.y) *
          smoothstep(0.02, 0.16, 1.0 - vUv.x) *
          smoothstep(0.02, 0.16, 1.0 - vUv.y);
        float stabilityFade = smoothstep(0.03, 0.22, viewFacing);
        float reflectionStrength =
          intensity *
          (0.25 + 0.75 * (1.0 - roughness)) *
          (0.25 + 0.75 * fresnel) *
          distanceFade *
          edgeFade *
          stabilityFade;

        // Clamp to reduce bright sparkles on disoccluded pixels.
        reflectionColor = min(
          reflectionColor,
          baseColor.rgb * 2.5 + vec3(0.35)
        );

        gl_FragColor = vec4(
          baseColor.rgb + reflectionColor * reflectionStrength,
          baseColor.a
        );
      }
    `,
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::ScreenSpaceReflections',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          shaderPass: THREE_ADDONS.ShaderPass;
          _isEnabled: boolean;
          _effectEnabled: boolean;
          _intensity: number;
          _maxDistance: number;
          _thickness: number;
          _raySteps: number;
          _qualityMode: string;
          _excludeMaskRenderTarget: THREE.WebGLRenderTarget | null;
          _excludeMaskMaterial: THREE.MeshBasicMaterial;
          _excludeMaskFallbackTexture: THREE.DataTexture;
          _excludeMaskPreviousViewport: THREE.Vector4;
          _excludeMaskPreviousScissor: THREE.Vector4;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(
              screenSpaceReflectionsShader
            );
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'SSR');
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._intensity =
              effectData.doubleParameters.intensity !== undefined
                ? Math.max(0, effectData.doubleParameters.intensity)
                : 0.75;
            this._maxDistance =
              effectData.doubleParameters.maxDistance !== undefined
                ? Math.max(0, effectData.doubleParameters.maxDistance)
                : 420;
            this._thickness =
              effectData.doubleParameters.thickness !== undefined
                ? Math.max(0.0001, effectData.doubleParameters.thickness)
                : 4;
            this._qualityMode =
              effectData.stringParameters.qualityMode || 'medium';
            this.shaderPass.enabled = true;
            this._raySteps = 14;
            this._excludeMaskRenderTarget = null;
            this._excludeMaskMaterial = new THREE.MeshBasicMaterial({
              color: 0x000000,
              toneMapped: false,
            });
            const fallbackPixel = new Uint8Array([0, 0, 0, 255]);
            this._excludeMaskFallbackTexture = new THREE.DataTexture(
              fallbackPixel,
              1,
              1
            );
            this._excludeMaskFallbackTexture.needsUpdate = true;
            this._excludeMaskFallbackTexture.generateMipmaps = false;
            this._excludeMaskFallbackTexture.minFilter = THREE.NearestFilter;
            this._excludeMaskFallbackTexture.magFilter = THREE.NearestFilter;
            this.shaderPass.uniforms.tSSRExcludeMask.value =
              this._excludeMaskFallbackTexture;
            this._excludeMaskPreviousViewport = new THREE.Vector4();
            this._excludeMaskPreviousScissor = new THREE.Vector4();
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
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().addPostProcessingPass(this.shaderPass);
            gdjs.reorderScene3DPostProcessingPasses(target);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().removePostProcessingPass(this.shaderPass);
            gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'SSR');
            this.shaderPass.uniforms.tSSRExcludeMask.value =
              this._excludeMaskFallbackTexture;
            this._disposeSSRExcludeMaskResources();
            this._isEnabled = false;
            return true;
          }

          private _adaptQuality(target: gdjs.EffectsTarget): void {
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            const quality = gdjs.getScene3DPostProcessingQualityProfileForMode(
              this._qualityMode
            );
            this._raySteps = quality.ssrSteps;
          }

          private _isSSRExcludedMesh(object3D: THREE.Object3D): boolean {
            const mesh = object3D as THREE.Mesh;
            if (!mesh || !mesh.isMesh || !mesh.visible) {
              return false;
            }
            const userData = (mesh as any).userData;
            return !!(userData && userData[ssrExcludeUserDataKey]);
          }

          private _sceneHasSSRExcludedMeshes(scene: THREE.Scene): boolean {
            const stack: THREE.Object3D[] = [scene];
            while (stack.length > 0) {
              const object3D = stack.pop() as THREE.Object3D;
              if (this._isSSRExcludedMesh(object3D)) {
                return true;
              }
              const children = object3D.children;
              for (let i = 0; i < children.length; i++) {
                stack.push(children[i]);
              }
            }
            return false;
          }

          private _ensureSSRExcludeMaskTarget(
            width: number,
            height: number,
            outputColorSpace: THREE.ColorSpace
          ): THREE.WebGLRenderTarget {
            if (!this._excludeMaskRenderTarget) {
              this._excludeMaskRenderTarget = new THREE.WebGLRenderTarget(1, 1, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                depthBuffer: true,
                stencilBuffer: false,
              });
              this._excludeMaskRenderTarget.texture.generateMipmaps = false;
            }

            if (
              this._excludeMaskRenderTarget.width !== width ||
              this._excludeMaskRenderTarget.height !== height
            ) {
              this._excludeMaskRenderTarget.setSize(width, height);
            }

            this._excludeMaskRenderTarget.texture.colorSpace = outputColorSpace;
            return this._excludeMaskRenderTarget;
          }

          private _captureSSRExcludeMask(
            threeRenderer: THREE.WebGLRenderer,
            threeScene: THREE.Scene,
            threeCamera: THREE.Camera,
            width: number,
            height: number
          ): THREE.Texture {
            const renderTarget = this._ensureSSRExcludeMaskTarget(
              width,
              height,
              threeRenderer.outputColorSpace
            );
            const previousRenderTarget = threeRenderer.getRenderTarget();
            const previousAutoClear = threeRenderer.autoClear;
            const previousScissorTest = threeRenderer.getScissorTest();
            const previousXrEnabled = threeRenderer.xr.enabled;
            threeRenderer.getViewport(this._excludeMaskPreviousViewport);
            threeRenderer.getScissor(this._excludeMaskPreviousScissor);
            const previousOverrideMaterial = threeScene.overrideMaterial;

            const hiddenMeshes: Array<{ mesh: THREE.Mesh; visible: boolean }> = [];
            try {
              this._excludeMaskMaterial.color.setRGB(0, 0, 0);
              this._excludeMaskMaterial.depthTest = true;
              this._excludeMaskMaterial.depthWrite = true;
              this._excludeMaskMaterial.transparent = false;

              threeRenderer.xr.enabled = false;
              threeRenderer.autoClear = true;
              threeRenderer.setRenderTarget(renderTarget);
              threeRenderer.setViewport(0, 0, width, height);
              threeRenderer.setScissor(0, 0, width, height);
              threeRenderer.setScissorTest(false);
              threeScene.overrideMaterial = this._excludeMaskMaterial;
              threeRenderer.clear(true, true, true);
              threeRenderer.render(threeScene, threeCamera);

              let hasExcludedMeshes = false;
              threeScene.traverse((object3D) => {
                const mesh = object3D as THREE.Mesh;
                if (!mesh || !mesh.isMesh) {
                  return;
                }

                if (this._isSSRExcludedMesh(mesh)) {
                  hasExcludedMeshes = true;
                  return;
                }

                hiddenMeshes.push({
                  mesh,
                  visible: mesh.visible,
                });
                mesh.visible = false;
              });

              if (hasExcludedMeshes) {
                this._excludeMaskMaterial.color.setRGB(1, 1, 1);
                this._excludeMaskMaterial.depthTest = true;
                this._excludeMaskMaterial.depthWrite = false;
                this._excludeMaskMaterial.transparent = false;
                threeRenderer.autoClear = false;
                threeScene.overrideMaterial = this._excludeMaskMaterial;
                threeRenderer.render(threeScene, threeCamera);
              }
            } finally {
              for (let i = 0; i < hiddenMeshes.length; i++) {
                hiddenMeshes[i].mesh.visible = hiddenMeshes[i].visible;
              }
              threeScene.overrideMaterial = previousOverrideMaterial;
              threeRenderer.setRenderTarget(previousRenderTarget);
              threeRenderer.setViewport(this._excludeMaskPreviousViewport);
              threeRenderer.setScissor(this._excludeMaskPreviousScissor);
              threeRenderer.setScissorTest(previousScissorTest);
              threeRenderer.autoClear = previousAutoClear;
              threeRenderer.xr.enabled = previousXrEnabled;
            }

            return renderTarget.texture;
          }

          private _disposeSSRExcludeMaskResources(): void {
            if (this._excludeMaskRenderTarget) {
              this._excludeMaskRenderTarget.dispose();
              this._excludeMaskRenderTarget = null;
            }
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            if (!this._effectEnabled) {
              this.shaderPass.enabled = false;
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'SSR');
              this._disposeSSRExcludeMaskResources();
              return;
            }

            const runtimeScene = target.getRuntimeScene();
            const threeRenderer = runtimeScene
              .getGame()
              .getRenderer()
              .getThreeRenderer();
            const layerRenderer = target.getRenderer();
            const threeScene = layerRenderer.getThreeScene();
            const threeCamera = layerRenderer.getThreeCamera();

            if (!threeRenderer || !threeScene || !threeCamera) {
              return;
            }

            this._adaptQuality(target);
            if (!gdjs.isScene3DPostProcessingEnabled(target)) {
              this.shaderPass.enabled = false;
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'SSR');
              this._disposeSSRExcludeMaskResources();
              return;
            }
            gdjs.setScene3DPostProcessingEffectQualityMode(
              target,
              'SSR',
              this._qualityMode
            );

            const sharedCapture = gdjs.captureScene3DSharedTextures(
              target,
              threeRenderer,
              threeScene,
              threeCamera
            );
            if (!sharedCapture || !sharedCapture.depthTexture) {
              return;
            }

            let ssrExcludeMaskTexture: THREE.Texture =
              this._excludeMaskFallbackTexture;
            if (this._sceneHasSSRExcludedMeshes(threeScene)) {
              ssrExcludeMaskTexture = this._captureSSRExcludeMask(
                threeRenderer,
                threeScene,
                threeCamera,
                sharedCapture.width,
                sharedCapture.height
              );
            } else {
              this._disposeSSRExcludeMaskResources();
            }

            threeCamera.updateMatrixWorld();
            threeCamera.updateProjectionMatrix();
            threeCamera.projectionMatrixInverse
              .copy(threeCamera.projectionMatrix)
              .invert();
            this.shaderPass.enabled = true;
            this.shaderPass.uniforms.resolution.value.set(
              sharedCapture.width,
              sharedCapture.height
            );
            this.shaderPass.uniforms.tSceneColor.value =
              sharedCapture.colorTexture;
            this.shaderPass.uniforms.tDepth.value = sharedCapture.depthTexture;
            this.shaderPass.uniforms.tSSRExcludeMask.value = ssrExcludeMaskTexture;
            this.shaderPass.uniforms.cameraProjectionMatrix.value.copy(
              threeCamera.projectionMatrix
            );
            this.shaderPass.uniforms.cameraProjectionMatrixInverse.value.copy(
              threeCamera.projectionMatrixInverse
            );
            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.maxDistance.value = this._maxDistance;
            this.shaderPass.uniforms.thickness.value = this._thickness;
            this.shaderPass.uniforms.maxSteps.value = this._raySteps;
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._intensity = Math.max(0, value);
              this.shaderPass.uniforms.intensity.value = this._intensity;
            } else if (parameterName === 'maxDistance') {
              this._maxDistance = Math.max(0, value);
              this.shaderPass.uniforms.maxDistance.value = this._maxDistance;
            } else if (parameterName === 'thickness') {
              this._thickness = Math.max(0.0001, value);
              this.shaderPass.uniforms.thickness.value = this._thickness;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            }
            if (parameterName === 'maxDistance') {
              return this._maxDistance;
            }
            if (parameterName === 'thickness') {
              return this._thickness;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'qualityMode') {
              this._qualityMode = value || 'medium';
            }
          }
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
              this.shaderPass.enabled = value;
            }
          }
          getNetworkSyncData(): ScreenSpaceReflectionsNetworkSyncData {
            return {
              i: this._intensity,
              md: this._maxDistance,
              t: this._thickness,
              e: this._effectEnabled,
              q: this._qualityMode,
            };
          }
          updateFromNetworkSyncData(
            syncData: ScreenSpaceReflectionsNetworkSyncData
          ): void {
            this._intensity = Math.max(0, syncData.i);
            this._maxDistance = Math.max(0, syncData.md);
            this._thickness = Math.max(0.0001, syncData.t);
            this._effectEnabled = syncData.e;
            this._qualityMode = syncData.q || 'medium';

            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.maxDistance.value = this._maxDistance;
            this.shaderPass.uniforms.thickness.value = this._thickness;
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
