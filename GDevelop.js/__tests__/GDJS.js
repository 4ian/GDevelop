const path = require('path');
const {
  makeFakeAbstractFileSystem,
} = require('../TestUtils/FakeAbstractFileSystem');
const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeTestExtensions } = require('../TestUtils/TestExtensions');

describe('libGD.js - GDJS related tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  describe('Exporter', () => {
    // Fake files to simulate a file system (see tests below).
    const fakeIndexHtmlContent = `<html>
  <head>
  <style>
    /* GDJS_CUSTOM_STYLE */
  </style>
  <!-- GDJS_CODE_FILES -->
  <body>
    <!-- GDJS_CUSTOM_HTML -->
  </body>
  </head>
</html>`;
    const fakeConfigXmlContent = `
<widget id="GDJS_PACKAGENAME" version="GDJS_PROJECTVERSION">
  <name>GDJS_PROJECTNAME</name>
  <platform name="android">
<!-- GDJS_ICONS_ANDROID -->
  </platform>
  <platform name="ios">
<!-- GDJS_ICONS_IOS -->
  </platform>
<!-- GDJS_EXTENSION_CORDOVA_DEPENDENCY -->
</widget>`;
    const fakePackageJsonContent = `
{
  "name": "GDJS_GAME_MANGLED_NAME",
  "displayName": "GDJS_GAME_NAME",
  "version": "GDJS_GAME_VERSION",
  "description": "GDJS_GAME_NAME",
  "author": "GDJS_GAME_AUTHOR"
}`;

    it('properly exports HTML5 files', () => {
      // Create a simple project
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setName('My great project with spaces and "quotes"!');
      project.setDescription(
        'A nice project\nwith line breaks in the description.'
      );
      project.setVersion('1.2.3');

      // Prepare a fake file system
      var fs = makeFakeAbstractFileSystem(gd, {
        '/fake-gdjs-root/Runtime/index.html': fakeIndexHtmlContent,
        '/fake-gdjs-root/Runtime/Electron/LICENSE.GDevelop.txt': "",
      });

      // Export and check the content of written files.
      const exporter = new gd.Exporter(fs, '/fake-gdjs-root');
      const exportOptions = new gd.ExportOptions(project, '/fake-export-dir');
      expect(exporter.exportWholePixiProject(exportOptions)).toBe(true);
      exportOptions.delete();
      exporter.delete();

      // Check the index.html contains the include files.
      expect(fs.writeToFile.mock.calls[1][0]).toBe('/fake-export-dir/index.html');
      expect(fs.writeToFile.mock.calls[1][1]).toContain('gd.js');
      expect(fs.writeToFile.mock.calls[1][1]).toContain('affinetransformation.js');
      expect(fs.writeToFile.mock.calls[1][1]).toContain('pixi-renderers/runtimescene-pixi-renderer.js');
      expect(fs.writeToFile.mock.calls[1][1]).toContain('data.js');

      // Check the webmanifest was properly generated.
      expect(fs.writeToFile.mock.calls[2][0]).toBe('/fake-export-dir/manifest.webmanifest');
      expect(() => JSON.parse(fs.writeToFile.mock.calls[2][1])).not.toThrow();
      expect(JSON.parse(fs.writeToFile.mock.calls[2][1])).toEqual({
        "name": "My great project with spaces and \"quotes\"!",
        "short_name": "My great project with spaces and \"quotes\"!",
        "id": "com.example.gamename",
        "description": "A nice project\nwith line breaks in the description.",
        "orientation": "landscape",
        "start_url": "./index.html",
        "display": "standalone",
        "background_color": "black",
        "categories": ["games", "entertainment"],
        "icons": []
      });
    });
    it('properly exports Cordova files', () => {
      // Create a simple project
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setName('My great project with spaces and "quotes" and (parentheses)!');
      project.setVersion('1.2.3');

      // Prepare a fake file system
      var fs = makeFakeAbstractFileSystem(gd, {
        '/fake-gdjs-root/Runtime/Cordova/www/index.html': fakeIndexHtmlContent,
        '/fake-gdjs-root/Runtime/Cordova/config.xml': fakeConfigXmlContent,
        '/fake-gdjs-root/Runtime/Cordova/package.json': fakePackageJsonContent,
        '/fake-gdjs-root/Runtime/Cordova/www/LICENSE.GDevelop.txt': "",
      });

      // Export and check the content of written files.
      const exporter = new gd.Exporter(fs, '/fake-gdjs-root');
      const exportOptions = new gd.ExportOptions(project, '/fake-export-dir');
      exportOptions.setTarget('cordova');
      expect(exporter.exportWholePixiProject(exportOptions)).toBe(true);
      exportOptions.delete();
      exporter.delete();

      expect(fs.writeToFile).toHaveBeenCalledWith(
        '/fake-export-dir/config.xml',
        `
<widget id="com.example.gamename" version="1.2.3">
  <name>My great project with spaces and &quot;quotes&quot; and parentheses!</name>
  <platform name="android">

  </platform>
  <platform name="ios">

  </platform>

</widget>`
      );
      console.dir(fs.writeToFile.mock.calls);
      expect(fs.writeToFile).toHaveBeenCalledWith(
        '/fake-export-dir/package.json',
        `
{
  \"name\": \"my_32great_32project_32with_32spaces_32and_32_34quotes_34_32and_32_40parentheses_41_33\",
  \"displayName\": \"My great project with spaces and \\\"quotes\\\" and (parentheses)!\",
  \"version\": \"1.2.3\",
  \"description\": \"My great project with spaces and \\\"quotes\\\" and (parentheses)!\",
  \"author\": \"\"
}`
      );
    });
    it('properly exports Cordova plugins config if required by an extension', () => {
      // Create a project with some content using the AdMob extension.
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setName('My great project with spaces and "quotes"!');
      project.setVersion('1.2.3');
      project
        .getExtensionProperties()
        .setValue('AdMob', 'AdMobAppIdAndroid', 'my android app id');
      const layout = project.insertNewLayout('Scene', 0);
      const event = layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      const action = new gd.Instruction();
      action.setType('AdMob::ShowInterstitial');
      gd.asStandardEvent(event).getActions().insert(action, 0);

      // Prepare a fake file system
      var fs = makeFakeAbstractFileSystem(gd, {
        '/fake-gdjs-root/Runtime/Cordova/www/index.html': fakeIndexHtmlContent,
        '/fake-gdjs-root/Runtime/Cordova/config.xml': fakeConfigXmlContent,
        '/fake-gdjs-root/Runtime/Cordova/package.json': fakePackageJsonContent,
        '/fake-gdjs-root/Runtime/Cordova/www/LICENSE.GDevelop.txt': "",
      });

      // Export and check the content of written files.
      const exporter = new gd.Exporter(fs, '/fake-gdjs-root');
      const exportOptions = new gd.ExportOptions(project, '/fake-export-dir');
      exportOptions.setTarget('cordova');
      expect(exporter.exportWholePixiProject(exportOptions)).toBe(true);
      exportOptions.delete();
      exporter.delete();

      expect(fs.writeToFile).toHaveBeenCalledWith(
        '/fake-export-dir/config.xml',
        `
<widget id="com.example.gamename" version="1.2.3">
  <name>My great project with spaces and &quot;quotes&quot;!</name>
  <platform name="android">

  </platform>
  <platform name="ios">

  </platform>
<plugin name=\"gdevelop-cordova-admob-plus\" spec=\"0.43.0\">
    <variable name=\"APP_ID_ANDROID\" value=\"my android app id\" />
</plugin>
</widget>`
      );
      expect(fs.writeToFile).toHaveBeenCalledWith(
        '/fake-export-dir/package.json',
        `
{
  \"name\": \"my_32great_32project_32with_32spaces_32and_32_34quotes_34_33\",
  \"displayName\": \"My great project with spaces and \\\"quotes\\\"!\",
  \"version\": \"1.2.3\",
  \"description\": \"My great project with spaces and \\\"quotes\\\"!\",
  \"author\": \"\"
}`
      );
    });
  });

  describe('LayoutCodeGenerator', () => {
    it('can generate code for a layout', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);

      // Create a repeat event with a trigger once
      const evt = layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Repeat', 0);
      gd.asRepeatEvent(evt).setRepeatExpression('5+4+3+2+1');
      const condition = new gd.Instruction();
      condition.setType('BuiltinCommonInstructions::Once');
      gd.asRepeatEvent(evt).getConditions().insert(condition, 0);

      const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
      const code = layoutCodeGenerator.generateLayoutCompleteCode(
        layout,
        new gd.SetString(),
        true
      );

      // The loop is using a counter somewhere
      expect(code).toMatch('repeatCount');

      // Trigger once is used in a condition
      expect(code).toMatch('runtimeScene.getOnceTriggers().triggerOnce');

      condition.delete();
    });
    it('does not generate code for improperly set up actions/conditions', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const evt = layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      layout.insertNewObject(project, 'TextObject::Text', 'MyTextObject', 0);
      layout.insertNewObject(
        project,
        'FakeObjectWithUnsupportedCapability::FakeObjectWithUnsupportedCapability',
        'MyFakeObjectWithUnsupportedCapability',
        0
      );

      // Valid action (to check code generation is done).
      const action = new gd.Instruction();
      action.setType('ChangeAnimation');
      action.setParametersCount(4);
      action.setParameter(0, 'MyObject');
      action.setParameter(1, '=');
      action.setParameter(2, '2');
      gd.asStandardEvent(evt).getActions().insert(action, 0);

      // Action with mismatched object type.
      const mismatchedObjectTypeAction = new gd.Instruction();
      mismatchedObjectTypeAction.setType('ChangeAnimation');
      mismatchedObjectTypeAction.setParametersCount(4);
      mismatchedObjectTypeAction.setParameter(0, 'MyTextObject');
      mismatchedObjectTypeAction.setParameter(1, '=');
      mismatchedObjectTypeAction.setParameter(2, '2');
      gd.asStandardEvent(evt)
        .getActions()
        .insert(mismatchedObjectTypeAction, 1);

      // Action with an unknown object.
      const unknownObjectAction = new gd.Instruction();
      unknownObjectAction.setType('ChangeAnimation');
      unknownObjectAction.setParametersCount(4);
      unknownObjectAction.setParameter(0, 'UnknownObject');
      unknownObjectAction.setParameter(1, '=');
      unknownObjectAction.setParameter(2, '2');
      gd.asStandardEvent(evt).getActions().insert(unknownObjectAction, 2);

      // Action that is unknown.
      const unknownAction = new gd.Instruction();
      unknownAction.setType('UnknownExtension::NotExistingInstruction');
      unknownAction.setParametersCount(1);
      unknownAction.setParameter(0, 'Anything');
      gd.asStandardEvent(evt).getActions().insert(unknownAction, 3);

      // Action for an object not having the required capability.
      const unsupportedCapabilityAction = new gd.Instruction();
      unsupportedCapabilityAction.setType('EffectCapability::EffectBehavior::EnableEffect');
      unsupportedCapabilityAction.setParametersCount(4);
      unsupportedCapabilityAction.setParameter(0, 'MyFakeObjectWithUnsupportedCapability');
      unsupportedCapabilityAction.setParameter(1, 'Effect');
      unsupportedCapabilityAction.setParameter(1, '"MyEffect"');
      unsupportedCapabilityAction.setParameter(2, 'yes');
      gd.asStandardEvent(evt)
        .getActions()
        .insert(unsupportedCapabilityAction, 4);

      const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
      const code = layoutCodeGenerator.generateLayoutCompleteCode(
        layout,
        new gd.SetString(),
        true
      );

      // Animation is set to 2 for MyObject
      expect(code).toMatch(
        'gdjs.SceneCode.GDMyObjectObjects1[i].setAnimation(2);'
      );

      // Check that the action with a wrong object was not generated.
      expect(code).toMatch('/* Mismatched object type - skipped. */');

      // Check that the action with a wrong object was not generated.
      expect(code).toMatch('/* Unknown object - skipped. */');

      // Check that the unknown action was not generated.
      expect(code).toMatch('/* Unknown instruction - skipped. */');

      // Check that the action for an object not having the required capability was not generated.
      expect(code).toEqual(expect.not.stringContaining(
        'gdjs.SceneCode.GDMyFakeObjectWithUnsupportedCapabilityObjects1[i].getBehavior(\"Effect\")')
      );

      action.delete();
    });
    it('does not generate code for improperly set up action/conditions, with groups', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const evt = layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      layout.insertNewObject(project, 'Sprite', 'MySprite', 0);
      const obj = layout.insertNewObject(
        project,
        'FakeObjectWithUnsupportedCapability::FakeObjectWithUnsupportedCapability',
        'MyFakeObjectWithUnsupportedCapability',
        0
      );

      const group = layout.getObjectGroups().insertNew('MyGroup', 0);
      group.addObject('MySprite');
      group.addObject('MyFakeObjectWithUnsupportedCapability');

      // Valid action (to check code generation is done).
      const action = new gd.Instruction();
      action.setType('ChangeLayer');
      action.setParametersCount(2);
      action.setParameter(0, 'MyGroup');
      action.setParameter(1, '"New layer"');
      gd.asStandardEvent(evt).getActions().insert(action, 0);

      // Action for an object not having the required capability.
      const unsupportedCapabilityAction = new gd.Instruction();
      unsupportedCapabilityAction.setType('EffectCapability::EffectBehavior::EnableEffect');
      unsupportedCapabilityAction.setParametersCount(4);
      unsupportedCapabilityAction.setParameter(0, 'MyGroup');
      unsupportedCapabilityAction.setParameter(1, 'Effect');
      unsupportedCapabilityAction.setParameter(2, '"MyEffect"');
      unsupportedCapabilityAction.setParameter(3, 'yes');
      gd.asStandardEvent(evt)
        .getActions()
        .insert(unsupportedCapabilityAction, 1);

      const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
      const code = layoutCodeGenerator.generateLayoutCompleteCode(
        layout,
        new gd.SetString(),
        true
      );

      // Layer can be changed for both object instances.
      expect(code).toMatch(
        'gdjs.SceneCode.GDMySpriteObjects1[i].setLayer("New layer");'
      );
      expect(code).toMatch(
        'gdjs.SceneCode.GDMyFakeObjectWithUnsupportedCapabilityObjects1[i].setLayer("New layer");'
      );

      // Check that the action with an object not having the required capability
      // was not generated for this object,
      // but generated for the Sprite supporting this capability.
      expect(code).toMatch(
        'gdjs.SceneCode.GDMySpriteObjects1[i].getBehavior(\"Effect\").enableEffect(\"MyEffect\", true);'
      );
      expect(code).toEqual(expect.not.stringContaining(
        'gdjs.SceneCode.GDMyFakeObjectWithUnsupportedCapabilityObjects1[i].getBehavior(\"Effect\")')
      );

      action.delete();
    });
  });

  describe('EventsFunctionsExtensionCodeGenerator', () => {
    it('can generate code for an events function', function () {
      const project = new gd.ProjectHelper.createNewGDJSProject();

      const includeFiles = new gd.SetString();
      const eventsFunction = new gd.EventsFunction();

      // Create a function accepting 4 parameters:
      const parameters = eventsFunction.getParameters();
      const parameter1 = new gd.ParameterMetadata();
      parameter1.setType('objectList');
      parameter1.setName('MyObject');
      parameter1.setDescription('The first object to be used');
      const parameter2 = new gd.ParameterMetadata();
      parameter2.setType('expression');
      parameter2.setName('MyNumber');
      parameter2.setDescription('Some number');
      const parameter3 = new gd.ParameterMetadata();
      parameter3.setType('objectList');
      parameter3.setName('MySprite');
      parameter3.setDescription('The second object to be used, a sprite');
      parameter3.setExtraInfo('Sprite');
      const parameter4 = new gd.ParameterMetadata();
      parameter4.setType('string');
      parameter4.setName('MyString');
      parameter4.setDescription('Some string');
      parameters.push_back(parameter1);
      parameters.push_back(parameter2);
      parameters.push_back(parameter3);
      parameters.push_back(parameter4);

      // Create a repeat event with...
      const eventsList = eventsFunction.getEvents();

      const evt = eventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Repeat',
        0
      );
      gd.asRepeatEvent(evt).setRepeatExpression('5+4+3+2+1');

      // ...a trigger once condition...
      const condition = new gd.Instruction();
      condition.setType('BuiltinCommonInstructions::Once');
      gd.asRepeatEvent(evt).getConditions().insert(condition, 0);

      // ...and an action to update a variable of MyObject
      const action = new gd.Instruction();
      action.setType('ModVarObjet');
      action.setParametersCount(4);
      action.setParameter(0, 'MyObject');
      action.setParameter(1, 'ObjectVariable');
      action.setParameter(2, '+');
      action.setParameter(3, '42');
      gd.asRepeatEvent(evt).getActions().insert(action, 0);

      const action2 = new gd.Instruction();
      action2.setType('ModVarObjet');
      action2.setParametersCount(4);
      action2.setParameter(0, 'MyObject');
      action2.setParameter(1, 'ObjectVariable2');
      action2.setParameter(2, '=');
      action2.setParameter(
        3,
        'GetArgumentAsNumber("MyNumber") + ToNumber(GetArgumentAsString("MyString"))'
      );
      gd.asRepeatEvent(evt).getActions().insert(action2, 1);

      const namespace = 'gdjs.eventsFunction.myTest';
      const extension = new gd.EventsFunctionsExtension();
      const eventsFunctionsExtensionCodeGenerator =
        new gd.EventsFunctionsExtensionCodeGenerator(project);
      const code =
        eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
          extension,
          eventsFunction,
          namespace,
          includeFiles,
          true
        );

      // Check that the function name is properly generated
      expect(code).toMatch(namespace + '.func = function(');

      // Check that the context for the events function is here...
      expect(code).toMatch('function(runtimeScene, eventsFunctionContext)');
      expect(code).toMatch('var eventsFunctionContext =');

      // Check that the parameters, with the (optional) context of the parent function,
      // are all here
      expect(code).toMatch(
        'function(runtimeScene, MyObject, MyNumber, MySprite, MyString, parentEventsFunctionContext)'
      );

      // ...and objects should be able to get queried...
      expect(code).toMatch('"MyObject": MyObject');
      expect(code).toMatch('"MySprite": MySprite');

      // ...and arguments should be able to get queried too:
      expect(code).toMatch('if (argName === "MyNumber") return MyNumber;');
      expect(code).toMatch('if (argName === "MyString") return MyString;');

      // GetArgumentAsString("MyString") should be generated code to query and cast as a string
      // the argument
      expect(code).toMatch(
        '(typeof eventsFunctionContext !== \'undefined\' ? "" + eventsFunctionContext.getArgument("MyString") : "")'
      );

      // GetArgumentAsNumber("MyNumber") should be generated code to query and cast as a string
      // the argument
      expect(code).toMatch(
        '(typeof eventsFunctionContext !== \'undefined\' ? Number(eventsFunctionContext.getArgument("MyNumber")) || 0 : 0)'
      );

      // The loop is using a counter somewhere
      expect(code).toMatch('repeatCount');

      // Trigger once is used in a condition
      expect(code).toMatch(
        'eventsFunctionContext.getOnceTriggers().triggerOnce'
      );

      // A variable has 42 added to it
      expect(code).toMatch('getVariables().get("ObjectVariable")).add(42)');

      condition.delete();
      action.delete();
      extension.delete();
    });

    it('can generate code for an events function, with groups', function () {
      const project = new gd.ProjectHelper.createNewGDJSProject();

      const includeFiles = new gd.SetString();
      const eventsFunction = new gd.EventsFunction();

      // Create a function accepting 2 parameters:
      const parameters = eventsFunction.getParameters();
      const parameter1 = new gd.ParameterMetadata();
      parameter1.setType('objectList');
      parameter1.setName('MyObject');
      parameter1.setDescription('The first object to be used');
      const parameter2 = new gd.ParameterMetadata();
      parameter2.setType('objectList');
      parameter2.setName('MySprite');
      parameter2.setDescription('The second object to be used, a sprite');
      parameter2.setExtraInfo('Sprite');
      parameters.push_back(parameter1);
      parameters.push_back(parameter2);

      // And with a group:
      const group = eventsFunction.getObjectGroups().insertNew('MyGroup', 0);
      group.addObject('MyObject');
      group.addObject('MySprite');

      // Create a repeat event with...
      const eventsList = eventsFunction.getEvents();

      const evt = eventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Repeat',
        0
      );
      gd.asRepeatEvent(evt).setRepeatExpression('5+4+3+2+1');

      // ...an action to update a variable of the group of objects
      const action = new gd.Instruction();
      action.setType('ModVarObjet');
      action.setParametersCount(4);
      action.setParameter(0, 'MyGroup');
      action.setParameter(1, 'ObjectVariable');
      action.setParameter(2, '+');
      action.setParameter(3, '42');
      gd.asRepeatEvent(evt).getActions().insert(action, 0);

      const namespace = 'gdjs.eventsFunction.myTest';
      const eventsFunctionsExtensionCodeGenerator =
        new gd.EventsFunctionsExtensionCodeGenerator(project);
      const code =
        eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
          new gd.EventsFunctionsExtension(),
          eventsFunction,
          namespace,
          includeFiles,
          true
        );

      // Check that the function name is properly generated
      expect(code).toMatch(namespace + '.func = function(');

      // Check that the context for the events function is here...
      expect(code).toMatch('function(runtimeScene, eventsFunctionContext)');
      expect(code).toMatch('var eventsFunctionContext =');

      // Check that the parameters, with the (optional) context of the parent function,
      // are all here
      expect(code).toMatch(
        'function(runtimeScene, MyObject, MySprite, parentEventsFunctionContext)'
      );

      // ...and objects should be able to get queried...
      expect(code).toMatch('"MyObject": MyObject');
      expect(code).toMatch('"MySprite": MySprite');

      // Variables of both MyObject and MySprite should have 42 added:
      expect(code).toMatch(
        'GDMyObjectObjects2[i].getVariables().get("ObjectVariable")).add(42)'
      );
      expect(code).toMatch(
        'GDMySpriteObjects2[i].getVariables().get("ObjectVariable")).add(42)'
      );

      action.delete();
    });
  });

  describe('TextObject', function () {
    it('should expose TextObject specific methods', function () {
      var object = new gd.TextObject('MyTextObject');
      object.setText('Hello');
      object.setFontName('Hello.ttf');
      object.setCharacterSize(10);
      object.setBold(true);
      object.setColor('1;2;3');

      expect(object.getText()).toBe('Hello');
      expect(object.getFontName()).toBe('Hello.ttf');
      expect(object.getCharacterSize()).toBe(10);
      expect(object.isBold()).toBe(true);
      expect(object.getColor()).toBe('1;2;3');
    });
  });
  describe('TiledSpriteObject', function () {
    it('should expose TiledSpriteObject specific methods', function () {
      var object = new gd.TiledSpriteObject('MyTiledSpriteObject');
      object.setTexture('MyImageName');
      expect(object.getTexture()).toBe('MyImageName');
    });
  });
  describe('PanelSpriteObject', function () {
    it('should expose PanelSpriteObject specific methods', function () {
      var object = new gd.PanelSpriteObject('MyPanelSpriteObject');
      object.setTexture('MyImageName');
      expect(object.getTexture()).toBe('MyImageName');
    });
  });
  describe('ShapePainterObject', function () {
    it('should expose ShapePainterObject specific methods', function () {
      var object = new gd.ShapePainterObject('MyShapePainterObject');
      object.setCoordinatesAbsolute();
      expect(object.areCoordinatesAbsolute()).toBe(true);
      object.setCoordinatesRelative();
      expect(object.areCoordinatesAbsolute()).toBe(false);
    });
  });
  describe('ShapePainterObject', function () {
    it('should expose ShapePainterObject specific methods', function () {
      var object = new gd.ShapePainterObject('MyShapePainterObject');
      object.setClearBetweenFrames(true);
      expect(object.isClearedBetweenFrames()).toBe(true);
      object.setClearBetweenFrames(false);
      expect(object.isClearedBetweenFrames()).toBe(false);
    });
  });
  describe('TextEntryObject', function () {
    it('should expose TextEntryObject', function () {
      var object = new gd.TextEntryObject('MyTextEntryObject');
    });
  });
  describe('ParticleEmitterObject', function () {
    it('should expose ParticleEmitterObject', function () {
      var object = new gd.ParticleEmitterObject('MyParticleEmitterObject');
    });
  });
  describe('JsCodeEvent', function () {
    it('can store its code', function () {
      var event = new gd.JsCodeEvent();
      event.setInlineCode('console.log("Hello world");');
      expect(event.getInlineCode()).toBe('console.log("Hello world");');
    });
    it('can store the objects to pass as parameter', function () {
      var event = new gd.JsCodeEvent();
      event.setParameterObjects('MyObject');
      expect(event.getParameterObjects()).toBe('MyObject');
    });
    it("can store if it's expanded or not", function () {
      var event = new gd.JsCodeEvent();
      expect(event.isEventsSheetExpanded()).toBe(false);
      event.setEventsSheetExpanded(true);
      expect(event.isEventsSheetExpanded()).toBe(true);
    });
    it('can be cloned', function () {
      var event = new gd.JsCodeEvent();
      event.setInlineCode('console.log("Hello world 2");');
      event.setParameterObjects('MyObject2');

      var cloneEvent = event.clone();
      expect(cloneEvent.getParameterObjects()).toBe('MyObject2');
      expect(cloneEvent.getInlineCode()).toBe('console.log("Hello world 2");');
    });
  });
});
