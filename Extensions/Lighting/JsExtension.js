// @flow
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
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

    const lightObstacleBehavior = new gd.BehaviorJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    lightObstacleBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      return false;
    };

    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    lightObstacleBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      return behaviorProperties;
    };

    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    lightObstacleBehavior.initializeContent = function (behaviorContent) {};
    extension
      .addBehavior(
        'LightObstacleBehavior',
        _('Light Obstacle Behavior'),
        'LightObstacleBehavior',
        _(
          'This behavior makes the object an obstacle to the light. The light emitted by light objects will be stopped by the object.'
        ),
        '',
        'CppPlatform/Extensions/lightObstacleIcon32.png',
        'LightObstacleBehavior',
        lightObstacleBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/Lighting/lightobstacleruntimebehavior.js')
      .addIncludeFile('Extensions/Lighting/lightruntimeobject.js')
      .addIncludeFile(
        'Extensions/Lighting/lightruntimeobject-pixi-renderer.js'
      );

    const lightObject = new gd.ObjectJsImplementation();

    // $FlowExpectedError - ignore Flow warning as we're creating an object.
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

    // $FlowExpectedError - ignore Flow warning as we're creating an object.
    lightObject.getProperties = function (objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

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
          .setDescription(
            _(
              'When activated, display the lines used to render the light - useful to understand how the light is rendered on screen.'
            )
          )
      );

      objectProperties
        .getOrCreate('texture')
        .setValue(objectContent.texture)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Light texture (optional)'))
        .setDescription(
          _(
            "A texture to be used to display the light. If you don't specify a texture, the light is rendered as fading from bright, in its center, to dark."
          )
        );

      return objectProperties;
    };
    lightObject.setRawJSONContent(
      JSON.stringify({
        radius: 50,
        color: '#ffffff',
        debugMode: false,
        texture: '',
      })
    );

    // $FlowExpectedError - ignore Flow warning as we're creating an object.
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

    // $FlowExpectedError - ignore Flow warning as we're creating an object.
    lightObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'LightObject',
        _('Light'),
        _(
          'Displays a light on the scene, with a customizable radius and color. Add then the Light Obstacle behavior to the objects that must act as obstacle to the lights.'
        ),
        'CppPlatform/Extensions/lightIcon32.png',
        lightObject
      )
      .setIncludeFile('Extensions/Lighting/lightruntimeobject.js')
      .addIncludeFile('Extensions/Lighting/lightruntimeobject-pixi-renderer.js')
      .addIncludeFile('Extensions/Lighting/lightobstacleruntimebehavior.js');

    object
      .addAction(
        'SetRadius',
        _('Set the radius of light object'),
        _('Set the radius of light object'),
        _('Set the radius of _PARAM0_ to: _PARAM1_'),
        '',
        'CppPlatform/Extensions/lightIcon24.png',
        'CppPlatform/Extensions/lightIcon16.png'
      )
      .addParameter('object', _('Object'), 'LightObject', false)
      .addParameter('expression', _('Radius'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setRadius');

    object
      .addAction(
        'SetColor',
        _('Set the color of light object'),
        _('Set the color of light object in format "R;G;B" string.'),
        _('Set the color of _PARAM0_ to: _PARAM1_'),
        '',
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Object'), 'LightObject', false)
      .addParameter('string', _('Color'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setColor');

    return extension;
  },

  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },

  registerEditorConfigurations: function (
    objectsEditorService /*: ObjectsEditorService */
  ) {
    objectsEditorService.registerEditorConfiguration(
      'Lighting::LightObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/light',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /**
     * Renderer for instances of LightObject inside the IDE.
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
      if (this._radius <= 0) this._radius = 1;
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

      const geometry = new PIXI.Geometry();
      const shader = PIXI.Shader.from(
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

      this._vertexBuffer = new Float32Array([
        this._instance.getX() - this._radius,
        this._instance.getY() + this._radius,
        this._instance.getX() + this._radius,
        this._instance.getY() + this._radius,
        this._instance.getX() + this._radius,
        this._instance.getY() - this._radius,
        this._instance.getX() - this._radius,
        this._instance.getY() - this._radius,
      ]);

      geometry
        .addAttribute('aVertexPosition', this._vertexBuffer, 2)
        .addIndex([0, 1, 2, 2, 3, 0]);

      this._pixiObject = new PIXI.Mesh(geometry, shader);
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

      this._vertexBuffer[0] = this._instance.getX() - this._radius;
      this._vertexBuffer[1] = this._instance.getY() + this._radius;
      this._vertexBuffer[2] = this._instance.getX() + this._radius;
      this._vertexBuffer[3] = this._instance.getY() + this._radius;
      this._vertexBuffer[4] = this._instance.getX() + this._radius;
      this._vertexBuffer[5] = this._instance.getY() - this._radius;
      this._vertexBuffer[6] = this._instance.getX() - this._radius;
      this._vertexBuffer[7] = this._instance.getY() - this._radius;

      this._pixiObject.geometry
        .getBuffer('aVertexPosition')
        .update(this._vertexBuffer);
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
