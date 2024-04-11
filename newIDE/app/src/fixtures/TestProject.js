// @flow

/*::
export type TestProject = {|
  project: gdProject,
  shapePainterObjectConfiguration: gdObjectConfiguration,
  textObjectConfiguration: gdObjectConfiguration,
  particleEmitterConfiguration: gdObjectConfiguration,
  tiledSpriteObjectConfiguration: gdObjectConfiguration,
  panelSpriteObject: gdObject,
  spriteObjectConfiguration: gdSpriteObject,
  emptySpriteObjectConfiguration: gdSpriteObject,
  cube3dObject: gdObject,
  textInputObject: gdObject,
  customObject: gdObject,
  spriteObject: gdObject,
  emptySpriteObject: gdObject,
  spriteObjectWithBehaviors: gdObject,
  spriteObjectWithoutBehaviors: gdObject,
  testSpriteObjectInstance: gdInitialInstance,
  testLayout: gdLayout,
  group1: gdObjectGroup,
  group2: gdObjectGroup,
  group4WithLongsNames: gdObjectGroup,
  testLayoutInstance1: gdInitialInstance,
  testLayoutInstance2: gdInitialInstance,
  testLayoutInstance3: gdInitialInstance,
  testInstruction: gdInstruction,
  testExternalEvents1: gdExternalEvents,
  testExternalEvents2: gdExternalEvents,
  emptyLayout: gdLayout,
  emptyEventsList: gdEventsList,
  testEventsFunction: gdEventsFunction,
  testEventsFunctionsExtension: gdEventsFunctionsExtension,
  testSerializedEvents: Object,
  testSerializedEventsWithLotsOfObjects: Object,
  testEventsBasedBehavior: gdEventsBasedBehavior,
  testEmptyEventsBasedBehavior: gdEventsBasedBehavior,
  testBehaviorEventsFunction: gdEventsFunction,
  testBehaviorLifecycleEventsFunction: gdEventsFunction,
  testEventsBasedObject: gdEventsBasedObject,
  testObjectEventsFunction: gdEventsFunction,
  layerWithEffects: gdLayer,
  layerWith3DEffects: gdLayer,
  layerWith2DEffects: gdLayer,
  layerWithEffectWithoutEffectType: gdLayer,
  layerWithoutEffects: gdLayer,
  spriteObjectWithEffects: gdObject,
  spriteObjectWithoutEffects: gdObject,
  stringRelationalOperatorParameterMetadata: gdParameterMetadata,
  numberRelationalOperatorParameterMetadata: gdParameterMetadata,
  colorRelationalOperatorParameterMetadata: gdParameterMetadata,
  unknownRelationalOperatorParameterMetadata: gdParameterMetadata,
  emptyObjectsContainer: gdObjectsContainer,
|};
*/

/**
 * Create a dummy project using libGD.js filled with a
 * few elements that can be used for testing.
 *
 * @param gd The GD instance to use to create the project.
 */
export const makeTestProject = (gd /*: libGDevelop */) /*: TestProject */ => {
  // Create and expose a game project
  const project = gd.ProjectHelper.createNewGDJSProject();

  // Add some fake resources
  const resource1 = new gd.ImageResource();
  const resource2 = new gd.ImageResource();
  const resource3 = new gd.ImageResource();
  const resource4 = new gd.ImageResource();
  const audioResource1 = new gd.AudioResource();
  const videoResource1 = new gd.VideoResource();
  const videoResource2 = new gd.VideoResource();
  const fontResource = new gd.FontResource();
  const bitmapFontResource1 = new gd.BitmapFontResource();
  const bitmapFontResource2 = new gd.BitmapFontResource();
  const jsonResource1 = new gd.JsonResource();
  const jsonResource2 = new gd.JsonResource();
  const jsonResource3 = new gd.JsonResource();
  resource1.setName('fake-image1.png');
  resource1.setFile('fake-image1.png');
  resource2.setName('fake-image2.png');
  resource2.setFile('fake-image2.png');
  resource3.setName('icon128.png');
  resource3.setFile('res/icon128.png');
  resource4.setName('pixi');
  resource4.setFile('res/powered-pixijs.png');
  audioResource1.setName('fake-audio1.mp3');
  audioResource1.setFile('fake-audio1.mp3');
  videoResource1.setName('fake-video1.mp4');
  videoResource1.setFile('fake-video1.mp4');
  videoResource2.setName('fake-video2.mp4');
  videoResource2.setFile('fake-video2.mp4');
  fontResource.setName('font.ttf');
  fontResource.setFile('font.ttf');
  bitmapFontResource1.setName('bmfont.xml');
  bitmapFontResource1.setFile('bmfont.xml');
  bitmapFontResource2.setName('super-font.fnt');
  bitmapFontResource2.setFile('super-font.fnt');
  jsonResource1.setName('levelData.json');
  jsonResource1.setFile('levelData.json');
  jsonResource2.setName('InventoryData.json');
  jsonResource2.setFile('InventoryData.json');
  jsonResource3.setName('text-data.json');
  jsonResource3.setFile('text-data.json');
  project.getResourcesManager().addResource(resource1);
  project.getResourcesManager().addResource(resource2);
  project.getResourcesManager().addResource(resource3);
  project.getResourcesManager().addResource(resource4);
  project.getResourcesManager().addResource(audioResource1);
  project.getResourcesManager().addResource(videoResource1);
  project.getResourcesManager().addResource(videoResource2);
  project.getResourcesManager().addResource(fontResource);
  project.getResourcesManager().addResource(bitmapFontResource1);
  project.getResourcesManager().addResource(bitmapFontResource2);
  project.getResourcesManager().addResource(jsonResource1);
  project.getResourcesManager().addResource(jsonResource2);
  project.getResourcesManager().addResource(jsonResource3);

  const buttonExtension = project.insertNewEventsFunctionsExtension(
    'Button',
    0
  );
  buttonExtension.setVersion('1.0.0');

  const buttonEventBasedObject = buttonExtension
    .getEventsBasedObjects()
    .insertNew('PanelSpriteButton', 0);
  const buttonProperties = buttonEventBasedObject.getPropertyDescriptors();
  buttonProperties
    .insertNew('PressedLabelOffsetY', 0)
    .setType('number')
    .setLabel('Label offset on Y axis when pressed');
  buttonProperties
    .insertNew('LeftPadding', 1)
    .setType('number')
    .setLabel('Left padding')
    .setGroup('Padding');
  buttonProperties
    .insertNew('RightPadding', 2)
    .setType('number')
    .setLabel('Right padding')
    .setGroup('Padding');
  buttonProperties
    .insertNew('TopPadding', 3)
    .setType('number')
    .setLabel('Top padding')
    .setGroup('Padding');
  buttonProperties
    .insertNew('DownPadding', 4)
    .setType('number')
    .setLabel('Down padding')
    .setGroup('Padding');
  buttonEventBasedObject.insertNewObject(
    project,
    'TextObject::Text',
    'Label',
    0
  );
  buttonEventBasedObject.insertNewObject(
    project,
    'PanelSpriteObject::PanelSprite',
    'Idle',
    1
  );
  buttonEventBasedObject.insertNewObject(
    project,
    'PanelSpriteObject::PanelSprite',
    'Hovered',
    2
  );
  buttonEventBasedObject.insertNewObject(
    project,
    'PanelSpriteObject::PanelSprite',
    'Pressed',
    3
  );
  // Add a function
  const testObjectEventsFunction = buttonEventBasedObject
    .getEventsFunctions()
    .insertNewEventsFunction('MyTestFunction', 0);
  testObjectEventsFunction
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

  // Create and expose some objects
  const testLayout = project.insertNewLayout('TestLayout', 0);
  const customObject = testLayout.insertNewObject(
    project,
    'Button::PanelSpriteButton',
    'MyButton',
    0
  );
  const shapePainterObject = testLayout.insertNewObject(
    project,
    'PrimitiveDrawing::Drawer',
    'MyShapePainterObject',
    0
  );
  const textObject = testLayout.insertNewObject(
    project,
    'TextObject::Text',
    'MyTextObject',
    0
  );
  const particleEmitter = testLayout.insertNewObject(
    project,
    'ParticleSystem::ParticleEmitter',
    'MyParticleEmitter',
    0
  );
  const tiledSpriteObject = testLayout.insertNewObject(
    project,
    'TiledSpriteObject::TiledSprite',
    'MyTiledSpriteObject',
    0
  );
  const cube3dObject = testLayout.insertNewObject(
    project,
    'FakeScene3D::Cube3DObject',
    'CubeObject',
    0
  );
  const textInputObject = testLayout.insertNewObject(
    project,
    'FakeTextInput::TextInput',
    'TextInputObject',
    0
  );
  const panelSpriteObject = testLayout.insertNewObject(
    project,
    'PanelSpriteObject::PanelSprite',
    'MyPanelSpriteObject',
    0
  );
  const spriteObject = testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObject',
    0
  );
  const emptySpriteObject = testLayout.insertNewObject(
    project,
    'Sprite',
    'MyEmptySpriteObject',
    0
  );
  const spriteObjectWithBehaviors = testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObjectWithBehaviors',
    0
  );
  const spriteObjectWithoutBehaviors = testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObjectWithoutBehaviors',
    0
  );
  const spriteObjectWithoutEffects = testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObjectWithoutEffect',
    0
  );
  const spriteObjectWithEffects = testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObjectWithEffects',
    0
  );
  testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name',
    14
  );
  testLayout.insertNewObject(
    project,
    'FakeObjectWithUnsupportedCapability::FakeObjectWithUnsupportedCapability',
    'MyFakeObjectWithUnsupportedCapability',
    15
  );
  const spriteObjectConfiguration = gd.asSpriteConfiguration(
    spriteObject.getConfiguration()
  );
  const animations = spriteObjectConfiguration.getAnimations();
  const emptySpriteObjectConfiguration = gd.asSpriteConfiguration(
    emptySpriteObject.getConfiguration()
  );
  {
    const variablesContainer = spriteObject.getVariables();
    variablesContainer
      .insert('ObjectVariable', new gd.Variable(), 0)
      .setString('A multiline\nstr value');
    const variable = variablesContainer.insert(
      'OtherObjectVariable',
      new gd.Variable(),
      1
    );
    variable.setFolded(false);
    variable.castTo('structure');
    variable.getChild('ObjectChild1').setValue(564);
    variable.getChild('ObjectChild2').setString('Guttentag');
    variable.getChild('ObjectChild3').setBool(true);
    const arrayVariable = variable.getChild('ObjectChild4');
    arrayVariable.castTo('array');
    arrayVariable.setFolded(true);
    arrayVariable.pushNew().setValue(856.5);
  }
  {
    const animation = new gd.Animation();
    animation.setName('My animation');
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite();
    sprite1.setImageName('icon128.png');
    const sprite2 = new gd.Sprite();
    sprite2.setImageName('pixi');
    const sprite3 = new gd.Sprite();
    sprite3.setImageName('icon128.png');

    // Add a few points to the first sprite:
    sprite1.getOrigin().setX(10);
    sprite1.getOrigin().setY(20);
    sprite1.getCenter().setX(100);
    sprite1.getCenter().setY(200);
    const headCustomPoint = new gd.Point('Head');
    headCustomPoint.setX(40);
    headCustomPoint.setY(50);
    sprite1.addPoint(headCustomPoint);

    animation.getDirection(0).addSprite(sprite1);
    animation.getDirection(0).addSprite(sprite2);
    animation.getDirection(0).addSprite(sprite3);
    animations.addAnimation(animation);
  }
  {
    const animation = new gd.Animation();
    animation.setName('My other animation');
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite();
    sprite1.setImageName('icon128.png');
    const sprite2 = new gd.Sprite();
    sprite2.setImageName('icon128.png');
    const sprite3 = new gd.Sprite();
    sprite3.setImageName('icon128.png');
    const sprite4 = new gd.Sprite();
    sprite4.setImageName('icon128.png');
    animation.getDirection(0).addSprite(sprite1);
    animation.getDirection(0).addSprite(sprite2);
    animation.getDirection(0).addSprite(sprite3);
    animation.getDirection(0).addSprite(sprite4);
    animations.addAnimation(animation);
  }
  {
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite();
    sprite1.setImageName('pixi');
    animation.getDirection(0).addSprite(sprite1);
    animations.addAnimation(animation);
  }

  spriteObjectWithBehaviors.addNewBehavior(
    project,
    'PlatformBehavior::PlatformerObjectBehavior',
    'PlatformerObject'
  );
  spriteObjectWithBehaviors.addNewBehavior(
    project,
    'DraggableBehavior::Draggable',
    'Draggable'
  );

  const group1 = new gd.ObjectGroup();
  group1.setName('GroupOfSprites');
  group1.addObject('MySpriteObject');
  const group2 = new gd.ObjectGroup();
  group2.setName('GroupOfObjects');
  group2.addObject('MySpriteObject');
  group2.addObject('MyTextObject');
  const group3 = new gd.ObjectGroup();
  group3.setName('GroupOfSpriteObjectsWithBehaviors');
  group3.addObject('MySpriteObjectWithBehaviors');
  const group4WithLongsNames = new gd.ObjectGroup();
  group4WithLongsNames.setName('MyGroupWithObjectsHavingLongName');
  group4WithLongsNames.addObject('MySpriteObject');
  group4WithLongsNames.addObject(
    'MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name'
  );
  group4WithLongsNames.addObject('MySpriteObjectWithoutBehaviors');
  testLayout.getObjectGroups().insert(group1, 0);
  testLayout.getObjectGroups().insert(group2, 1);
  testLayout.getObjectGroups().insert(group3, 2);
  testLayout.getObjectGroups().insert(group4WithLongsNames, 3);

  const testLayoutInstance1 = testLayout
    .getInitialInstances()
    .insertNewInitialInstance();
  testLayoutInstance1.setX(10);
  testLayoutInstance1.setY(15);

  const testLayoutInstance2 = testLayout
    .getInitialInstances()
    .insertNewInitialInstance();
  testLayoutInstance2.setX(120);
  testLayoutInstance2.setY(-15);
  testLayoutInstance2.setZ(32);
  testLayoutInstance2.setObjectName(cube3dObject.getName());

  const testLayoutInstance3 = testLayout
    .getInitialInstances()
    .insertNewInitialInstance();
  testLayoutInstance3.setX(12);
  testLayoutInstance3.setY(-15.5);
  testLayoutInstance3.setZ(3.2);
  testLayoutInstance3.setObjectName(textInputObject.getName());

  const testSpriteObjectInstance = testLayout
    .getInitialInstances()
    .insertNewInitialInstance();
  testSpriteObjectInstance.setObjectName(spriteObject.getName());

  {
    const variablesContainer = testSpriteObjectInstance.getVariables();
    variablesContainer
      .insert('InstanceVariable', new gd.Variable(), 0)
      .setString('A multiline\nstr value');
    const variable = variablesContainer.insert(
      'OtherInstanceVariable',
      new gd.Variable(),
      1
    );
    variable.castTo('structure');
    variable.getChild('InstanceChild1').setValue(1995);
    variable.getChild('InstanceChild2').setString('Hallo');
    variable.getChild('InstanceChild3').setBool(false);
    const arrayVariable = variable.getChild('InstanceChild4');
    arrayVariable.castTo('array');
    arrayVariable.pushNew().setString('Bonjour');
  }

  // Add layers
  testLayout.insertNewLayer('GUI', 0);
  testLayout.insertNewLayer('OtherLayer', 1);

  //Add a few variables
  const testLayoutVariables = testLayout.getVariables();
  testLayoutVariables
    .insert('Variable1', new gd.Variable(), 0)
    .setString('A multiline\nstr value');
  testLayoutVariables
    .insert('Variable2', new gd.Variable(), 1)
    .setString('123456');
  const variable3 = new gd.Variable();
  variable3.getChild('Child1').setString('Child1 str value');
  variable3.getChild('Child2').setString('7891011');
  variable3
    .getChild('FoldedChild')
    .getChild('SubChild1')
    .setString('Hello\nMultiline\nWorld');
  variable3.getChild('FoldedChild').setFolded(true);
  testLayoutVariables.insert('Variable3', variable3, 2);
  const variable4 = new gd.Variable();
  variable4.getAtIndex(0).setString('String value\nwith Multiline');
  variable4.getAtIndex(1).setValue(4539.42);
  variable4.getAtIndex(2).setBool(true);
  variable4.setFolded(true);
  testLayoutVariables.insert('FoldedArray', variable4, 3);
  const variable5 = new gd.Variable();
  variable5.getAtIndex(0).setString('PlayerName');
  variable5.getAtIndex(1).setValue(25);
  variable5.getAtIndex(2).setBool(false);
  testLayoutVariables.insert('OtherArray', variable5, 4);

  //Create a few events
  //Add a new "standard" event to the scene:
  var evt = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
  testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 1);
  testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::ForEach', 2);
  testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::While', 3);
  testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Repeat', 4);
  var evt6 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Group', 5);
  testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Link', 6);
  var evt8 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::JsCode', 7);
  var evtWithInvalidParameters = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

  const groupEvent = gd.asGroupEvent(evt6);
  groupEvent.setName('Group #1');

  const jsCodeEvent = gd.asJsCodeEvent(evt8);
  jsCodeEvent.setInlineCode('console.log("Hello, World!");');
  jsCodeEvent.setParameterObjects('MyObject');

  const makeKeyPressedCondition = key => {
    const condition = new gd.Instruction();
    condition.setType('KeyPressed');
    condition.setParametersCount(2);
    condition.setParameter(1, key);
    return condition; // This leaks memory if not deleted
  };

  const makeMouseButtonPressedCondition = button => {
    const condition = new gd.Instruction();
    condition.setType('SourisBouton');
    condition.setParametersCount(2);
    condition.setParameter(1, button);
    return condition; // This leaks memory if not deleted
  };

  const makeDeleteAction = objectToDelete => {
    var action = new gd.Instruction(); //Add a simple action
    action.setType('Delete');
    action.setParametersCount(2);
    action.setParameter(0, objectToDelete);
    return action; // This leaks memory if not deleted
  };

  var standardEvt = gd.asStandardEvent(evt);
  standardEvt.getConditions().push_back(makeKeyPressedCondition('Space'));
  standardEvt.getActions().push_back(makeDeleteAction('MyCharacter'));

  gd.asStandardEvent(evtWithInvalidParameters)
    .getConditions()
    .push_back(makeKeyPressedCondition(''));
  gd.asStandardEvent(evtWithInvalidParameters)
    .getConditions()
    .push_back(makeKeyPressedCondition('Invalid key'));
  gd.asStandardEvent(evtWithInvalidParameters)
    .getConditions()
    .push_back(makeMouseButtonPressedCondition(''));

  //Add a few sub events:
  {
    const subEvent = evt
      .getSubEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
    const subStandardEvt = gd.asStandardEvent(subEvent);
    subStandardEvt.getConditions().push_back(makeKeyPressedCondition('Space'));
    subStandardEvt.getActions().push_back(makeDeleteAction('MyCharacter1'));
    subStandardEvt.getActions().push_back(makeDeleteAction('MyCharacter2'));
  }
  {
    const subEvent = evt
      .getSubEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0);
    const subCommentEvt = gd.asCommentEvent(subEvent);
    subCommentEvt.setComment(
      'Kain is deified. The clans tell tales of him, few know the truth. He was mortal once, as were we all. However, his contempt for humanity drove him to create me and my brethren. I am Raziel, first born of his lieutenants. I stood with Kain and my brethren at the dawn of the empire. I have served him a millennium. Over time we became less human and more ... divine.'
    );
  }

  for (let i = 0; i < 20; ++i) {
    const evt = testLayout
      .getEvents()
      .insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        testLayout.getEvents().getEventsCount()
      );
    const standardEvt = gd.asStandardEvent(evt);

    standardEvt.getConditions().push_back(makeKeyPressedCondition('Space'));
    standardEvt.getActions().push_back(makeDeleteAction('OtherObject' + i));
  }

  // Add a disabled event with a sub event
  {
    const disabledEvent = testLayout
      .getEvents()
      .insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        testLayout.getEvents().getEventsCount()
      );
    const disabledStandardEvt = gd.asStandardEvent(disabledEvent);
    disabledStandardEvt.setDisabled(true);
    disabledStandardEvt
      .getConditions()
      .push_back(makeKeyPressedCondition('Space'));
    disabledStandardEvt
      .getActions()
      .push_back(makeDeleteAction('YetAnotherObject'));

    const subEvent = disabledStandardEvt
      .getSubEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
    const subStandardEvt = gd.asStandardEvent(subEvent);
    subStandardEvt.getConditions().push_back(makeKeyPressedCondition('Space'));
    subStandardEvt.getActions().push_back(makeDeleteAction('MyCharacter1'));
    subStandardEvt.getActions().push_back(makeDeleteAction('MyCharacter2'));
  }

  const testInstruction = makeKeyPressedCondition('Space');

  // Global objects
  project.insertNewObject(project, 'TextObject::Text', 'GlobalTextObject', 0);
  project.insertNewObject(
    project,
    'TiledSpriteObject::TiledSprite',
    'GlobalTiledSpriteObject',
    0
  );

  // External events
  const testExternalEvents1 = project.insertNewExternalEvents(
    'TestExternalEvents1',
    0
  );
  const testExternalEvents2 = project.insertNewExternalEvents(
    'TestExternalEvents2',
    1
  );

  // Empty layout
  const emptyLayout = project.insertNewLayout('EmptyLayout', 1);

  // Layout with a long name
  project.insertNewLayout(
    'Layout with a very looooooooong naaaaame to test in the project manager',
    2
  );

  // Empty events list
  const emptyEventsList = new gd.EventsList();

  // Events functions extension
  const someAlreadyInstalledExtension = project.insertNewEventsFunctionsExtension(
    'SomeAlreadyInstalledExtension',
    0
  );
  someAlreadyInstalledExtension.setNamespace('SomeAlreadyInstalledExtension');
  someAlreadyInstalledExtension.setName('SomeAlreadyInstalledExtension');
  someAlreadyInstalledExtension.setFullName(
    'Some fake already installed extension'
  );
  someAlreadyInstalledExtension.setVersion('1.2.3');

  // Events functions extension
  const testEventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
    'TestExt',
    0
  );
  testEventsFunctionsExtension.setNamespace('MyExt');
  testEventsFunctionsExtension.setVersion('1.1');
  testEventsFunctionsExtension.setName('My name');
  testEventsFunctionsExtension.setFullName('My descriptive name');
  testEventsFunctionsExtension.setDescription('My description');

  // Events function
  const testEventsFunction = testEventsFunctionsExtension.insertNewEventsFunction(
    'MyTestFunction',
    0
  );

  const parameter1 = new gd.ParameterMetadata();
  parameter1.setType('objectList');
  parameter1.setName('MyObjectWithoutType');
  parameter1.setDescription('The first object to be used');
  const parameter2 = new gd.ParameterMetadata();
  parameter2.setType('expression');
  parameter2.setName('MyNumber');
  parameter2.setDescription('Some number');
  const parameter3 = new gd.ParameterMetadata();
  parameter3.setType('string');
  parameter3.setName('MyString');
  parameter3.setDescription('Some string');
  const parameter4 = new gd.ParameterMetadata();
  parameter4.setType('objectList');
  parameter4.setName('MySpriteObject');
  parameter4.setDescription('The second object to be used, a sprite');
  parameter4.setExtraInfo('Sprite');
  testEventsFunction.getParameters().push_back(parameter1);
  testEventsFunction.getParameters().push_back(parameter2);
  testEventsFunction.getParameters().push_back(parameter3);
  testEventsFunction.getParameters().push_back(parameter4);

  testEventsFunction
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

  testEventsFunctionsExtension.insertNewEventsFunction('MyTestFunction2', 1);
  testEventsFunctionsExtension
    .insertNewEventsFunction('MyPrivateTestFunction3', 2)
    .setPrivate(true);

  // Create more dummy objects to test events with a lot of objects
  for (var i = 0; i < 6; ++i) {
    testLayout.insertNewObject(
      project,
      'Sprite',
      'VirtualControls' + (i !== 0 ? i : ''),
      testLayout.getObjectsCount()
    );
  }

  const testSerializedEvents = JSON.parse(
    `[{"disabled":false,"folded":false,"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"inverted":false,"value":"CollisionNP"},"parameters":["MySpriteObject","MySpriteObjectWithBehaviors",""],"subInstructions":[]}],"actions":[{"type":{"inverted":false,"value":"Arreter"},"parameters":["MySpriteObjectWithBehaviors"],"subInstructions":[]},{"type":{"inverted":false,"value":"AddForceXY"},"parameters":["MySpriteObjectWithBehaviors","-150","0","1"],"subInstructions":[]}],"events":[]},{"disabled":false,"folded":false,"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"inverted":false,"value":"CollisionNP"},"parameters":["MyTextObject","MySpriteObjectWithBehaviors",""],"subInstructions":[]}],"actions":[{"type":{"inverted":false,"value":"Arreter"},"parameters":["MySpriteObjectWithBehaviors"],"subInstructions":[]},{"type":{"inverted":false,"value":"AddForceXY"},"parameters":["MySpriteObjectWithBehaviors","150","0","1"],"subInstructions":[]}],"events":[]}]`
  );

  const testSerializedEventsWithLotsOfObjects = JSON.parse(
    `[{"disabled":false,"folded":false,"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"inverted":false,"value":"CollisionNP"},"parameters":["MySpriteObject","MySpriteObjectWithBehaviors",""],"subInstructions":[]}],"actions":[{"type":{"inverted":false,"value":"Arreter"},"parameters":["MySpriteObjectWithBehaviors"],"subInstructions":[]},{"type":{"inverted":false,"value":"AddForceXY"},"parameters":["MySpriteObjectWithBehaviors","-150","0","1"],"subInstructions":[]}],"events":[]},{"disabled":false,"folded":false,"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"inverted":false,"value":"CollisionNP"},"parameters":["MyTextObject","MySpriteObjectWithBehaviors",""],"subInstructions":[]}],"actions":[{"type":{"inverted":false,"value":"Arreter"},"parameters":["MySpriteObjectWithBehaviors"],"subInstructions":[]},{"type":{"inverted":false,"value":"AddForceXY"},"parameters":["MySpriteObjectWithBehaviors","150","0","1"],"subInstructions":[]}],"events":[]}, {"disabled":false,"folded":false,"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"inverted":true,"value":"SystemInfo::IsMobile"},"parameters":[],"subInstructions":[]}],"actions":[{"type":{"inverted":false,"value":"Cache"},"parameters":["VirtualControls"],"subInstructions":[]},{"type":{"inverted":false,"value":"Cache"},"parameters":["VirtualControls2"],"subInstructions":[]},{"type":{"inverted":false,"value":"Cache"},"parameters":["VirtualControls3"],"subInstructions":[]},{"type":{"inverted":false,"value":"Cache"},"parameters":["VirtualControls4"],"subInstructions":[]},{"type":{"inverted":false,"value":"Cache"},"parameters":["VirtualControls5"],"subInstructions":[]},{"type":{"inverted":false,"value":"Cache"},"parameters":["VirtualControls5"],"subInstructions":[]}],"events":[]}]`
  );

  // Events based behavior
  const testEventsBasedBehavior = new gd.EventsBasedBehavior();
  testEventsBasedBehavior.setName('MyTestBehavior');
  testEventsBasedBehavior.setFullName('My Test Behavior');
  testEventsBasedBehavior.setDescription(
    'This is a test events based behavior.\n\nIt does a lot of cool things. It applies to SpriteObject only.'
  );
  testEventsBasedBehavior.setObjectType('Sprite');

  // Add some properties
  testEventsBasedBehavior
    .getPropertyDescriptors()
    .insertNew('NumberProperty', 0)
    .setType('Number')
    .setValue('123')
    .setLabel('My number property');
  testEventsBasedBehavior
    .getPropertyDescriptors()
    .insertNew('StringProperty', 1)
    .setType('String')
    .setValue('Hello World')
    .setLabel('My string property');
  testEventsBasedBehavior
    .getPropertyDescriptors()
    .insertNew('BooleanProperty', 2)
    .setType('Boolean')
    .setValue('true')
    .setLabel('My boolean property');

  // Add a function
  const testBehaviorEventsFunction = testEventsBasedBehavior
    .getEventsFunctions()
    .insertNewEventsFunction('MyTestFunction', 0);
  testBehaviorEventsFunction
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

  // Add a lifecycle function
  const testBehaviorLifecycleEventsFunction = testEventsBasedBehavior
    .getEventsFunctions()
    .insertNewEventsFunction('doStepPreEvents', 1);

  {
    const parameter1 = new gd.ParameterMetadata();
    parameter1.setType('object');
    parameter1.setName('Object');
    parameter1.setDescription('Object');
    const parameter2 = new gd.ParameterMetadata();
    parameter2.setType('behavior');
    parameter2.setName('Behavior');
    parameter2.setDescription('Behavior');
    testBehaviorEventsFunction.getParameters().push_back(parameter1);
    testBehaviorEventsFunction.getParameters().push_back(parameter2);
    testBehaviorLifecycleEventsFunction.getParameters().push_back(parameter1);
    testBehaviorLifecycleEventsFunction.getParameters().push_back(parameter2);
  }

  // Add an empty events based behavior
  const testEmptyEventsBasedBehavior = new gd.EventsBasedBehavior();
  testEventsBasedBehavior.setName('MyTestEmptyBehavior');
  testEventsBasedBehavior.setFullName('My Test empty Behavior');
  testEventsBasedBehavior.setDescription(
    'This is a test events based behavior, without any functions.'
  );

  // Create a layer with some effects
  const layerWithEffects = new gd.Layer();
  {
    const effect1 = layerWithEffects
      .getEffects()
      .insertNewEffect('MyEffect1', 0);
    const effect2 = layerWithEffects
      .getEffects()
      .insertNewEffect('MyEffect2', 1);
    const effect3 = layerWithEffects
      .getEffects()
      .insertNewEffect('MyEffect3', 1);
    const effect4 = layerWithEffects
      .getEffects()
      .insertNewEffect('MyEffect4', 1);

    effect1.setEffectType('FakeSepia');
    effect1.setDoubleParameter('opacity', 0.6);
    effect2.setEffectType('FakeNight');
    effect2.setDoubleParameter('intensity', 0.1);
    effect2.setDoubleParameter('opacity', 0.2);
    effect3.setEffectType('FakeEffectWithVariousParameters');
    effect3.setDoubleParameter('intensity', 0.1);
    effect3.setStringParameter('image', 'my-image');
    effect4.setEffectType('FakeDirectionalLight');
  }
  // Create a layer with some 3D effects
  const layerWith3DEffects = new gd.Layer();
  {
    const effect4 = layerWith3DEffects
      .getEffects()
      .insertNewEffect('MyEffect4', 1);

    effect4.setEffectType('FakeDirectionalLight');
  }
  // Create a layer with some 2D effects
  const layerWith2DEffects = new gd.Layer();
  {
    const effect1 = layerWith2DEffects
      .getEffects()
      .insertNewEffect('MyEffect1', 0);
    const effect2 = layerWith2DEffects
      .getEffects()
      .insertNewEffect('MyEffect2', 1);
    const effect3 = layerWith2DEffects
      .getEffects()
      .insertNewEffect('MyEffect3', 1);

    effect1.setEffectType('FakeSepia');
    effect1.setDoubleParameter('opacity', 0.6);
    effect2.setEffectType('FakeNight');
    effect2.setDoubleParameter('intensity', 0.1);
    effect2.setDoubleParameter('opacity', 0.2);
    effect3.setEffectType('FakeEffectWithVariousParameters');
    effect3.setDoubleParameter('intensity', 0.1);
    effect3.setStringParameter('image', 'my-image');
  }

  const layerWithEffectWithoutEffectType = new gd.Layer();
  layerWithEffectWithoutEffectType
    .getEffects()
    .insertNewEffect('MyEffectWithoutEffectType', 0);

  const layerWithoutEffects = new gd.Layer();

  {
    const effect1 = spriteObjectWithEffects
      .getEffects()
      .insertNewEffect('MyEffect1', 0);
    const effect2 = spriteObjectWithEffects
      .getEffects()
      .insertNewEffect('MyEffect2', 1);
    const effect3 = spriteObjectWithEffects
      .getEffects()
      .insertNewEffect('MyEffect3', 1);

    effect1.setEffectType('FakeSepia');
    effect1.setDoubleParameter('opacity', 0.6);
    effect2.setEffectType('FakeNight');
    effect2.setDoubleParameter('intensity', 0.1);
    effect2.setDoubleParameter('opacity', 0.2);
    effect3.setEffectType('FakeEffectWithVariousParameters');
    effect3.setDoubleParameter('intensity', 0.1);
    effect3.setStringParameter('image', 'my-image');
  }

  // Set up some fake parameter metadata.
  const stringRelationalOperatorParameterMetadata = new gd.ParameterMetadata();
  stringRelationalOperatorParameterMetadata.setType('relationalOperator');
  stringRelationalOperatorParameterMetadata.setDescription(
    'A fake parameter (for strings)'
  );
  stringRelationalOperatorParameterMetadata.setExtraInfo('string');

  const numberRelationalOperatorParameterMetadata = new gd.ParameterMetadata();
  numberRelationalOperatorParameterMetadata.setType('relationalOperator');
  numberRelationalOperatorParameterMetadata.setDescription(
    'A fake parameter (for number)'
  );
  numberRelationalOperatorParameterMetadata.setExtraInfo('number');

  const colorRelationalOperatorParameterMetadata = new gd.ParameterMetadata();
  colorRelationalOperatorParameterMetadata.setType('relationalOperator');
  colorRelationalOperatorParameterMetadata.setDescription(
    'A fake parameter (for colors)'
  );
  colorRelationalOperatorParameterMetadata.setExtraInfo('color');

  const unknownRelationalOperatorParameterMetadata = new gd.ParameterMetadata();
  unknownRelationalOperatorParameterMetadata.setType('relationalOperator');
  unknownRelationalOperatorParameterMetadata.setDescription(
    'A fake parameter (unknown type)'
  );
  unknownRelationalOperatorParameterMetadata.setExtraInfo(
    'whatever-this-is-not-recognised'
  );

  return {
    project,
    shapePainterObjectConfiguration: shapePainterObject.getConfiguration(),
    textObjectConfiguration: textObject.getConfiguration(),
    particleEmitterConfiguration: particleEmitter.getConfiguration(),
    tiledSpriteObjectConfiguration: tiledSpriteObject.getConfiguration(),
    panelSpriteObject,
    customObject,
    cube3dObject,
    textInputObject,
    spriteObject,
    spriteObjectConfiguration,
    emptySpriteObject,
    emptySpriteObjectConfiguration,
    testSpriteObjectInstance,
    spriteObjectWithBehaviors,
    spriteObjectWithoutBehaviors,
    testLayout,
    group1,
    group2,
    group4WithLongsNames,
    testLayoutInstance1,
    testLayoutInstance2,
    testLayoutInstance3,
    testInstruction,
    testExternalEvents1,
    testExternalEvents2,
    emptyLayout,
    emptyEventsList,
    testEventsFunction,
    testEventsFunctionsExtension,
    testSerializedEvents,
    testSerializedEventsWithLotsOfObjects,
    testEventsBasedBehavior,
    testEmptyEventsBasedBehavior,
    testBehaviorEventsFunction,
    testBehaviorLifecycleEventsFunction,
    testEventsBasedObject: buttonEventBasedObject,
    testObjectEventsFunction,
    layerWithEffects,
    layerWith3DEffects,
    layerWith2DEffects,
    layerWithEffectWithoutEffectType,
    layerWithoutEffects,
    spriteObjectWithEffects,
    spriteObjectWithoutEffects,
    stringRelationalOperatorParameterMetadata,
    numberRelationalOperatorParameterMetadata,
    colorRelationalOperatorParameterMetadata,
    unknownRelationalOperatorParameterMetadata,
    emptyObjectsContainer: new gd.ObjectsContainer(),
  };
};
