// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('create_or_replace_object (additional cases)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);

    const testSceneObjects = testScene.getObjects();
    testSceneObjects.insertNewObject(
      project,
      'Sprite',
      'Player',
      testSceneObjects.getObjectsCount()
    );
  });

  afterEach(() => {
    project.delete();
  });

  it('fails when an asset_id is provided but no asset is found', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        searchAndInstallAsset: async () =>
          Promise.resolve({
            status: 'nothing-found',
            message: 'Object not found',
            createdObjects: [],
            assetShortHeader: null,
            isTheFirstOfItsTypeInProject: false,
          }),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyAssetObject',
          asset_id: 'non-existing-asset-id',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No asset found with id "non-existing-asset-id". Object not created.'
    );
    expect(testScene.getObjects().hasObjectNamed('MyAssetObject')).toBe(false);
  });

  it('fails when replacing an existing object without search_terms, description nor asset_id', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          replace_existing_object: true,
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No search_terms/description/asset_id provided for "Player". Not replaced.'
    );
    // The object is left untouched.
    expect(testScene.getObjects().hasObjectNamed('Player')).toBe(true);
  });

  it('fails when replacing an existing object but the asset store has no match', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        searchAndInstallAsset: async () =>
          Promise.resolve({
            status: 'nothing-found',
            message: 'Object not found',
            createdObjects: [],
            assetShortHeader: null,
            isTheFirstOfItsTypeInProject: false,
          }),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          replace_existing_object: true,
          search_terms: 'something not in the store',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No asset store match for "Player" in scene "TestScene". Instead, inspect and modify the object\'s properties to match what you need.'
    );
    // The object is left untouched (and no temporary replacement object remains).
    expect(testScene.getObjects().hasObjectNamed('Player')).toBe(true);
    expect(testScene.getObjects().hasObjectNamed('PlayerReplacement')).toBe(
      false
    );
  });

  it('fails when creating from scratch with an invalid object type', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_type: 'NotARealObjectType',
          object_name: 'MyBrokenObject',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Object type "NotARealObjectType" does not exist.'
    );
    expect(testScene.getObjects().hasObjectNamed('MyBrokenObject')).toBe(false);
  });

  it('uses the asset store tag of the object type as default search terms', async () => {
    const options = makeFakeLaunchFunctionOptionsWithProject(project);
    // Wrap the working fake searchAndInstallAsset to inspect its calls.
    const searchAndInstallAsset = jest.fn(options.searchAndInstallAsset);

    const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
      {
        ...options,
        searchAndInstallAsset,
        getAssetStoreTagForNewObject: () => 'button',
        args: {
          scene_name: 'TestScene',
          object_type: 'Sprite',
          object_name: 'MyButton',
          // No search_terms nor asset_id: the assetStoreTag is used as a fallback.
        },
      }
    );

    expect(searchAndInstallAsset).toHaveBeenCalledTimes(1);
    expect(searchAndInstallAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerms: 'button, default',
        objectName: 'MyButton',
        objectType: 'Sprite',
      })
    );
    expect(result.success).toBe(true);
    expect(result.message).toEqual(
      expect.stringContaining(
        'Created object "MyButton" (type "Sprite", scene "TestScene") from asset store.'
      )
    );
    expect(testScene.getObjects().hasObjectNamed('MyButton')).toBe(true);
  });
});
