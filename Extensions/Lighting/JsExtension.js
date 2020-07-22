module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'Lighting',
      _('Lights'),
      _(
        'Allow to display lights on the screen and mark objects as obstacles for the lights.'
      ),
      'Harsimran Virk',
      'MIT'
    );

    var lightObstacleBehavior = new gd.BehaviorJsImplementation();
    lightObstacleBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      return false;
    };
    lightObstacleBehavior.getProperties = function (behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      return behaviorProperties;
    };
    lightObstacleBehavior.initializeContent = function (behaviorContent) {};
    extension
      .addBehavior(
        'LightObstacleBehavior',
        _('Light Obstacle Behavior'),
        'LightObstacleBehavior',
        _('This behavior makes the object an obstacle to light'),
        '',
        'CppPlatform/Extensions/lightObstacleIcon32.png',
        'LightObstacleBehavior',
        lightObstacleBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/Lighting/lightobstacleruntimebehavior.js');

    var lightObject = new gd.ObjectJsImplementation();

    lightObject.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'radius') {
        objectContent.radius = parseFloat(newValue);
        return true;
      }

      if (propertyName === 'color') {
        objectContent.color = newValue;
        return true;
      }

      if (propertyName === 'debugMode') {
        objectContent.debugMode = newValue === '1';
        return true;
      }

      if (propertyName === 'texture') {
        objectContent.texture = newValue;
        return true;
      }

      return false;
    };

    lightObject.getProperties = function (objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        'radius',
        new gd.PropertyDescriptor(objectContent.radius.toString())
          .setType('number')
          .setLabel(_('Radius'))
      );

      objectProperties.set(
        'color',
        new gd.PropertyDescriptor(objectContent.color)
          .setType('color')
          .setLabel(_('Color'))
      );

      objectProperties.set(
        'debugMode',
        new gd.PropertyDescriptor(objectContent.debugMode ? 'true' : 'false')
          .setType('boolean')
          .setLabel(_('Debug mode'))
      );

      objectProperties
        .getOrCreate('texture')
        .setValue(objectContent.texture)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Image resource'));

      return objectProperties;
    };
    lightObject.setRawJSONContent(
      JSON.stringify({
        radius: 50,
        color: '#b4b4b4',
        debugMode: false,
        texture: '',
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
      // if (propertyName === 'My instance property') {
      //   instance.setRawStringProperty('instanceprop1', newValue);
      //   return true;
      // }

      return false;
    };
    lightObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();

      // instanceProperties
      //   .getOrCreate('My instance property')
      //   .setValue(instance.getRawStringProperty('instanceprop1'));

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'LightObject',
        _('Light'),
        _('An object displaying a light on screen.'),
        'CppPlatform/Extensions/lightIcon32.png',
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
          .get('radius')
          .getValue()
      );
      if(this._radius <= 0) this._radius = 1;
      this._colorHex = parseInt(
        this._associatedObject
          .getProperties(this.project)
          .get('color')
          .getValue()
          .replace('#', ''),
        16
      );
      this._color = [
        ((this._colorHex >> 16) & 0xff) / 255,
        ((this._colorHex >> 8) & 0xff) / 255,
        (this._colorHex & 0xff) / 255,
      ];
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
          center: [this._instance.getX(), this._instance.getY()],
          radius: this._radius,
          color: this._color,
        }
      );
      this._geometry
        .addAttribute(
          'aVertexPosition',
          [
            this._instance.getX() - this._radius,
            this._instance.getY() + this._radius,
            this._instance.getX() + this._radius,
            this._instance.getY() + this._radius,
            this._instance.getX() + this._radius,
            this._instance.getY() - this._radius,
            this._instance.getX() - this._radius,
            this._instance.getY() - this._radius,
          ],
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
      return 'CppPlatform/Extensions/lightIcon32.png';
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedLightObjectInstance.prototype.update = function () {
      this._pixiObject.shader.uniforms.center = new Float32Array([
        this._instance.getX(),
        this._instance.getY(),
      ]);
      this._pixiObject.geometry
        .getBuffer('aVertexPosition')
        .update(
          new Float32Array([
            this._instance.getX() - this._radius,
            this._instance.getY() + this._radius,
            this._instance.getX() + this._radius,
            this._instance.getY() + this._radius,
            this._instance.getX() + this._radius,
            this._instance.getY() - this._radius,
            this._instance.getX() - this._radius,
            this._instance.getY() - this._radius,
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

    RenderedLightObjectInstance.prototype.getOriginX = function () {
      return this._radius;
    };

    RenderedLightObjectInstance.prototype.getOriginY = function () {
      return this._radius;
    };

    objectsRenderingService.registerInstanceRenderer(
      'Lighting::LightObject',
      RenderedLightObjectInstance
    );
  },
};
