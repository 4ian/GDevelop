// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('describe_instances', () => {
  let project: gdProject;
  let testScene: gdLayout;

  const addInstance = (objectName: string, x: number, y: number) => {
    const instance = testScene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName(objectName);
    instance.setX(x);
    instance.setY(y);
    return instance;
  };

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Enemy', 1);
    project.getObjects().insertNewObject(project, 'Sprite', 'GlobalHud', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('describes all the instances of the scene, including global objects', async () => {
    addInstance('Player', 10, 20);
    addInstance('Enemy', 30, 40);
    addInstance('GlobalHud', 50, 60);

    const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );

    expect(result.success).toBe(true);
    expect(result.instancesForSceneNamed).toBe('TestScene');
    const instances = result.instances || [];
    expect(instances).toHaveLength(3);
    expect(instances.map(instance => instance.name).sort()).toEqual([
      'Enemy',
      'GlobalHud',
      'Player',
    ]);
    // Each instance gets a shortened id instead of its persistentUuid.
    instances.forEach(instance => {
      expect(instance.id).toHaveLength(10);
      expect(instance.persistentUuid).toBeUndefined();
    });
    expect(result.instancesOnlyForObjectsNamed).toBeUndefined();
  });

  it('filters instances by object names (comma separated, case-insensitive)', async () => {
    addInstance('Player', 10, 20);
    addInstance('Enemy', 30, 40);
    addInstance('GlobalHud', 50, 60);

    const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          filter_by_object_name: 'player, ENEMY',
        },
      }
    );

    expect(result.success).toBe(true);
    const instances = result.instances || [];
    expect(instances).toHaveLength(2);
    expect(instances.map(instance => instance.name).sort()).toEqual([
      'Enemy',
      'Player',
    ]);
    expect(result.instancesOnlyForObjectsNamed).toBe('enemy,player');
  });

  it('returns an empty list when the filter matches no object', async () => {
    addInstance('Player', 10, 20);

    const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          filter_by_object_name: 'DoesNotExist',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.instances).toEqual([]);
    expect(result.instancesOnlyForObjectsNamed).toBe('doesnotexist');
  });

  it('fails when the scene does not exist and lists the scenes', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'MissingScene' },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Scene not found: "MissingScene". Scenes in this project: "TestScene".'
    );
  });
});

describe('describe_instances (per-instance state)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
  });

  afterEach(() => {
    project.delete();
  });

  const describeInstances = async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );
    expect(result.success).toBe(true);
    return result.instances || [];
  };

  it('reports the per-instance variables, only when the instance has some', async () => {
    const plainInstance = testScene
      .getInitialInstances()
      .insertNewInitialInstance();
    plainInstance.setObjectName('Player');
    const instanceWithVariables = testScene
      .getInitialInstances()
      .insertNewInitialInstance();
    instanceWithVariables.setObjectName('Player');
    instanceWithVariables
      .getVariables()
      .insertNew('LevelNumber', 0)
      .setValue(3);

    const instances = await describeInstances();
    expect(instances).toHaveLength(2);
    const plain = instances.find(
      instance => instance.id === plainInstance.getPersistentUuid().slice(0, 10)
    );
    const withVariables = instances.find(
      instance =>
        instance.id === instanceWithVariables.getPersistentUuid().slice(0, 10)
    );
    if (!plain || !withVariables)
      throw new Error('Expected to find both instances in the description.');

    // No key at all when the instance has no variable of its own.
    expect(plain.initialVariables).toBeUndefined();
    expect(withVariables.initialVariables).toHaveLength(1);
    expect(withVariables.initialVariables[0]).toMatchObject({
      name: 'LevelNumber',
      type: 'number',
      value: 3,
    });
    // Internal per-instance properties stay unexposed.
    instances.forEach(instance => {
      expect(instance.numberProperties).toBeUndefined();
      expect(instance.stringProperties).toBeUndefined();
    });
  });

  it('reports hidden only when the instance starts hidden', async () => {
    const visibleInstance = testScene
      .getInitialInstances()
      .insertNewInitialInstance();
    visibleInstance.setObjectName('Player');
    const hiddenInstance = testScene
      .getInitialInstances()
      .insertNewInitialInstance();
    hiddenInstance.setObjectName('Player');
    hiddenInstance.setHidden(true);

    const instances = await describeInstances();
    const visible = instances.find(
      instance =>
        instance.id === visibleInstance.getPersistentUuid().slice(0, 10)
    );
    const hidden = instances.find(
      instance =>
        instance.id === hiddenInstance.getPersistentUuid().slice(0, 10)
    );
    if (!visible || !hidden)
      throw new Error('Expected to find both instances in the description.');

    expect(visible.hidden).toBeUndefined();
    expect(hidden.hidden).toBe(true);
  });
});
