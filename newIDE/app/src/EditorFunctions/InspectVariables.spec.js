// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('inspect_variables', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('returns all global variables when no paths are requested', async () => {
    const globalVariables = project.getVariables();
    globalVariables.insertNew('highScore', 0).setValue(9000);
    globalVariables.insertNew('gameTitle', 1).setString('My Game');

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_variables.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { variable_scope: 'global' },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe('Variables of global.');
    expect(result.variables).toEqual([
      { variableName: 'highScore', type: 'Number', value: '9000' },
      { variableName: 'gameTitle', type: 'String', value: 'My Game' },
    ]);
  });

  it('returns requested structure and array paths that all exist', async () => {
    const sceneVariables = testScene.getVariables();
    const player = sceneVariables.insertNew('player', 0);
    player.castTo('structure');
    player.getChild('health').setValue(75);
    const items = sceneVariables.insertNew('items', 1);
    items.castTo('array');
    items.pushNew().setString('Sword');
    items.pushNew().setString('Shield');

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_variables.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'scene',
          scene_name: 'TestScene',
          variable_names_or_paths: ['player.health', 'items[1]'],
        },
      }
    );

    expect(result.success).toBe(true);
    // Every requested path exists, so no "Not found" is reported.
    expect(result.message).toBe('Variables of scene "TestScene".');
    expect(result.variables).toEqual([
      { variableName: 'player.health', type: 'Number', value: '75' },
      { variableName: 'items[1]', type: 'String', value: 'Shield' },
    ]);
  });

  it('returns the variables of the first member of a group', async () => {
    const sceneObjects = testScene.getObjects();
    const enemy1 = sceneObjects.insertNewObject(project, 'Sprite', 'Enemy1', 0);
    const enemy2 = sceneObjects.insertNewObject(project, 'Sprite', 'Enemy2', 1);
    enemy1
      .getVariables()
      .insertNew('hp', 0)
      .setValue(5);
    enemy2
      .getVariables()
      .insertNew('hp', 0)
      .setValue(8);
    enemy2
      .getVariables()
      .insertNew('armor', 1)
      .setValue(2);

    const group = sceneObjects.getObjectGroups().insertNew('Enemies', 0);
    group.addObject('Enemy1');
    group.addObject('Enemy2');

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_variables.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'group',
          scene_name: 'TestScene',
          object_name: 'Enemies',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Variables of scene "TestScene" group "Enemies".'
    );
    // Only the container of the FIRST member of the group is inspected:
    // Enemy2's extra "armor" variable is not listed.
    expect(result.variables).toEqual([
      { variableName: 'hp', type: 'Number', value: '5' },
    ]);
  });
});
