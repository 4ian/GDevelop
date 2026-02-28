namespace gdjs {
  /**
   * MapMarker behavior data structure.
   * @category Behaviors > MapMarker
   */
  export type MapMarkerBehaviorData = {
    /** The type of marker (Player, Enemy, Item, etc.) */
    markerType: string;
    /** Custom color in "R;G;B" format */
    customColor: string;
    /** Custom size (0 to use default) */
    customSize: number;
    /** Custom icon resource name */
    customIcon: string;
    /** Whether to show rotation */
    showRotation: boolean;
    /** Whether the marker is visible on the map */
    visibleOnMap: boolean;
  };

  /**
   * Network sync data for MapMarker behavior.
   * @category Behaviors > MapMarker
   */
  export type MapMarkerNetworkSyncDataType = {
    mt: string;
    vis: boolean;
    cc: string;
    cs: number;
  };

  /**
   * MapMarker behavior allows objects to be tracked and displayed on a map.
   * Objects with this behavior will appear as markers on any Map object in the scene.
   * @category Behaviors > MapMarker
   */
  export class MapMarkerRuntimeBehavior extends gdjs.RuntimeBehavior {
    _markerType: string;
    _customColor: string;
    _customSize: number;
    _customIcon: string;
    _showRotation: boolean;
    _visibleOnMap: boolean;

    // Flash effect state
    _isFlashing: boolean = false;
    _flashStartTime: number = 0;
    _flashDuration: number = 0;
    _flashInterval: number = 0.5; // Flash on/off every 0.5 seconds

    /**
     * Create the MapMarker behavior.
     * @param instanceContainer The container the object belongs to.
     * @param behaviorData The behavior data used to initialize the behavior.
     * @param owner The object that owns this behavior.
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: MapMarkerBehaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);

      this._markerType = behaviorData.markerType || 'Player';
      this._customColor = behaviorData.customColor || '255;255;255';
      this._customSize = behaviorData.customSize || 0;
      this._customIcon = behaviorData.customIcon || '';
      this._showRotation = behaviorData.showRotation || false;
      this._visibleOnMap = behaviorData.visibleOnMap !== false;
    }

    override updateFromBehaviorData(
      oldBehaviorData: MapMarkerBehaviorData,
      newBehaviorData: MapMarkerBehaviorData
    ): boolean {
      if (oldBehaviorData.markerType !== newBehaviorData.markerType) {
        this._markerType = newBehaviorData.markerType;
      }
      if (oldBehaviorData.customColor !== newBehaviorData.customColor) {
        this._customColor = newBehaviorData.customColor;
      }
      if (oldBehaviorData.customSize !== newBehaviorData.customSize) {
        this._customSize = newBehaviorData.customSize;
      }
      if (oldBehaviorData.customIcon !== newBehaviorData.customIcon) {
        this._customIcon = newBehaviorData.customIcon;
      }
      if (oldBehaviorData.showRotation !== newBehaviorData.showRotation) {
        this._showRotation = newBehaviorData.showRotation;
      }
      if (
        oldBehaviorData.visibleOnMap !== newBehaviorData.visibleOnMap
      ) {
        this._visibleOnMap = newBehaviorData.visibleOnMap;
      }

      return true;
    }

    override onActivate(): void {
      // Behavior activated - nothing specific to do
    }

    override onDeActivate(): void {
      // Behavior deactivated - nothing specific to do
    }

    override doStepPreEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      // Update flash state
      if (this._isFlashing) {
        const currentTime = instanceContainer.getElapsedTime() / 1000;
        const elapsed = currentTime - this._flashStartTime;

        if (elapsed >= this._flashDuration) {
          this._isFlashing = false;
        }
      }
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      // Nothing to do after events
    }

    // ===== PUBLIC API =====

    /**
     * Show the object on the map.
     */
    showOnMap(): void {
      this._visibleOnMap = true;
    }

    /**
     * Hide the object from the map.
     */
    hideOnMap(): void {
      this._visibleOnMap = false;
    }

    /**
     * Check if the object is visible on the map.
     * @returns True if the object is visible on the map.
     */
    isVisibleOnMap(): boolean {
      return this._visibleOnMap;
    }

    /**
     * Set the marker type.
     * @param type The marker type (Player, Enemy, Item, Ally, Obstacle, Custom).
     */
    setMarkerType(type: string): void {
      this._markerType = type;
    }

    /**
     * Get the marker type.
     * @returns The marker type.
     */
    getMarkerType(): string {
      return this._markerType;
    }

    /**
     * Check if the marker type matches the given type.
     * @param type The type to check against.
     * @returns True if the marker type matches.
     */
    markerTypeIs(type: string): boolean {
      return this._markerType === type;
    }

    /**
     * Set the custom color for the marker.
     * @param color The color in "R;G;B" format.
     */
    setCustomColor(color: string): void {
      this._customColor = color;
    }

    /**
     * Get the custom color for the marker.
     * @returns The color in "R;G;B" format.
     */
    getCustomColor(): string {
      return this._customColor;
    }

    /**
     * Set the custom size for the marker.
     * @param size The size in pixels (0 to use default).
     */
    setCustomSize(size: number): void {
      this._customSize = Math.max(0, size);
    }

    /**
     * Get the custom size for the marker.
     * @returns The size in pixels.
     */
    getCustomSize(): number {
      return this._customSize;
    }

    /**
     * Set the custom icon for the marker.
     * @param icon The icon resource name.
     */
    setCustomIcon(icon: string): void {
      this._customIcon = icon;
    }

    /**
     * Get the custom icon for the marker.
     * @returns The icon resource name.
     */
    getCustomIcon(): string {
      return this._customIcon;
    }

    /**
     * Set whether to show the marker rotation.
     * @param show True to show rotation.
     */
    setShowRotation(show: boolean): void {
      this._showRotation = show;
    }

    /**
     * Check if the marker shows rotation.
     * @returns True if the marker shows rotation.
     */
    getShowRotation(): boolean {
      return this._showRotation;
    }

    /**
     * Start a flash effect on the marker.
     * @param duration The duration of the flash in seconds.
     */
    flash(duration: number): void {
      this._isFlashing = true;
      this._flashStartTime =
        this.owner.getInstanceContainer().getElapsedTime() / 1000;
      this._flashDuration = duration;
    }

    /**
     * Check if the marker is currently flashing.
     * @returns True if the marker is flashing.
     */
    isFlashing(): boolean {
      return this._isFlashing;
    }

    /**
     * Check if the flash should be shown (for alternating on/off display).
     * @returns True if the flash should be shown.
     */
    shouldShowFlash(): boolean {
      if (!this._isFlashing) return true;

      const currentTime =
        this.owner.getInstanceContainer().getElapsedTime() / 1000;
      const elapsed = currentTime - this._flashStartTime;
      const cycle = Math.floor(elapsed / this._flashInterval);

      return cycle % 2 === 0;
    }
  }

  gdjs.registerBehavior(
    'Map::MapMarker',
    gdjs.MapMarkerRuntimeBehavior
  );
}
