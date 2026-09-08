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

  const evaluate = (project, layout, type, expression, objectName = '') => {
    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
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
    // The variable is read from the (first) instance of the object.
    expect(code).toContain('runtimeScene.getObjects("Door")');
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
});
