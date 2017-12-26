/**
 * Create a dummy project using libGD.js filled with a
 * few elements that can be used for testing.
 *
 * @param gd The GD instance to use to create the project.
 */
export const makeTestProject = gd => {
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
  const adMobObject = new gd.AdMobObject('MyAdMobObject');
  const textObject = new gd.TextObject('MyTextObject');
  const tiledSpriteObject = new gd.TiledSpriteObject('MyTiledSpriteObject');
  const panelSpriteObject = new gd.PanelSpriteObject('MyPanelSpriteObject');
  const spriteObject = new gd.SpriteObject('MySpriteObject');
  const spriteObjectWithBehaviors = new gd.SpriteObject(
    'MySpriteObjectWithBehaviors'
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

  // Layout
  const testLayout = project.insertNewLayout('TestLayout', 0);
  testLayout.insertObject(shapePainterObject, 0);
  testLayout.insertObject(textObject, 0);
  testLayout.insertObject(tiledSpriteObject, 0);
  testLayout.insertObject(panelSpriteObject, 0);
  testLayout.insertObject(spriteObject, 0);
  testLayout.insertObject(spriteObjectWithBehaviors, 0);

  const group1 = new gd.ObjectGroup();
  group1.setName('GroupOfSprites');
  group1.addObject('MySpriteObject');
  const group2 = new gd.ObjectGroup();
  group2.setName('GroupOfObjects');
  group2.addObject('MySpriteObject');
  group2.addObject('MyTextObject');
  testLayout.getObjectGroups().insert(group1, 0);
  testLayout.getObjectGroups().insert(group2, 1);

  const testLayoutInstance1 = testLayout
    .getInitialInstances()
    .insertNewInitialInstance();
  testLayoutInstance1.setX(10);
  testLayoutInstance1.setY(15);

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
  var evt2 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 1);
  var evt3 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::ForEach', 2);
  var evt4 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::While', 3);
  var evt5 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Repeat', 4);
  var evt6 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Group', 5);
  var evt7 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Link', 6);
  var evt8 = testLayout
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::JsCode', 7);

  const groupEvent = gd.asGroupEvent(evt6);
  groupEvent.setName('Group #1');

  const jsCodeEvent = gd.asJsCodeEvent(evt8);
  jsCodeEvent.setInlineCode('console.log("Hello, World!");')
  jsCodeEvent.setParameterObjects('MyObject');

  const makeKeyPressedCondition = () => {
    const condition = new gd.Instruction();
    condition.setType('KeyPressed');
    condition.setParametersCount(2);
    condition.setParameter(1, 'Space');
    return condition;
  };

  const makeDeleteAction = objectToDelete => {
    var action = new gd.Instruction(); //Add a simple action
    action.setType('Delete');
    action.setParametersCount(2);
    action.setParameter(0, objectToDelete);
    return action;
  };

  var standardEvt = gd.asStandardEvent(evt);
  standardEvt.getConditions().push_back(makeKeyPressedCondition());
  standardEvt.getActions().push_back(makeDeleteAction('MyCharacter'));

  //Add a few sub events:
  {
    const subEvent = evt
      .getSubEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
    const subStandardEvt = gd.asStandardEvent(subEvent);
    subStandardEvt.getConditions().push_back(makeKeyPressedCondition());
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

    standardEvt.getConditions().push_back(makeKeyPressedCondition());
    standardEvt.getActions().push_back(makeDeleteAction('OtherObject' + i));
  }

  const testInstruction = makeKeyPressedCondition();

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

  return {
    project,
    shapePainterObject,
    adMobObject,
    textObject,
    tiledSpriteObject,
    panelSpriteObject,
    spriteObject,
    spriteObjectWithBehaviors,
    testLayout,
    group1,
    group2,
    testLayoutInstance1,
    testInstruction,
    testExternalEvents1,
    testExternalEvents2,
    emptyLayout,
  };
};
