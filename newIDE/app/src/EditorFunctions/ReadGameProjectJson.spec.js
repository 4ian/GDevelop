// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('read_game_project_json', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    project.insertNewLayout('Level2', 1);
    project.insertNewLayout('Menu', 2);
    const level1 = project.getLayout('Level1');
    level1.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    level1.getObjects().insertNewObject(project, 'Sprite', 'Enemy', 1);
  });

  afterEach(() => {
    project.delete();
  });

  const launch = (args: any): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.read_game_project_json.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args,
    });

  it('reads the scene names of the live project with a wildcard path', async () => {
    const result = await launch({ path: 'scenes[*].sceneName' });
    expect(result.success).toBe(true);
    expect(result.result).toEqual(['Level1', 'Level2', 'Menu']);
    expect(result.message).toBeUndefined();
  });

  it('applies a case-insensitive contains filter on an array', async () => {
    const result = await launch({
      path: 'scenes',
      filter: { property: 'sceneName', contains: 'level' },
      maxDepth: 3,
    });
    expect(result.success).toBe(true);
    expect((result.result || []).map(scene => scene.sceneName)).toEqual([
      'Level1',
      'Level2',
    ]);
  });

  it('counts an array with countOnly', async () => {
    const result = await launch({
      path: 'scenes[0].objects',
      countOnly: true,
    });
    expect(result.success).toBe(true);
    expect(result.result).toEqual({ count: 2 });
  });

  it('paginates an array with offset/limit, appending a continuation marker', async () => {
    const result = await launch({
      path: 'scenes[*].sceneName',
      offset: 1,
      limit: 1,
    });
    expect(result.success).toBe(true);
    expect(result.result).toEqual([
      'Level2',
      '... and 1 more items (continue with offset=2)',
    ]);
  });

  it('returns a clear marker when the offset is beyond the end', async () => {
    const result = await launch({
      path: 'scenes[*].sceneName',
      offset: 10,
    });
    expect(result.success).toBe(true);
    expect(result.result).toEqual([
      '(no items: offset 10 is beyond the end - the array has 3 items)',
    ]);
  });

  it('fails with the available keys for an unknown path', async () => {
    const result = await launch({ path: 'scenes[0].unknownKey' });
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Key "unknownKey" not found. Available keys: sceneName, objects, objectGroups, sceneVariables, layers, instancesOnSceneDescription.'
    );
  });
});
