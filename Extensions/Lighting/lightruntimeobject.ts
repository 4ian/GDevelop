namespace gdjs {
  export type LightObjectDataType = {
    /** The base parameters of light object. */
    content: {
      /** The radius of light object. */
      radius: number;
      /** A string representing color in hexadecimal format. */
      color: string;
      /** A string representing the name of texture used for light object. */
      texture: string;
      /** true if the light objects shows debug graphics, false otherwise. */
      debugMode: boolean;
    };
  };

  export type LightObjectData = ObjectData & LightObjectDataType;

  /**
   * Displays a Light object.
   */
  export class LightRuntimeObject extends gdjs.RuntimeObject {
    _radius: number;

    /** color in format [r, g, b], where each component is in the range [0, 255] */
    _color: integer[];
    _debugMode: boolean;
    _texture: string;
    _obstaclesManager: gdjs.LightObstaclesManager;
    _renderer: gdjs.LightRuntimeObjectRenderer;
    _instanceContainer: gdjs.RuntimeScene;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      lightObjectData: LightObjectData
    ) {
      super(runtimeScene, lightObjectData);
      this._radius =
        lightObjectData.content.radius > 0 ? lightObjectData.content.radius : 1;
      this._color = gdjs.rgbOrHexToRGBColor(lightObjectData.content.color);
      this._debugMode = lightObjectData.content.debugMode;
      this._texture = lightObjectData.content.texture;
      this._obstaclesManager = gdjs.LightObstaclesManager.getManager(
        runtimeScene
      );
      this._renderer = new gdjs.LightRuntimeObjectRenderer(this, runtimeScene);
      this._instanceContainer = runtimeScene;

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    static hexToRGBColor(hex) {
      const hexNumber = parseInt(hex.replace('#', ''), 16);
      return [(hexNumber >> 16) & 255, (hexNumber >> 8) & 255, hexNumber & 255];
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updateFromObjectData(
      oldObjectData: LightObjectData,
      newObjectData: LightObjectData
    ): boolean {
      if (oldObjectData.content.radius !== newObjectData.content.radius) {
        this.setRadius(newObjectData.content.radius);
      }
      if (oldObjectData.content.color !== newObjectData.content.color) {
        this._color = gdjs.rgbOrHexToRGBColor(newObjectData.content.color);
        this._renderer.updateColor();
      }
      if (oldObjectData.content.texture !== newObjectData.content.texture) {
        this._texture = newObjectData.content.texture;
        this._renderer.updateMesh();
      }
      if (oldObjectData.content.debugMode !== newObjectData.content.debugMode) {
        this._debugMode = newObjectData.content.debugMode;
        this._renderer.updateDebugMode();
      }
      return true;
    }

    updatePreRender(): void {
      this._renderer.ensureUpToDate();
    }

    /**
     * Get the radius of the light object.
     * @returns radius of the light object.
     */
    getRadius(): number {
      return this._radius;
    }

    /**
     * Set the radius of the light object.
     */
    setRadius(radius: number): void {
      this._radius = radius > 0 ? radius : 1;
      this._renderer.updateRadius();
    }

    /**
     * Get the height of the light object.
     * @returns height of light object.
     */
    getHeight(): float {
      return 2 * this._radius;
    }

    /**
     * Get the width of the light object.
     * @returns width of light object.
     */
    getWidth(): float {
      return 2 * this._radius;
    }

    /**
     * Get the x co-ordinate of the top-left vertex/point of light object.
     * @returns x co-ordinate of the top-left vertex/point.
     */
    getDrawableX(): float {
      return this.x - this._radius;
    }

    /**
     * Get the y co-ordinate of the top-left vertex/point of light object.
     * @returns y co-ordinate of the top-left vertex/point.
     */
    getDrawableY(): float {
      return this.y - this._radius;
    }

    /**
     * Get the color of the light object as a "R;G;B" string.
     * @returns the color of light object in "R;G;B" format.
     */
    getColor(): string {
      return this._color[0] + ';' + this._color[1] + ';' + this._color[2];
    }

    /**
     * Set the color of the light object in format "R;G;B" string, with components in the range of [0-255].
     */
    setColor(color: string): void {
      this._color = gdjs.rgbOrHexToRGBColor(color);
      this._renderer.updateColor();
    }

    /**
     * Get the light obstacles manager.
     * @returns the light obstacles manager.
     */
    getObstaclesManager(): gdjs.LightObstaclesManager {
      return this._obstaclesManager;
    }

    /**
     * Returns true if the light shows debug graphics, false otherwise.
     * @returns true if debug mode is activated.
     */
    getDebugMode(): boolean {
      return this._debugMode;
    }

    /**
     * Returns the path of texture resource.
     * @returns the path of texture.
     */
    getTexture(): string {
      return this._texture;
    }
  }
  gdjs.registerObject('Lighting::LightObject', gdjs.LightRuntimeObject);
}
