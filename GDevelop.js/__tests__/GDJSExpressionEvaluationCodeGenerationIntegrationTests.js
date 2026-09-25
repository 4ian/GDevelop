const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');

describe('libGD.js - GDJS expression evaluation code generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  const makeProject = () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getVariables().insertNew('Score', 0).setValue(42);
    const inventory = layout.getVariables().insertNew('Inventory', 1);
    inventory.castTo('Structure');
    inventory.getChild('Coins').setValue(7);
    project.getVariables().insertNew('Name', 0).setString('Player 1');
    return { project, layout };
  };

  const evaluate = (
    project,
    layout,
    type,
    expression,
    objectName = '',
    evaluateForAllInstances = false
  ) => {
    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    layoutCodeGenerator.setEvaluateForAllInstances(evaluateForAllInstances);
    const code = layoutCodeGenerator.generateExpressionEvaluationCode(
      layout,
      type,
      expression,
      objectName
    );
    layoutCodeGenerator.delete();

    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);
    const serializedSceneElement = new gd.SerializerElement();
    layout.serializeTo(serializedSceneElement);
    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });

    const evaluation = new Function('runtimeScene', 'gdjs', code)(
      runtimeScene,
      gdjs
    );
    return { code, evaluation };
  };

  it('evaluates a number expression and lists the variables it uses', function () {
    const { project, layout } = makeProject();

    const { evaluation } = evaluate(
      project,
      layout,
      'number',
      'Score * 2 + Inventory.Coins'
    );
    expect(evaluation.result).toBe(42 * 2 + 7);
    expect(Object.keys(evaluation.variables)).toEqual([
      'Score',
      'Inventory.Coins',
    ]);
    expect(evaluation.variables['Score'].getAsNumber()).toBe(42);
    expect(evaluation.variables['Inventory.Coins'].getAsNumber()).toBe(7);

    project.delete();
  });

  it('evaluates a string expression using a global variable', function () {
    const { project, layout } = makeProject();

    const { evaluation } = evaluate(
      project,
      layout,
      'string',
      '"Hello " + Name'
    );
    expect(evaluation.result).toBe('Hello Player 1');
    expect(Object.keys(evaluation.variables)).toEqual(['Name']);

    project.delete();
  });

  it('gives the variable itself for a variable parameter', function () {
    const { project, layout } = makeProject();

    const { evaluation } = evaluate(project, layout, 'scenevar', 'Inventory');
    expect(evaluation.result.getChild('Coins').getAsNumber()).toBe(7);

    project.delete();
  });

  it('reads an object variable given as a generic variable', function () {
    const { project, layout } = makeProject();
    const door = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Door', 0);
    door.getVariables().insertNew('PlayerInDoorway', 0).setBool(true);

    // Only the code is checked: the minimal GDJS mock has no instances of
    // objects (and no fallback container for a missing instance).
    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    const code = layoutCodeGenerator.generateExpressionEvaluationCode(
      layout,
      'variable',
      'Door.PlayerInDoorway',
      ''
    );
    layoutCodeGenerator.delete();
    // Asked for one value only: it is read from the first instance, and the
    // number of instances is reported so that the editor can say so.
    expect(code).toContain('runtimeScene.getObjects("Door")');
    expect(code).toContain('instancesCount:');
    expect(code).toContain('instances: null');
    expect(code).toContain('getVariables()');
    expect(code).not.toContain('.get("Door")');

    project.delete();
  });

  it('resolves objects to all their instances', function () {
    const { project, layout } = makeProject();
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    const { code, evaluation } = evaluate(
      project,
      layout,
      'number',
      'Player.X() + Score'
    );
    // The lists of objects are declared in a dedicated namespace, filled with
    // all the instances of the scene (none here).
    expect(code).toContain('gdjs.__expressionEvaluationCode');
    expect(code).toContain('runtimeScene.getObjects("Player")');
    expect(evaluation.result).toBe(42);
    // `Player` is an object, not a variable.
    expect(Object.keys(evaluation.variables)).toEqual(['Score']);

    project.delete();
  });

  it('counts the instances of an object named apart from the expression', function () {
    // What a parameter of an instruction acting on an object looks like: the
    // object is given, but the expression itself does not mention it. Its
    // list must still be declared, or counting its instances reads the length
    // of a list that does not exist.
    const { project, layout } = makeProject();
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    const { code, evaluation } = evaluate(
      project,
      layout,
      'number',
      '10+10',
      'Player'
    );
    expect(code).toContain('runtimeScene.getObjects("Player")');
    expect(evaluation.result).toBe(20);
    expect(evaluation.instancesCount).toBe(0);

    project.delete();
  });

  it('reads only the first instance unless asked otherwise', function () {
    const { project, layout } = makeProject();
    const player = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    player.getVariables().insertNew('Life', 0).setValue(100);

    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    const code = layoutCodeGenerator.generateExpressionEvaluationCode(
      layout,
      'variable',
      'Player.Life',
      ''
    );
    layoutCodeGenerator.delete();

    expect(code).toContain('[0].getVariables()');
    expect(code).not.toContain('[i].getVariables()');
  });

  it('reads every instance when asked for it', function () {
    const { project, layout } = makeProject();
    const player = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    player.getVariables().insertNew('Life', 0).setValue(100);

    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    layoutCodeGenerator.setEvaluateForAllInstances(true);
    const code = layoutCodeGenerator.generateExpressionEvaluationCode(
      layout,
      'variable',
      'Player.Life',
      ''
    );
    layoutCodeGenerator.delete();

    // One value per instance, walked with a bounded loop, and the value of
    // the first instance still returned on its own.
    expect(code).toContain('[i].getVariables()');
    expect(code).toContain('gdjsEvaluatedInstances');
    expect(code).toContain('instances: gdjsEvaluatedInstances');
    expect(code).toContain('gdjsEvaluatedInstances.length < ');
    // The variables listed apart must not depend on the instance walked.
    expect(code).toContain('[0].getVariables()');
  });

  it('reads every instance of every object of a group', function () {
    const { project, layout } = makeProject();
    const player = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    player.getVariables().insertNew('Life', 0).setValue(100);
    const enemy = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Enemy', 1);
    enemy.getVariables().insertNew('Life', 0).setValue(10);
    const group = layout.getObjects().getObjectGroups().insertNew('Fighters', 0);
    group.addObject('Player');
    group.addObject('Enemy');

    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    layoutCodeGenerator.setEvaluateForAllInstances(true);
    const code = layoutCodeGenerator.generateExpressionEvaluationCode(
      layout,
      'variable',
      'Fighters.Life',
      ''
    );
    layoutCodeGenerator.delete();

    // Each object of the group is walked in turn, its instances named after
    // it, under one cap shared by the whole group.
    expect(code).toContain('instances: gdjsEvaluatedInstances');
    expect(code).toContain('[i].getVariables()');
    expect(code).toContain('objectName: "Player"');
    expect(code).toContain('objectName: "Enemy"');
    expect(code.split('gdjsEvaluatedInstances.length < ').length - 1).toBe(2);
    // Its instances are still counted, over every object of the group.
    expect(code).toContain('instancesCount:');

    project.delete();
  });
});
