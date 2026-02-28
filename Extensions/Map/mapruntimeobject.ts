namespace gdjs {
  /**
   * Base parameters for {@link gdjs.MapRuntimeObject}
   * @category Objects > Map
   */
  export type MapObjectDataType = {
    /** The base parameters of the map object */
    content: {
      /** Map mode: 'Minimap' or 'WorldMap' */
      mode: string;
      /** map shape: 'Rectangle' or 'Circle' */
      shape: string;
      /** Width of the map in pixels */
      width: number;
      /** Height of the map in pixels */
      height: number;
      /** Zoom level (0.01 to 1.0) */
      zoom: number;
      /** Whether the map stays fixed on screen */
      stayOnScreen: boolean;
      /** Background image resource name */
      backgroundImage: string;
      /** Frame image resource name */
      frameImage: string;
      /** Background color in "R;G;B" format */
      backgroundColor: string;
      /** Background opacity (0-1) */
      backgroundOpacity: number;
      /** Border color in "R;G;B" format */
      borderColor: string;
      /** Border width in pixels */
      borderWidth: number;
      /** Player marker image resource name */
      playerMarkerImage: string;
      /** Player marker color in "R;G;B" format */
      playerColor: string;
      /** Player marker size in pixels */
      playerSize: number;
      /** Enemy marker image resource name */
      enemyMarkerImage: string;
      /** Enemy marker color in "R;G;B" format */
      enemyColor: string;
      /** Enemy marker size in pixels */
      enemySize: number;
      /** Item marker image resource name */
      itemMarkerImage: string;
      /** Item marker color in "R;G;B" format */
      itemColor: string;
      /** Item marker size in pixels */
      itemSize: number;
      /** Whether to show obstacles on the map */
      showObstacles: boolean;
      /** Obstacle color in "R;G;B" format */
      obstacleColor: string;
      /** Obstacle opacity (0-1) */
      obstacleOpacity: number;
      /** Whether to use object shape for obstacles */
      useObjectShape: boolean;
      /** Whether to auto-detect level bounds */
      autoDetectBounds: boolean;
    };
  };

  /**
   * @category Objects > Map
   */
  export type MapObjectData = ObjectData & MapObjectDataType;

  /**
   * Network sync data for map object.
   * @category Objects > Map
   */
  export type MapNetworkSyncDataType = {
    w: number;
    h: number;
    z: float;
    vis: boolean;
  };

  /**
   * @category Objects > Map
   */
  export type MapNetworkSyncData = ObjectNetworkSyncData &
    MapNetworkSyncDataType;

  /**
   * Displays a map that tracks objects with MapMarker behavior.
   * The map can display different marker types (Player, Enemy, Item, etc.)
   * with customizable colors, sizes, and icons.
   * @category Objects > Map
   */
  export class MapRuntimeObject extends gdjs.RuntimeObject {
    _width: number;
    _height: number;
    _zoom: number;
    _stayOnScreen: boolean;
    _mode: string;
    _shape: string;
    _backgroundImage: string;
    _frameImage: string;
    _backgroundColor: string;
    _backgroundOpacity: number;
    _borderColor: string;
    _borderWidth: number;
    _playerMarkerImage: string;
    _playerColor: string;
    _playerSize: number;
    _enemyMarkerImage: string;
    _enemyColor: string;
    _enemySize: number;
    _itemMarkerImage: string;
    _itemColor: string;
    _itemSize: number;
    _showObstacles: boolean;
    _obstacleColor: string;
    _obstacleOpacity: number;
    _useObjectShape: boolean;
    _autoDetectBounds: boolean;

    _visible: boolean = true;
    _renderer: MapRuntimeObjectRenderer;

    // Tracking bounds
    _boundsMinX: number = 0;
    _boundsMinY: number = 0;
    _boundsMaxX: number = 0;
    _boundsMaxY: number = 0;
    _boundsDetected: boolean = false;

    // Update throttling
    _elapsedAccumulator: number = 0;
    _hasCustomSize: boolean = false;

    /**
     * @param instanceContainer The container the object belongs to.
     * @param objectData The object data used to initialize the object
     * @param instanceData The optional instance data
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: MapObjectData,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);

      const defaultContent = {
        mode: 'Minimap',
        shape: 'Rectangle',
        width: 200,
        height: 200,
        zoom: 0.1,
        stayOnScreen: true,
        backgroundImage: '',
        frameImage: '',
        backgroundColor: '0;0;0',
        backgroundOpacity: 0.7,
        borderColor: '255;255;255',
        borderWidth: 2,
        playerMarkerImage: '',
        playerColor: '0;255;0',
        playerSize: 12,
        enemyMarkerImage: '',
        enemyColor: '255;0;0',
        enemySize: 8,
        itemMarkerImage: '',
        itemColor: '255;255;0',
        itemSize: 6,
        showObstacles: true,
        obstacleColor: '128;128;128',
        obstacleOpacity: 0.5,
        useObjectShape: true,
        autoDetectBounds: true,
      };
      const rawContent = objectData.content || {};
      const content = { ...defaultContent, ...rawContent };
      this._mode = content.mode === 'WorldMap' ? 'WorldMap' : 'Minimap';
      this._shape = content.shape === 'Circle' ? 'Circle' : 'Rectangle';
      this._width = Math.max(1, content.width);
      this._height = Math.max(1, content.height);
      this._zoom = content.zoom;
      this._stayOnScreen = content.stayOnScreen;
      this._backgroundImage = content.backgroundImage;
      this._frameImage = content.frameImage;
      this._backgroundColor = content.backgroundColor;
      this._backgroundOpacity = content.backgroundOpacity;
      this._borderColor = content.borderColor;
      this._borderWidth = content.borderWidth;
      this._playerMarkerImage = content.playerMarkerImage;
      this._playerColor = content.playerColor;
      this._playerSize = content.playerSize;
      this._enemyMarkerImage = content.enemyMarkerImage;
      this._enemyColor = content.enemyColor;
      this._enemySize = content.enemySize;
      this._itemMarkerImage = content.itemMarkerImage;
      this._itemColor = content.itemColor;
      this._itemSize = content.itemSize;
      this._showObstacles = content.showObstacles;
      this._obstacleColor = content.obstacleColor;
      this._obstacleOpacity = content.obstacleOpacity;
      this._useObjectShape = content.useObjectShape;
      this._autoDetectBounds = content.autoDetectBounds;

      this._renderer = new gdjs.MapRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    override getRendererObject() {
      return this._renderer.getRendererObject();
    }

    override updateFromObjectData(
      oldObjectData: MapObjectData,
      newObjectData: MapObjectData
    ): boolean {
      const defaultContent = {
        mode: 'Minimap',
        shape: 'Rectangle',
        width: 200,
        height: 200,
        zoom: 0.1,
        stayOnScreen: true,
        backgroundImage: '',
        frameImage: '',
        backgroundColor: '0;0;0',
        backgroundOpacity: 0.7,
        borderColor: '255;255;255',
        borderWidth: 2,
        playerMarkerImage: '',
        playerColor: '0;255;0',
        playerSize: 12,
        enemyMarkerImage: '',
        enemyColor: '255;0;0',
        enemySize: 8,
        itemMarkerImage: '',
        itemColor: '255;255;0',
        itemSize: 6,
        showObstacles: true,
        obstacleColor: '128;128;128',
        obstacleOpacity: 0.5,
        useObjectShape: true,
        autoDetectBounds: true,
      };
      const oldContent = { ...defaultContent, ...(oldObjectData.content || {}) };
      const content = { ...defaultContent, ...(newObjectData.content || {}) };

      let needsUpdate = false;

      if (oldContent.mode !== content.mode) {
        this._mode = content.mode === 'WorldMap' ? 'WorldMap' : 'Minimap';
        needsUpdate = true;
      }

      if (oldContent.shape !== content.shape) {
        this._shape = content.shape === 'Circle' ? 'Circle' : 'Rectangle';
        needsUpdate = true;
      }

      if (!this._hasCustomSize) {
        if (oldContent.width !== content.width) {
          this._width = Math.max(1, content.width);
          needsUpdate = true;
        }
        if (oldContent.height !== content.height) {
          this._height = Math.max(1, content.height);
          needsUpdate = true;
        }
      }
      if (oldContent.zoom !== content.zoom) {
        this._zoom = content.zoom;
        needsUpdate = true;
      }
      if (oldContent.stayOnScreen !== content.stayOnScreen) {
        this._stayOnScreen = content.stayOnScreen;
        needsUpdate = true;
      }
      if (oldContent.backgroundImage !== content.backgroundImage) {
        this._backgroundImage = content.backgroundImage;
        needsUpdate = true;
      }
      if (oldContent.frameImage !== content.frameImage) {
        this._frameImage = content.frameImage;
        needsUpdate = true;
      }
      if (oldContent.backgroundColor !== content.backgroundColor) {
        this._backgroundColor = content.backgroundColor;
        needsUpdate = true;
      }
      if (oldContent.backgroundOpacity !== content.backgroundOpacity) {
        this._backgroundOpacity = content.backgroundOpacity;
        needsUpdate = true;
      }
      if (oldContent.borderColor !== content.borderColor) {
        this._borderColor = content.borderColor;
        needsUpdate = true;
      }
      if (oldContent.borderWidth !== content.borderWidth) {
        this._borderWidth = content.borderWidth;
        needsUpdate = true;
      }
      if (oldContent.playerMarkerImage !== content.playerMarkerImage) {
        this._playerMarkerImage = content.playerMarkerImage;
        needsUpdate = true;
      }
      if (oldContent.playerColor !== content.playerColor) {
        this._playerColor = content.playerColor;
        needsUpdate = true;
      }
      if (oldContent.playerSize !== content.playerSize) {
        this._playerSize = content.playerSize;
        needsUpdate = true;
      }
      if (oldContent.enemyMarkerImage !== content.enemyMarkerImage) {
        this._enemyMarkerImage = content.enemyMarkerImage;
        needsUpdate = true;
      }
      if (oldContent.enemyColor !== content.enemyColor) {
        this._enemyColor = content.enemyColor;
        needsUpdate = true;
      }
      if (oldContent.enemySize !== content.enemySize) {
        this._enemySize = content.enemySize;
        needsUpdate = true;
      }
      if (oldContent.itemMarkerImage !== content.itemMarkerImage) {
        this._itemMarkerImage = content.itemMarkerImage;
        needsUpdate = true;
      }
      if (oldContent.itemColor !== content.itemColor) {
        this._itemColor = content.itemColor;
        needsUpdate = true;
      }
      if (oldContent.itemSize !== content.itemSize) {
        this._itemSize = content.itemSize;
        needsUpdate = true;
      }
      if (oldContent.showObstacles !== content.showObstacles) {
        this._showObstacles = content.showObstacles;
        needsUpdate = true;
      }
      if (oldContent.obstacleColor !== content.obstacleColor) {
        this._obstacleColor = content.obstacleColor;
        needsUpdate = true;
      }
      if (oldContent.obstacleOpacity !== content.obstacleOpacity) {
        this._obstacleOpacity = content.obstacleOpacity;
        needsUpdate = true;
      }
      if (oldContent.useObjectShape !== content.useObjectShape) {
        this._useObjectShape = content.useObjectShape;
        needsUpdate = true;
      }
      if (oldContent.autoDetectBounds !== content.autoDetectBounds) {
        this._autoDetectBounds = content.autoDetectBounds;
        needsUpdate = true;
      }

      if (needsUpdate) {
        this._renderer.update();
      }

      return true;
    }

    override getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): MapNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        w: this._width,
        h: this._height,
        z: this._zoom,
        vis: this._visible,
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: MapNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.w !== undefined) {
        this._width = networkSyncData.w;
      }
      if (networkSyncData.h !== undefined) {
        this._height = networkSyncData.h;
      }
      if (networkSyncData.z !== undefined) {
        this._zoom = networkSyncData.z;
      }
      if (networkSyncData.vis !== undefined) {
        this._visible = networkSyncData.vis;
        this._renderer.updateVisibility();
      }
    }

    override extraInitializationFromInitialInstance(
      initialInstanceData: InstanceData
    ): void {
      if (initialInstanceData.customSize) {
        this._width = Math.max(1, initialInstanceData.width);
        this._height = Math.max(1, initialInstanceData.height);
        this._hasCustomSize = true;
      }
    }

    override onCreated(): void {
      // Auto-detect bounds on creation if enabled
      if (this._autoDetectBounds) {
        this._detectBounds();
      }
    }

    override onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    /**
     * Called once during the game loop, before events and rendering.
     * @param instanceContainer The container the object belongs to.
     */
    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      // Auto-detect bounds if needed
      if (this._autoDetectBounds && !this._boundsDetected) {
        this._detectBounds();
      }

      // Update renderer
      this._renderer.update();
    }

    /**
     * Detect level bounds automatically from layer size and tracked objects.
     * @internal
     */
    _detectBounds(): void {
      const layer = this.getInstanceContainer().getLayer(this.getLayer());

      // Get camera bounds as a starting point
      const cameraMinX = layer.getCameraX() - layer.getCameraWidth() / 2;
      const cameraMinY = layer.getCameraY() - layer.getCameraHeight() / 2;
      const cameraMaxX = layer.getCameraX() + layer.getCameraWidth() / 2;
      const cameraMaxY = layer.getCameraY() + layer.getCameraHeight() / 2;

      // Expand bounds to include all objects with markers
      let minX = cameraMinX;
      let minY = cameraMinY;
      let maxX = cameraMaxX;
      let maxY = cameraMaxY;

      const allObjects = this.getInstanceContainer().getAdhocListOfAllInstances();
      for (const obj of allObjects) {
        const behavior = obj.getBehavior('MapMarker');

        if (behavior) {
          const x = obj.getX();
          const y = obj.getY();
          const width = obj.getWidth();
          const height = obj.getHeight();

          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + width);
          maxY = Math.max(maxY, y + height);
        }
      }

      // Add some padding
      const padding = 100;
      this._boundsMinX = minX - padding;
      this._boundsMinY = minY - padding;
      this._boundsMaxX = maxX + padding;
      this._boundsMaxY = maxY + padding;

      this._boundsDetected = true;
    }

    /**
     * Convert world coordinates to map coordinates.
     * @param worldX The world X coordinate.
     * @param worldY The world Y coordinate.
     * @returns A tuple containing the map X and Y coordinates.
     */
    worldToMap(worldX: number, worldY: number): [number, number] {
      if (this._mode === 'Minimap') {
        const playerCenter = this._getPlayerCenter();
        const dx = worldX - playerCenter[0];
        const dy = worldY - playerCenter[1];
        const cx = this._width / 2;
        const cy = this._height / 2;
        return [cx + dx * this._zoom, cy + dy * this._zoom];
      }
      const worldWidth = this._boundsMaxX - this._boundsMinX;
      const worldHeight = this._boundsMaxY - this._boundsMinY;
      if (worldWidth <= 0 || worldHeight <= 0) {
        return [0, 0];
      }

      const normalizedX = (worldX - this._boundsMinX) / worldWidth;
      const normalizedY = (worldY - this._boundsMinY) / worldHeight;

      const mapX = normalizedX * this._width;
      const mapY = normalizedY * this._height;

      return [mapX, mapY];
    }

    /**
     * Get all tracked objects with MapMarker behavior.
     * @returns An array of tracked runtime objects.
     */
    getTrackedObjects(): gdjs.RuntimeObject[] {
      const tracked: gdjs.RuntimeObject[] = [];
      const allObjects = this.getInstanceContainer().getAdhocListOfAllInstances();

      for (const obj of allObjects) {
        const markerBehavior = this._getMapMarkerBehavior(obj);
        if (markerBehavior && markerBehavior.isVisibleOnMap()) {
          tracked.push(obj);
        }
      }

      // Sort so that higher-priority markers (e.g., Player) are rendered last and appear on top.
      tracked.sort((a, b) => {
        const pa = this._getMarkerPriorityFor(a);
        const pb = this._getMarkerPriorityFor(b);
        return pa - pb;
      });

      return tracked;
    }

    /**
     * Get the MapMarker behavior from an object by type.
     * @param obj The object to get the behavior from.
     * @returns The MapMarkerRuntimeBehavior or null if not found.
     * @internal
     */
    _getMapMarkerBehavior(obj: gdjs.RuntimeObject): gdjs.MapMarkerRuntimeBehavior | null {
      const runtimeObj = obj as any;
      // Search by type in _behaviorsTable (contains all behaviors by name)
      if (runtimeObj._behaviorsTable && runtimeObj._behaviorsTable.items) {
        for (const key in runtimeObj._behaviorsTable.items) {
          const behavior = runtimeObj._behaviorsTable.items[key];
          if (behavior && behavior.type === 'Map::MapMarker') {
            return behavior as unknown as gdjs.MapMarkerRuntimeBehavior;
          }
        }
      }
      return null;
    }

    // ===== PUBLIC API =====

    // (Removed legacy show/hide/toggle visibility API)

    /**
     * Set the map visibility.
     * @param visible True to show, false to hide.
     */
    setVisible(visible: boolean): void {
      this._visible = !!visible;
      this._renderer.updateVisibility();
    }

    /**
     * Get player center position if available; otherwise use camera center.
     * @internal
     */
    _getPlayerCenter(): [number, number] {
      const tracked = this.getTrackedObjects();
      for (const obj of tracked) {
        const markerBehavior = this._getMapMarkerBehavior(obj);
        if (markerBehavior && markerBehavior.getMarkerType() === 'Player') {
          return [obj.getCenterXInScene(), obj.getCenterYInScene()];
        }
      }
      const layer = this.getInstanceContainer().getLayer(this.getLayer());
      return [layer.getCameraX(), layer.getCameraY()];
    }

    /**
     * Check if the map is visible.
     * @returns True if the map is visible.
     */
    isVisible(): boolean {
      return this._visible;
    }

    /**
     * Zoom in the map.
     */
    zoomIn(): void {
      this._zoom = Math.min(1.0, this._zoom + 0.05);
    }

    /**
     * Zoom out the map.
     */
    zoomOut(): void {
      this._zoom = Math.max(0.01, this._zoom - 0.05);
    }

    /**
     * Set the zoom level of the map.
     * @param zoom The zoom level (0.01 to 1.0).
     */
    setZoom(zoom: number): void {
      this._zoom = Math.max(0.01, Math.min(1.0, zoom));
    }

    /**
     * Get the current zoom level.
     * @returns The zoom level.
     */
    getZoomLevel(): number {
      return this._zoom;
    }

    /**
     * Set the position of the map on screen.
     * @param x The X position.
     * @param y The Y position.
     */
    setPosition(x: number, y: number): void {
      this.setX(x);
      this.setY(y);
    }

    /**
     * Set the size of the map (both width and height).
     * @param size The size in pixels.
     */
    setSize(size: number): void {
      const clamped = Math.max(50, size);
      this._width = clamped;
      this._height = clamped;
      this._hasCustomSize = true;
      this._renderer.update();
    }

    /**
     * Set the default player marker color for this map.
     * @param color The color in "R;G;B" format.
     */
    setPlayerColor(color: string): void {
      this._playerColor = color;
      this._renderer.update();
    }

    /**
     * Set the default enemy marker color for this map.
     * @param color The color in "R;G;B" format.
     */
    setEnemyColor(color: string): void {
      this._enemyColor = color;
      this._renderer.update();
    }

    /**
     * Set the default item marker color for this map.
     * @param color The color in "R;G;B" format.
     */
    setItemColor(color: string): void {
      this._itemColor = color;
      this._renderer.update();
    }

    /**
     * Set the default obstacle color for this map.
     * @param color The color in "R;G;B" format.
     */
    setObstacleColor(color: string): void {
      this._obstacleColor = color;
      this._renderer.update();
    }

    /**
     * Set the width of the map.
     * @param width The width in pixels.
     */
    override setWidth(width: number): void {
      this._width = Math.max(1, width);
      this._hasCustomSize = true;
      this._renderer.update();
    }

    /**
     * Set the height of the map.
     * @param height The height in pixels.
     */
    override setHeight(height: number): void {
      this._height = Math.max(1, height);
      this._hasCustomSize = true;
      this._renderer.update();
    }

    /**
     * Get the width of the map.
     * @returns The width in pixels.
     */
    override getWidth(): number {
      return this._width;
    }

    /**
     * Get the height of the map.
     * @returns The height in pixels.
     */
    override getHeight(): number {
      return this._height;
    }

    /**
     * Get the number of tracked objects.
     * @param markerType Optional marker type to filter by.
     * @returns The number of tracked objects.
     */
    getTrackedCount(markerType?: string): number {
      const tracked = this.getTrackedObjects();

      if (!markerType) {
        return tracked.length;
      }

      let count = 0;
      for (const obj of tracked) {
        const markerBehavior = this._getMapMarkerBehavior(obj);
        if (markerBehavior && markerBehavior.getMarkerType() === markerType) {
          count++;
        }
      }

      return count;
    }

    // Getters for renderer

    /**
     * Get the size (maximum of width and height).
     * @returns The size in pixels.
     */
    getSize(): number {
      return Math.max(this._width, this._height);
    }

    /**
     * Get the zoom level.
     * @returns The zoom level.
     */
    getZoom(): number {
      return this._zoom;
    }

    /**
     * Check if the map stays on screen.
     * @returns True if the map stays on screen.
     */
    getStayOnScreen(): boolean {
      return this._stayOnScreen;
    }

    /**
     * Get the map shape.
     * @returns The shape ('Rectangle' or 'Circle').
     */
    getShape(): string {
      return this._shape;
    }

    /**
     * Get the map mode.
     * @returns The map mode ('Minimap' or 'WorldMap').
     */
    getMode(): string {
      return this._mode;
    }

    /**
     * Get the background image resource name.
     * @returns The background image resource name.
     */
    getBackgroundImage(): string {
      return this._backgroundImage;
    }

    /**
     * Get the frame image resource name.
     * @returns The frame image resource name.
     */
    getFrameImage(): string {
      return this._frameImage;
    }

    /**
     * Get the background color.
     * @returns The background color in "R;G;B" format.
     */
    getBackgroundColor(): string {
      return this._backgroundColor;
    }

    /**
     * Get the background opacity.
     * @returns The background opacity (0-1).
     */
    getBackgroundOpacity(): number {
      return this._backgroundOpacity;
    }

    /**
     * Get the border color.
     * @returns The border color in "R;G;B" format.
     */
    getBorderColor(): string {
      return this._borderColor;
    }

    /**
     * Get the border width.
     * @returns The border width in pixels.
     */
    getBorderWidth(): number {
      return this._borderWidth;
    }

    /**
     * Get the player marker image resource name.
     * @returns The player marker image resource name.
     */
    getPlayerMarkerImage(): string {
      return this._playerMarkerImage;
    }

    /**
     * Get the player marker color.
     * @returns The player marker color in "R;G;B" format.
     */
    getPlayerColor(): string {
      return this._playerColor;
    }

    /**
     * Get the player marker size.
     * @returns The player marker size in pixels.
     */
    getPlayerSize(): number {
      return this._playerSize;
    }

    /**
     * Get the enemy marker image resource name.
     * @returns The enemy marker image resource name.
     */
    getEnemyMarkerImage(): string {
      return this._enemyMarkerImage;
    }

    /**
     * Get the enemy marker color.
     * @returns The enemy marker color in "R;G;B" format.
     */
    getEnemyColor(): string {
      return this._enemyColor;
    }

    /**
     * Get the enemy marker size.
     * @returns The enemy marker size in pixels.
     */
    getEnemySize(): number {
      return this._enemySize;
    }

    /**
     * Get the item marker image resource name.
     * @returns The item marker image resource name.
     */
    getItemMarkerImage(): string {
      return this._itemMarkerImage;
    }

    /**
     * Get the item marker color.
     * @returns The item marker color in "R;G;B" format.
     */
    getItemColor(): string {
      return this._itemColor;
    }

    /**
     * Get the item marker size.
     * @returns The item marker size in pixels.
     */
    getItemSize(): number {
      return this._itemSize;
    }

    /**
     * Check if obstacles are shown on the map.
     * @returns True if obstacles are shown.
     */
    getShowObstacles(): boolean {
      return this._showObstacles;
    }

    /**
     * Get the obstacle color.
     * @returns The obstacle color in "R;G;B" format.
     */
    getObstacleColor(): string {
      return this._obstacleColor;
    }

    /**
     * Get the obstacle opacity.
     * @returns The obstacle opacity (0-1).
     */
    getObstacleOpacity(): number {
      return this._obstacleOpacity;
    }

    /**
     * Check if object shape is used for obstacles.
     * @returns True if object shape is used.
     */
    getUseObjectShape(): boolean {
      return this._useObjectShape;
    }

    /**
     * Compute a priority for a marker type to control draw order.
     * Lower priority renders first; higher renders later (on top).
     * @internal
     */
    _getMarkerPriorityFor(obj: gdjs.RuntimeObject): number {
      const markerBehavior = this._getMapMarkerBehavior(obj);
      if (markerBehavior) {
        // Check if the method exists before calling it
        if (typeof markerBehavior.getMarkerType !== 'function') {
          return 0;
        }
        const type = markerBehavior.getMarkerType();
        switch (type) {
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
      return 0;
    }
  }

  gdjs.registerObject('Map::Map', gdjs.MapRuntimeObject);
}
