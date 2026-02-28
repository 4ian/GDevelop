namespace gdjs {
  /**
   * PIXI.js renderer for MapRuntimeObject.
   * Handles the visual rendering of the map using PIXI.js.
   * @internal
   */
  export class MapRuntimeObjectPixiRenderer {
    _object: gdjs.MapRuntimeObject;
    _instanceContainer: gdjs.RuntimeInstanceContainer;

    _pixiContainer: PIXI.Container;
    _backgroundGraphics: PIXI.Graphics;
    _contentGraphics: PIXI.Graphics;
    _borderGraphics: PIXI.Graphics;
    _markersContainer: PIXI.Container;
    _maskGraphics: PIXI.Graphics | null = null;

    _backgroundSprite: PIXI.Sprite | null = null;
    _frameSprite: PIXI.Sprite | null = null;

    _markerSprites: Map<string, PIXI.Sprite> = new Map();
    _loadedTextures: Map<string, PIXI.Texture> = new Map();

    _currentBackgroundImage: string = '';
    _currentFrameImage: string = '';
    _currentShape: string = 'Rectangle';

    // Track previous world positions to compute heading when angle is unavailable
    _prevWorldPositions: Map<string, { x: number; y: number }> = new Map();

    /**
     * Create the PIXI renderer for the map object.
     * @param runtimeObject The map runtime object.
     * @param instanceContainer The container the object belongs to.
     */
    constructor(
      runtimeObject: gdjs.MapRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._instanceContainer = instanceContainer;

      // Create container
      this._pixiContainer = new PIXI.Container();

      // Create graphics layers
      this._backgroundGraphics = new PIXI.Graphics();
      this._contentGraphics = new PIXI.Graphics();
      this._borderGraphics = new PIXI.Graphics();
      this._markersContainer = new PIXI.Container();
      this._markersContainer.sortableChildren = true;

      this._pixiContainer.addChild(this._backgroundGraphics);
      this._pixiContainer.addChild(this._contentGraphics);
      this._pixiContainer.addChild(this._markersContainer);
      this._pixiContainer.addChild(this._borderGraphics);

      // Add to scene
      instanceContainer
        .getLayer(runtimeObject.getLayer())
        .getRenderer()
        .addRendererObject(this._pixiContainer, runtimeObject.getZOrder());

      this.updatePosition();
      this.updateVisibility();
    }

    /**
     * Get the PIXI renderer object.
     * @returns The PIXI container.
     */
    getRendererObject(): PIXI.Container {
      return this._pixiContainer;
    }

    /**
     * Destroy the renderer and clean up resources.
     */
    destroy(): void {
      // Clean up background sprite
      if (this._backgroundSprite) {
        this._pixiContainer.removeChild(this._backgroundSprite);
        this._backgroundSprite.destroy();
        this._backgroundSprite = null;
      }

      // Clean up frame sprite
      if (this._frameSprite) {
        this._pixiContainer.removeChild(this._frameSprite);
        this._frameSprite.destroy();
        this._frameSprite = null;
      }

      // Clean up mask graphics
      if (this._maskGraphics) {
        this._pixiContainer.mask = null;
        this._pixiContainer.removeChild(this._maskGraphics);
        this._maskGraphics.destroy();
        this._maskGraphics = null;
      }

      // Clean up marker sprites
      this._markerSprites.forEach((sprite) => {
        sprite.destroy();
      });
      this._markerSprites.clear();

      // Clean up markers container
      this._markersContainer.destroy();

      // Clean up graphics
      this._backgroundGraphics.destroy();
      this._contentGraphics.destroy();
      this._borderGraphics.destroy();

      // Remove from scene
      this._instanceContainer
        .getLayer(this._object.getLayer())
        .getRenderer()
        .removeRendererObject(this._pixiContainer);

      this._pixiContainer.destroy();
    }

    /**
     * Update the renderer (position and render).
     */
    update(): void {
      this.updatePosition();
      this.render();
    }

    /**
     * Update the position of the map on screen.
     */
    updatePosition(): void {
      if (this._object.getStayOnScreen()) {
        // Fixed position on screen (UI layer behavior)
        const layer = this._instanceContainer.getLayer(this._object.getLayer());
        const cameraX = layer.getCameraX();
        const cameraY = layer.getCameraY();
        const cameraWidth = layer.getCameraWidth();
        const cameraHeight = layer.getCameraHeight();

        // Position relative to camera
        const screenX = this._object.getX();
        const screenY = this._object.getY();

        this._pixiContainer.position.x = cameraX - cameraWidth / 2 + screenX;
        this._pixiContainer.position.y = cameraY - cameraHeight / 2 + screenY;
      } else {
        // World position
        this._pixiContainer.position.x = this._object.getX();
        this._pixiContainer.position.y = this._object.getY();
      }
    }

    /**
     * Update the visibility of the map.
     */
    updateVisibility(): void {
      this._pixiContainer.visible = this._object.isVisible();
    }

    /**
     * Render the map.
     */
    render(): void {
      // Clear previous frame
      this._backgroundGraphics.clear();
      this._contentGraphics.clear();
      this._borderGraphics.clear();

      // Clear marker sprites
      this._markerSprites.forEach((sprite) => {
        sprite.visible = false;
      });

      // Update mask for circular shape
      this._updateMask();

      // Apply rotation for HeadingUp mode
      this._applyOrientationRotation();

      // Render background
      this._renderBackground();

      // Render content (markers)
      this._renderMarkers();

      // Render border
      this._renderBorder();

      // Render frame (if custom image)
      this._renderFrame();
    }

    /**
     * Apply rotation based on orientation mode.
     * In map mode (HeadingUp), the map rotates so the player's heading is always up.
     * In WorldMap mode (NorthUp), the map is fixed with north at the top.
     * @internal
     */
    _applyOrientationRotation(): void {
      const mode = this._object.getMode();
      const width = this._object.getWidth();
      const height = this._object.getHeight();
      const centerX = width / 2;
      const centerY = height / 2;

      // map mode uses HeadingUp (rotates with player)
      // WorldMap mode uses NorthUp (fixed north)
      if (mode === 'Minimap') {
        const headingAngle = this._getCameraAngle();
        const rotation = -headingAngle - Math.PI / 2;
        this._contentGraphics.rotation = rotation;
        this._contentGraphics.position.set(centerX, centerY);
        this._markersContainer.rotation = rotation;
        this._markersContainer.position.set(centerX, centerY);
        this._backgroundGraphics.rotation = rotation;
        this._backgroundGraphics.position.set(centerX, centerY);

        // The border should stay aligned with the mask (not rotated), but still centered.
        this._borderGraphics.rotation = 0;
        this._borderGraphics.position.set(centerX, centerY);

        // Rotate background sprite too, if it exists.
        if (this._backgroundSprite) {
          this._backgroundSprite.pivot.set(centerX, centerY);
          this._backgroundSprite.position.set(centerX, centerY);
          this._backgroundSprite.rotation = rotation;
        }
      } else {
        // WorldMap mode - NorthUp (no rotation)
        this._contentGraphics.rotation = 0;
        this._contentGraphics.position.set(0, 0);
        this._markersContainer.rotation = 0;
        this._markersContainer.position.set(0, 0);
        this._backgroundGraphics.rotation = 0;
        this._backgroundGraphics.position.set(0, 0);
        this._borderGraphics.rotation = 0;
        this._borderGraphics.position.set(0, 0);
        if (this._backgroundSprite) {
          this._backgroundSprite.pivot.set(0, 0);
          this._backgroundSprite.position.set(0, 0);
          this._backgroundSprite.rotation = 0;
        }
      }
    }

    /**
     * Get the player's current angle in radians.
     * @returns The player's angle in radians, or 0 if no player found.
     * @internal
     */
    _getCameraAngle(): number {
      let layerNameToUse = this._object.getLayer();
      const trackedObjects = this._object.getTrackedObjects();
      for (const obj of trackedObjects) {
        const markerBehavior = this._object._getMapMarkerBehavior(obj);
        if (markerBehavior && markerBehavior.getMarkerType() === 'Player') {
          layerNameToUse = obj.getLayer();
          break;
        }
      }
      const layer = this._instanceContainer.getLayer(layerNameToUse);
      const layerRenderer: any = layer.getRenderer();
      const threeCamera =
        layerRenderer && typeof layerRenderer.getThreeCamera === 'function'
          ? layerRenderer.getThreeCamera()
          : null;
      const three: any = (globalThis as any).THREE;
      if (threeCamera && three && typeof three.Vector3 === 'function') {
        const projectNDCToZ0 = (ndcX: number, ndcY: number) => {
          threeCamera.updateMatrixWorld();
          if (threeCamera instanceof three.OrthographicCamera) {
            const vector = new three.Vector3(ndcX, ndcY, 0);
            vector.unproject(threeCamera);
            const direction = new three.Vector3();
            threeCamera.getWorldDirection(direction);
            if (!direction.z) return null;
            const distance = (0 - vector.z) / direction.z;
            vector.x += distance * direction.x;
            vector.y += distance * direction.y;
            return vector;
          }

          const vector = new three.Vector3(ndcX, ndcY, 0.5);
          vector.unproject(threeCamera);
          vector.sub(threeCamera.position).normalize();
          if (!vector.z) return null;
          const distance = (0 - threeCamera.position.z) / vector.z;
          const x = distance * vector.x + threeCamera.position.x;
          const y = distance * vector.y + threeCamera.position.y;
          return new three.Vector3(x, y, 0);
        };

        const center = projectNDCToZ0(0, 0);
        const candidateA = projectNDCToZ0(0, -0.5);
        const candidateB = projectNDCToZ0(0, 0.5);
        if (center && candidateA && candidateB) {
          const aInCamera = candidateA.clone();
          const bInCamera = candidateB.clone();
          if (typeof threeCamera.worldToLocal === 'function') {
            threeCamera.worldToLocal(aInCamera);
            threeCamera.worldToLocal(bInCamera);
          }
          const inScreen = aInCamera.z < bInCamera.z ? candidateA : candidateB;

          const dx = inScreen.x - center.x;
          const dy = inScreen.y - center.y;
          const x = dx;
          const y = -dy;
          if (x !== 0 || y !== 0) {
            return Math.atan2(y, x);
          }
        }
      }
      const rotationDeg = layer.getCameraRotation();
      return (rotationDeg * Math.PI) / 180;
    }

    /**
     * Update the mask for circular or rectangular shape.
     * @internal
     */
    _updateMask(): void {
      const shape = this._object.getShape();
      const width = this._object.getWidth();
      const height = this._object.getHeight();

      // Create mask graphics if not exists
      if (!this._maskGraphics) {
        this._maskGraphics = new PIXI.Graphics();
        this._pixiContainer.addChild(this._maskGraphics);
        this._pixiContainer.mask = this._maskGraphics;
      }

      this._maskGraphics.clear();
      this._maskGraphics.beginFill(0xffffff);

      if (shape === 'Circle') {
        // Draw circular mask
        const radius = Math.min(width, height) / 2;
        this._maskGraphics.drawCircle(width / 2, height / 2, radius);
        this._currentShape = 'Circle';
      } else {
        // Draw rectangular mask
        this._maskGraphics.drawRect(0, 0, width, height);
        this._currentShape = 'Rectangle';
      }

      this._maskGraphics.endFill();
    }

    /**
     * Render the background of the map.
     * @internal
     */
    _renderBackground(): void {
      const bgImage = this._object.getBackgroundImage();
      const shape = this._object.getShape();
      const width = this._object.getWidth();
      const height = this._object.getHeight();
      const centerX = width / 2;
      const centerY = height / 2;

      // Check if we're in map mode (HeadingUp - center-relative coordinates)
      const mode = this._object.getMode();
      const ismap = mode === 'Minimap';

      if (bgImage && bgImage !== '') {
        // Use background image
        this._loadAndRenderBackgroundImage(bgImage);
      } else {
        // Use solid color
        const bgColor = this._parseColor(this._object.getBackgroundColor());
        const bgOpacity = this._object.getBackgroundOpacity();

        this._backgroundGraphics.beginFill(bgColor, bgOpacity);
        if (shape === 'Circle') {
          // Draw circular background (center-relative for map/HeadingUp)
          const radius = Math.min(width, height) / 2;
          if (ismap) {
            this._backgroundGraphics.drawCircle(0, 0, radius);
          } else {
            this._backgroundGraphics.drawCircle(centerX, centerY, radius);
          }
        } else {
          // Draw rectangular background (center-relative for map/HeadingUp)
          if (ismap) {
            this._backgroundGraphics.drawRect(-centerX, -centerY, width, height);
          } else {
            this._backgroundGraphics.drawRect(0, 0, width, height);
          }
        }
        this._backgroundGraphics.endFill();
      }
    }

    /**
     * Load and render a background image.
     * @param imageName The name of the image resource.
     * @internal
     */
    _loadAndRenderBackgroundImage(imageName: string): void {
      const width = this._object.getWidth();
      const height = this._object.getHeight();

      try {
        // Check if we need to reload the image
        if (this._currentBackgroundImage !== imageName) {
          // Remove old sprite if exists
          if (this._backgroundSprite) {
            this._pixiContainer.removeChild(this._backgroundSprite);
            this._backgroundSprite.destroy();
            this._backgroundSprite = null;
          }

          // Load new texture
          const texture = this._instanceContainer
            .getGame()
            .getImageManager()
            .getPIXITexture(imageName);

          // Create sprite
          this._backgroundSprite = new PIXI.Sprite(texture);
          this._backgroundSprite.width = width;
          this._backgroundSprite.height = height;
          this._backgroundSprite.alpha = this._object.getBackgroundOpacity();

          // Add to container (behind graphics)
          this._pixiContainer.addChildAt(this._backgroundSprite, 0);

          this._currentBackgroundImage = imageName;
        } else if (this._backgroundSprite) {
          // Update existing sprite
          this._backgroundSprite.width = width;
          this._backgroundSprite.height = height;
          this._backgroundSprite.alpha = this._object.getBackgroundOpacity();
        }
      } catch (error) {
        // Fallback to solid color if image loading fails
        console.warn(`Failed to load map background image: ${imageName}`, error);
        this._currentBackgroundImage = '';

        const bgColor = this._parseColor(this._object.getBackgroundColor());
        const bgOpacity = this._object.getBackgroundOpacity();

        this._backgroundGraphics.beginFill(bgColor, bgOpacity);
        this._backgroundGraphics.drawRect(0, 0, width, height);
        this._backgroundGraphics.endFill();
      }
    }

    /**
     * Render all tracked object markers.
     * @internal
     */
    _renderMarkers(): void {
      const trackedObjects = this._object.getTrackedObjects();

      for (const obj of trackedObjects) {
        const markerBehavior = this._object._getMapMarkerBehavior(obj);
        if (markerBehavior) {
          // Check if required methods exist before rendering
          if (typeof markerBehavior.getMarkerType === 'function') {
            this._renderMarker(obj, markerBehavior);
          }
        }
      }
    }

    /**
     * Render a single marker for a tracked object.
     * @param obj The tracked object.
     * @param markerBehavior The map marker behavior.
     * @internal
     */
    _renderMarker(
      obj: gdjs.RuntimeObject,
      markerBehavior: gdjs.MapMarkerRuntimeBehavior
    ): void {
      const markerType = markerBehavior.getMarkerType();
      const worldX = obj.getCenterXInScene();
      const worldY = obj.getCenterYInScene();
      let [mapX, mapY] = this._object.worldToMap(worldX, worldY);

      // Adjust coordinates for rotation (center-relative)
      const mode = this._object.getMode();
      const width = this._object.getWidth();
      const height = this._object.getHeight();
      const centerX = width / 2;
      const centerY = height / 2;

      // In map mode (HeadingUp), coordinates need to be relative to center
      if (mode === 'Minimap') {
        mapX = mapX - centerX;
        mapY = mapY - centerY;
      }

      // Get marker properties based on type
      let color: number;
      let size: number;
      let customIcon: string = '';
      let angleDeg: number = 0;
      let priority: number = this._getMarkerPriorityFromType(markerType);

      const showRotation =
        markerBehavior.getShowRotation() ||
        (mode === 'Minimap' && markerType === 'Player');
      if (showRotation) {
        const maybeGetAngle = (obj as any).getAngle;
        if (typeof maybeGetAngle === 'function') {
          angleDeg = maybeGetAngle.call(obj);
        } else {
          const key = `${obj.name}_${obj.id}`;
          const prev = this._prevWorldPositions.get(key);
          if (prev) {
            const dx = worldX - prev.x;
            const dy = worldY - prev.y;
            if (dx !== 0 || dy !== 0) {
              angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
            }
          }
          this._prevWorldPositions.set(key, { x: worldX, y: worldY });
        }
      }

      switch (markerType) {
        case 'Player':
          color = this._parseColor(
            markerBehavior.getCustomColor() || this._object.getPlayerColor()
          );
          size = this._object.getPlayerSize();
          customIcon =
            markerBehavior.getCustomIcon() || this._object.getPlayerMarkerImage();
          break;
        case 'Enemy':
          color = this._parseColor(
            markerBehavior.getCustomColor() || this._object.getEnemyColor()
          );
          size = this._object.getEnemySize();
          customIcon =
            markerBehavior.getCustomIcon() || this._object.getEnemyMarkerImage();
          break;
        case 'Ally':
          color = this._parseColor(markerBehavior.getCustomColor() || '0;128;255');
          size = this._object.getPlayerSize();
          customIcon = markerBehavior.getCustomIcon() || '';
          break;
        case 'Item':
          color = this._parseColor(
            markerBehavior.getCustomColor() || this._object.getItemColor()
          );
          size = this._object.getItemSize();
          customIcon =
            markerBehavior.getCustomIcon() || this._object.getItemMarkerImage();
          break;
        case 'Obstacle':
          if (!this._object.getShowObstacles()) return;
          color = this._parseColor(
            markerBehavior.getCustomColor() || this._object.getObstacleColor()
          );
          size = 8;

          // Render obstacle shape if enabled
          if (this._object.getUseObjectShape()) {
            this._renderObstacleShape(obj, mapX, mapY, color);
            return;
          }
          break;
        case 'Custom':
          color = this._parseColor(markerBehavior.getCustomColor() || '255;255;255');
          size = markerBehavior.getCustomSize() || 8;
          customIcon = markerBehavior.getCustomIcon() || '';
          break;
        default:
          color = this._parseColor(markerBehavior.getCustomColor() || '255;255;255');
          size = 8;
          customIcon = markerBehavior.getCustomIcon() || '';
      }

      // Apply custom size if set
      const behaviorCustomSize = markerBehavior.getCustomSize();
      if (behaviorCustomSize > 0) {
        size = behaviorCustomSize;
      }

      // Check if flashing
      const isFlashing = markerBehavior.isFlashing();
      if (isFlashing && !markerBehavior.shouldShowFlash()) {
        return; // Don't render during flash off period
      }

      // Render marker
      if (customIcon && customIcon !== '') {
        // Render custom icon
        this._renderCustomIconMarker(
          obj,
          mapX,
          mapY,
          size,
          customIcon,
          angleDeg,
          showRotation,
          priority
        );
      } else {
        // Render default shape based on type
        if (markerType === 'Player') {
          this._renderTriangleMarker(mapX, mapY, size, color, angleDeg + 90);
        } else if (markerType === 'Item') {
          this._renderStarMarker(mapX, mapY, size, color);
        } else {
          this._renderCircleMarker(mapX, mapY, size, color);
        }
      }
    }

    /**
     * Render a circle marker.
     * @param x The X position.
     * @param y The Y position.
     * @param size The size of the marker.
     * @param color The color of the marker.
     * @internal
     */
    _renderCircleMarker(
      x: number,
      y: number,
      size: number,
      color: number
    ): void {
      this._contentGraphics.beginFill(color);
      this._contentGraphics.drawCircle(x, y, size / 2);
      this._contentGraphics.endFill();
    }

    /**
     * Render a triangle marker (typically for player).
     * @param x The X position.
     * @param y The Y position.
     * @param size The size of the marker.
     * @param color The color of the marker.
     * @param angle The rotation angle in degrees.
     * @internal
     */
    _renderTriangleMarker(
      x: number,
      y: number,
      size: number,
      color: number,
      angle: number
    ): void {
      const rad = (angle * Math.PI) / 180;
      const height = size;
      const width = size * 0.8;

      // Triangle points (pointing up initially)
      const points = [
        { x: 0, y: -height / 2 },
        { x: -width / 2, y: height / 2 },
        { x: width / 2, y: height / 2 },
      ];

      // Rotate points
      const rotatedPoints = points.map((p) => ({
        x: x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
        y: y + p.x * Math.sin(rad) + p.y * Math.cos(rad),
      }));

      this._contentGraphics.beginFill(color);
      this._contentGraphics.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
      this._contentGraphics.lineTo(rotatedPoints[1].x, rotatedPoints[1].y);
      this._contentGraphics.lineTo(rotatedPoints[2].x, rotatedPoints[2].y);
      this._contentGraphics.closePath();
      this._contentGraphics.endFill();
    }

    /**
     * Render a star marker (typically for items).
     * @param x The X position.
     * @param y The Y position.
     * @param size The size of the marker.
     * @param color The color of the marker.
     * @internal
     */
    _renderStarMarker(
      x: number,
      y: number,
      size: number,
      color: number
    ): void {
      const outerRadius = size / 2;
      const innerRadius = size / 4;
      const points = 5;

      this._contentGraphics.beginFill(color);

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        if (i === 0) {
          this._contentGraphics.moveTo(px, py);
        } else {
          this._contentGraphics.lineTo(px, py);
        }
      }

      this._contentGraphics.closePath();
      this._contentGraphics.endFill();
    }

    /**
     * Render an obstacle shape.
     * @param obj The obstacle object.
     * @param centerX The center X position on the map.
     * @param centerY The center Y position on the map.
     * @param color The color of the obstacle.
     * @internal
     */
    _renderObstacleShape(
      obj: gdjs.RuntimeObject,
      centerX: number,
      centerY: number,
      color: number
    ): void {
      const opacity = this._object.getObstacleOpacity();
      const zoom = this._object.getZoom();

      // Scale object size to map
      const width = obj.getWidth() * zoom;
      const height = obj.getHeight() * zoom;

      this._contentGraphics.beginFill(color, opacity);
      this._contentGraphics.drawRect(
        centerX - width / 2,
        centerY - height / 2,
        width,
        height
      );
      this._contentGraphics.endFill();
    }

    /**
     * Render the border of the map.
     * @internal
     */
    _renderBorder(): void {
      const width = this._object.getWidth();
      const height = this._object.getHeight();
      const centerX = width / 2;
      const centerY = height / 2;
      const borderColor = this._parseColor(this._object.getBorderColor());
      const borderWidth = this._object.getBorderWidth();
      const shape = this._object.getShape();

      // Check if we're in map mode (HeadingUp - center-relative coordinates)
      const mode = this._object.getMode();
      const ismap = mode === 'Minimap';

      if (borderWidth > 0) {
        this._borderGraphics.lineStyle(borderWidth, borderColor, 1);
        if (shape === 'Circle') {
          // Draw circular border (center-relative for map/HeadingUp)
          const radius = Math.min(width, height) / 2;
          if (ismap) {
            this._borderGraphics.drawCircle(0, 0, radius);
          } else {
            this._borderGraphics.drawCircle(centerX, centerY, radius);
          }
        } else {
          // Draw rectangular border (center-relative for map/HeadingUp)
          if (ismap) {
            this._borderGraphics.drawRect(-centerX, -centerY, width, height);
          } else {
            this._borderGraphics.drawRect(0, 0, width, height);
          }
        }
      }
    }

    /**
     * Render the frame image overlay.
     * @internal
     */
    _renderFrame(): void {
      const frameImage = this._object.getFrameImage();
      const width = this._object.getWidth();
      const height = this._object.getHeight();

      if (frameImage && frameImage !== '') {
        try {
          // Check if we need to reload the frame
          if (this._currentFrameImage !== frameImage) {
            // Remove old sprite if exists
            if (this._frameSprite) {
              this._pixiContainer.removeChild(this._frameSprite);
              this._frameSprite.destroy();
              this._frameSprite = null;
            }

            // Load new texture
            const texture = this._instanceContainer
              .getGame()
              .getImageManager()
              .getPIXITexture(frameImage);

            // Create sprite
            this._frameSprite = new PIXI.Sprite(texture);
            this._frameSprite.width = width;
            this._frameSprite.height = height;

            // Add to container (on top of everything)
            this._pixiContainer.addChild(this._frameSprite);

            this._currentFrameImage = frameImage;
          } else if (this._frameSprite) {
            // Update existing sprite
            this._frameSprite.width = width;
            this._frameSprite.height = height;
          }
        } catch (error) {
          console.warn(`Failed to load map frame image: ${frameImage}`, error);
          this._currentFrameImage = '';
        }
      } else {
        // Remove frame sprite if no image specified
        if (this._frameSprite) {
          this._pixiContainer.removeChild(this._frameSprite);
          this._frameSprite.destroy();
          this._frameSprite = null;
          this._currentFrameImage = '';
        }
      }
    }

    /**
     * Render a custom icon marker.
     * @param obj The tracked object.
     * @param x The X position.
     * @param y The Y position.
     * @param size The size of the marker.
     * @param iconName The name of the icon resource.
     * @param angleDeg The rotation angle in degrees.
     * @param showRotation Whether to show rotation.
     * @internal
     */
    _renderCustomIconMarker(
      obj: gdjs.RuntimeObject,
      x: number,
      y: number,
      size: number,
      iconName: string,
      angleDeg: number,
      showRotation: boolean,
      priority: number
    ): void {
      try {
        // Get or create sprite for this object
        const spriteKey = `${obj.name}_${obj.id}`;
        let sprite = this._markerSprites.get(spriteKey);

        if (!sprite) {
          // Load texture
          const texture = this._instanceContainer
            .getGame()
            .getImageManager()
            .getPIXITexture(iconName);

          // Create sprite
          sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5, 0.5);
          this._markersContainer.addChild(sprite);
          this._markerSprites.set(spriteKey, sprite);
        }

        // Update sprite position and size
        sprite.position.set(x, y);
        sprite.width = size;
        sprite.height = size;
        sprite.visible = true;
        sprite.zIndex = priority;

        // Apply rotation if needed
        if (showRotation) {
          sprite.rotation = ((angleDeg + 90) * Math.PI) / 180;
        } else {
          sprite.rotation = 0;
        }
      } catch (error) {
        // Fallback to circle if icon loading fails
        console.warn(`Failed to load marker icon: ${iconName}`, error);
        this._renderCircleMarker(x, y, size, 0xffffff);
      }
    }

    /**
     * Parse a color string in "R;G;B" format to a hexadecimal number.
     * @param colorString The color string in "R;G;B" format.
     * @returns The hexadecimal color value.
     * @internal
     */
    _parseColor(colorString: string): number {
      const parts = colorString.split(';');
      if (parts.length === 3) {
        const r = parseInt(parts[0], 10);
        const g = parseInt(parts[1], 10);
        const b = parseInt(parts[2], 10);
        return (r << 16) | (g << 8) | b;
      }
      return 0xffffff;
    }

    /**
     * Compute marker priority from marker type.
     * @internal
     */
    _getMarkerPriorityFromType(markerType: string): number {
      switch (markerType) {
        case 'Obstacle':
          return 100;
        case 'Custom':
          return 200;
        case 'Item':
          return 300;
        case 'Ally':
          return 400;
        case 'Enemy':
          return 500;
        case 'Player':
          return 1000;
        default:
          return 200;
      }
    }
  }

  export const MapRuntimeObjectRenderer = MapRuntimeObjectPixiRenderer;
  export type MapRuntimeObjectRenderer = MapRuntimeObjectPixiRenderer;
}
