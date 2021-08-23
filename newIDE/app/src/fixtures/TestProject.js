// @flow

/*::
export type TestProject = {|
  project: gdProject,
  shapePainterObject: any,
  textObject: any,
  tiledSpriteObject: any,
  panelSpriteObject: any,
  spriteObject: gdSpriteObject,
  spriteObjectWithBehaviors: gdSpriteObject,
  spriteObjectWithoutBehaviors: gdSpriteObject,
  testLayout: gdLayout,
  group1: gdObjectGroup,
  group2: gdObjectGroup,
  testLayoutInstance1: gdInitialInstance,
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
  layerWithEffects: gdLayer,
  layerWithEffectWithoutEffectType: gdLayer,
  layerWithoutEffects: gdLayer,
  spriteObjectWithEffects: gdSpriteObject,
  spriteObjectWithoutEffects: gdSpriteObject,
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
  project.getResourcesManager().addResource(resource1);
  project.getResourcesManager().addResource(resource2);
  project.getResourcesManager().addResource(resource3);
  project.getResourcesManager().addResource(resource4);
  project.getResourcesManager().addResource(audioResource1);

  // Create and expose some objects
  const shapePainterObject = new gd.ShapePainterObject('MyShapePainterObject');
  const textObject = new gd.TextObject('MyTextObject');
  const tiledSpriteObject = new gd.TiledSpriteObject('MyTiledSpriteObject');
  const panelSpriteObject = new gd.PanelSpriteObject('MyPanelSpriteObject');
  const spriteObject = new gd.SpriteObject('MySpriteObject');
  const spriteObjectWithBehaviors = new gd.SpriteObject(
    'MySpriteObjectWithBehaviors'
  );
  const spriteObjectWithoutBehaviors = new gd.SpriteObject(
    'MySpriteObjectWithoutBehaviors'
  );

  {
    const animation = new gd.Animation();
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
    spriteObject.addAnimation(animation);
  }
  {
    const animation = new gd.Animation();
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
    spriteObject.addAnimation(animation);
  }
  {
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite();
    sprite1.setImageName('pixi');
    animation.getDirection(0).addSprite(sprite1);
    spriteObject.addAnimation(animation);
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

  // Add some tags
  tiledSpriteObject.setTags('Tag1');
  spriteObject.setTags('Tag1, Tag2');

  // Layout
  const testLayout = project.insertNewLayout('TestLayout', 0);
  testLayout.insertObject(shapePainterObject, 0);
  testLayout.insertObject(textObject, 0);
  testLayout.insertObject(tiledSpriteObject, 0);
  testLayout.insertObject(panelSpriteObject, 0);
  testLayout.insertObject(spriteObject, 0);
  testLayout.insertObject(spriteObjectWithBehaviors, 0);
  testLayout.insertObject(spriteObjectWithoutBehaviors, 0);

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
  testLayout.getObjectGroups().insert(group1, 0);
  testLayout.getObjectGroups().insert(group2, 1);
  testLayout.getObjectGroups().insert(group3, 2);

  const testLayoutInstance1 = testLayout
    .getInitialInstances()
    .insertNewInitialInstance();
  testLayoutInstance1.setX(10);
  testLayoutInstance1.setY(15);

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
    .getChild('Child3')
    .getChild('SubChild1')
    .setString('Hello\nMultiline\nWorld');
  testLayoutVariables.insert('Variable3', variable3, 2);

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
  const globalTextObject = new gd.TextObject('GlobalTextObject');
  const globalTiledSpriteObject = new gd.TiledSpriteObject(
    'GlobalTiledSpriteObject'
  );
  project.insertObject(globalTextObject, 0);
  project.insertObject(globalTiledSpriteObject, 0);

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

  // Empty events list
  const emptyEventsList = new gd.EventsList();

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

  const effect1 = layerWithEffects.getEffects().insertNewEffect('MyEffect1', 0);
  const effect2 = layerWithEffects.getEffects().insertNewEffect('MyEffect2', 1);
  const effect3 = layerWithEffects.getEffects().insertNewEffect('MyEffect3', 1);

  effect1.setEffectType('FakeSepia');
  effect1.setDoubleParameter('opacity', 0.6);
  effect2.setEffectType('FakeNight');
  effect2.setDoubleParameter('intensity', 0.1);
  effect2.setDoubleParameter('opacity', 0.2);
  effect3.setEffectType('FakeEffectWithVariousParameters');
  effect3.setDoubleParameter('intensity', 0.1);
  effect3.setStringParameter('image', 'my-image');

  const layerWithEffectWithoutEffectType = new gd.Layer();
  layerWithEffectWithoutEffectType
    .getEffects()
    .insertNewEffect('MyEffectWithoutEffectType', 0);

  const layerWithoutEffects = new gd.Layer();

  const spriteObjectWithoutEffects = new gd.SpriteObject(
    'MySpriteObjectWithoutEffects'
  );
  const spriteObjectWithEffects = new gd.SpriteObject(
    'MySpriteObjectWithEffects'
  );
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

  return {
    project,
    shapePainterObject,
    textObject,
    tiledSpriteObject,
    panelSpriteObject,
    spriteObject,
    spriteObjectWithBehaviors,
    spriteObjectWithoutBehaviors,
    testLayout,
    group1,
    group2,
    testLayoutInstance1,
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
    layerWithEffects,
    layerWithEffectWithoutEffectType,
    layerWithoutEffects,
    spriteObjectWithEffects,
    spriteObjectWithoutEffects,
  };
};
