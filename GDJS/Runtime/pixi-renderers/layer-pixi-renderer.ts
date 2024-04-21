/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

namespace gdjs {
  const logger = new gdjs.Logger('LayerPixiRenderer');

  /**
   * The renderer for a gdjs.Layer using Pixi.js.
   */
  export class LayerPixiRenderer {
    private _pixiContainer: PIXI.Container;

    private _layer: gdjs.RuntimeLayer;

    /** For a lighting layer, the sprite used to display the render texture. */
    private _lightingSprite: PIXI.Sprite | null = null;
    private _isLightingLayer: boolean;
    private _clearColor: Array<integer>;

    /**
     * The render texture where the whole 2D layer is rendered.
     * The render texture is then used for lighting (if it's a light layer)
     * or to be rendered in a 3D scene (for a 2D+3D layer).
     */
    private _renderTexture: PIXI.RenderTexture | null = null;

    // Width and height are tracked when a render texture is used.
    private _oldWidth: float | null = null;
    private _oldHeight: float | null = null;

    // For a 3D (or 2D+3D) layer:
    private _threeGroup: THREE.Group | null = null;
    private _threeScene: THREE.Scene | null = null;
    private _threeCamera:
      | THREE.PerspectiveCamera
      | THREE.OrthographicCamera
      | null = null;
    private _threeCameraDirty: boolean = false;
    private _threeEffectComposer: THREE_ADDONS.EffectComposer | null = null;

    // For a 2D+3D layer, the 2D rendering is done on the render texture
    // and then must be displayed on a plane in the 3D world:
    private _threePlaneTexture: THREE.Texture | null = null;
    private _threePlaneGeometry: THREE.PlaneGeometry | null = null;
    private _threePlaneMaterial: THREE.ShaderMaterial | null = null;
    private _threePlaneMesh: THREE.Mesh | null = null;

    /**
     * Pixi doesn't sort children with zIndex == 0.
     */
    private static readonly zeroZOrderForPixi = Math.pow(2, -24);

    private static vectorForProjections: THREE.Vector3 | null = null;

    /**
     * @param layer The layer
     * @param runtimeInstanceContainerRenderer The scene renderer
     */
    constructor(
      layer: gdjs.RuntimeLayer,
      runtimeInstanceContainerRenderer: gdjs.RuntimeInstanceContainerRenderer,
      runtimeGameRenderer: gdjs.RuntimeGameRenderer
    ) {
      this._pixiContainer = new PIXI.Container();
      this._pixiContainer.sortableChildren = true;
      this._layer = layer;
      this._isLightingLayer = layer.isLightingLayer();
      const parentRendererObject = runtimeInstanceContainerRenderer.getRendererObject();
      if (parentRendererObject) {
        parentRendererObject.addChild(this._pixiContainer);
      }
      this._pixiContainer.filters = [];

      // Setup rendering for lighting or 3D rendering:
      const pixiRenderer = runtimeGameRenderer.getPIXIRenderer();
      if (this._isLightingLayer) {
        this._clearColor = layer.getClearColor();
        this._setupLightingRendering(
          pixiRenderer,
          runtimeInstanceContainerRenderer
        );
      } else {
        // Clear color is used as background color of transparent sprites.
        this._clearColor = [
          ...gdjs.hexNumberToRGBArray(
            this._layer.getRuntimeScene().getBackgroundColor()
          ),
          0,
        ];
        this._setup3DRendering(pixiRenderer, runtimeInstanceContainerRenderer);
      }
    }

    onCreated() {
      // The layer is now fully initialized. Adapt the 3D camera position
      // (which we could not do before in `_setup3DRendering`).
      this._update3DCameraAspectAndPosition();
    }

    onGameResolutionResized() {
      // Ensure the 3D camera aspect is updated:
      this._update3DCameraAspectAndPosition();
    }

    private _update3DCameraAspectAndPosition() {
      if (!this._threeCamera) {
        return;
      }
      if (this._threeCamera instanceof THREE.OrthographicCamera) {
        const width = this._layer.getWidth();
        const height = this._layer.getHeight();
        this._threeCamera.left = -width / 2;
        this._threeCamera.right = width / 2;
        this._threeCamera.top = height / 2;
        this._threeCamera.bottom = -height / 2;
      } else {
        this._threeCamera.aspect =
          this._layer.getWidth() / this._layer.getHeight();
      }
      this._threeCamera.updateProjectionMatrix();

      this.updatePosition();
    }

    getRendererObject(): PIXI.Container {
      return this._pixiContainer;
    }

    getThreeScene(): THREE.Scene | null {
      return this._threeScene;
    }

    getThreeCamera():
      | THREE.PerspectiveCamera
      | THREE.OrthographicCamera
      | null {
      return this._threeCamera;
    }

    getThreeEffectComposer(): THREE_ADDONS.EffectComposer | null {
      return this._threeEffectComposer;
    }

    addPostProcessingPass(pass: THREE_ADDONS.Pass) {
      if (!this._threeEffectComposer) {
        return;
      }
      const game = this._layer.getRuntimeScene().getGame();
      // TODO Keep the effects in the same order they are defined
      // because the order matter for the final result.
      // There is the same issue with 2D effects too.

      // The composer contains:
      // - RenderPass
      // - inserted passes for effects
      // - SMAAPass (optionally)
      // - OutputPass
      const index =
        this._threeEffectComposer.passes.length -
        (game.getAntialiasingMode() === 'none' ? 1 : 2);
      this._threeEffectComposer.insertPass(pass, index);
    }

    removePostProcessingPass(pass: THREE_ADDONS.Pass) {
      if (!this._threeEffectComposer) {
        return;
      }
      this._threeEffectComposer.removePass(pass);
    }

    hasPostProcessingPass() {
      if (!this._threeEffectComposer) {
        return false;
      }
      const game = this._layer.getRuntimeScene().getGame();
      // RenderPass, OutputPass and optionally SMAAPass are default passes.
      const emptyCount = game.getAntialiasingMode() === 'none' ? 2 : 3;
      return this._threeEffectComposer.passes.length > emptyCount;
    }

    /**
     * The sprite, displaying the "render texture" of the layer, to display
     * for a lighting layer.
     */
    getLightingSprite(): PIXI.Sprite | null {
      return this._lightingSprite;
    }

    /**
     * Create, or re-create, Three.js objects for 3D rendering of this layer.
     */
    private _setup3DRendering(
      pixiRenderer: PIXI.Renderer | null,
      runtimeInstanceContainerRenderer: gdjs.RuntimeInstanceContainerRenderer
    ): void {
      if (typeof THREE === 'undefined') {
        return;
      }
      // TODO (3D): ideally we would avoid the need for this check at all,
      // maybe by having separate rendering classes for custom object layers and scene layers.
      if (this._layer instanceof gdjs.Layer) {
        if (
          this._layer.getRenderingType() ===
            gdjs.RuntimeLayerRenderingType.THREE_D ||
          this._layer.getRenderingType() ===
            gdjs.RuntimeLayerRenderingType.TWO_D_PLUS_THREE_D
        ) {
          if (this._threeScene || this._threeGroup || this._threeCamera) {
            throw new Error(
              'Tried to setup 3D rendering for a layer that is already set up.'
            );
          }

          this._threeScene = new THREE.Scene();

          // Use a mirroring on the Y axis to follow the same axis as in the 2D, PixiJS, rendering.
          // We use a mirroring rather than a camera rotation so that the Z order is not changed.
          this._threeScene.scale.y = -1;

          this._threeGroup = new THREE.Group();
          this._threeScene.add(this._threeGroup);

          if (
            this._layer.getCameraType() ===
            gdjs.RuntimeLayerCameraType.ORTHOGRAPHIC
          ) {
            const width = this._layer.getWidth();
            const height = this._layer.getHeight();
            this._threeCamera = new THREE.OrthographicCamera(
              -width / 2,
              width / 2,
              height / 2,
              -height / 2,
              this._layer.getInitialCamera3DNearPlaneDistance(),
              this._layer.getInitialCamera3DFarPlaneDistance()
            );
          } else {
            this._threeCamera = new THREE.PerspectiveCamera(
              this._layer.getInitialCamera3DFieldOfView(),
              1,
              this._layer.getInitialCamera3DNearPlaneDistance(),
              this._layer.getInitialCamera3DFarPlaneDistance()
            );
          }
          this._threeCamera.rotation.order = 'ZYX';

          const game = this._layer.getRuntimeScene().getGame();
          const threeRenderer = game.getRenderer().getThreeRenderer();
          if (threeRenderer) {
            // When adding more default passes, make sure to update
            // `addPostProcessingPass` and `hasPostProcessingPass` formulas.
            this._threeEffectComposer = new THREE_ADDONS.EffectComposer(
              threeRenderer
            );
            this._threeEffectComposer.addPass(
              new THREE_ADDONS.RenderPass(this._threeScene, this._threeCamera)
            );
            if (game.getAntialiasingMode() !== 'none') {
              this._threeEffectComposer.addPass(
                new THREE_ADDONS.SMAAPass(
                  game.getGameResolutionWidth(),
                  game.getGameResolutionHeight()
                )
              );
            }
            this._threeEffectComposer.addPass(new THREE_ADDONS.OutputPass());
          }

          if (
            this._layer.getRenderingType() ===
            gdjs.RuntimeLayerRenderingType.TWO_D_PLUS_THREE_D
          ) {
            if (
              this._renderTexture ||
              this._threePlaneGeometry ||
              this._threePlaneMaterial ||
              this._threePlaneTexture ||
              this._threePlaneMesh
            )
              throw new Error(
                'Tried to setup PixiJS plane for 2D rendering in 3D for a layer that is already set up.'
              );

            // If we have both 2D and 3D objects to be rendered, create a render texture that PixiJS will use
            // to render, and that will be projected on a plane by Three.js
            this._createPixiRenderTexture(pixiRenderer);

            // Create the plane that will show this texture.
            this._threePlaneGeometry = new THREE.PlaneGeometry(1, 1);

            // Create the texture to project on the plane.
            // Use a buffer to create a "fake" DataTexture, just so the texture
            // is considered initialized by Three.js.
            const width = 1;
            const height = 1;
            const size = width * height;
            const data = new Uint8Array(4 * size);
            const texture = new THREE.DataTexture(data, width, height);
            texture.needsUpdate = true;

            this._threePlaneTexture = texture;
            this._threePlaneTexture.generateMipmaps = false;
            const filter =
              this._layer.getRuntimeScene().getGame().getScaleMode() ===
              'nearest'
                ? THREE.NearestFilter
                : THREE.LinearFilter;
            this._threePlaneTexture.minFilter = filter;
            this._threePlaneTexture.magFilter = filter;
            this._threePlaneTexture.wrapS = THREE.ClampToEdgeWrapping;
            this._threePlaneTexture.wrapT = THREE.ClampToEdgeWrapping;
            // This disable the gamma correction done by THREE as PIXI is already doing it.
            const noGammaCorrectionShader: THREE.ShaderMaterialParameters = {
              vertexShader: `
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform sampler2D map;
                varying vec2 vUv;
                void main() {
                  vec4 texel = texture2D(map, vUv);
                  gl_FragColor = texel;
                }
              `,
              uniforms: {
                map: { value: this._threePlaneTexture },
              },
              side: THREE.FrontSide,
              transparent: true,
            };
            this._threePlaneMaterial = new THREE.ShaderMaterial(
              noGammaCorrectionShader
            );
            this._threePlaneMaterial;

            // Finally, create the mesh shown in the scene.
            this._threePlaneMesh = new THREE.Mesh(
              this._threePlaneGeometry,
              this._threePlaneMaterial
            );

            // Force to render the mesh last (after the rest of 3D objects, including
            // transparent ones). In most cases, the 2D rendering is composed of a lot
            // of transparent areas, and we can't risk it being displayed first and wrongly
            // occluding 3D objects shown behind.
            this._threePlaneMesh.renderOrder = Number.MAX_SAFE_INTEGER;
            this._threeScene.add(this._threePlaneMesh);
          }

          // Note: we can not update the position of the camera at this point,
          // because the layer might not be fully constructed.
          // See `onCreated`.
        }
      } else {
        // This is a layer of a custom object.

        const parentThreeObject = runtimeInstanceContainerRenderer.get3DRendererObject();
        if (!parentThreeObject) {
          // No parent 3D renderer object, 3D is disabled.
          return;
        }

        if (!this._threeGroup) {
          // TODO (3D) - optimization: do not create a THREE.Group if no 3D object are contained inside.
          this._threeGroup = new THREE.Group();
          parentThreeObject.add(this._threeGroup);
        }
      }
    }

    setThreeCameraDirty(enable: boolean) {
      this._threeCameraDirty = enable;
    }

    show2DRenderingPlane(enable: boolean) {
      if (!this._threePlaneMesh) return;
      if (this._threePlaneMesh.visible === enable) return;
      this._threePlaneMesh.visible = enable;
    }

    /**
     * Update the position of the PIXI container. To be called after each change
     * made to position, zoom or rotation of the camera.
     */
    updatePosition(): void {
      const angle = -gdjs.toRad(this._layer.getCameraRotation());
      const zoomFactor = this._layer.getCameraZoom();
      this._pixiContainer.rotation = angle;
      this._pixiContainer.scale.x = zoomFactor;
      this._pixiContainer.scale.y = zoomFactor;
      const cosValue = Math.cos(angle);
      const sinValue = Math.sin(angle);
      const centerX =
        this._layer.getCameraX() * zoomFactor * cosValue -
        this._layer.getCameraY() * zoomFactor * sinValue;
      const centerY =
        this._layer.getCameraX() * zoomFactor * sinValue +
        this._layer.getCameraY() * zoomFactor * cosValue;
      this._pixiContainer.position.x = this._layer.getWidth() / 2 - centerX;
      this._pixiContainer.position.y = this._layer.getHeight() / 2 - centerY;

      if (
        this._layer.getRuntimeScene().getGame().getPixelsRounding() &&
        (cosValue === 0 || sinValue === 0) &&
        Number.isInteger(zoomFactor)
      ) {
        // Camera rounding is important for pixel perfect games.
        // Otherwise, the camera position fractional part is added to
        // the sprite one and it changes in which direction sprites are rounded.
        // It makes sprites rounding inconsistent with each other
        // and they seem to move on pixel left and right.
        //
        // PIXI uses a floor function on sprites position on the screen,
        // so a floor must be applied on the camera position too.
        // According to the above calculus,
        // _pixiContainer.position is the opposite of the camera,
        // this is why the ceil function is used floor(x) = -ceil(-x).
        //
        // When the camera directly follows an object,
        // given this object dimension is even,
        // the decimal part of onScenePosition and cameraPosition are the same.
        //
        // Doing the calculus without rounding:
        // onScreenPosition = onScenePosition - cameraPosition
        // onScreenPosition = 980.75 - 200.75
        // onScreenPosition = 780
        //
        // Doing the calculus with rounding:
        // onScreenPosition = floor(onScenePosition + ceil(-cameraPosition))
        // onScreenPosition = floor(980.75 + ceil(-200.75))
        // onScreenPosition = floor(980.75 - 200)
        // onScreenPosition = floor(780.75)
        // onScreenPosition = 780

        if (
          this._layer
            .getRuntimeScene()
            .getGame()
            .getRenderer()
            .getPIXIRenderer() instanceof PIXI.Renderer
        ) {
          // TODO Revert from `round` to `ceil` when the issue is fixed in Pixi.
          // Since the upgrade to Pixi 7, sprites are rounded with `round`
          // instead of `floor`.
          // https://github.com/pixijs/pixijs/issues/9868
          this._pixiContainer.position.x = Math.round(
            this._pixiContainer.position.x
          );
          this._pixiContainer.position.y = Math.round(
            this._pixiContainer.position.y
          );
        } else {
          this._pixiContainer.position.x = Math.ceil(
            this._pixiContainer.position.x
          );
          this._pixiContainer.position.y = Math.ceil(
            this._pixiContainer.position.y
          );
        }
      }

      if (this._threeCamera) {
        // TODO (3D) - improvement: handle camera rounding like down for PixiJS?
        this._threeCamera.position.x = this._layer.getCameraX();
        this._threeCamera.position.y = -this._layer.getCameraY(); // Inverted because the scene is mirrored on Y axis.
        this._threeCamera.rotation.z = angle;

        if (this._threeCamera instanceof THREE.OrthographicCamera) {
          this._threeCamera.zoom = this._layer.getCameraZoom();
          this._threeCamera.updateProjectionMatrix();
          this._threeCamera.position.z = this._layer.getCameraZ(null);
        } else {
          this._threeCamera.position.z = this._layer.getCameraZ(
            this._threeCamera.fov
          );
        }

        if (this._threePlaneMesh) {
          // Adapt the plane size so that it covers the whole screen.
          this._threePlaneMesh.scale.x = this._layer.getWidth() / zoomFactor;
          this._threePlaneMesh.scale.y = this._layer.getHeight() / zoomFactor;

          // Adapt the plane position so that it's always displayed on the whole screen.
          this._threePlaneMesh.position.x = this._threeCamera.position.x;
          this._threePlaneMesh.position.y = -this._threeCamera.position.y; // Inverted because the scene is mirrored on Y axis.
          this._threePlaneMesh.rotation.z = -angle;
        }
      }
    }

    updateResolution() {
      if (this._threeEffectComposer) {
        const game = this._layer.getRuntimeScene().getGame();
        this._threeEffectComposer.setSize(
          game.getGameResolutionWidth(),
          game.getGameResolutionHeight()
        );
      }
    }

    isCameraRotatedIn3D() {
      return (
        this._threeCamera &&
        (this._threeCamera.rotation.x !== 0 ||
          this._threeCamera.rotation.y !== 0)
      );
    }

    transformTo3DWorld(
      screenX: float,
      screenY: float,
      worldZ: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      const camera = this._threeCamera;
      if (!camera) {
        result[0] = 0;
        result[1] = 0;
        return result;
      }
      const width = this._layer.getWidth();
      const height = this._layer.getHeight();
      const normalizedX = (screenX / width) * 2 - 1;
      const normalizedY = -(screenY / height) * 2 + 1;

      let vector = LayerPixiRenderer.vectorForProjections;
      if (!vector) {
        vector = new THREE.Vector3();
        LayerPixiRenderer.vectorForProjections = vector;
      }

      camera.updateMatrixWorld();

      if (camera instanceof THREE.OrthographicCamera) {
        // https://discourse.threejs.org/t/how-to-unproject-mouse2d-with-orthographic-camera/4777
        vector.set(normalizedX, normalizedY, 0);
        vector.unproject(camera);
        // The unprojected point is on the camera.
        // Find x and y for a given z along the camera direction line.
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const distance = (worldZ - vector.z) / direction.z;
        vector.x += distance * direction.x;
        vector.y += distance * direction.y;
      } else {
        // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
        vector.set(normalizedX, normalizedY, 0.5);
        vector.unproject(camera);
        // The unprojected point is on the frustum plane.
        // Find x and y for a given z along the line between the camera and
        // the one on the frustum.
        vector.sub(camera.position).normalize();
        const distance = (worldZ - camera.position.z) / vector.z;
        vector.x = distance * vector.x + camera.position.x;
        vector.y = distance * vector.y + camera.position.y;
      }

      // The plane z == worldZ may not be visible on the camera.
      if (!Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
        result[0] = 0;
        result[1] = 0;
        return result;
      }

      result[0] = vector.x;
      result[1] = -vector.y;
      return result;
    }

    updateVisibility(visible: boolean): void {
      this._pixiContainer.visible = !!visible;
      if (this._threeGroup) this._threeGroup.visible = !!visible;
    }

    updatePreRender(): void {
      if (this._threeCameraDirty) {
        const camera = this.getThreeCamera();
        if (camera) {
          camera.updateProjectionMatrix();
        }
        this._threeCameraDirty = false;
      }
    }

    /**
     * Add a child to the pixi container associated to the layer.
     * All objects which are on this layer must be children of this container.
     *
     * @param pixiChild The child (PIXI object) to be added.
     * @param zOrder The z order of the associated object.
     */
    addRendererObject(pixiChild, zOrder: float): void {
      const child = pixiChild as PIXI.DisplayObject;
      child.zIndex = zOrder || LayerPixiRenderer.zeroZOrderForPixi;
      this._pixiContainer.addChild(child);
    }

    /**
     * Change the z order of a child associated to an object.
     *
     * @param pixiChild The child (PIXI object) to be modified.
     * @param newZOrder The z order of the associated object.
     */
    changeRendererObjectZOrder(pixiChild, newZOrder: float): void {
      const child = pixiChild as PIXI.DisplayObject;
      child.zIndex = newZOrder;
    }

    /**
     * Remove a child from the internal pixi container.
     * Should be called when an object is deleted or removed from the layer.
     *
     * @param child The child (PIXI object) to be removed.
     */
    removeRendererObject(child): void {
      this._pixiContainer.removeChild(child);
    }

    has3DObjects(): boolean {
      return !!this._threeGroup && this._threeGroup.children.length > 0;
    }

    has2DObjects(): boolean {
      return this._pixiContainer.children.length > 0;
    }

    add3DRendererObject(object: THREE.Object3D): void {
      if (!this._threeGroup) return;

      this._threeGroup.add(object);
    }

    remove3DRendererObject(object: THREE.Object3D): void {
      if (!this._threeGroup) return;

      this._threeGroup.remove(object);
    }

    updateClearColor(): void {
      this._clearColor = this._layer.getClearColor();
      // this._createPixiRenderTexture(); // TODO: Check this was useless
    }

    /**
     * Create the PixiJS RenderTexture used to display the whole layer.
     * Can be used either for lighting or for rendering the layer in a texture
     * so it can then be consumed by Three.js to render it in 3D.
     */
    private _createPixiRenderTexture(pixiRenderer: PIXI.Renderer | null): void {
      if (!pixiRenderer || pixiRenderer.type !== PIXI.RENDERER_TYPE.WEBGL) {
        return;
      }
      if (this._renderTexture) {
        logger.error(
          'Tried to create a PixiJS RenderTexture for a layer that already has one.'
        );
        return;
      }

      this._oldWidth = pixiRenderer.screen.width;
      this._oldHeight = pixiRenderer.screen.height;
      const width = this._oldWidth;
      const height = this._oldHeight;
      const resolution = pixiRenderer.resolution;
      this._renderTexture = PIXI.RenderTexture.create({
        // A size of 0 is forbidden by Pixi.
        width: width || 100,
        height: height || 100,
        resolution,
      });
      this._renderTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
      logger.info(`RenderTexture created for layer ${this._layer.getName()}.`);
    }

    /**
     * Render the layer of the PixiJS RenderTexture, so that it can be then displayed
     * with a blend mode (for a lighting layer) or consumed by Three.js (for 2D+3D layers).
     */
    renderOnPixiRenderTexture(pixiRenderer: PIXI.Renderer) {
      if (!this._renderTexture) {
        return;
      }
      if (
        this._oldWidth !== pixiRenderer.screen.width ||
        this._oldHeight !== pixiRenderer.screen.height
      ) {
        // A size of 0 is forbidden by Pixi.
        this._renderTexture.resize(
          pixiRenderer.screen.width || 100,
          pixiRenderer.screen.height || 100
        );
        this._oldWidth = pixiRenderer.screen.width;
        this._oldHeight = pixiRenderer.screen.height;
      }
      const oldRenderTexture = pixiRenderer.renderTexture.current || undefined;
      const oldSourceFrame = pixiRenderer.renderTexture.sourceFrame;
      pixiRenderer.renderTexture.bind(this._renderTexture);

      // The background is the ambient color for lighting layers
      // and transparent for 2D+3D layers.
      this._clearColor[3] = this._isLightingLayer ? 1 : 0;
      pixiRenderer.renderTexture.clear(this._clearColor);

      pixiRenderer.render(this._pixiContainer, {
        renderTexture: this._renderTexture,
        clear: false,
      });
      pixiRenderer.renderTexture.bind(
        oldRenderTexture,
        oldSourceFrame,
        undefined
      );
    }

    /**
     * Set the texture of the 2D plane in the 3D world to be the same WebGL texture
     * as the PixiJS RenderTexture - so that the 2D rendering can be shown in the 3D world.
     */
    updateThreePlaneTextureFromPixiRenderTexture(
      threeRenderer: THREE.WebGLRenderer,
      pixiRenderer: PIXI.Renderer
    ): void {
      if (!this._threePlaneTexture || !this._renderTexture) {
        return;
      }

      const glTexture = this._renderTexture.baseTexture._glTextures[
        pixiRenderer.CONTEXT_UID
      ];
      if (glTexture) {
        // "Hack" into the Three.js renderer by getting the internal WebGL texture for the PixiJS plane,
        // and set it so that it's the same as the WebGL texture for the PixiJS RenderTexture.
        // This works because PixiJS and Three.js are using the same WebGL context.
        const texture = threeRenderer.properties.get(this._threePlaneTexture);
        texture.__webglTexture = glTexture.texture;
      }
    }

    /**
     * Enable the use of a PIXI.RenderTexture to render the PIXI.Container
     * of the layer and, in the scene PIXI container, replace the container
     * of the layer by a sprite showing this texture.
     * used only in lighting for now as the sprite could have MULTIPLY blend mode.
     */
    private _setupLightingRendering(
      pixiRenderer: PIXI.Renderer | null,
      runtimeInstanceContainerRenderer: gdjs.RuntimeInstanceContainerRenderer
    ): void {
      this._createPixiRenderTexture(pixiRenderer);
      if (!this._renderTexture) {
        return;
      }

      this._lightingSprite = new PIXI.Sprite(this._renderTexture);
      this._lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      const parentPixiContainer = runtimeInstanceContainerRenderer.getRendererObject();
      if (parentPixiContainer) {
        const index = parentPixiContainer.getChildIndex(this._pixiContainer);
        parentPixiContainer.addChildAt(this._lightingSprite, index);
        parentPixiContainer.removeChild(this._pixiContainer);
      }
    }
  }

  //Register the class to let the engine use it.
  export type LayerRenderer = gdjs.LayerPixiRenderer;
  export const LayerRenderer = gdjs.LayerPixiRenderer;
}
