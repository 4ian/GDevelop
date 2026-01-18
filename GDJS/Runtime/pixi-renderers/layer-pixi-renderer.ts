/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

namespace gdjs {
  const logger = new gdjs.Logger('LayerPixiRenderer');

  const FRUSTUM_EDGES: Array<[number, number]> = [
    // near plane edges
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    // far plane edges
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    // near↔far connections
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  /** Normalized Device Coordinates corners for near (-1) and far (+1) planes (Three.js NDC: z=-1 near, z=+1 far). */
  const NDC_CORNERS: Array<Array<float>> = [
    // near
    [-1, -1, -1],
    [+1, -1, -1],
    [+1, +1, -1],
    [-1, +1, -1],
    // far
    [-1, -1, +1],
    [+1, -1, +1],
    [+1, +1, +1],
    [-1, +1, +1],
  ];

  /** Sort convex polygon vertices around centroid to get consistent winding. */
  const sortConvexPolygon = (points: THREE.Vector3[]): THREE.Vector3[] => {
    if (points.length <= 2) return points;
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
    return points
      .map((p) => ({ p, a: Math.atan2(p.y - cy, p.x - cx) }))
      .sort((u, v) => u.a - v.a)
      .map((u) => u.p);
  };

  /**
   * Intersect a frustum edge segment [a,b] with plane Z=0.
   * Returns point or null if no intersection on the segment.
   */
  const intersectSegmentWithZ0 = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    eps = 1e-9
  ): THREE.Vector3 | null => {
    const az = a.z,
      bz = b.z;
    const dz = bz - az;

    // If both z on same side and not on plane, no crossing.
    if (Math.abs(dz) < eps) {
      // Segment is (almost) parallel to plane.
      if (Math.abs(az) < eps && Math.abs(bz) < eps) {
        // Entire segment lies on plane: return endpoints (handled by caller via dedup).
        // Here we return null and let caller add endpoints if needed.
        return null;
      }
      return null;
    }

    // Solve a.z + t*(b.z - a.z) = 0  ⇒  t = -a.z / (b.z - a.z)
    const t = -az / dz;
    if (t < -eps || t > 1 + eps) {
      // Intersection beyond the segment bounds.
      return null;
    }

    const p = new THREE.Vector3(
      a.x + t * (b.x - a.x),
      a.y + t * (b.y - a.y),
      0
    );
    return p;
  };

  /** Remove near-duplicate points. */
  const dedupPoints = (
    points: THREE.Vector3[],
    eps = 1e-6
  ): THREE.Vector3[] => {
    const out: THREE.Vector3[] = [];
    for (const p of points) {
      const exists = out.some(
        (q) => Math.abs(p.x - q.x) < eps && Math.abs(p.y - q.y) < eps
      );
      if (!exists) out.push(p);
    }
    return out;
  };

  /**
   * Compute the convex polygon of the camera frustum clipped by plane Z=0.
   * Returns ordered vertices (world coords, z=0). Empty array if no intersection.
   */
  const clipFrustumAgainstZ0 = (camera: THREE.Camera): THREE.Vector3[] => {
    camera.updateMatrixWorld(true);

    // Get the 8 corners of the camera frustum in world coordinates.
    const corners = NDC_CORNERS.map((ndc) =>
      new THREE.Vector3(ndc[0], ndc[1], ndc[2]).unproject(camera)
    );
    if (corners.length !== 8) return [];

    const hits: THREE.Vector3[] = [];

    // 1) Add vertices that already lie on the plane (z≈0).
    for (const v of corners) {
      if (Math.abs(v.z) < 1e-9) {
        hits.push(new THREE.Vector3(v.x, v.y, 0));
      }
    }

    // 2) Intersect each frustum edge with plane Z=0.
    for (const [i, j] of FRUSTUM_EDGES) {
      const a = corners[i],
        b = corners[j];
      const p = intersectSegmentWithZ0(a, b);
      if (p) hits.push(p);
    }

    // Deduplicate and order.
    const unique = dedupPoints(hits);
    if (unique.length < 3) return [];
    return sortConvexPolygon(unique);
  };

  /**
   * Intersect the ray going through a normalized device coordinate (nx, ny)
   * with the plane Z=0. Returns the hit point in THREE world coords (z=0)
   * or null if the ray doesn't intersect the plane in front of the camera.
   */
  const projectNDCToZ0 = (
    camera: THREE.Camera,
    nx: number,
    ny: number
  ): THREE.Vector3 | null => {
    if (!camera) return null;

    camera.updateMatrixWorld(true);

    const origin = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const p = new THREE.Vector3(nx, ny, 0.5);

    if (camera instanceof THREE.OrthographicCamera) {
      // For ortho, unproject a point on the camera plane, and use forward dir.
      p.z = 0; // on the camera plane
      p.unproject(camera); // gives a point on the camera plane in world coords
      origin.copy(p);
      camera.getWorldDirection(dir);
    } else {
      // Perspective: unproject a point on the frustum plane, build a ray.
      p.unproject(camera);
      origin.copy(camera.position);
      dir.copy(p).sub(origin).normalize();
    }

    const dz = dir.z;
    if (Math.abs(dz) < 1e-8) return null; // parallel
    const t = -origin.z / dz;
    if (t <= 0) return null; // behind the camera => not visible

    return origin.addScaledVector(dir, t).setZ(0);
  };

  const assumedFovIn2D = 45;

  /**
   * The renderer for a gdjs.Layer using Pixi.js.
   * @category Renderers > Layers
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
    private _threePlaneMeshDebugOutline: THREE.LineSegments | null = null;

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
      const parentRendererObject =
        runtimeInstanceContainerRenderer.getRendererObject();
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

      // Uncomment to show the outline of the 2D rendering plane.
      // this.show2DRenderingPlaneDebugOutline(true);
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

    getThreeGroup(): THREE.Group | null {
      return this._threeGroup;
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

            this.set2DPlaneMaxDrawingDistance(
              this._layer.getInitialCamera2DPlaneMaxDrawingDistance()
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

        const parentThreeObject =
          runtimeInstanceContainerRenderer.get3DRendererObject();
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

    setCamera3DNearPlaneDistance(distance: number) {
      if (!this._threeCamera) return;

      this._threeCamera.near = Math.min(
        // 0 is not a valid value for three js perspective camera:
        // https://threejs.org/docs/#api/en/cameras/PerspectiveCamera.
        Math.max(distance, 0.0001),
        // Near value cannot exceed far value.
        this._threeCamera.far
      );
      this._threeCameraDirty = true;
    }

    getCamera3DNearPlaneDistance(): float {
      if (!this._threeCamera) return 0;
      return this._threeCamera.near;
    }

    setCamera3DFarPlaneDistance(distance: number) {
      if (!this._threeCamera) return;
      this._threeCamera.far = Math.max(distance, this._threeCamera.near);
      this._threeCameraDirty = true;
    }

    getCamera3DFarPlaneDistance(): float {
      if (!this._threeCamera) return 0;
      return this._threeCamera.far;
    }

    setCamera3DFieldOfView(angle: number) {
      if (!this._threeCamera) return;
      if (this._threeCamera instanceof THREE.OrthographicCamera) return;

      this._threeCamera.fov = Math.min(Math.max(angle, 0), 180);
      this._threeCameraDirty = true;
    }

    getCamera3DFieldOfView(): float {
      if (!this._threeCamera) return 0;
      return this._threeCamera
        ? this._threeCamera instanceof THREE.OrthographicCamera
          ? 0
          : this._threeCamera.fov
        : assumedFovIn2D;
    }

    show2DRenderingPlane(enable: boolean) {
      if (!this._threePlaneMesh) return;
      if (this._threePlaneMesh.visible === enable) return;
      this._threePlaneMesh.visible = enable;
    }

    /**
     * Enable or disable the drawing of an outline of the 2D rendering plane.
     * Useful to visually see where the 2D rendering is done in the 3D world.
     */
    show2DRenderingPlaneDebugOutline(enable: boolean) {
      if (!this._threePlaneMesh) return;
      if (enable && !this._threePlaneMeshDebugOutline) {
        // Add rectangle outline around the plane.
        const edges = new THREE.EdgesGeometry(this._threePlaneGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xff0000,
        });
        this._threePlaneMeshDebugOutline = new THREE.LineSegments(
          edges,
          lineMaterial
        );

        // Attach the outline to the plane so it follows position/scale/rotation.
        this._threePlaneMesh.add(this._threePlaneMeshDebugOutline);
      }
      if (!enable && this._threePlaneMeshDebugOutline) {
        this._threePlaneMesh.remove(this._threePlaneMeshDebugOutline);
        this._threePlaneMeshDebugOutline = null;
      }
    }

    /** Maximum size of the 2D plane, in pixels. */
    private _2DPlaneMaxDrawingDistance: float = 5000;
    /** Tilt degrees below which the 2D plane is not clamped. */
    private _2DPlaneClampFreeTiltDeg: float = 0.1;
    /** Tilt degrees below which the 2D plane is fully clamped. */
    private _2DPlaneClampHardTiltDeg: float = 6;
    private _2DPlaneClampRampPower: float = 1.5; // 1 = linear, >1 = smoother

    /**
     * Set the maximum "drawing distance", in pixels, of the 2D when in the 3D world.
     * This corresponds to the "height" of the 2D plane.
     * Used when the 3D camera is tilted on the X or Y axis (instead of looking down the Z axis,
     * as it's done by default for 2D games).
     * This is useful to avoid the 2D plane being too big when the camera is tilted.
     */
    set2DPlaneMaxDrawingDistance(h: float) {
      this._2DPlaneMaxDrawingDistance = Math.max(0, h);
    }

    get2DPlaneMaxDrawingDistance(): float {
      return this._2DPlaneMaxDrawingDistance;
    }

    /**
     * Set the tilt degrees below which the 2D plane is not clamped.
     */
    set2DPlaneClampFreeTiltDegrees(d: number) {
      this._2DPlaneClampFreeTiltDeg = Math.max(0, d);
    }

    /**
     * Set the tilt degrees below which the 2D plane is clamped (see `set2DPlaneMaxDrawingDistance`).
     */
    set2DPlaneClampHardTiltDegrees(d: number) {
      this._2DPlaneClampHardTiltDeg = Math.max(0, d);
    }

    /**
     * Set the ramp power of the 2D plane clamping (see `set2DPlaneMaxDrawingDistance`). Used
     * for smoother transition between clamped and unclamped.
     */
    set2DPlaneClampRampPower(p: number) {
      this._2DPlaneClampRampPower = Math.max(0.1, p);
    }

    /**
     * Get the size of the 2D plane, in the world coordinates.
     */
    private _get2DPlaneSize(): [number, number] {
      if (!this._threeCamera) return [0, 0];

      // Compute the intersection of the frustrum of the camera on the Z=0 plane.
      // In theory, that's where the entire 2D rendering should be displayed.
      const poly = clipFrustumAgainstZ0(this._threeCamera);

      if (poly.length === 0) {
        // No intersection at all: Z=0 not in view.
        return [0, 0];
      }

      // Compute the axis-aligned bounds on Z=0 (world units) of the polygon,
      // so we can compute the size of the plane doing the 2D rendering.
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const p of poly) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      let boxW = Math.max(1e-8, maxX - minX);
      let boxH = Math.max(1e-8, maxY - minY);

      // Keep 2D layer aspect ratio (so texture isn't stretched).
      const targetAspect = this._layer.getWidth() / this._layer.getHeight();
      const boxAspect = boxW / boxH;
      if (boxAspect < targetAspect) {
        boxW = targetAspect * boxH;
      } else {
        boxH = boxW / targetAspect;
      }

      // Decide if we should cap based on camera tilt (X/Y) ---
      const forward = new THREE.Vector3();
      this._threeCamera.getWorldDirection(forward);
      // |forward.z| ≈ 1  -> no tilt (look mostly perpendicular to Z=0).
      // |forward.z| ≈ 0  -> grazing the horizon (strong tilt).

      const freeCos = Math.cos(
        THREE.MathUtils.degToRad(this._2DPlaneClampFreeTiltDeg)
      );
      const hardCos = Math.cos(
        THREE.MathUtils.degToRad(this._2DPlaneClampHardTiltDeg)
      );
      const tiltCos = Math.abs(forward.z);

      // Map tiltCos ∈ [hardCos, freeCos] to w ∈ [1, 0]
      let w = 0;
      if (tiltCos <= hardCos)
        w = 1; // fully clamped
      else if (tiltCos >= freeCos)
        w = 0; // no clamp
      else w = (freeCos - tiltCos) / (freeCos - hardCos);

      // Ease it
      w = Math.pow(w, this._2DPlaneClampRampPower);

      // Interpolate Infinity→base via 1/w (bounded):
      const BIG = 1e12; // “practically infinite”
      const denom = Math.max(w, 1e-6);
      const effectiveMaxH = Math.min(
        BIG,
        this._2DPlaneMaxDrawingDistance / denom
      );

      // Apply the max height.
      if (effectiveMaxH < BIG) {
        const clampedH = Math.max(1e-8, Math.min(boxH, effectiveMaxH));
        if (clampedH !== boxH) {
          boxH = clampedH;
          boxW = targetAspect * boxH; // keep aspect
        }
      }

      return [boxW, boxH];
    }

    private _get2DPlanePosition(boxH: number): [number, number] {
      if (!this._threeCamera) return [0, 0];

      // Choose the plane position (anchor to bottom of screen, heading-invariant) ---
      const bottomLeft = projectNDCToZ0(this._threeCamera, -1, -1);
      const bottomRight = projectNDCToZ0(this._threeCamera, +1, -1);

      let cx: number, cy: number;

      if (bottomLeft && bottomRight) {
        // Midpoint of the bottom-of-screen segment on Z=0:
        const mx = 0.5 * (bottomLeft.x + bottomRight.x);
        const my = 0.5 * (bottomLeft.y + bottomRight.y);

        // Tangent along the bottom line (unit):
        let dx = bottomRight.x - bottomLeft.x;
        let dy = bottomRight.y - bottomLeft.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        // Inward normal n = +90° rotation of d in XY plane:
        // d = (dx, dy)  ->  n = (-dy, dx)
        let nx = -dy;
        let ny = dx;

        // Ensure n points "into the screen":
        const midIn = projectNDCToZ0(this._threeCamera, 0, -0.5);
        if (midIn) {
          const vx = midIn.x - mx;
          const vy = midIn.y - my;
          if (vx * nx + vy * ny < 0) {
            nx = -nx;
            ny = -ny;
          }
        }

        // Place the plane so its bottom edge lies on the bottom-of-screen line:
        cx = mx + nx * (boxH * 0.5);
        cy = my + ny * (boxH * 0.5);
      } else {
        // Fallback to the camera center projected on Z=0 if bottom line not visible:
        const centerRay = projectNDCToZ0(this._threeCamera, 0, 0);
        if (centerRay) {
          cx = centerRay.x;
          cy = centerRay.y;
        } else {
          // Fallback to the camera position if the center ray is not visible:
          cx = this._threeCamera.position.x;
          cy = this._threeCamera.position.y;
        }
      }
      return [cx, cy];
    }

    updatePosition(): void {
      // Update the 3D camera position and rotation.
      if (this._threeCamera) {
        const angle = -gdjs.toRad(this._layer.getCameraRotation());
        this._threeCamera.position.x = this._layer.getCameraX();
        this._threeCamera.position.y = -this._layer.getCameraY(); // scene is mirrored on Y
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
      }

      let effectivePixiZoom = 1;
      const angle = -gdjs.toRad(this._layer.getCameraRotation());
      const angleCosValue = Math.cos(angle);
      const angleSinValue = Math.sin(angle);

      // Determine if this layer will actually render in 3D mode.
      // A layer configured for 3D (has _threeCamera and _threePlaneMesh) but with no
      // 3D objects will be rendered directly in 2D mode, so it should use 2D-style
      // pixi container setup to avoid a zoom mismatch.
      // See also: `layerHas3DObjectsToRender` in `runtimescene-pixi-renderer.ts`.
      const willRenderIn3DMode =
        this._threeCamera && this._threePlaneMesh && this.has3DObjects();

      // Update the 2D plane in the 3D world position, size and rotation,
      // and update the 2D Pixi container position, size and rotation.
      if (this._threeCamera && this._threePlaneMesh) {
        const [boxW, boxH] = this._get2DPlaneSize();

        if (boxW === 0 || boxH === 0) {
          // No size means the 2D plane is not visible.
          this._threePlaneMesh.visible = false;
        } else {
          this._threePlaneMesh.visible = true;

          const [cx, cy] = this._get2DPlanePosition(boxH);

          // Update the 2D plane size, position and rotation (so 2D remains upright).
          // Plane size (geometry is 1×1).
          this._threePlaneMesh.scale.set(boxW, boxH, 1);
          this._threePlaneMesh.position.set(cx, -cy, 0);
          this._threePlaneMesh.rotation.set(0, 0, -angle);

          if (willRenderIn3DMode) {
            // Update the 2D Pixi container size and rotation to match the "zoom" (which comes from the 2D plane size)
            // rotation and position.
            effectivePixiZoom = this._layer.getWidth() / boxW; // == height/boxH
            this._pixiContainer.scale.set(effectivePixiZoom, effectivePixiZoom);
            this._pixiContainer.rotation = angle;

            const followX = cx;
            const followY = -cy;
            const centerX2d =
              followX * effectivePixiZoom * angleCosValue -
              followY * effectivePixiZoom * angleSinValue;
            const centerY2d =
              followX * effectivePixiZoom * angleSinValue +
              followY * effectivePixiZoom * angleCosValue;
            this._pixiContainer.position.x =
              this._layer.getWidth() / 2 - centerX2d;
            this._pixiContainer.position.y =
              this._layer.getHeight() / 2 - centerY2d;
          }
        }
      }

      // 2D only (no 3D rendering and so no 2D plane in the 3D world):
      // Update the 2D Pixi container position, size and rotation.
      // This also applies to layers configured for 3D but with no 3D objects,
      // since they will be rendered directly in 2D mode.
      if (!willRenderIn3DMode) {
        effectivePixiZoom = this._layer.getCameraZoom();

        this._pixiContainer.rotation = angle;
        this._pixiContainer.scale.x = effectivePixiZoom;
        this._pixiContainer.scale.y = effectivePixiZoom;
        const centerX =
          this._layer.getCameraX() * effectivePixiZoom * angleCosValue -
          this._layer.getCameraY() * effectivePixiZoom * angleSinValue;
        const centerY =
          this._layer.getCameraX() * effectivePixiZoom * angleSinValue +
          this._layer.getCameraY() * effectivePixiZoom * angleCosValue;
        this._pixiContainer.position.x = this._layer.getWidth() / 2 - centerX;
        this._pixiContainer.position.y = this._layer.getHeight() / 2 - centerY;
      }

      // Pixel rounding for the Pixi rendering (be it for 2D only
      // or for the 2D rendering shown in the 2D plane in the 3D world).
      if (
        this._layer.getRuntimeScene().getGame().getPixelsRounding() &&
        (angleCosValue === 0 || angleSinValue === 0) &&
        Number.isInteger(effectivePixiZoom)
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
    }

    updateResolution() {
      if (this._threeEffectComposer) {
        const game = this._layer.getRuntimeScene().getGame();
        this._threeEffectComposer.setPixelRatio(window.devicePixelRatio);
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

    /**
     * Check if the layer is rendering in 3D mode with a 2D plane
     * (i.e., has a 3D camera and a plane mesh for 2D content).
     */
    isRenderingIn3DWithPlane(): boolean {
      return !!(this._threeCamera && this._threePlaneMesh && this.has3DObjects());
    }

    /**
     * Project a point from 3D world coordinates (with Y flipped, as used in Three.js scene)
     * to canvas coordinates.
     *
     * @param worldX The X position in 3D world coordinates.
     * @param worldY The Y position in 3D world coordinates (already flipped for Three.js).
     * @param worldZ The Z position in 3D world coordinates.
     * @param result The point instance that is used to return the result.
     * @returns The canvas coordinates, or null if the point is behind the camera.
     */
    projectWorldToCanvas(
      worldX: float,
      worldY: float,
      worldZ: float,
      result: FloatPoint
    ): FloatPoint | null {
      const camera = this._threeCamera;
      if (!camera) {
        return null;
      }

      let vector = LayerPixiRenderer.vectorForProjections;
      if (!vector) {
        vector = new THREE.Vector3();
        LayerPixiRenderer.vectorForProjections = vector;
      }

      vector.set(worldX, worldY, worldZ);

      camera.updateMatrixWorld();

      // Project the point to normalized device coordinates (-1 to 1).
      vector.project(camera);

      // Check if the point is behind the camera (z > 1 means behind).
      if (vector.z > 1) {
        return null;
      }

      // Convert from NDC (-1 to 1) to canvas coordinates.
      const width = this._layer.getWidth();
      const height = this._layer.getHeight();
      result[0] = ((vector.x + 1) / 2) * width;
      result[1] = ((-vector.y + 1) / 2) * height;

      return result;
    }

    /**
     * Get the 2D plane's current transformation data for DOM element positioning.
     * Returns null if not rendering in 3D mode with a 2D plane.
     *
     * @returns Object containing plane position, size, and rotation, or null.
     */
    get2DPlaneTransformData(): {
      centerX: float;
      centerY: float;
      width: float;
      height: float;
      rotationZ: float;
    } | null {
      if (!this._threePlaneMesh || !this._threeCamera) {
        return null;
      }

      const [boxW, boxH] = this._get2DPlaneSize();
      if (boxW === 0 || boxH === 0) {
        return null;
      }

      const [cx, cy] = this._get2DPlanePosition(boxH);

      return {
        centerX: cx,
        centerY: cy,
        width: boxW,
        height: boxH,
        rotationZ: -gdjs.toRad(this._layer.getCameraRotation()),
      };
    }

    /**
     * Compute the CSS transform properties for a DOM element to appear
     * on the 2D plane in 3D space.
     *
     * This computes position, size, and rotation based on the projected corners
     * of the object, preserving text readability while approximating the 3D position.
     * All returned coordinates are in canvas space.
     *
     * @param objectX The object X position in scene coordinates.
     * @param objectY The object Y position in scene coordinates.
     * @param objectWidth The object width.
     * @param objectHeight The object height.
     * @param objectAngle The object angle in degrees.
     * @returns Object with CSS transform data in canvas coordinates, or null if not in 3D mode or not visible.
     */
    computeDOMElementTransformIn3D(
      objectX: float,
      objectY: float,
      objectWidth: float,
      objectHeight: float,
      objectAngle: float
    ): {
      rotationDeg: float;
      centerX: float;
      centerY: float;
      width: float;
      height: float;
      scaleForText: float;
    } | null {
      const camera = this._threeCamera;
      const planeMesh = this._threePlaneMesh;
      if (!camera || !planeMesh || !this.has3DObjects()) {
        return null;
      }

      const workingPoint: FloatPoint = [0, 0];

      // Calculate the object's center in scene coordinates.
      const objectCenterX = objectX + objectWidth / 2;
      const objectCenterY = objectY + objectHeight / 2;

      // Get the 4 corners of the object in scene coordinates.
      const angleRad = gdjs.toRad(objectAngle);
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const hw = objectWidth / 2;
      const hh = objectHeight / 2;

      // Corners relative to center, then rotated and translated.
      // Order: top-left, top-right, bottom-right, bottom-left
      const corners: Array<[float, float]> = [
        [-hw, -hh],
        [hw, -hh],
        [hw, hh],
        [-hw, hh],
      ];

      const projectedCorners: Array<[float, float]> = [];

      for (const [dx, dy] of corners) {
        // Rotate the corner offset.
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;

        // World position (Y flipped for Three.js).
        const worldX = objectCenterX + rx;
        const worldY = -(objectCenterY + ry);
        const worldZ = 0;

        const projected = this.projectWorldToCanvas(
          worldX,
          worldY,
          worldZ,
          workingPoint
        );
        if (!projected) {
          // Point is behind the camera, can't render.
          return null;
        }
        projectedCorners.push([projected[0], projected[1]]);
      }

      const [tl, tr, br, bl] = projectedCorners;

      // Check if any corner is outside the canvas bounds (with some margin).
      const canvasWidth = this._layer.getWidth();
      const canvasHeight = this._layer.getHeight();
      const margin = Math.max(canvasWidth, canvasHeight) * 2;
      for (const corner of projectedCorners) {
        if (
          corner[0] < -margin ||
          corner[0] > canvasWidth + margin ||
          corner[1] < -margin ||
          corner[1] > canvasHeight + margin
        ) {
          return null;
        }
      }

      // Calculate the center of the projected quadrilateral (in canvas coordinates).
      const projCenterX = (tl[0] + tr[0] + br[0] + bl[0]) / 4;
      const projCenterY = (tl[1] + tr[1] + br[1] + bl[1]) / 4;

      // Calculate the projected width and height (in canvas pixels).
      // Width: average of top and bottom edge lengths.
      const topEdgeLength = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);
      const bottomEdgeLength = Math.hypot(br[0] - bl[0], br[1] - bl[1]);
      const projWidth = (topEdgeLength + bottomEdgeLength) / 2;

      // Height: average of left and right edge lengths.
      const leftEdgeLength = Math.hypot(bl[0] - tl[0], bl[1] - tl[1]);
      const rightEdgeLength = Math.hypot(br[0] - tr[0], br[1] - tr[1]);
      const projHeight = (leftEdgeLength + rightEdgeLength) / 2;

      // Calculate the rotation from the projected top edge (in radians).
      const projAngleRad = Math.atan2(tr[1] - tl[1], tr[0] - tl[0]);
      const projAngleDeg = (projAngleRad * 180) / Math.PI;

      // Calculate scale factor for text (relative to original object size).
      // This is the average of width and height scales.
      const scaleX = projWidth / objectWidth;
      const scaleY = projHeight / objectHeight;
      const scaleForText = (scaleX + scaleY) / 2;

      return {
        rotationDeg: projAngleDeg,
        centerX: projCenterX,
        centerY: projCenterY,
        width: projWidth,
        height: projHeight,
        scaleForText,
      };
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

      const glTexture =
        this._renderTexture.baseTexture._glTextures[pixiRenderer.CONTEXT_UID];
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
      const parentPixiContainer =
        runtimeInstanceContainerRenderer.getRendererObject();
      if (parentPixiContainer) {
        const index = parentPixiContainer.getChildIndex(this._pixiContainer);
        parentPixiContainer.addChildAt(this._lightingSprite, index);
        parentPixiContainer.removeChild(this._pixiContainer);
      }
    }
  }

  //Register the class to let the engine use it.
  /**
   * @category Renderers > Layers
   */
  export type LayerRenderer = gdjs.LayerPixiRenderer;
  /**
   * @category Renderers > Layers
   */
  export const LayerRenderer = gdjs.LayerPixiRenderer;
}
