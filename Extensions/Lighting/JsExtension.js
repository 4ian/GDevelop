module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'Lighting',
      _('PIXI Lights'),
      _('Lights using PIXI'),
      'Harsimran Virk',
      'MIT'
    );

    var lightObstacleBehavior = new gd.BehaviorJsImplementation();
    lightObstacleBehavior.updateProperty = function(
      behaviorContent,
      propertyName,
      newValue
    ) {

      return false;
    };
    lightObstacleBehavior.getProperties = function(behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      return behaviorProperties;
    };
    lightObstacleBehavior.initializeContent = function(behaviorContent) {
      behaviorContent.setStringAttribute('property1', 'Initial value 1');
      behaviorContent.setBoolAttribute('property2', true);
    };
    extension
      .addBehavior(
        'LightObstacleBehavior',
        _('Light Obstacle Behavior'),
        'DummyBehavior',
        _('This behavior makes the object an obstacle to light'),
        '',
        'CppPlatform/Extensions/topdownmovementicon.png',
        'LightObstacleBehavior',
        lightObstacleBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/Lighting/lightobstacleruntimebehavior.js')

    var lightObject = new gd.ObjectJsImplementation();

    lightObject.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'Radius') {
        objectContent.radius = newValue;
        return true;
      }

      if (propertyName === 'Color') {
        objectContent.color = newValue;
        return true;
      }

      return false;
    };

    lightObject.getProperties = function (objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        'Radius',
        new gd.PropertyDescriptor(objectContent.radius.toString()).setType(
          'number'
        )
      );

      objectProperties.set(
        'Color',
        new gd.PropertyDescriptor(objectContent.color)
      );

      return objectProperties;
    };
    lightObject.setRawJSONContent(
      JSON.stringify({
        radius: 50,
        color: '180,180,180',
      })
    );

    lightObject.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };
    lightObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'LightObject',
        _('Light Object for testing'),
        _('This is an experimental light object'),
        'CppPlatform/Extensions/topdownmovementicon.png',
        lightObject
      )
      .setIncludeFile('Extensions/Lighting/lightruntimeobject.js')
      .addIncludeFile(
        'Extensions/Lighting/lightruntimeobject-pixi-renderer.js'
      );

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },

  registerEditorConfigurations: function (objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      'Lighting::LightObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/extensions/extend-gdevelop',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /**
     * Renderer for instances of DummyObject inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedLightObjectInstance
     * @constructor
     */
    function RenderedLightObjectInstance(
      project,
      layout,
      instance,
      associatedObject,
      pixiContainer,
      pixiResourcesLoader
    ) {
      RenderedInstance.call(
        this,
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );
      this._radius = parseFloat(
        this._associatedObject
          .getProperties(this.project)
          .get('Radius')
          .getValue()
      );
      this._color = this._associatedObject
        .getProperties(this.project)
        .get('Color')
        .getValue()
        .split(',')
        .map((item) => parseFloat(item) / 255);
      this._geometry = new PIXI.Geometry();
      this._shader = PIXI.Shader.from(
        `
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
    varying vec2 vPos;

    void main() {
        vPos = aVertexPosition;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }`,
        `
    precision mediump float;
    uniform vec2 center;
    uniform float radius;
    uniform vec3 color;
    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vPos;

    void main() {
        float l = length(vPos - center);
        float intensity = 0.0;
        if(l < radius)
          intensity = clamp((radius - l)*(radius - l)/(radius*radius), 0.0, 1.0);
        gl_FragColor = vec4(color*intensity, 1.0);
    }
    `,
        {
          center: [
            this._instance.getX() + this._radius,
            this._instance.getY() + this._radius,
          ],
          radius: this._radius,
          color: this._color,
        }
      );
      this._geometry
        .addAttribute(
          'aVertexPosition',
          [50, 150, 150, 150, 150, 50, 50, 50],
          2
        )
        .addIndex([0, 1, 2, 2, 3, 0]);
      //Setup the PIXI object:
      this._pixiObject = new PIXI.Mesh(this._geometry, this._shader);
      this._pixiObject.blendMode = PIXI.BLEND_MODES.ADD;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
    }
    RenderedLightObjectInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedLightObjectInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'CppPlatform/Extensions/topdownmovementicon.png';
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedLightObjectInstance.prototype.update = function () {
      this._pixiObject.shader.uniforms.center = new Float32Array([
        this._instance.getX() + this._radius,
        this._instance.getY() + this._radius,
      ]);
      this._pixiObject.geometry
        .getBuffer('aVertexPosition')
        .update(
          new Float32Array([
            this._instance.getX(),
            this._instance.getY() + this._radius * 2,
            this._instance.getX() + this._radius * 2,
            this._instance.getY() + this._radius * 2,
            this._instance.getX() + this._radius * 2,
            this._instance.getY(),
            this._instance.getX(),
            this._instance.getY(),
          ])
        );
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedLightObjectInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedLightObjectInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      'Lighting::LightObject',
      RenderedLightObjectInstance
    );
  },
};
