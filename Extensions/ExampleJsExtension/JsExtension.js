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
      'MyDummyExtension',
      _('My Dummy Extension'),
      _('An example of a declaration of an extension'),
      'Florian Rival',
      'MIT'
    );

    // Register Properties
    extension
      .registerProperty('DummyPropertyString')
      .setLabel(_('Dummy Property Name'))
      .setDescription('Type in anything :)')
      .setType('string');

    extension
      .registerProperty('DummyPropertyNumber')
      .setLabel(_('Dummy Numeric Property Name'))
      .setDescription('Only numbers here ;)')
      .setType('number');

    extension
      .registerProperty('DummyPropertyBoolean')
      .setDescription(_('A boolean property'))
      .setType('boolean');

    // Register Cordova/NPM dependencies
    extension
      .addDependency()
      .setName('Thirteen Checker')
      .setDependencyType('npm')
      .setExportName('is-thirteen')
      .setVersion('2.0.0');

    // Declare effects:
    const dummyEffect = extension
      .addEffect('DummyEffect')
      .setFullName(_('Dummy effect example'))
      .setDescription(
        _(
          'This is an example of an effect ("shader") with an [external link to the wiki](http://wiki.compilgames.net/doku.php/gdevelop5/) and **bold letters**.'
        )
      )
      .addIncludeFile('Extensions/ExampleJsExtension/dummyeffect.js');
    const dummyEffectProperties = dummyEffect.getProperties();
    dummyEffectProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel(_('Opacity of the effect (between 0 and 1)'))
      .setType('number')
      .setDescription(_('This is an optional description.'));
    dummyEffectProperties
      .getOrCreate('someImage')
      .setValue('')
      .setLabel(
        _("Image resource (won't be used, just for demonstration purpose)")
      )
      .setType('resource')
      .addExtraInfo('image');
    dummyEffectProperties
      .getOrCreate('someColor')
      .setValue('#0022FF')
      .setLabel(_("Color (won't be used, just for demonstration purpose)"))
      .setType('color')
      .setDescription(_('Another optional description.'));
    dummyEffectProperties
      .getOrCreate('someBoolean')
      .setValue('true')
      .setLabel(_('Some setting to enable or not for the effect'))
      .setType('boolean')
      .setDescription(_('And some *optional* description.'));

    // Declare conditions, actions or expressions:
    extension
      .addCondition(
        'MyNewCondition',
        _('Dummy condition example'),
        _(
          'This is an example of a condition displayed in the events sheet. Will return true if the number is less than 10 and the length of the text is less than 5.'
        ),
        _('Call the example condition with _PARAM0_ and _PARAM1_'),
        _('Dummy Extension'),
        'res/conditions/camera24.png',
        'res/conditions/camera.png'
      )
      .addParameter('expression', _('Number 1'), '', false)
      .addParameter('string', _('Text 1'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/ExampleJsExtension/examplejsextensiontools.js'
      )
      .setFunctionName('gdjs.evtTools.exampleJsExtension.myConditionFunction');

    extension
      .addExpression(
        'DummyExpression',
        _('Dummy expression example'),
        _('This is an example of an expression'),
        _('Dummy Extension'),
        'res/actions/camera.png'
      )
      .addParameter('expression', _('Maximum'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.random');

    extension
      .addStrExpression(
        'DummyStrExpression',
        _('Dummy string expression example'),
        _('This is an example of an expression returning a string'),
        _('Dummy Extension'),
        'res/actions/camera.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/ExampleJsExtension/examplejsextensiontools.js'
      )
      .setFunctionName('gdjs.evtTools.exampleJsExtension.getString');

    // Declare a behavior.
    // Create a new gd.BehaviorJsImplementation object and implement the methods
    // that are called to get and set the properties of the behavior.
    // Everything that is stored inside the behavior is in "behaviorContent" and is automatically
    // saved/loaded to JSON.
    const dummyBehavior = new gd.BehaviorJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    dummyBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      console.log("updateProperty: " + propertyName);
      if (propertyName === 'My first property') {
        behaviorContent.setStringAttribute('property1', newValue);
        return true;
      }
      if (propertyName === 'My other property') {
        behaviorContent.setBoolAttribute('property2', newValue === '1');
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    dummyBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('My first property')
        .setValue(behaviorContent.getStringAttribute('property1'));
      behaviorProperties
        .getOrCreate('My other property')
        .setValue(
          behaviorContent.getBoolAttribute('property2') ? 'true' : 'false'
        )
        .setType('Boolean');

      return behaviorProperties;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    dummyBehavior.initializeContent = function (behaviorContent) {
      behaviorContent.setStringAttribute('property1', 'Initial value 1');
      behaviorContent.setBoolAttribute('property2', true);
    };
    extension
      .addBehavior(
        'DummyBehavior',
        _('Dummy behavior for testing'),
        'DummyBehavior',
        _('This dummy behavior does nothing'),
        '',
        'CppPlatform/Extensions/topdownmovementicon.png',
        'DummyBehavior',
        dummyBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/ExampleJsExtension/dummyruntimebehavior.js')
      // You can optionally include more than one file when the behavior is used:
      .addIncludeFile(
        'Extensions/ExampleJsExtension/examplejsextensiontools.js'
      );

    // Declare another behavior, with shared data between the behaviors
    // In addition to the usual behavior:
    // Create a new gd.BehaviorSharedDataJsImplementation object and implement the methods
    // that are called to get and set the properties of the shared data.
    var dummyBehaviorWithSharedData = new gd.BehaviorJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    dummyBehaviorWithSharedData.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'My behavior property') {
        behaviorContent.setStringAttribute('property1', newValue);
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    dummyBehaviorWithSharedData.getProperties = function (behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('My behavior property')
        .setValue(behaviorContent.getStringAttribute('property1'));

      return behaviorProperties;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    dummyBehaviorWithSharedData.initializeContent = function (behaviorContent) {
      behaviorContent.setStringAttribute('property1', 'Initial value 1');
    };

    var sharedData = new gd.BehaviorSharedDataJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    sharedData.updateProperty = function (
      sharedContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'My shared property') {
        sharedContent.setStringAttribute('sharedProperty1', newValue);
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    sharedData.getProperties = function (sharedContent) {
      var sharedProperties = new gd.MapStringPropertyDescriptor();

      sharedProperties
        .getOrCreate('My shared property')
        .setValue(sharedContent.getStringAttribute('sharedProperty1'));

      return sharedProperties;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    sharedData.initializeContent = function (behaviorContent) {
      behaviorContent.setStringAttribute(
        'sharedProperty1',
        'Initial shared value 1'
      );
    };

    extension
      .addBehavior(
        'DummyBehaviorWithSharedData',
        _('Dummy behavior with shared data for testing'),
        'DummyBehaviorWithSharedData',
        _('This dummy behavior uses shared data and does nothing'),
        '',
        'CppPlatform/Extensions/topdownmovementicon.png',
        'DummyBehaviorWithSharedData',
        dummyBehaviorWithSharedData,
        sharedData
      )
      .setIncludeFile(
        'Extensions/ExampleJsExtension/dummywithshareddataruntimebehavior.js'
      )
      // You can optionally include more than one file when the behavior is used:
      .addIncludeFile(
        'Extensions/ExampleJsExtension/examplejsextensiontools.js'
      );

    // Declare an object.
    // Create a new gd.ObjectJsImplementation object and implement the methods
    // that are called to get and set the properties of the object, as well
    // as the properties of the initial instances of this object
    // Everything that is stored inside the object is in "content" and is automatically
    // saved/loaded to JSON.
    var dummyObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    dummyObject.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'My first property') {
        objectContent.property1 = newValue;
        return true;
      }
      if (propertyName === 'My other property') {
        objectContent.property2 = newValue === '1';
        return true;
      }
      if (propertyName === 'My third property') {
        objectContent.property3 = newValue;
        return true;
      }
      if (propertyName === 'myImage') {
        objectContent.myImage = newValue;
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    dummyObject.getProperties = function (objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('My first property')
        .setValue(objectContent.property1);
      objectProperties
        .getOrCreate('My other property')
        .setValue(objectContent.property2 ? 'true' : 'false')
        .setType('boolean');
      objectProperties
        .getOrCreate('My third property')
        .setValue(objectContent.property3.toString())
        .setType('number');
      objectProperties
        .getOrCreate('myImage')
        .setValue(objectContent.myImage)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(
          _("Image resource (won't be shown, just for demonstration purpose)")
        );

      return objectProperties;
    };
    dummyObject.setRawJSONContent(
      JSON.stringify({
        property1: 'Hello world',
        property2: true,
        property3: 123,
        myImage: '',
      })
    );

    // $FlowExpectedError - ignore Flow warning as we're creating an object
    dummyObject.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      if (propertyName === 'My instance property') {
        instance.setRawStringProperty('instanceprop1', newValue);
        return true;
      }
      if (propertyName === 'My other instance property') {
        instance.setRawDoubleProperty('instanceprop2', parseFloat(newValue));
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    dummyObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();

      instanceProperties
        .getOrCreate('My instance property')
        .setValue(instance.getRawStringProperty('instanceprop1'));
      instanceProperties
        .getOrCreate('My other instance property')
        .setValue(instance.getRawDoubleProperty('instanceprop2').toString())
        .setType('number');

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'DummyObject',
        _('Dummy object for testing'),
        _('This dummy object does nothing'),
        'CppPlatform/Extensions/topdownmovementicon.png',
        dummyObject
      )
      .setIncludeFile('Extensions/ExampleJsExtension/dummyruntimeobject.js')
      .addIncludeFile(
        'Extensions/ExampleJsExtension/dummyruntimeobject-pixi-renderer.js'
      );

    object
      .addAction(
        'MyMethod',
        _('Display a dummy text in Developer console'),
        _(
          'Display a dummy text in Developer console. Open it with CTRL-SHIFT-J (Cmd-Alt-J on macOS).'
        ),
        _('Display a dummy text for _PARAM0_, with params: _PARAM1_, _PARAM2_'),
        '',
        'res/conditions/camera24.png',
        'res/conditions/camera.png'
      )
      .addParameter('object', _('Object'), 'DummyObject', false) // This parameter is mandatory for any object action/condition
      .addParameter('expression', _('Number 1'), '', false)
      .addParameter('string', _('Text 1'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('myMethod');

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
    const dummyBehavior = extension
      .getBehaviorMetadata('MyDummyExtension::DummyBehavior')
      .get();
    const sharedData = extension
      .getBehaviorMetadata('MyDummyExtension::DummyBehaviorWithSharedData')
      .getSharedDataInstance();
    return [
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        dummyBehavior,
        'My first property',
        'Testing value'
      ),
      gd.ProjectHelper.sanityCheckBehaviorsSharedDataProperty(
        sharedData,
        'My shared property',
        'Testing value'
      ),
    ];
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
      'MyDummyExtension::DummyObject',
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
      this._pixiObject = new PIXI.Text('This is a dummy object', {
        align: 'left',
      });
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
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
      return 'CppPlatform/Extensions/texticon24.png';
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedDummyObjectInstance.prototype.update = function () {
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
    RenderedDummyObjectInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedDummyObjectInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      'MyDummyExtension::DummyObject',
      RenderedDummyObjectInstance
    );
  },
};
