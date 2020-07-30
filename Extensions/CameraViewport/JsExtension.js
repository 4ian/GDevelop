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
      'CameraViewport',
      _('Camera Viewport Extension'),
      _('Adds a camera viewport'),
      'Arthur Pacaud (arthuro555)',
      'MIT'
    );

    var cameraViewport = new gd.ObjectJsImplementation();

    // $FlowExpectedError - ignore Flow warning as we're creating an object
    cameraViewport.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'Camera Number') {
        objectContent.cameraId = newValue;
        if(parseInt(newValue) < 0) objectContent.cameraId = "0";
        return true;
      }

      if (propertyName === 'Render Camera Viewports') {
        objectContent.showOtherCameras = newValue === '1' ? true : false;
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    cameraViewport.getProperties = function (objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('Camera Number')
        .setValue(objectContent.cameraId)
        .setType("number");
      
      objectProperties
        .getOrCreate('Render Camera Viewports')
        .setValue(objectContent.showOtherCameras ? 'true' : 'false')
        .setLabel("Should the camera render also cameras? Turning this on might cause a loose of performance.")
        .setType("boolean");

      return objectProperties;
    };
    
    cameraViewport.setRawJSONContent(
      JSON.stringify({
        cameraId: '0',
        showOtherCameras: false,
      })
    );

    // $FlowExpectedError - ignore Flow warning as we're creating an object
    cameraViewport.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };

    // $FlowExpectedError - ignore Flow warning as we're creating an object
    cameraViewport.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      return new gd.MapStringPropertyDescriptor();
    };

    const object = extension
      .addObject(
        'CameraViewport',
        _('Camera viewport'),
        _('Renders a camera'),
        'res/conditions/camera.png',
        cameraViewport
      )
      .setIncludeFile('Extensions/CameraViewport/cameraviewportruntimeobject.js')
      .addIncludeFile(
        'Extensions/CameraViewport/cameraviewportruntimeobject-pixi-renderer.js'
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
      'CameraViewport::CameraViewport',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/all-features/camera',
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
     * Renderer for instances of DummyObject inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedDummyObjectInstance
     * @constructor
     */
    function RenderedDummyObjectInstance(
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
      this._pixiObject = new PIXI.Container();
      this._pixiContainer.addChild(this._pixiObject);

      this._pixiRectangle = new PIXI.Graphics();
      this._pixiRectangle.lineStyle(2, 0xFEEB77, 1);
      this._pixiRectangle.alpha = 0.25;

      this._pixiText = new PIXI.Text("No camera");
      this._pixiText.anchor.x = 0.5;
      this._pixiText.anchor.y = 0.5;

      this._pixiObject.addChild(this._pixiRectangle);
      this._pixiObject.addChild(this._pixiText);

      this.update();
    }
    RenderedDummyObjectInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedDummyObjectInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'res/conditions/camera.png';
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedDummyObjectInstance.prototype.update = function () {
      const width = this._instance.hasCustomSize() ? this._instance.getCustomWidth() : this.getDefaultWidth();
      const height = this._instance.hasCustomSize() ? this._instance.getCustomHeight() : this.getDefaultHeight();

      // Read Camera ID from the object
      const cameraId = this._associatedObject
        .getProperties()
        .get('Camera Number')
        .getValue();
      this._pixiText.text = "Camera " + cameraId;
      if(parseInt(cameraId) === 0) this._pixiText.text = "Main Camera";

      // Read position and angle from the instance
      this._pixiObject.position.x =
        this._instance.getX();
      this._pixiObject.position.y =
        this._instance.getY();
      this._pixiText.position.x =
        width/ 2;
      this._pixiText.position.y =
        height / 2;
      this._pixiText.style.fontSize = (height / 50) * (width / 50);

      this._pixiRectangle.clear();

      this._pixiRectangle.beginFill(0xFFFFFF, 1);
      this._pixiRectangle.drawRect(0, 0, width, height);
      this._pixiRectangle.endFill();
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedDummyObjectInstance.prototype.getDefaultWidth = function () {
      return 250;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedDummyObjectInstance.prototype.getDefaultHeight = function () {
      return 150;
    };

    objectsRenderingService.registerInstanceRenderer(
      'CameraViewport::CameraViewport',
      RenderedDummyObjectInstance
    );
  },
};
