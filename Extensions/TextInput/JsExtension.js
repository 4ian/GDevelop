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
      'TextInput',
      _('Text Input'),
      _('A text field the player can type text in to.'),
      'Florian Rival',
      'MIT'
    );

    const textInputObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    textInputObject.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'initialValue') {
        objectContent.initialValue = newValue;
        return true;
      } else if (propertyName === 'placeholder') {
        objectContent.placeholder = newValue;
        return true;
      } else if (propertyName === 'fontResourceName') {
        objectContent.fontResourceName = newValue;
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    textInputObject.getProperties = function (objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('initialValue')
        .setValue(objectContent.initialValue)
        .setType('string')
        .setLabel(_('Initial value'));

      objectProperties
        .getOrCreate('placeholder')
        .setValue(objectContent.placeholder)
        .setType('string')
        .setLabel(_('Placeholder'));

        objectProperties
          .getOrCreate('fontResourceName')
          .setValue(objectContent.fontResourceName || '')
          .setType('resource')
          .addExtraInfo('font')
          .setLabel(_('Font'));

      return objectProperties;
    };
    textInputObject.setRawJSONContent(
      JSON.stringify({
        initialValue: '',
        fontResourceName: '',
        placeholder: 'Touch to start typing',
      })
    );

    // $FlowExpectedError - ignore Flow warning as we're creating an object
    textInputObject.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      if (propertyName === 'initialValue') {
        instance.setRawStringProperty('initialValue', newValue);
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    textInputObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();

      instanceProperties
        .getOrCreate('initialValue')
        .setValue(instance.getRawStringProperty('initialValue'))
        .setType('string')
        .setLabel(_('Initial value'));

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'TextInputObject',
        _('Text input'),
        _('A text field the player can type text into.'),
        'CppPlatform/Extensions/topdownmovementicon.png', // TODO
        textInputObject
      )
      .setIncludeFile('Extensions/TextInput/textinputruntimeobject.js')
      .addIncludeFile(
        'Extensions/TextInput/textinputruntimeobject-pixi-renderer.js'
      );

    return extension;
  },
  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array.
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function (
    objectsEditorService /*: ObjectsEditorService */
  ) {
    objectsEditorService.registerEditorConfiguration(
      'TextInput::TextInputObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/extensions/extend-gdevelop', // TODO
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

    // TODO: rewrite as a class

    /**
     * Renderer for instances of TextInputObject inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedTextInputObjectInstance
     * @constructor
     */
    function RenderedTextInputObjectInstance(
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

      //Setup the PIXI object:
      this._pixiObject = new PIXI.Text('This is a dummy object', {
        align: 'left',
      });
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
    }
    RenderedTextInputObjectInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedTextInputObjectInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'CppPlatform/Extensions/texticon24.png';
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedTextInputObjectInstance.prototype.update = function () {
      // Read a property from the object
      const property1Value = this._associatedObject
        .getProperties()
        .get('My first property')
        .getValue();
      this._pixiObject.text = property1Value;

      // Read position and angle from the instance
      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
      // Custom size can be read in instance.getCustomWidth() and
      // instance.getCustomHeight()
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedTextInputObjectInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedTextInputObjectInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      'TextInput::TextInputObject',
      RenderedTextInputObjectInstance
    );
  },
};
