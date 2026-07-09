// @flow
import { fakeAssetShortHeader1 } from '../fixtures/GDevelopServicesTestData';
import { PixiResourcesLoaderMock } from '../fixtures/TestPixiResourcesLoader';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import {
  editorFunctions,
  noEventsInSceneText,
  type EditorFunctionGenericOutput,
  type LaunchFunctionOptionsWithProject,
} from './index';

const gd: libGDevelop = global.gd;

const fake9PatchAssetShortHeader = {
  ...fakeAssetShortHeader1,
  name: 'Yellow Button',
  objectType: '9patch',
  animationsCount: 1,
};

const fake3DModelAssetShortHeader = {
  ...fakeAssetShortHeader1,
  name: 'Knight Character',
  objectType: 'Scene3D::Model3DObject',
  animationsCount: 8,
};

// Particle emitter assets have no animations count in the assets database.
const fakeParticleEmitterAssetShortHeader = {
  ...fakeAssetShortHeader1,
  name: 'Fire Sparkles',
  objectType: 'ParticleSystem::ParticleEmitter',
  animationsCount: undefined,
};

// $FlowFixMe[incompatible-type]
// $FlowFixMe[missing-local-annot]
// $FlowFixMe[cannot-resolve-name]
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('editorFunctions', () => {
  const makeFakeLaunchFunctionOptionsWithProject = (
    project: gdProject
  ): LaunchFunctionOptionsWithProject => ({
    project,
    args: {},
    i18n: makeFakeI18n(),
    editorCallbacks: {
      onOpenLayout: jest.fn(),
      onCreateProject: jest.fn(),
    },
    relatedAiRequestId: 'fake-ai-request-id',
    getRelatedAiRequestLastMessages: () => ({
      lastUserMessage: null,
      lastAssistantMessages: [],
    }),
    generateEvents: jest.fn(),
    onInstancesModifiedOutsideEditor: jest.fn(),
    onObjectGroupsModifiedOutsideEditor: jest.fn(),
    onSceneEventsModifiedOutsideEditor: jest.fn(),
    onProjectItemRenamedOutsideEditor: jest.fn(),
    toolOptions: {
      includeEventsJson: true,
    },
    ensureExtensionInstalled: jest.fn(),
    searchAndInstallAsset: async ({
      objectsContainer,
      objectName,
      objectType,
    }) => {
      const fakeFoundObjectType = objectType || 'Sprite';
      const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
        project,
        fakeFoundObjectType
      );
      const object = objectsContainer.insertNewObject(
        project,
        fakeFoundObjectType,
        objectName,
        objectsContainer.getObjectsCount()
      );

      return Promise.resolve({
        status: 'asset-installed',
        message: 'Object installed',
        createdObjects: [object],
        assetShortHeader: fakeAssetShortHeader1,
        isTheFirstOfItsTypeInProject,
      });
    },
    searchAndInstallResources: async () => {
      return Promise.resolve({
        results: [
          {
            resourceName: 'fake-resource-name',
            resourceKind: 'fake-resource-kind',
            status: 'resource-installed',
          },
        ],
      });
    },
    onObjectsModifiedOutsideEditor: jest.fn(),
    onWillDeleteScene: jest.fn(),
    onWillDeleteObject: jest.fn(),
    onWillInstallExtension: jest.fn(),
    onExtensionInstalled: jest.fn(),
    getAssetStoreTagForNewObject: () => null,
    PixiResourcesLoader: PixiResourcesLoaderMock,
  });

  describe('create_or_replace_object', () => {
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

      const globalObjects = project.getObjects();
      globalObjects.insertNewObject(
        project,
        'Sprite',
        'GlobalObjectPlayer',
        globalObjects.getObjectsCount()
      );
    });

    afterEach(() => {
      project.delete();
    });

    it('creates a new object (from scratch, because only object_type was provided)', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'MyNewTextObject',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.message).toMatchInlineSnapshot(
        `"Created object \\"MyNewTextObject\\" (type \\"TextObject::Text\\", scene \\"TestScene\\") from scratch. Properties: bold: false, characterSize: 20 (px), color: 0;0;0 (color), isOutlineEnabled: false, isShadowEnabled: false, italic: false, lineHeight: 0 (px), outlineColor: 255;255;255 (color), outlineThickness: 2 (px), shadowAngle: 90 (deg), shadowBlurRadius: 2 (px), shadowColor: 0;0;0 (color), shadowDistance: 4 (px), shadowOpacity: 127 (px), text: Text (multilinestring), textAlignment: left (choice, one of: [\\"left\\", \\"center\\", \\"right\\"]), verticalTextAlignment: top (choice, one of: [\\"top\\", \\"center\\", \\"bottom\\"]). Empty: font (resource)."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: true,
      });
    });

    it('creates a new object (from the asset store, with search_terms and object_type provided)', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'MyNewTextObject',
            search_terms: 'Very cool text object',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.message).toMatchInlineSnapshot(
        `"Created object \\"MyNewTextObject\\" (type \\"TextObject::Text\\", scene \\"TestScene\\") from asset store. Used asset \\"Dino Doux\\" (6 animation(s)). Properties: bold: false, characterSize: 20 (px), color: 0;0;0 (color), isOutlineEnabled: false, isShadowEnabled: false, italic: false, lineHeight: 0 (px), outlineColor: 255;255;255 (color), outlineThickness: 2 (px), shadowAngle: 90 (deg), shadowBlurRadius: 2 (px), shadowColor: 0;0;0 (color), shadowDistance: 4 (px), shadowOpacity: 127 (px), text: Text (multilinestring), textAlignment: left (choice, one of: [\\"left\\", \\"center\\", \\"right\\"]), verticalTextAlignment: top (choice, one of: [\\"top\\", \\"center\\", \\"bottom\\"]). Empty: font (resource)."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: true,
      });
    });

    it('creates a new object (from the asset store, with search_terms but without any specified object type)', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'SomeNewObject',
            search_terms: 'A very cool sprite for my player in my game',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.message).toMatchInlineSnapshot(
        `"Created object \\"SomeNewObject\\" (type \\"Sprite\\", scene \\"TestScene\\") from asset store. Used asset \\"Dino Doux\\" (6 animation(s)). This object type has no editable object properties."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('creates a new object from a 9patch asset, without showing its constant animations count', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          searchAndInstallAsset: async ({
            objectsContainer,
            objectName,
            objectType,
          }) => {
            const object = objectsContainer.insertNewObject(
              project,
              'TextObject::Text',
              objectName,
              objectsContainer.getObjectsCount()
            );
            return Promise.resolve({
              status: 'asset-installed',
              message: 'Object installed',
              createdObjects: [object],
              assetShortHeader: fake9PatchAssetShortHeader,
              isTheFirstOfItsTypeInProject: false,
            });
          },
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'MenuButton',
            search_terms: 'yellow button',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toEqual(
        expect.stringContaining('Used asset "Yellow Button".')
      );
      expect(result.message).not.toEqual(expect.stringContaining('animation'));
    });

    it('creates a new object from an animated 3D model asset, showing its animations count', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          searchAndInstallAsset: async ({
            objectsContainer,
            objectName,
            objectType,
          }) => {
            const object = objectsContainer.insertNewObject(
              project,
              'Sprite',
              objectName,
              objectsContainer.getObjectsCount()
            );
            return Promise.resolve({
              status: 'asset-installed',
              message: 'Object installed',
              createdObjects: [object],
              assetShortHeader: fake3DModelAssetShortHeader,
              isTheFirstOfItsTypeInProject: false,
            });
          },
          args: {
            scene_name: 'TestScene',
            object_name: 'Knight',
            search_terms: 'knight character',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toEqual(
        expect.stringContaining(
          'Used asset "Knight Character" (8 animation(s)).'
        )
      );
    });

    it('creates a new object (from scratch, fallback if not found in the asset store)', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          searchAndInstallAsset: async ({
            objectsContainer,
            objectName,
            objectType,
          }) => {
            return Promise.resolve({
              status: 'nothing-found',
              message: 'Object not found',
              createdObjects: [],
              assetShortHeader: null,
              isTheFirstOfItsTypeInProject: false,
            });
          },
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'MyNewTextObject',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.message).toMatchInlineSnapshot(
        `"Created object \\"MyNewTextObject\\" (type \\"TextObject::Text\\", scene \\"TestScene\\") from scratch. Properties: bold: false, characterSize: 20 (px), color: 0;0;0 (color), isOutlineEnabled: false, isShadowEnabled: false, italic: false, lineHeight: 0 (px), outlineColor: 255;255;255 (color), outlineThickness: 2 (px), shadowAngle: 90 (deg), shadowBlurRadius: 2 (px), shadowColor: 0;0;0 (color), shadowDistance: 4 (px), shadowOpacity: 127 (px), text: Text (multilinestring), textAlignment: left (choice, one of: [\\"left\\", \\"center\\", \\"right\\"]), verticalTextAlignment: top (choice, one of: [\\"top\\", \\"center\\", \\"bottom\\"]). Empty: font (resource)."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: true,
      });
    });

    it('returns success without creating when object already exists with same type', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'Player',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Object \\"Player\\" already exists - nothing was changed. Set replace_existing_object to true to replace its assets from the asset store."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when duplicating an existing object (same scene)', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'TheNewPlayer',
            duplicated_object_name: 'Player',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(project.getObjects().hasObjectNamed('TheNewPlayer')).toBe(false);
      expect(testScene.getObjects().hasObjectNamed('TheNewPlayer')).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Duplicated \\"Player\\" (scene \\"TestScene\\") as \\"TheNewPlayer\\" (scene \\"TestScene\\"); same type/behaviors/properties/effects."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when duplicating an existing object (and making it global)', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'TheNewPlayer',
            duplicated_object_name: 'Player',
            target_object_scope: 'global',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(project.getObjects().hasObjectNamed('TheNewPlayer')).toBe(true);
      expect(testScene.getObjects().hasObjectNamed('TheNewPlayer')).toBe(false);
      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Duplicated \\"Player\\" (scene \\"TestScene\\") as \\"TheNewPlayer\\" (global objects); same type/behaviors/properties/effects."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when duplicating an existing object (from another scene)', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();
      const otherScene = project.insertNewLayout('OtherScene', 1);
      const otherSceneObjects = otherScene.getObjects();
      otherSceneObjects.insertNewObject(
        project,
        'Sprite',
        'OtherScenePlayer',
        otherSceneObjects.getObjectsCount()
      );

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'TheNewPlayer',
            duplicated_object_name: 'OtherScenePlayer',
            duplicated_object_scene: 'OtherScene',
            target_object_scope: 'scene',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(project.getObjects().hasObjectNamed('TheNewPlayer')).toBe(false);
      expect(project.getObjects().hasObjectNamed('OtherScenePlayer')).toBe(
        false
      );
      expect(testScene.getObjects().hasObjectNamed('TheNewPlayer')).toBe(true);
      expect(testScene.getObjects().hasObjectNamed('OtherScenePlayer')).toBe(
        false
      );
      expect(otherScene.getObjects().hasObjectNamed('TheNewPlayer')).toBe(
        false
      );
      expect(otherScene.getObjects().hasObjectNamed('OtherScenePlayer')).toBe(
        true
      );
      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Duplicated \\"OtherScenePlayer\\" (scene \\"OtherScene\\") as \\"TheNewPlayer\\" (scene \\"TestScene\\"); same type/behaviors/properties/effects."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('fails when duplicating an object not existing in another scene', async () => {
      project.insertNewLayout('OtherScene', 1);

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'TheNewPlayer',
            duplicated_object_name: 'DoesNotExist',
            duplicated_object_scene: 'OtherScene',
            target_object_scope: 'scene',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"Object \\"DoesNotExist\\" not found in scene \\"OtherScene\\" nor globally. Not duplicated."`
      );
    });

    it('fails when duplicating an object not existing (in the same scene)', async () => {
      project.insertNewLayout('OtherScene', 1);

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'TheNewPlayer',
            duplicated_object_name: 'DoesNotExist',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"Object \\"DoesNotExist\\" not found in scene \\"TestScene\\" nor globally. Not duplicated."`
      );
    });

    it('returns success when replacing an existing object', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'Player',
            replace_existing_object: true,
            search_terms: 'Spaceship, Blue',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(project.getObjects().hasObjectNamed('PlayerReplacement')).toBe(
        false
      );
      expect(project.getObjects().hasObjectNamed('Player')).toBe(false);
      expect(testScene.getObjects().hasObjectNamed('PlayerReplacement')).toBe(
        false
      );
      expect(testScene.getObjects().hasObjectNamed('Player')).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Replaced scene \\"TestScene\\" object \\"Player\\" with asset store object (same type \\"Sprite\\"). Used asset \\"Dino Doux\\" (6 animation(s))."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when moving an existing object to the global objects', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'Player',
            replace_existing_object: true, // This has no impact.
            target_object_scope: 'global',
            search_terms: '', // This has no impact.
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(project.getObjects().hasObjectNamed('PlayerReplacement')).toBe(
        false
      );
      expect(project.getObjects().hasObjectNamed('Player')).toBe(true);
      expect(testScene.getObjects().hasObjectNamed('PlayerReplacement')).toBe(
        false
      );
      expect(testScene.getObjects().hasObjectNamed('Player')).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"Moved \\"Player\\" to global objects; type/behaviors/properties/effects unchanged."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('fails when moving a scene object to a global object when there is one already', async () => {
      // Add an object, with the same name as the global object, in the scene
      // so we can try then to move it.
      testScene
        .getObjects()
        .insertNewObject(
          project,
          'Sprite',
          'GlobalObjectPlayer',
          testScene.getObjects().getObjectsCount()
        );

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'GlobalObjectPlayer',
            target_object_scope: 'global',
            search_terms: '', // This has no impact.
          },
        }
      );

      expect(result.message).toMatchInlineSnapshot(
        `"Object \\"GlobalObjectPlayer\\" already exists globally. No change."`
      );
      expect(project.getObjects().hasObjectNamed('GlobalObjectPlayer')).toBe(
        true
      );
      expect(testScene.getObjects().hasObjectNamed('GlobalObjectPlayer')).toBe(
        true
      );
      expect(result.success).toBe(false);
    });

    it('fails when moving an existing global object to a scene', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'GlobalObjectPlayer',
            target_object_scope: 'scene',
            search_terms: '', // This has no impact.
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.message).toMatchInlineSnapshot(
        `"\\"GlobalObjectPlayer\\" is global; global objects cannot be moved to scene \\"TestScene\\"."`
      );
      expect(project.getObjects().hasObjectNamed('GlobalObjectPlayer')).toBe(
        true
      );
      expect(testScene.getObjects().hasObjectNamed('GlobalObjectPlayer')).toBe(
        false
      );
      expect(result.success).toBe(false);
    });

    it('fails when scene does not exist', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'NonExistentScene',
            object_type: 'Sprite',
            object_name: 'Player',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"Scene not found: \\"NonExistentScene\\". Scenes in this project: \\"TestScene\\"."`
      );
    });

    it('creates a new object via asset_id without object_type', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          searchAndInstallAsset: async ({
            objectsContainer,
            objectName,
            objectType,
          }) => {
            // The helper derives the type from the asset itself.
            const object = objectsContainer.insertNewObject(
              project,
              'Sprite',
              objectName,
              objectsContainer.getObjectsCount()
            );
            return Promise.resolve({
              status: 'asset-installed',
              message: 'Object installed',
              createdObjects: [object],
              assetShortHeader: fakeAssetShortHeader1,
              isTheFirstOfItsTypeInProject: false,
            });
          },
          args: {
            scene_name: 'TestScene',
            object_name: 'MyAssetObject',
            asset_id: fakeAssetShortHeader1.id,
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.success).toBe(true);
      expect(testScene.getObjects().hasObjectNamed('MyAssetObject')).toBe(true);
    });

    it('fails when creating a new object without object_type, search_terms nor asset_id', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyAssetObject',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"No search_terms or asset_id provided for \\"MyAssetObject\\". Not created."`
      );
    });

    it('replaces an existing object without specifying object_type', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Player',
            replace_existing_object: true,
            search_terms: 'Spaceship, Blue',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Replaced scene \\"TestScene\\" object \\"Player\\" with asset store object (same type \\"Sprite\\"). Used asset \\"Dino Doux\\" (6 animation(s))."`
      );
    });

    it('replaces an existing object with a particle emitter asset, which has no animations count', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          searchAndInstallAsset: async ({
            objectsContainer,
            objectName,
            objectType,
          }) => {
            const object = objectsContainer.insertNewObject(
              project,
              objectType || 'Sprite',
              objectName,
              objectsContainer.getObjectsCount()
            );
            return Promise.resolve({
              status: 'asset-installed',
              message: 'Object installed',
              createdObjects: [object],
              // $FlowFixMe[incompatible-type] - the AssetShortHeader type declares animationsCount as required, but particle emitter assets have none in the assets database.
              assetShortHeader: fakeParticleEmitterAssetShortHeader,
              isTheFirstOfItsTypeInProject: false,
            });
          },
          args: {
            scene_name: 'TestScene',
            object_name: 'Player',
            replace_existing_object: true,
            search_terms: 'fire sparkles',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toEqual(
        expect.stringContaining('Used asset "Fire Sparkles".')
      );
      expect(result.message).not.toEqual(expect.stringContaining('animation'));
      expect(result.message).not.toEqual(expect.stringContaining('undefined'));
    });

    it('fails when object_type conflicts with an existing object type', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'Player',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"Object \\"Player\\" already exists in scene \\"TestScene\\" with type \\"Sprite\\". Cannot (re)create as type \\"TextObject::Text\\"."`
      );
    });

    it('reports global scope when creating a global object from scratch', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          searchAndInstallAsset: async () =>
            Promise.resolve({
              status: 'nothing-found',
              message: '',
              createdObjects: [],
              assetShortHeader: null,
              isTheFirstOfItsTypeInProject: false,
            }),
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'GlobalText',
            target_object_scope: 'global',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(project.getObjects().hasObjectNamed('GlobalText')).toBe(true);
      expect(testScene.getObjects().hasObjectNamed('GlobalText')).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining(
          'Created object "GlobalText" (type "TextObject::Text", global) from scratch.'
        )
      );
    });

    it('reports global scope when creating a global object from the asset store', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'Sprite',
            object_name: 'GlobalSprite',
            target_object_scope: 'global',
            search_terms: 'cool sprite',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(project.getObjects().hasObjectNamed('GlobalSprite')).toBe(true);
      expect(result.message).toEqual(
        expect.stringContaining(
          'Created object "GlobalSprite" (type "Sprite", global) from asset store.'
        )
      );
    });
  });

  describe('change_object_property', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);

      // Add font resources to the project
      const fontResource1 = new gd.FontResource();
      fontResource1.setName('font1.ttf');
      fontResource1.setFile('font1.ttf');
      const fontResource2 = new gd.FontResource();
      fontResource2.setName('font2.ttf');
      fontResource2.setFile('font2.ttf');
      project.getResourcesManager().addResource(fontResource1);
      project.getResourcesManager().addResource(fontResource2);
      const audioResource1 = new gd.AudioResource();
      audioResource1.setName('audio1.aac');
      audioResource1.setFile('audio1.aac');
      project.getResourcesManager().addResource(audioResource1);

      // Create a TextObject with a font property (resource type)
      const testSceneObjects = testScene.getObjects();
      const textObject = testSceneObjects.insertNewObject(
        project,
        'TextObject::Text',
        'MyTextObject',
        testSceneObjects.getObjectsCount()
      );
      // Set the font property to an existing resource
      textObject.getConfiguration().updateProperty('font', 'font1.ttf');
    });

    afterEach(() => {
      project.delete();
    });

    it('successfully changes a resource property from one existing resource to another', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyTextObject',
            changed_properties: [
              {
                property_name: 'font',
                new_value: 'font2.ttf',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(`
        "Done.
        Set \\"font\\" on \\"MyTextObject\\" = \\"font2.ttf\\"."
      `);

      // Verify the property was actually changed
      const textObject = testScene.getObjects().getObject('MyTextObject');
      const fontProperty = textObject
        .getConfiguration()
        .getProperties()
        .get('font');
      expect(fontProperty.getValue()).toBe('font2.ttf');
    });

    it('fails when changing a resource property to a non-existing resource', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyTextObject',
            changed_properties: [
              {
                property_name: 'font',
                new_value: 'non-existing-font.ttf',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(`
        "No changes. Issues:
        \\"font\\" on \\"MyTextObject\\" -> \\"non-existing-font.ttf\\": resource \\"non-existing-font.ttf\\" does not exist. New resources cannot be added just by name; use \`create_or_replace_object\` to import assets from the asset store (preserving properties/behaviors/events)."
      `);

      // Verify the property was NOT changed (still the original value)
      const textObject = testScene.getObjects().getObject('MyTextObject');
      const fontProperty = textObject
        .getConfiguration()
        .getProperties()
        .get('font');
      expect(fontProperty.getValue()).toBe('font1.ttf');
    });

    it('fails when changing a resource property to one with a different type', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyTextObject',
            changed_properties: [
              {
                property_name: 'font',
                new_value: 'audio1.aac',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(`
        "No changes. Issues:
        \\"font\\" on \\"MyTextObject\\" -> \\"audio1.aac\\": resource \\"audio1.aac\\" has kind \\"audio\\" but expected \\"font\\"."
      `);

      // Verify the property was NOT changed (still the original value)
      const textObject = testScene.getObjects().getObject('MyTextObject');
      const fontProperty = textObject
        .getConfiguration()
        .getProperties()
        .get('font');
      expect(fontProperty.getValue()).toBe('font1.ttf');
    });
  });

  describe('change_object_property', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);

      // Add font resources to the project
      const fontResource1 = new gd.FontResource();
      fontResource1.setName('font1.ttf');
      fontResource1.setFile('font1.ttf');
      project.getResourcesManager().addResource(fontResource1);

      // Create a TextObject with a font property (resource type)
      const testSceneObjects = testScene.getObjects();
      const textObject = testSceneObjects.insertNewObject(
        project,
        'TextObject::Text',
        'MyTextObject',
        testSceneObjects.getObjectsCount()
      );
      // Set the font property to an existing resource
      textObject.getConfiguration().updateProperty('font', 'font1.ttf');
    });

    afterEach(() => {
      project.delete();
    });

    it('handles various property types: resource, non-existing, boolean, and number with sanitization warning', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyTextObject',
            changed_properties: [
              // Valid change but a property name with a typo
              {
                property_name: 'Character-size_',
                new_value: '56',
              },
              // Change a choice
              {
                property_name: 'textAlignment',
                new_value: 'INVALID_CHOICE',
              },
              {
                property_name: 'verticalTextAlignment',
                new_value: 'BoTTOm',
              },
              // Try to change a non-existing property
              {
                property_name: 'nonExistingProperty',
                new_value: 'someValue',
              },
              // Change a boolean property with "true"
              {
                property_name: 'bold',
                new_value: 'YES',
              },
              {
                property_name: 'isShadowEnabled',
                new_value: '1',
              },
              // Change a boolean property with "FALSE"
              {
                property_name: 'italic',
                new_value: 'FALSE',
              },
              // Change a number property with a value that will be sanitized
              {
                property_name: 'shadowAngle',
                new_value: '20,40 , 50',
              },
              {
                property_name: 'shadowDistance',
                new_value: '20X   40 X 50',
              },
              {
                property_name: 'shadowBlurRadius',
                new_value: '20.41 × 50',
              },
            ],
          },
        }
      );

      // The operation should succeed overall (some changes were made)
      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(`
        "Done with warnings.
        Set \\"characterSize\\" on \\"MyTextObject\\" = \\"56\\".
        Set \\"verticalTextAlignment\\" on \\"MyTextObject\\" = \\"bottom\\".
        Set \\"bold\\" on \\"MyTextObject\\" = \\"true\\".
        Set \\"isShadowEnabled\\" on \\"MyTextObject\\" = \\"true\\".
        Set \\"italic\\" on \\"MyTextObject\\" = \\"false\\".
        Set \\"shadowAngle\\" on \\"MyTextObject\\" = \\"20\\".
        Set \\"shadowDistance\\" on \\"MyTextObject\\" = \\"0\\".
        Set \\"shadowBlurRadius\\" on \\"MyTextObject\\" = \\"20.41\\".
        Warnings:
        Could not set \\"textAlignment\\" on \\"MyTextObject\\": invalid value or type.
        Property \\"nonExistingProperty\\" not found on object \\"MyTextObject\\". Available properties: bold, characterSize, color, font, isOutlineEnabled, isShadowEnabled, italic, lineHeight, outlineColor, outlineThickness, shadowAngle, shadowBlurRadius, shadowColor, shadowDistance, shadowOpacity, text, textAlignment, verticalTextAlignment.
        \\"shadowAngle\\" on \\"MyTextObject\\" = \\"20\\", but requested \\"20,40 , 50\\" looks multi-dimensional; only a single number is allowed.
        \\"shadowDistance\\" on \\"MyTextObject\\" = \\"0\\", but requested \\"20X   40 X 50\\" looks multi-dimensional; only a single number is allowed.
        \\"shadowBlurRadius\\" on \\"MyTextObject\\" = \\"20.41\\", but requested \\"20.41 × 50\\" looks multi-dimensional; only a single number is allowed."
      `);

      // Verify the properties were actually changed
      const textObject = testScene.getObjects().getObject('MyTextObject');
      const properties = textObject.getConfiguration().getProperties();

      expect(properties.get('characterSize').getValue()).toBe('56');
      expect(properties.get('bold').getValue()).toBe('true');
      expect(properties.get('italic').getValue()).toBe('false');
      expect(properties.get('shadowAngle').getValue()).toBe('20');
    });

    it('lists the available properties only once when several properties are not found', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyTextObject',
            changed_properties: [
              { property_name: 'fontSize', new_value: '56' },
              { property_name: 'scaleX', new_value: '2' },
              { property_name: 'wrongProperty', new_value: '3' },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(
        (result.message || '').split('Available properties:').length - 1
      ).toBe(1);
    });

    it('reports the FINAL renamed name when a collision forces a suffix', async () => {
      // The scene already has another object named "Foo": renaming
      // MyTextObject -> Foo must collide and end up as "Foo2".
      testScene
        .getObjects()
        .insertNewObject(
          project,
          'Sprite',
          'Foo',
          testScene.getObjects().getObjectsCount()
        );

      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyTextObject',
            changed_properties: [
              {
                property_name: 'name',
                new_value: 'Foo',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      // Final name reported is "Foo2", not the requested "Foo".
      expect(result.message).toMatchInlineSnapshot(`
        "Done.
        Renamed object \\"MyTextObject\\" to \\"Foo2\\" (events and references updated)."
      `);
      // Original "Foo" still exists; the renamed one is "Foo2".
      expect(testScene.getObjects().hasObjectNamed('Foo')).toBe(true);
      expect(testScene.getObjects().hasObjectNamed('Foo2')).toBe(true);
      expect(testScene.getObjects().hasObjectNamed('MyTextObject')).toBe(false);
    });
  });

  describe('change_object_properties_effects (object effects)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      makeTestExtensions(gd);
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
      const testSceneObjects = testScene.getObjects();
      testSceneObjects.insertNewObject(
        project,
        'Sprite',
        'MySprite',
        testSceneObjects.getObjectsCount()
      );
    });

    afterEach(() => {
      project.delete();
    });

    it('redirects the old "change_object_property" name to the same implementation', () => {
      expect(editorFunctions.change_object_property).toBe(
        editorFunctions.change_object_properties_effects
      );
    });

    it('creates a new effect on the object (not on any layer) and reports it with a single message', async () => {
      const result = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            changed_effects: [
              {
                effect_name: 'MySepia',
                effect_type: 'FakeSepia',
                changed_properties: [
                  { property_name: 'opacity', new_value: '0.5' },
                ],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Created new "MySepia" effect');
      expect(result.message).not.toContain('Modified "opacity"');

      const object = testScene.getObjects().getObject('MySprite');
      const effectsContainer = object.getEffects();
      expect(effectsContainer.getEffectsCount()).toBe(1);
      expect(
        effectsContainer.getEffect('MySepia').getDoubleParameter('opacity')
      ).toBe(0.5);

      // The base layer must not have received the effect.
      expect(
        testScene
          .getLayers()
          .getLayer('')
          .getEffects()
          .getEffectsCount()
      ).toBe(0);
    });

    it('updates and deletes existing object effects', async () => {
      await editorFunctions.change_object_properties_effects.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          changed_effects: [
            { effect_name: 'ToRemove', effect_type: 'FakeSepia' },
            { effect_name: 'ToKeep', effect_type: 'FakeNight' },
          ],
        },
      });

      const result = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            changed_effects: [
              { effect_name: 'ToRemove', delete_this_effect: true },
              {
                effect_name: 'ToKeep',
                changed_properties: [
                  { property_name: 'intensity', new_value: '0.3' },
                ],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Removed "ToRemove" effect on object "MySprite".'
      );
      expect(result.message).toContain(
        'Modified "intensity" property of the "ToKeep" effect to "0.3".'
      );

      const effectsContainer = testScene
        .getObjects()
        .getObject('MySprite')
        .getEffects();
      expect(effectsContainer.hasEffectNamed('ToRemove')).toBe(false);
      expect(effectsContainer.hasEffectNamed('ToKeep')).toBe(true);
    });

    it('changes properties and effects together in a single call', async () => {
      const result = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            changed_properties: [
              { property_name: 'name', new_value: 'MySprite' },
            ],
            changed_effects: [
              { effect_name: 'MyNight', effect_type: 'FakeNight' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('already named "MySprite"');
      expect(result.message).toContain('Created new "MyNight" effect');

      const effectsContainer = testScene
        .getObjects()
        .getObject('MySprite')
        .getEffects();
      expect(effectsContainer.hasEffectNamed('MyNight')).toBe(true);
    });

    it('warns and does not add an effect on an object type with no effect capability', async () => {
      const testSceneObjects = testScene.getObjects();
      testSceneObjects.insertNewObject(
        project,
        'FakeScene3D::Cube3DObject',
        'MyCube',
        testSceneObjects.getObjectsCount()
      );

      const result = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyCube',
            changed_effects: [
              { effect_name: 'MySepia', effect_type: 'FakeSepia' },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'Object "MyCube" does not support effects'
      );
      expect(
        testScene
          .getObjects()
          .getObject('MyCube')
          .getEffects()
          .getEffectsCount()
      ).toBe(0);
    });
  });

  describe('change_object_properties_effects (delete_this_object)', () => {
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

    it('deletes a scene object and its instances when delete_this_object is true', async () => {
      const sceneObjects = testScene.getObjects();
      sceneObjects.insertNewObject(project, 'Sprite', 'MySprite', 0);
      const instance = testScene
        .getInitialInstances()
        .insertNewInitialInstance();
      instance.setObjectName('MySprite');

      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            delete_this_object: true,
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Deleted object "MySprite"');
      expect(sceneObjects.hasObjectNamed('MySprite')).toBe(false);
      expect(
        testScene.getInitialInstances().hasInstancesOfObject('MySprite')
      ).toBe(false);
    });

    it('deletes a global object and removes it from groups', async () => {
      const globalObjects = project.getObjects();
      globalObjects.insertNewObject(project, 'Sprite', 'GlobalSprite', 0);
      const group = globalObjects.getObjectGroups().insertNew('AllSprites', 0);
      group.addObject('GlobalSprite');

      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'GlobalSprite',
            delete_this_object: true,
          },
        }
      );

      expect(result.success).toBe(true);
      expect(globalObjects.hasObjectNamed('GlobalSprite')).toBe(false);
      expect(group.find('GlobalSprite')).toBe(false);
    });

    it('fails when the object is not found', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Ghost',
            delete_this_object: true,
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Object not found');
    });

    it('notifies the editor of the deleted object name, so it can close any related dialog/panel', async () => {
      testScene.getObjects().insertNewObject(project, 'Sprite', 'MySprite', 0);
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);

      await editorFunctions.change_object_properties_effects.launchFunction({
        ...fakeOptions,
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          delete_this_object: true,
        },
      });

      expect(fakeOptions.onWillDeleteObject).toHaveBeenCalledWith({
        scene: testScene,
        objectName: 'MySprite',
      });
      expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
        { scene: testScene }
      );
      expect(fakeOptions.onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });
  });

  describe('inspect_object_properties_effects (object effects)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      makeTestExtensions(gd);
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
      const testSceneObjects = testScene.getObjects();
      const object = testSceneObjects.insertNewObject(
        project,
        'Sprite',
        'MySprite',
        testSceneObjects.getObjectsCount()
      );
      const effect = object.getEffects().insertNewEffect('MySepia', 0);
      effect.setEffectType('FakeSepia');
      effect.setDoubleParameter('opacity', 0.7);
    });

    afterEach(() => {
      project.delete();
    });

    it('redirects the old "inspect_object_properties" name to the same implementation', () => {
      expect(editorFunctions.inspect_object_properties).toBe(
        editorFunctions.inspect_object_properties_effects
      );
    });

    it('returns the object properties as well as its own effects', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.properties).toBeTruthy();
      expect(result.effects).toEqual([
        expect.objectContaining({
          effectName: 'MySepia',
          effectType: 'FakeSepia',
        }),
      ]);
    });

    it('does not include an effects field for an object type with no effect capability', async () => {
      const testSceneObjects = testScene.getObjects();
      testSceneObjects.insertNewObject(
        project,
        'FakeScene3D::Cube3DObject',
        'MyCube',
        testSceneObjects.getObjectsCount()
      );

      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyCube',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.effects).toBeUndefined();
    });
  });

  describe('change_behavior_property', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);

      // Create a Sprite object and add a PlatformerObject behavior to it
      const testSceneObjects = testScene.getObjects();
      const spriteObject = testSceneObjects.insertNewObject(
        project,
        'Sprite',
        'MySprite',
        testSceneObjects.getObjectsCount()
      );

      // Add PlatformerObject behavior
      spriteObject.addNewBehavior(
        project,
        'PlatformBehavior::PlatformerObjectBehavior',
        'PlatformerObject'
      );
    });

    afterEach(() => {
      project.delete();
    });

    it('changes behavior properties with warnings for invalid values', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_name: 'PlatformerObject',
            changed_properties: [
              // Change number properties
              {
                property_name: 'GRAVITY',
                new_value: '1500',
              },
              {
                property_name: 'JumpSpeed',
                new_value: '800',
              },
              {
                property_name: 'Max_speed',
                new_value: '300 x 20',
              },
              // Change a boolean property with "true"
              {
                property_name: 'CanGrabPlatforms',
                new_value: 'true',
              },
              // Change a boolean property with "FALSE"
              {
                property_name: 'IgnoreDefaultControls',
                new_value: 'FALSE',
              },
              // Try to change a non-existing property
              {
                property_name: 'nonExistingProperty',
                new_value: 'someValue',
              },
            ],
          },
        }
      );

      // The operation should succeed overall (some changes were made)
      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(`
        "Done with warnings.
        Set \\"Gravity\\" on behavior \\"PlatformerObject\\" = \\"1500\\".
        Set \\"JumpSpeed\\" on behavior \\"PlatformerObject\\" = \\"800\\".
        Set \\"MaxSpeed\\" on behavior \\"PlatformerObject\\" = \\"300\\".
        Set \\"CanGrabPlatforms\\" on behavior \\"PlatformerObject\\" = \\"true\\".
        Set \\"IgnoreDefaultControls\\" on behavior \\"PlatformerObject\\" = \\"false\\".
        Warnings:
        \\"MaxSpeed\\" on behavior \\"PlatformerObject\\" = \\"300\\", but requested \\"300 x 20\\" looks multi-dimensional; only a single number is allowed.
        Property \\"nonExistingProperty\\" not on behavior \\"PlatformerObject\\" of \\"MySprite\\". Available properties: Acceleration, CanGoDownFromJumpthru, CanGrabPlatforms, CanGrabWithoutMoving, Deceleration, Gravity, IgnoreDefaultControls, JumpSpeed, JumpSustainTime, LadderClimbingSpeed, MaxFallingSpeed, MaxSpeed, SlopeMaxAngle, XGrabTolerance, YGrabOffset."
      `);

      // Verify the behavior properties were actually changed
      const spriteObject = testScene.getObjects().getObject('MySprite');
      const behavior = spriteObject.getBehavior('PlatformerObject');
      const behaviorProperties = behavior.getProperties();

      expect(behaviorProperties.get('Gravity').getValue()).toBe('1500');
      expect(behaviorProperties.get('JumpSpeed').getValue()).toBe('800');
      expect(behaviorProperties.get('MaxSpeed').getValue()).toBe('300');
      expect(behaviorProperties.get('CanGrabPlatforms').getValue()).toBe(
        'true'
      );
      expect(behaviorProperties.get('IgnoreDefaultControls').getValue()).toBe(
        'false'
      );
    });
  });

  describe('read_scene_events', () => {
    let project: gdProject;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('TestScene', 0);
    });

    afterEach(() => {
      project.delete();
    });

    it('returns a placeholder when the scene has no events', async () => {
      const result = await editorFunctions.read_scene_events.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      });

      expect(result.success).toBe(true);
      expect(result.eventsAsText).toBe(noEventsInSceneText);
    });
  });

  describe('add_scene_events', () => {
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

    it('adds events to a scene and installs missing resources', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const onSceneEventsModifiedOutsideEditor = jest.fn();
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const searchAndInstallResources = jest.fn().mockResolvedValue({
        results: [
          {
            resourceName: 'explosion.png',
            resourceKind: 'image',
            status: 'resource-installed',
          },
          {
            resourceName: 'explosion.wav',
            resourceKind: 'audio',
            status: 'resource-installed',
          },
        ],
      });
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const ensureExtensionInstalled = jest.fn().mockResolvedValue(undefined);

      const result = await editorFunctions.add_scene_events.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          events_description:
            'When the player presses space, play an explosion sound and show an explosion effect',
          extension_names_list: '',
          objects_list: 'Player',
        },
        // $FlowFixMe[underconstrained-implicit-instantiation]
        generateEvents: jest.fn().mockResolvedValue({
          generationCompleted: true,
          aiGeneratedEvent: {
            id: 'test-ai-event-id',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            userId: 'test-user',
            status: 'ready',
            partialGameProjectJson: '{}',
            eventsDescription:
              'When the player presses space, play an explosion sound and show an explosion effect',
            extensionNamesList: '',
            objectsList: 'Player',
            existingEventsAsText: '',
            existingEventsJson: null,
            existingEventsJsonUserRelativeKey: null,
            resultMessage: 'Successfully added explosion events.',
            changes: [
              {
                operationName: 'insert_at_end',
                operationTargetEvent: null,
                isEventsJsonValid: true,
                generatedEvents: JSON.stringify([
                  {
                    type: 'BuiltinCommonInstructions::Standard',
                    conditions: [],
                    actions: [],
                  },
                ]),
                areEventsValid: true,
                extensionNames: [],
                diagnosticLines: [],
                undeclaredVariables: [],
                undeclaredObjectVariables: {},
                missingObjectBehaviors: {},
                missingResources: [
                  { resourceName: 'explosion.png', resourceKind: 'image' },
                  { resourceName: 'explosion.wav', resourceKind: 'audio' },
                ],
              },
            ],
            error: null,
            stats: null,
          },
        }),
        onSceneEventsModifiedOutsideEditor,
        ensureExtensionInstalled,
        searchAndInstallResources,
      });

      expect(result).toMatchInlineSnapshot(`
        Object {
          "aiGeneratedEventId": "test-ai-event-id",
          "message": "Successfully added explosion events.",
          "newlyAddedResources": Array [
            Object {
              "resourceKind": "image",
              "resourceName": "explosion.png",
              "status": "resource-installed",
            },
            Object {
              "resourceKind": "audio",
              "resourceName": "explosion.wav",
              "status": "resource-installed",
            },
          ],
          "success": true,
        }
      `);

      expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        newOrChangedAiGeneratedEventIds: new Set(['test-ai-event-id']),
      });
    });
  });

  describe('add_or_edit_variable', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);

      // A scene-scoped sprite and a global sprite, to exercise the two
      // object-variable scope branches.
      testScene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
      project.getObjects().insertNewObject(project, 'Sprite', 'GlobalEnemy', 0);
    });

    afterEach(() => {
      project.delete();
    });

    it('reports scope and new value for a global variable (added)', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'score',
          variable_scope: 'global',
          value: '42',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added global variable \\"score\\" (Number) = 42"`
      );
    });

    it('reports scope and new value for a scene variable (added)', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'lives',
          variable_scope: 'scene',
          scene_name: 'TestScene',
          value: '3',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added scene \\"TestScene\\" variable \\"lives\\" (Number) = 3"`
      );
    });

    it('reports scope and new value for a scene-object variable (added)', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'health',
          variable_scope: 'object',
          scene_name: 'TestScene',
          object_name: 'Player',
          value: '100',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added scene \\"TestScene\\" object \\"Player\\" variable \\"health\\" (Number) = 100"`
      );
    });

    it('reports scope and new value for a global-object variable (added)', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'speed',
          variable_scope: 'object',
          object_name: 'GlobalEnemy',
          value: '50',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added global object \\"GlobalEnemy\\" variable \\"speed\\" (Number) = 50"`
      );
    });

    it('truncates the value to 200 chars in the success message', async () => {
      const longValue = 'x'.repeat(450);
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'longText',
          variable_scope: 'global',
          value: longValue,
        },
      });

      expect(result.success).toBe(true);
      // 200 'x' kept, then the truncation tag mentioning the remaining 250 chars.
      expect(result.message).toBe(
        `Added global variable "longText" (String) = ${'x'.repeat(
          200
        )}[...truncated - 250 more characters]`
      );
    });

    it('does not truncate when value is exactly 200 chars', async () => {
      const value = 'a'.repeat(200);
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'edgeCase',
          variable_scope: 'global',
          value,
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        `Added global variable "edgeCase" (String) = ${value}`
      );
    });

    it('reports the new value when editing an existing variable', async () => {
      const variables = project.getVariables();
      variables.insertNew('greeting', 0).setString('hi');

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'greeting',
          variable_scope: 'global',
          value: 'hello world',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Edited global variable \\"greeting\\" = hello world"`
      );
    });

    it('creates a structure variable from a JSON object value', async () => {
      const value = '{"hp": 10, "name": "Hero", "alive": true}';
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'stats',
          variable_scope: 'global',
          value,
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        `Added global variable "stats" (Structure) = ${value}`
      );

      // The variable is actually persisted as a structure with each child set.
      const variable = project.getVariables().get('stats');
      expect(variable.getType()).toBe(gd.Variable.Structure);
      expect(variable.getChild('hp').getValue()).toBe(10);
      expect(variable.getChild('name').getString()).toBe('Hero');
      expect(variable.getChild('alive').getBool()).toBe(true);
    });

    it('sets a nested field inside an existing structure', async () => {
      // Pre-populate a structure with a child field.
      const variables = project.getVariables();
      const struct = variables.insertNew('player', 0);
      struct.castTo('structure');
      struct.getChild('hp').setValue(10);

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'player.hp',
          variable_scope: 'global',
          value: '42',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Edited global variable \\"player.hp\\" = 42"`
      );
      expect(struct.getChild('hp').getValue()).toBe(42);
    });

    it('adds a deeply nested structure path (path-based creation)', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'config.audio.volume',
          variable_scope: 'global',
          value: '0.8',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added global variable \\"config.audio.volume\\" (Number) = 0.8"`
      );
      const config = project.getVariables().get('config');
      expect(config.getType()).toBe(gd.Variable.Structure);
      expect(
        config
          .getChild('audio')
          .getChild('volume')
          .getValue()
      ).toBeCloseTo(0.8);
    });

    it('sets an element of an array variable', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'inventory[2]',
          variable_scope: 'global',
          value: 'Magic Sword',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added global variable \\"inventory[2]\\" (String) = Magic Sword"`
      );
      const inventory = project.getVariables().get('inventory');
      expect(inventory.getType()).toBe(gd.Variable.Array);
      expect(inventory.getChildrenCount()).toBe(3);
      expect(inventory.getAtIndex(2).getString()).toBe('Magic Sword');
    });

    it('preserves existing sibling fields when editing one field of a structure', async () => {
      // Pre-populate a structure with multiple children to ensure none are lost.
      const variables = project.getVariables();
      const struct = variables.insertNew('player', 0);
      struct.castTo('structure');
      struct.getChild('hp').setValue(10);
      struct.getChild('name').setString('Hero');
      struct.getChild('alive').setBool(true);

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'player.hp',
          variable_scope: 'global',
          value: '42',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Edited global variable \\"player.hp\\" = 42"`
      );
      expect(struct.getType()).toBe(gd.Variable.Structure);
      expect(struct.getChild('hp').getValue()).toBe(42);
      // Siblings must still be intact (no data loss from cast).
      expect(struct.hasChild('name')).toBe(true);
      expect(struct.getChild('name').getString()).toBe('Hero');
      expect(struct.hasChild('alive')).toBe(true);
      expect(struct.getChild('alive').getBool()).toBe(true);
    });

    it('preserves existing array elements when editing one element', async () => {
      // Pre-populate an array with multiple items to ensure none are lost.
      const variables = project.getVariables();
      const array = variables.insertNew('inventory', 0);
      array.castTo('array');
      array.pushNew().setString('Sword');
      array.pushNew().setString('Shield');
      array.pushNew().setString('Potion');

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'inventory[1]',
          variable_scope: 'global',
          value: 'Magic Shield',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Edited global variable \\"inventory[1]\\" = Magic Shield"`
      );
      expect(array.getType()).toBe(gd.Variable.Array);
      // Other elements must still be intact (no data loss from cast).
      expect(array.getChildrenCount()).toBe(3);
      expect(array.getAtIndex(0).getString()).toBe('Sword');
      expect(array.getAtIndex(1).getString()).toBe('Magic Shield');
      expect(array.getAtIndex(2).getString()).toBe('Potion');
    });

    it('sets a structure field inside an array element', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'players[0].name',
          variable_scope: 'scene',
          scene_name: 'TestScene',
          value: 'Alice',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added scene \\"TestScene\\" variable \\"players[0].name\\" (String) = Alice"`
      );
      const players = testScene.getVariables().get('players');
      expect(players.getType()).toBe(gd.Variable.Array);
      const player0 = players.getAtIndex(0);
      expect(player0.getType()).toBe(gd.Variable.Structure);
      expect(player0.getChild('name').getString()).toBe('Alice');
    });

    it('creates several variables at once from a `variables` array', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'scene',
          scene_name: 'TestScene',
          variables: [
            { variable_name_or_path: 'lives', value: '3' },
            { variable_name_or_path: 'score', value: '0' },
            { variable_name_or_path: 'playerName', value: 'Hero' },
          ],
        },
      });

      expect(result.success).toBe(true);
      const variables = testScene.getVariables();
      expect(variables.get('lives').getValue()).toBe(3);
      expect(variables.get('score').getValue()).toBe(0);
      expect(variables.get('playerName').getString()).toBe('Hero');
    });

    it('deletes a variable when `delete_this_variable` is true', async () => {
      const variables = testScene.getVariables();
      variables.insertNew('toRemove', 0).setString('bye');
      variables.insertNew('toKeep', 1).setString('stay');

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'scene',
          scene_name: 'TestScene',
          variables: [
            { variable_name_or_path: 'toRemove', delete_this_variable: true },
          ],
        },
      });

      expect(result.success).toBe(true);
      expect(variables.has('toRemove')).toBe(false);
      expect(variables.has('toKeep')).toBe(true);
    });

    it('edits and deletes variables in a single call', async () => {
      const variables = testScene.getVariables();
      variables.insertNew('old', 0).setString('remove me');

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'scene',
          scene_name: 'TestScene',
          variables: [
            { variable_name_or_path: 'newScore', value: '99' },
            { variable_name_or_path: 'old', delete_this_variable: true },
          ],
        },
      });

      expect(result.success).toBe(true);
      expect(variables.get('newScore').getValue()).toBe(99);
      expect(variables.has('old')).toBe(false);
    });

    it('warns (but still succeeds) when deleting a variable that does not exist', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'scene',
          scene_name: 'TestScene',
          variables: [
            { variable_name_or_path: 'newOne', value: '1' },
            { variable_name_or_path: 'ghost', delete_this_variable: true },
          ],
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Could not delete');
      expect(result.message).toContain('ghost');
      expect(
        testScene
          .getVariables()
          .get('newOne')
          .getValue()
      ).toBe(1);
    });

    it('deletes an element of an object array variable by index', async () => {
      // Reproduce the reported case: object "Player" with an array variable
      // "Variable" holding three numbers, delete index 2.
      const playerVariables = testScene
        .getObjects()
        .getObject('Player')
        .getVariables();
      const arrayVariable = playerVariables.insertNew('Variable', 0);
      arrayVariable.castTo('array');
      arrayVariable.pushNew().setValue(10);
      arrayVariable.pushNew().setValue(11);
      arrayVariable.pushNew().setValue(12);

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'object',
          scene_name: 'TestScene',
          object_name: 'Player',
          variables: [
            {
              variable_name_or_path: 'Variable[2]',
              delete_this_variable: true,
            },
          ],
        },
      });

      expect(result.success).toBe(true);
      const updated = testScene
        .getObjects()
        .getObject('Player')
        .getVariables()
        .get('Variable');
      expect(updated.getType()).toBe(gd.Variable.Array);
      expect(updated.getChildrenCount()).toBe(2);
      expect(updated.getAtIndex(0).getValue()).toBe(10);
      expect(updated.getAtIndex(1).getValue()).toBe(11);
    });
  });

  describe('inspect_variables', () => {
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

    it('returns all scene variables when no paths are requested', async () => {
      const variables = testScene.getVariables();
      variables.insertNew('Score', 0).setValue(7);
      variables.insertNew('Name', 1).setString('Hero');

      const result = await editorFunctions.inspect_variables.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { variable_scope: 'scene', scene_name: 'TestScene' },
      });

      expect(result.success).toBe(true);
      expect(result.variables).toEqual([
        { variableName: 'Score', type: 'Number', value: '7' },
        { variableName: 'Name', type: 'String', value: 'Hero' },
      ]);
    });

    it('returns a requested nested array path on an object variable', async () => {
      const objectVariables = testScene
        .getObjects()
        .getObject('Player')
        .getVariables();
      const arrayVariable = objectVariables.insertNew('Variable', 0);
      arrayVariable.castTo('array');
      arrayVariable.pushNew().setValue(10);
      arrayVariable.pushNew().setValue(11);
      arrayVariable.pushNew().setValue(12);

      const result = await editorFunctions.inspect_variables.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'object',
          scene_name: 'TestScene',
          object_name: 'Player',
          variable_names_or_paths: ['Variable[2]'],
        },
      });

      expect(result.success).toBe(true);
      expect(result.variables).toEqual([
        { variableName: 'Variable[2]', type: 'Number', value: '12' },
      ]);
    });

    it('reports requested paths that do not exist', async () => {
      testScene
        .getVariables()
        .insertNew('Score', 0)
        .setValue(1);

      const result = await editorFunctions.inspect_variables.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'scene',
          scene_name: 'TestScene',
          variable_names_or_paths: ['Score', 'Missing'],
        },
      });

      expect(result.success).toBe(true);
      expect(result.variables).toEqual([
        { variableName: 'Score', type: 'Number', value: '1' },
      ]);
      expect(result.message).toContain('Missing');
    });
  });

  describe('inspect_object_properties (property listing format)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);

      const sceneObjects = testScene.getObjects();
      sceneObjects.insertNewObject(
        project,
        'TextObject::Text',
        'MyText',
        sceneObjects.getObjectsCount()
      );
    });

    afterEach(() => {
      project.delete();
    });

    it('reminds to inspect variables/behaviors with the dedicated tools', async () => {
      testScene
        .getObjects()
        .getObject('MyText')
        .getVariables()
        .insertNew('Score', 0)
        .setValue(0);

      const result = await editorFunctions.inspect_object_properties.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scene_name: 'TestScene', object_name: 'MyText' },
        }
      );

      expect(result.success).toBe(true);
      expect(result.reminder).toContain('inspect_variables');
    });

    it('formats new object properties: short units, no boolean type tag, empty grouped at end', async () => {
      // The TextObject::Text new-from-scratch path uses `formatPropertiesList`,
      // and is fully populated by GD core - making it a stable check.
      const sceneObjects = testScene.getObjects();
      sceneObjects.removeObject('MyText');

      const result = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'NewText',
          },
          searchAndInstallAsset: async () =>
            Promise.resolve({
              status: 'nothing-found',
              message: '',
              createdObjects: [],
              assetShortHeader: null,
              isTheFirstOfItsTypeInProject: false,
            }),
        }
      );

      expect(result.success).toBe(true);
      // Booleans omit the "(boolean)" tag entirely.
      expect(result.message).toEqual(expect.stringContaining('bold: false,'));
      expect(result.message).not.toEqual(expect.stringContaining('(boolean)'));
      // Pixel units are abbreviated to "(px)" everywhere.
      expect(result.message).toEqual(expect.stringContaining('(px)'));
      expect(result.message).not.toEqual(expect.stringContaining('(Pixel)'));
      // DegreeAngle is abbreviated to "(deg)".
      expect(result.message).toEqual(expect.stringContaining('(deg)'));
      expect(result.message).not.toEqual(
        expect.stringContaining('(DegreeAngle)')
      );
      // Empty properties (here: `font`) are grouped at the end.
      expect(result.message).toEqual(
        expect.stringContaining('Empty: font (resource).')
      );
    });
  });

  describe('put_2d_instances (new-instance attributes in message)', () => {
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

    it('omits the attributes parenthetical when none of size/rotation/opacity/z-order are specified', async () => {
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'point',
          brush_position: '100,200',
          new_instances_count: 1,
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toEqual(
        expect.stringMatching(
          /Created 1 new instance of object "Player" \(id: [0-9a-f-]{10}\) using point brush at 100, 200 on the base layer \(""\)\./
        )
      );
    });

    it('includes size/rotation/opacity/z-order in the new-instance message', async () => {
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'point',
          brush_position: '50,60',
          new_instances_count: 2,
          instances_size: '64,64',
          instances_rotation: 45,
          instances_opacity: 128,
          instances_z_order: 5,
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toEqual(
        expect.stringMatching(
          /Created 2 new instances of object "Player" \(ids: [0-9a-f-]{10}, [0-9a-f-]{10}\) using point brush at 50, 60 on the base layer \(""\) \(size 64x64, rotation 45°, opacity 128\/255, z-order 5, origin at this position, each occupies X 50 to 114, Y 60 to 124\)\./
        )
      );
    });
  });

  describe('put_2d_instances (brush placement positions)', () => {
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

    // Collect the (x, y) of every instance on the scene, sorted by x then y so
    // assertions are independent of insertion order.
    const getInstancePositions = (
      scene: gdLayout
    ): Array<{| x: number, y: number |}> => {
      const positions = [];
      const functor = new gd.InitialInstanceJSFunctor();
      // $FlowFixMe[cannot-write]
      functor.invoke = instancePtr => {
        const instance: gdInitialInstance = gd.wrapPointer(
          // $FlowFixMe[incompatible-type]
          instancePtr,
          gd.InitialInstance
        );
        positions.push({ x: instance.getX(), y: instance.getY() });
      };
      // $FlowFixMe[incompatible-type]
      scene.getInitialInstances().iterateOverInstances(functor);
      functor.delete();
      return positions.sort((a, b) => a.x - b.x || a.y - b.y);
    };

    // Collect full instances (with their persistent uuid) so tests can target
    // existing instances by id for move/erase, like the real tool does.
    const getInstances = (
      scene: gdLayout
    ): Array<{| uuid: string, x: number, y: number, layer: string |}> => {
      const instances = [];
      const functor = new gd.InitialInstanceJSFunctor();
      // $FlowFixMe[cannot-write]
      functor.invoke = instancePtr => {
        const instance: gdInitialInstance = gd.wrapPointer(
          // $FlowFixMe[incompatible-type]
          instancePtr,
          gd.InitialInstance
        );
        instances.push({
          uuid: instance.getPersistentUuid(),
          x: instance.getX(),
          y: instance.getY(),
          layer: instance.getLayer(),
        });
      };
      // $FlowFixMe[incompatible-type]
      scene.getInitialInstances().iterateOverInstances(functor);
      functor.delete();
      return instances;
    };

    const putInstances = async (args: any) => {
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          ...args,
        },
      });
      expect(result.success).toBe(true);
      return result;
    };

    it('places a single instance at the exact position with the point brush', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });

      expect(getInstancePositions(testScene)).toEqual([{ x: 100, y: 200 }]);
    });

    it('distributes instances evenly along a horizontal line brush', async () => {
      await putInstances({
        brush_kind: 'line',
        brush_position: '0,50',
        brush_end_position: '300,50',
        new_instances_count: 4,
      });

      expect(getInstancePositions(testScene)).toEqual([
        { x: 0, y: 50 },
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 300, y: 50 },
      ]);
    });

    // Regression test: the grid brush used to compute the X step from the Y
    // span (and vice-versa), so a horizontal request collapsed every instance
    // onto the same X and marched them down off-screen in Y.
    it('spreads grid instances along X when start and end share the same Y', async () => {
      await putInstances({
        brush_kind: 'grid',
        brush_position: '128,288',
        brush_end_position: '320,288',
        new_instances_count: 4,
      });

      expect(getInstancePositions(testScene)).toEqual([
        { x: 128, y: 288 },
        { x: 192, y: 288 },
        { x: 256, y: 288 },
        { x: 320, y: 288 },
      ]);
    });

    // Regression test: the flat span must not stack instances on the same spot.
    it('spreads grid instances along Y when start and end share the same X', async () => {
      await putInstances({
        brush_kind: 'grid',
        brush_position: '100,100',
        brush_end_position: '100,400',
        new_instances_count: 4,
      });

      expect(getInstancePositions(testScene)).toEqual([
        { x: 100, y: 100 },
        { x: 100, y: 200 },
        { x: 100, y: 300 },
        { x: 100, y: 400 },
      ]);
    });

    it('lays out a real 2D grid reaching the end position', async () => {
      await putInstances({
        brush_kind: 'grid',
        brush_position: '0,0',
        brush_end_position: '200,200',
        new_instances_count: 9,
      });

      const positions = getInstancePositions(testScene);
      expect(positions).toHaveLength(9);
      // 3x3 grid: both axes use {0, 100, 200} and the last cell reaches the end.
      expect(new Set(positions.map(p => p.x))).toEqual(new Set([0, 100, 200]));
      expect(new Set(positions.map(p => p.y))).toEqual(new Set([0, 100, 200]));
      expect(positions).toContainEqual({ x: 200, y: 200 });
    });

    it('does not stack grid instances on top of each other', async () => {
      await putInstances({
        brush_kind: 'grid',
        brush_position: '128,288',
        brush_end_position: '320,288',
        new_instances_count: 4,
      });

      const positions = getInstancePositions(testScene);
      const uniqueKeys = new Set(positions.map(p => `${p.x},${p.y}`));
      expect(uniqueKeys.size).toBe(positions.length);
    });

    // Creating instances without an explicit brush_position used to silently
    // fall back to the scene center — a major source of instances duplicated
    // or dropped at a meaningless position by the AI. It must fail instead.
    it('fails when creating instances without a brush_position', async () => {
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'point',
          new_instances_count: 1,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('`brush_position` is required')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // The most frequent malformed call seen in production: a "modification"
    // call that forgot `existing_instance_ids` (and gave no position). It used
    // to create a duplicate instance at the scene center; it must fail.
    it('fails instead of creating a default instance when neither existing_instance_ids nor brush_position are given', async () => {
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'none',
          instances_opacity: 0,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('existing_instance_ids')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // The base layer's real name is "": accept the frequent "base" mistake
    // (when no layer literally named "base" exists) instead of failing.
    it('accepts "base" as the base layer name when no such layer exists', async () => {
      const result = await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
        layer_name: 'base',
      });

      const [created] = getInstances(testScene);
      expect(created.layer).toBe('');
      expect(result.message).toEqual(
        expect.stringContaining('the base layer ("")')
      );
    });

    it('scatters instances within the radius for the random_in_circle brush', async () => {
      const center = { x: 500, y: 400 };
      const radius = 80;
      await putInstances({
        brush_kind: 'random_in_circle',
        brush_position: `${center.x},${center.y}`,
        brush_size: radius,
        new_instances_count: 12,
      });

      const positions = getInstancePositions(testScene);
      expect(positions).toHaveLength(12);
      positions.forEach(({ x, y }) => {
        const distance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
        expect(distance).toBeLessThanOrEqual(radius);
      });
    });

    // The "none" brush is for modifying existing instances only: creating with
    // it used to silently pile up instances at a default position, leaving
    // unwanted duplicates.
    it('fails instead of creating instances with the none brush', async () => {
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'none',
          brush_position: '200,300',
          new_instances_count: 2,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('cannot create new ones')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // A call asking to create nothing and modify nothing used to silently
    // create one instance at the default scene-center position.
    it('fails when new_instances_count is 0 and no existing_instance_ids are given', async () => {
      for (const brush_kind of ['point', 'none']) {
        const result = await editorFunctions.put_2d_instances.launchFunction({
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Player',
            layer_name: '',
            brush_kind,
            new_instances_count: 0,
          },
        });

        expect(result.success).toBe(false);
        expect(result.message).toEqual(
          expect.stringContaining('Nothing to do')
        );
        expect(getInstancePositions(testScene)).toEqual([]);
      }
    });

    // The none brush with neither ids nor an explicit count used to create one
    // instance at the default scene-center position.
    it('fails with the none brush when no existing_instance_ids are given', async () => {
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'none',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('cannot create new ones')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // The created id in the message closes the loop "create then adjust":
    // it must be directly usable as `existing_instance_ids`.
    it('reports the created instance id, usable to modify it in a follow-up call', async () => {
      const result = await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });

      const idMatch = (result.message || '').match(/\(id: ([^)]+)\)/);
      if (!idMatch) throw new Error('Expected the created id in the message.');

      const moveResult = await putInstances({
        brush_kind: 'point',
        brush_position: '300,400',
        existing_instance_ids: idMatch[1],
      });

      expect(moveResult.message).toEqual(
        expect.stringContaining('Repositioned 1 instance')
      );
      expect(getInstancePositions(testScene)).toEqual([{ x: 300, y: 400 }]);
    });

    // The none brush must still leave existing instances where they are.
    it('does not move an existing instance edited with the none brush', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });
      const [created] = getInstances(testScene);

      await putInstances({
        brush_kind: 'none',
        brush_position: '640,360',
        existing_instance_ids: created.uuid,
        instances_size: '48,48',
      });

      expect(getInstancePositions(testScene)).toEqual([{ x: 100, y: 200 }]);
    });

    // Editing an existing instance with the none brush and no brush_position
    // must not snap it to the scene-center fallback.
    it('does not move an existing instance edited with the none brush and no brush_position', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });
      const [created] = getInstances(testScene);

      await putInstances({
        brush_kind: 'none',
        existing_instance_ids: created.uuid,
        instances_opacity: 128,
      });

      expect(getInstancePositions(testScene)).toEqual([{ x: 100, y: 200 }]);
    });

    // line/grid need an end position to spread instances. Omitting it must fail
    // up front (and create nothing) rather than silently dropping every
    // instance at the default origin.
    it('fails without creating instances when line/grid brush lacks brush_end_position', async () => {
      for (const brush_kind of ['line', 'grid']) {
        const result = await editorFunctions.put_2d_instances.launchFunction({
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Player',
            layer_name: '',
            brush_kind,
            brush_position: '50,60',
            new_instances_count: 3,
          },
        });

        expect(result.success).toBe(false);
        expect(result.message).toEqual(
          expect.stringContaining('requires brush_end_position')
        );
        // Nothing must have been created on the scene.
        expect(getInstancePositions(testScene)).toEqual([]);
      }
    });

    it('moves an existing instance to a new position with the point brush', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });
      const [created] = getInstances(testScene);

      const result = await putInstances({
        brush_kind: 'point',
        brush_position: '640,360',
        existing_instance_ids: created.uuid,
      });

      // No new instance is created; the existing one is repositioned.
      expect(getInstancePositions(testScene)).toEqual([{ x: 640, y: 360 }]);
      expect(result.message).toEqual(
        expect.stringContaining('Repositioned 1 instance')
      );
    });

    it('reports resize/rotation/opacity/z-order changes for an existing instance', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });
      const [created] = getInstances(testScene);

      const result = await putInstances({
        brush_kind: 'none',
        existing_instance_ids: created.uuid,
        instances_size: '48,48',
        instances_rotation: 90,
        instances_opacity: 128,
        instances_z_order: 7,
      });

      expect(result.message).toEqual(expect.stringContaining('Resized 1'));
      expect(result.message).toEqual(expect.stringContaining('Rotated 1'));
      expect(result.message).toEqual(
        expect.stringContaining('Changed opacity of 1 instance to 128/255')
      );
      expect(result.message).toEqual(
        expect.stringContaining('Changed Z-order of 1 instance to 7')
      );
    });

    it('erases an existing instance by id', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 2,
      });
      const instances = getInstances(testScene);
      expect(instances).toHaveLength(2);

      const result = await putInstances({
        brush_kind: 'erase',
        existing_instance_ids: instances[0].uuid,
      });

      expect(result.message).toEqual(
        expect.stringContaining('Erased 1 instance')
      );
      expect(getInstances(testScene)).toHaveLength(1);
    });

    it('erases an instance at an exact position (brush_size 0)', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });

      const result = await putInstances({
        brush_kind: 'erase',
        brush_position: '100,200',
      });

      expect(result.message).toEqual(
        expect.stringContaining('Erased 1 instance')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    it('erases instances within the brush radius', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,100',
        new_instances_count: 1,
      });

      const result = await putInstances({
        brush_kind: 'erase',
        brush_position: '120,120',
        brush_size: 50,
      });

      expect(result.message).toEqual(
        expect.stringContaining('Erased 1 instance')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // An erase that removed nothing used to report "Erased 0 instances." as a
    // success, which the AI took as a confirmation the instances were gone.
    it('fails when the erase brush matches nothing', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });

      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'erase',
          brush_position: '900,900',
          brush_size: 10,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('No instance was erased.')
      );
      // The existing instance is untouched.
      expect(getInstancePositions(testScene)).toEqual([{ x: 100, y: 200 }]);
    });

    it('fails when erasing an unknown instance id (none found, nothing changed)', async () => {
      // Bypass the `putInstances` helper, which asserts success — here we
      // expect a failure so the agent gets a real error signal instead of a
      // misleading success that could make it retry the same call in a loop.
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'erase',
          existing_instance_ids: 'does-not-exist',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining(
          'None of the specified instance ids were found: does-not-exist'
        )
      );
    });

    it('still succeeds erasing when some ids match and others are unknown', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 1,
      });
      const [created] = getInstances(testScene);

      const result = await putInstances({
        brush_kind: 'erase',
        existing_instance_ids: `${created.uuid},does-not-exist`,
      });

      // One id matched (so the call did something and must not fail), the other
      // is reported as not found.
      expect(result.message).toEqual(
        expect.stringContaining('Erased 1 instance')
      );
      expect(result.message).toEqual(
        expect.stringContaining('Instance ids not found: does-not-exist')
      );
      expect(getInstances(testScene)).toHaveLength(0);
    });

    it('fails when no requested instance id is found and nothing is created', async () => {
      // Bypass the `putInstances` helper, which asserts success — here we
      // expect a failure so the agent gets a real error signal instead of a
      // misleading success that could make it retry the same call in a loop.
      const result = await editorFunctions.put_2d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'none',
          existing_instance_ids: 'does-not-exist',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining(
          'None of the specified instance ids were found: does-not-exist'
        )
      );
    });
  });

  describe('put_3d_instances (new-instance attributes in message)', () => {
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

    it('includes size and rotation in the new-instance message', async () => {
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'point',
          brush_position: '10,20,30',
          new_instances_count: 1,
          instances_size: '8,16,24',
          instances_rotation: '15,30,45',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toEqual(
        expect.stringMatching(
          /Created 1 new instance of object "Player" \(id: [0-9a-f-]{10}\) using point brush at 10, 20, 30 on the base layer \(""\) \(size 8x16x24, rotation \(15°, 30°, 45°\), origin at this position, each occupies X 10 to 18, Y 20 to 36, Z 30 to 54\)\./
        )
      );
    });
  });

  describe('put_3d_instances (brush placement positions)', () => {
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

    // Collect the (x, y, z) of every instance, sorted for order-independence.
    const getInstancePositions = (
      scene: gdLayout
    ): Array<{| x: number, y: number, z: number |}> => {
      const positions = [];
      const functor = new gd.InitialInstanceJSFunctor();
      // $FlowFixMe[cannot-write]
      functor.invoke = instancePtr => {
        const instance: gdInitialInstance = gd.wrapPointer(
          // $FlowFixMe[incompatible-type]
          instancePtr,
          gd.InitialInstance
        );
        positions.push({
          x: instance.getX(),
          y: instance.getY(),
          z: instance.getZ(),
        });
      };
      // $FlowFixMe[incompatible-type]
      scene.getInitialInstances().iterateOverInstances(functor);
      functor.delete();
      return positions.sort((a, b) => a.x - b.x || a.y - b.y || a.z - b.z);
    };

    // Collect full instances (with their persistent uuid) so tests can target
    // existing instances by id for move/erase, like the real tool does.
    const getInstances = (
      scene: gdLayout
    ): Array<{|
      uuid: string,
      x: number,
      y: number,
      z: number,
      layer: string,
    |}> => {
      const instances = [];
      const functor = new gd.InitialInstanceJSFunctor();
      // $FlowFixMe[cannot-write]
      functor.invoke = instancePtr => {
        const instance: gdInitialInstance = gd.wrapPointer(
          // $FlowFixMe[incompatible-type]
          instancePtr,
          gd.InitialInstance
        );
        instances.push({
          uuid: instance.getPersistentUuid(),
          x: instance.getX(),
          y: instance.getY(),
          z: instance.getZ(),
          layer: instance.getLayer(),
        });
      };
      // $FlowFixMe[incompatible-type]
      scene.getInitialInstances().iterateOverInstances(functor);
      functor.delete();
      return instances;
    };

    const putInstances = async (args: any) => {
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          ...args,
        },
      });
      expect(result.success).toBe(true);
      return result;
    };

    it('places a single instance at the exact position with the point brush', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '10,20,30',
        new_instances_count: 1,
      });

      expect(getInstancePositions(testScene)).toEqual([
        { x: 10, y: 20, z: 30 },
      ]);
    });

    it('distributes instances evenly along a 3D line brush', async () => {
      await putInstances({
        brush_kind: 'line',
        brush_position: '0,0,0',
        brush_end_position: '300,300,300',
        new_instances_count: 4,
      });

      expect(getInstancePositions(testScene)).toEqual([
        { x: 0, y: 0, z: 0 },
        { x: 100, y: 100, z: 100 },
        { x: 200, y: 200, z: 200 },
        { x: 300, y: 300, z: 300 },
      ]);
    });

    it('scatters instances within the radius for the random_in_sphere brush', async () => {
      const radius = 50;
      await putInstances({
        brush_kind: 'random_in_sphere',
        brush_position: '0,0,0',
        brush_size: radius,
        new_instances_count: 10,
      });

      const positions = getInstancePositions(testScene);
      expect(positions).toHaveLength(10);
      positions.forEach(({ x, y, z }) => {
        expect(Math.sqrt(x * x + y * y + z * z)).toBeLessThanOrEqual(radius);
      });
    });

    it('fails without creating instances when the line brush lacks brush_end_position', async () => {
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'line',
          brush_position: '10,20,30',
          new_instances_count: 3,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('requires brush_end_position')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // Creating instances without an explicit brush_position used to silently
    // fall back to the scene center: it must fail instead.
    it('fails when creating instances without a brush_position', async () => {
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'point',
          new_instances_count: 1,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('`brush_position` is required')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    it('fails when no requested instance id is found and nothing is created', async () => {
      // Bypass the `putInstances` helper, which asserts success — here we
      // expect a failure so the agent gets a real error signal instead of a
      // misleading success that could make it retry the same call in a loop.
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'none',
          existing_instance_ids: 'does-not-exist',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining(
          'None of the specified instance ids were found: does-not-exist'
        )
      );
    });

    // A call asking to create nothing and modify nothing used to silently
    // create one instance at the default scene-center position.
    it('fails when new_instances_count is 0 and no existing_instance_ids are given', async () => {
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'none',
          new_instances_count: 0,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(expect.stringContaining('Nothing to do'));
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // The "none" brush is for modifying existing instances only: creating with
    // it used to silently pile up instances at a default position, leaving
    // unwanted duplicates.
    it('fails instead of creating instances with the none brush', async () => {
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'none',
          brush_position: '10,20,30',
          new_instances_count: 6,
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining('cannot create new ones')
      );
      expect(getInstancePositions(testScene)).toEqual([]);
    });

    // The created id in the message closes the loop "create then adjust":
    // it must be directly usable as `existing_instance_ids`.
    it('reports the created instance id, usable to modify it in a follow-up call', async () => {
      const result = await putInstances({
        brush_kind: 'point',
        brush_position: '10,20,30',
        new_instances_count: 1,
      });

      const idMatch = (result.message || '').match(/\(id: ([^)]+)\)/);
      if (!idMatch) throw new Error('Expected the created id in the message.');

      const moveResult = await putInstances({
        brush_kind: 'point',
        brush_position: '40,50,60',
        existing_instance_ids: idMatch[1],
      });

      expect(moveResult.message).toEqual(
        expect.stringContaining('Repositioned 1 instance')
      );
      expect(getInstancePositions(testScene)).toEqual([
        { x: 40, y: 50, z: 60 },
      ]);
    });

    it('erases an existing instance by id', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '10,20,30',
        new_instances_count: 2,
      });
      const instances = getInstances(testScene);
      expect(instances).toHaveLength(2);

      const result = await putInstances({
        brush_kind: 'erase',
        existing_instance_ids: instances[0].uuid,
      });

      expect(result.message).toEqual(
        expect.stringContaining('Erased 1 instance')
      );
      expect(getInstances(testScene)).toHaveLength(1);
    });

    it('fails when erasing an unknown instance id (none found, nothing changed)', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '10,20,30',
        new_instances_count: 1,
      });

      // Bypass the `putInstances` helper, which asserts success — here we
      // expect a failure so the agent gets a real error signal instead of a
      // misleading success that could make it retry the same call in a loop.
      const result = await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          brush_kind: 'erase',
          existing_instance_ids: 'does-not-exist',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining(
          'None of the specified instance ids were found: does-not-exist'
        )
      );
      // Nothing was erased: the existing instance is still there.
      expect(getInstances(testScene)).toHaveLength(1);
    });

    it('still succeeds erasing when some ids match and others are unknown', async () => {
      await putInstances({
        brush_kind: 'point',
        brush_position: '10,20,30',
        new_instances_count: 1,
      });
      const [created] = getInstances(testScene);

      const result = await putInstances({
        brush_kind: 'erase',
        existing_instance_ids: `${created.uuid},does-not-exist`,
      });

      // One id matched (so the call did something and must not fail), the other
      // is reported as not found.
      expect(result.message).toEqual(
        expect.stringContaining('Erased 1 instance')
      );
      expect(result.message).toEqual(
        expect.stringContaining('Instance ids not found: does-not-exist')
      );
      expect(getInstances(testScene)).toHaveLength(0);
    });

    // Note: there is intentionally no grid test here. `grid` is not part of
    // supported3dBrushKinds, so the tool schema prevents the model from ever
    // sending it to put_3d_instances (unlike the 2D variant, which supports it).
  });

  describe('describe_instances (position semantics)', () => {
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

    it('exposes z (even when 0), object size info and position semantics', async () => {
      const instance = testScene
        .getInitialInstances()
        .insertNewInitialInstance();
      instance.setObjectName('Player');
      instance.setX(100);
      instance.setY(200);
      instance.setHasCustomSize(true);
      instance.setHasCustomDepth(true);
      instance.setCustomWidth(32);
      instance.setCustomHeight(48);
      instance.setCustomDepth(64);

      const result = await editorFunctions.describe_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      });

      expect(result.success).toBe(true);
      const instances = result.instances || [];
      expect(instances).toHaveLength(1);
      expect(instances[0].z).toBe(0);
      expect(instances[0].width).toBe(32);
      expect(instances[0].height).toBe(48);
      expect(instances[0].depth).toBe(64);
      expect(result.positionSemantics).toEqual(
        expect.stringContaining('origin, NOT its center')
      );
      expect(result.objectSizeInfo).toEqual({ Player: null });
    });
  });

  describe('change_scene_properties_layers_effects_groups (echo new values)', () => {
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

    it('echoes the new values for background color and game resolution', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_properties: [
              { property_name: 'backgroundColor', new_value: '#ff0080' },
              { property_name: 'gameResolutionWidth', new_value: '1920' },
              { property_name: 'gameResolutionHeight', new_value: '1080' },
              { property_name: 'stopSoundsOnStartup', new_value: 'true' },
              { property_name: 'gameOrientation', new_value: 'landscape' },
              { property_name: 'gameScaleMode', new_value: 'nearest' },
              { property_name: 'gameName', new_value: 'My Game' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(`
        "Done.
        Set scene background color to #ff0080.
        Set game resolution width to 1920.
        Set game resolution height to 1080.
        Set stopSoundsOnStartup to true.
        Set game orientation to landscape.
        Set game scale mode to nearest.
        Set game name to \\"My Game\\"."
      `);

      // The properties are also actually applied to the project.
      expect(project.getGameResolutionWidth()).toBe(1920);
      expect(project.getGameResolutionHeight()).toBe(1080);
      expect(testScene.stopSoundsOnStartup()).toBe(true);
      expect(project.getOrientation()).toBe('landscape');
      expect(project.getScaleMode()).toBe('nearest');
      expect(project.getName()).toBe('My Game');
    });

    it('renames the scene when setting the "name" property', async () => {
      const onProjectItemRenamedOutsideEditor: JestMockFn<any, any> = jest.fn();
      const wasFirstScene = project.getFirstLayout() === 'TestScene';

      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          onProjectItemRenamedOutsideEditor,
          args: {
            scene_name: 'TestScene',
            changed_properties: [
              { property_name: 'name', new_value: 'GameScene' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Renamed scene "TestScene" to "GameScene"'
      );

      // The scene is actually renamed in the project.
      expect(project.hasLayoutNamed('TestScene')).toBe(false);
      expect(project.hasLayoutNamed('GameScene')).toBe(true);
      // The kept layout pointer is the same one.
      expect(testScene.getName()).toBe('GameScene');
      if (wasFirstScene) {
        expect(project.getFirstLayout()).toBe('GameScene');
      }

      // The editor is notified so open tabs can be kept and updated.
      expect(onProjectItemRenamedOutsideEditor).toHaveBeenCalledWith({
        kind: 'scene',
        oldName: 'TestScene',
        newName: 'GameScene',
      });
    });

    it('keeps spaces and special characters when renaming a scene', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_properties: [
              { property_name: 'name', new_value: 'Templo das Estações' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Renamed scene "TestScene" to "Templo das Estações"'
      );
      expect(project.hasLayoutNamed('Templo das Estações')).toBe(true);
      expect(project.hasLayoutNamed('Templo_das_Estações')).toBe(false);
    });

    it('uses the new scene name when renaming and setting as first scene in the same call', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_properties: [
              { property_name: 'name', new_value: 'New Scene Name' },
              { property_name: 'isFirstScene', new_value: 'true' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Set "New Scene Name" as the first (startup) scene.'
      );
      expect(project.getFirstLayout()).toBe('New Scene Name');
    });

    it('lists the project scenes when the scene is not found', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'NonExistentScene',
            changed_properties: [
              { property_name: 'name', new_value: 'Whatever' },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"Scene not found: \\"NonExistentScene\\". Scenes in this project: \\"TestScene\\"."`
      );
    });

    it('does nothing when renaming a scene to its current name', async () => {
      const onProjectItemRenamedOutsideEditor: JestMockFn<any, any> = jest.fn();

      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          onProjectItemRenamedOutsideEditor,
          args: {
            scene_name: 'TestScene',
            changed_properties: [
              { property_name: 'name', new_value: 'TestScene' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Scene already named "TestScene".');
      expect(project.hasLayoutNamed('TestScene')).toBe(true);
      expect(onProjectItemRenamedOutsideEditor).not.toHaveBeenCalled();
    });
  });

  describe('change_scene_properties_layers_effects_groups (layers)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      makeTestExtensions(gd);
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
    });

    afterEach(() => {
      project.delete();
    });

    it('creates a layer and clearly reports it did not exist', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layers: [{ layer_name: 'UI' }],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(`
        "Done.
        Layer \\"UI\\" did not exist in scene \\"TestScene\\": created it at position 1. Layers are now: \\"\\", \\"UI\\". If you meant to modify an existing layer, check its exact name."
      `);
      expect(testScene.hasLayerNamed('UI')).toBe(true);
    });

    it('does not create a layer when renaming a layer that does not exist', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layers: [
              { layer_name: 'Ground', new_layer_name: 'Background' },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toMatchInlineSnapshot(
        `"Layer \\"Ground\\" not found in scene \\"TestScene\\": no layer was renamed. Existing layers are: \\"\\". To create a new layer, pass its name as \\"layer_name\\"."`
      );
      expect(testScene.hasLayerNamed('Ground')).toBe(false);
      expect(testScene.hasLayerNamed('Background')).toBe(false);
    });

    it('does not create a layer when deleting a layer that does not exist', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layers: [{ layer_name: 'Ground', delete_this_layer: true }],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toMatchInlineSnapshot(
        `"Layer \\"Ground\\" not found in scene \\"TestScene\\": nothing was deleted. Existing layers are: \\"\\"."`
      );
      expect(testScene.hasLayerNamed('Ground')).toBe(false);
    });
  });

  describe('change_scene_properties_layers_effects_groups (layer effects)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      makeTestExtensions(gd);
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
    });

    afterEach(() => {
      project.delete();
    });

    it('creates a new effect and reports it with a single message (no separate "Modified" lines)', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layer_effects: [
              {
                layer_name: '',
                effect_name: 'MySepia',
                effect_type: 'FakeSepia',
                changed_properties: [
                  { property_name: 'opacity', new_value: '0.5' },
                ],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Created new "MySepia" effect');
      expect(result.message).not.toContain('Modified "opacity"');

      const effectsContainer = testScene
        .getLayers()
        .getLayer('')
        .getEffects();
      expect(effectsContainer.getEffectsCount()).toBe(1);
      expect(
        effectsContainer.getEffect('MySepia').getDoubleParameter('opacity')
      ).toBe(0.5);
    });

    it('reports a deletion and a modification together in the same message', async () => {
      await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layer_effects: [
              {
                layer_name: '',
                effect_name: 'ToRemove',
                effect_type: 'FakeSepia',
              },
              {
                layer_name: '',
                effect_name: 'ToKeep',
                effect_type: 'FakeNight',
              },
            ],
          },
        }
      );

      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layer_effects: [
              {
                layer_name: '',
                effect_name: 'ToRemove',
                delete_this_effect: true,
              },
              {
                layer_name: '',
                effect_name: 'ToKeep',
                changed_properties: [
                  { property_name: 'intensity', new_value: '0.3' },
                ],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Removed "ToRemove" effect on layer "".'
      );
      expect(result.message).toContain(
        'Modified "intensity" property of the "ToKeep" effect to "0.3".'
      );

      const effectsContainer = testScene
        .getLayers()
        .getLayer('')
        .getEffects();
      expect(effectsContainer.hasEffectNamed('ToRemove')).toBe(false);
      expect(effectsContainer.hasEffectNamed('ToKeep')).toBe(true);
    });

    it('warns (but still adds it) when adding a 3D-only effect to a 2D-restricted layer', async () => {
      testScene
        .getLayers()
        .getLayer('')
        .setRenderingType('2d');

      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layer_effects: [
              {
                layer_name: '',
                effect_name: 'MyLight',
                effect_type: 'FakeDirectionalLight',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Created new "MyLight" effect');
      expect(result.warnings).toContain(
        '"MyLight" only works in 3D, but layer "" is restricted to 2D'
      );
      expect(
        testScene
          .getLayers()
          .getLayer('')
          .getEffects()
          .hasEffectNamed('MyLight')
      ).toBe(true);
    });

    it('warns (but still adds it) when adding a 2D-only effect to a 3D-restricted layer', async () => {
      testScene
        .getLayers()
        .getLayer('')
        .setRenderingType('3d');

      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layer_effects: [
              {
                layer_name: '',
                effect_name: 'MySepia',
                effect_type: 'FakeSepia',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Created new "MySepia" effect');
      expect(result.warnings).toContain(
        '"MySepia" only works in 2D, but layer "" is restricted to 3D'
      );
    });

    it('does not warn when the layer allows both 2D and 3D (default)', async () => {
      const result = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_layer_effects: [
              {
                layer_name: '',
                effect_name: 'MyLight',
                effect_type: 'FakeDirectionalLight',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Done.');
      expect(result.warnings).toBeUndefined();
    });
  });

  describe('object groups behave like objects', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);

      const sceneObjects = testScene.getObjects();
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy1', 0);
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy2', 1);

      // A group of the two enemies.
      const group = sceneObjects.getObjectGroups().insertNew('Enemies', 0);
      group.addObject('Enemy1');
      group.addObject('Enemy2');
    });

    afterEach(() => {
      project.delete();
    });

    it('adds a behavior to every object of a group when the group name is given', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Enemies',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );

      expect(result.success).toBe(true);
      const sceneObjects = testScene.getObjects();
      expect(
        sceneObjects.getObject('Enemy1').hasBehaviorNamed('PlatformerObject')
      ).toBe(true);
      expect(
        sceneObjects.getObject('Enemy2').hasBehaviorNamed('PlatformerObject')
      ).toBe(true);
    });

    it('removes a behavior from every object of a group when the group name is given', async () => {
      const sceneObjects = testScene.getObjects();
      sceneObjects
        .getObject('Enemy1')
        .addNewBehavior(
          project,
          'PlatformBehavior::PlatformerObjectBehavior',
          'PlatformerObject'
        );
      sceneObjects
        .getObject('Enemy2')
        .addNewBehavior(
          project,
          'PlatformBehavior::PlatformerObjectBehavior',
          'PlatformerObject'
        );

      const result: EditorFunctionGenericOutput = await editorFunctions.remove_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Enemies',
            behavior_name: 'PlatformerObject',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(
        sceneObjects.getObject('Enemy1').hasBehaviorNamed('PlatformerObject')
      ).toBe(false);
      expect(
        sceneObjects.getObject('Enemy2').hasBehaviorNamed('PlatformerObject')
      ).toBe(false);
    });

    it('changes a behavior property on every object of a group', async () => {
      const sceneObjects = testScene.getObjects();
      for (const objectName of ['Enemy1', 'Enemy2']) {
        sceneObjects
          .getObject(objectName)
          .addNewBehavior(
            project,
            'PlatformBehavior::PlatformerObjectBehavior',
            'PlatformerObject'
          );
      }

      const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Enemies',
            behavior_name: 'PlatformerObject',
            changed_properties: [
              { property_name: 'GRAVITY', new_value: '1500' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      for (const objectName of ['Enemy1', 'Enemy2']) {
        const behavior = sceneObjects
          .getObject(objectName)
          .getBehavior('PlatformerObject');
        expect(
          behavior
            .getProperties()
            .get('Gravity')
            .getValue()
        ).toBe('1500');
      }
    });

    it('sets a variable on every object of a group (object scope with a group name)', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'health',
          variable_scope: 'object',
          scene_name: 'TestScene',
          object_name: 'Enemies',
          value: '100',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added scene \\"TestScene\\" group \\"Enemies\\" variable \\"health\\" (Number) = 100"`
      );
      const sceneObjects = testScene.getObjects();
      for (const objectName of ['Enemy1', 'Enemy2']) {
        const variables = sceneObjects.getObject(objectName).getVariables();
        expect(variables.has('health')).toBe(true);
        expect(variables.get('health').getValue()).toBe(100);
      }
    });

    it('accepts the `group` variable scope (equivalent to `object`)', async () => {
      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'shield',
          variable_scope: 'group',
          scene_name: 'TestScene',
          object_name: 'Enemies',
          value: '5',
        },
      });

      expect(result.success).toBe(true);
      const sceneObjects = testScene.getObjects();
      for (const objectName of ['Enemy1', 'Enemy2']) {
        expect(
          sceneObjects
            .getObject(objectName)
            .getVariables()
            .has('shield')
        ).toBe(true);
      }
    });

    it('fills the variables and behaviors in common when an object is added to a group', async () => {
      const sceneObjects = testScene.getObjects();

      // Make Enemy1 and Enemy2 share a behavior and a variable in common, so
      // the group exposes them. Then add a fresh Enemy3 with neither.
      for (const objectName of ['Enemy1', 'Enemy2']) {
        const object = sceneObjects.getObject(objectName);
        object.addNewBehavior(
          project,
          'PlatformBehavior::PlatformerObjectBehavior',
          'PlatformerObject'
        );
        object
          .getVariables()
          .insertNew('groupHealth', 0)
          .setValue(100);
      }
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy3', 2);

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [
              {
                group_name: 'Enemies',
                objects_to_add: ['Enemy3'],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);

      // Enemy3 was added to the group, so it received the variable and behavior
      // shared in common by the group.
      const enemy3 = sceneObjects.getObject('Enemy3');
      expect(enemy3.hasBehaviorNamed('PlatformerObject')).toBe(true);
      expect(enemy3.getVariables().has('groupHealth')).toBe(true);

      // The change message explains which behaviors and variables the newly
      // added object inherited from the group, with their names and types.
      expect(result.message).toMatchInlineSnapshot(`
        "Done.
        Group \\"Enemies\\" in scene \\"TestScene\\" now contains 3 object(s): Enemy1, Enemy2, Enemy3.
        Object(s) \\"Enemy3\\" newly added to group \\"Enemies\\" now have the behavior(s) \\"PlatformerObject\\" (PlatformBehavior::PlatformerObjectBehavior) and variable(s) \\"groupHealth\\" (Number) that the rest of the group has in common (a group is the \\"intersection\\" of its objects), added to them if they did not already have them."
      `);
    });

    it('sets a variable on every object of a global group (no scene_name)', async () => {
      // A global group, resolved without a scene_name.
      const globalObjects = project.getObjects();
      globalObjects.insertNewObject(project, 'Sprite', 'GlobalA', 0);
      globalObjects.insertNewObject(project, 'Sprite', 'GlobalB', 1);
      const globalGroup = globalObjects
        .getObjectGroups()
        .insertNew('Globals', 0);
      globalGroup.addObject('GlobalA');
      globalGroup.addObject('GlobalB');

      const result = await editorFunctions.add_or_edit_variable.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'ammo',
          variable_scope: 'object',
          object_name: 'Globals',
          value: '7',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatchInlineSnapshot(
        `"Added global group \\"Globals\\" variable \\"ammo\\" (Number) = 7"`
      );
      for (const objectName of ['GlobalA', 'GlobalB']) {
        expect(
          globalObjects
            .getObject(objectName)
            .getVariables()
            .has('ammo')
        ).toBe(true);
      }
    });

    it('inspects a behavior via a group (reads from a member that has it)', async () => {
      const sceneObjects = testScene.getObjects();
      // Only Enemy2 has the behavior; inspecting the group still finds it.
      sceneObjects
        .getObject('Enemy2')
        .addNewBehavior(
          project,
          'PlatformBehavior::PlatformerObjectBehavior',
          'PlatformerObject'
        );

      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Enemies',
            behavior_name: 'PlatformerObject',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.properties).toBeDefined();
    });

    it('applies a behavior property change only to the group members that have the behavior', async () => {
      const sceneObjects = testScene.getObjects();
      // Only Enemy1 has the behavior.
      sceneObjects
        .getObject('Enemy1')
        .addNewBehavior(
          project,
          'PlatformBehavior::PlatformerObjectBehavior',
          'PlatformerObject'
        );

      const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Enemies',
            behavior_name: 'PlatformerObject',
            changed_properties: [
              { property_name: 'GRAVITY', new_value: '1500' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(
        sceneObjects
          .getObject('Enemy1')
          .getBehavior('PlatformerObject')
          .getProperties()
          .get('Gravity')
          .getValue()
      ).toBe('1500');
      expect(
        sceneObjects.getObject('Enemy2').hasBehaviorNamed('PlatformerObject')
      ).toBe(false);
      // Enemy2 lacks the behavior, so it is reported as skipped.
      expect(result.message).toContain(
        'Behavior "PlatformerObject" not on "Enemy2". Not changed.'
      );
    });

    it('removes a behavior from the group members that have it, warning about the others', async () => {
      const sceneObjects = testScene.getObjects();
      // Only Enemy1 has the behavior; Enemy2 will be reported as a warning.
      sceneObjects
        .getObject('Enemy1')
        .addNewBehavior(
          project,
          'PlatformBehavior::PlatformerObjectBehavior',
          'PlatformerObject'
        );

      const result: EditorFunctionGenericOutput = await editorFunctions.remove_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Enemies',
            behavior_name: 'PlatformerObject',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Removed behavior');
      expect(result.message).toContain('Enemy2');
      expect(
        sceneObjects.getObject('Enemy1').hasBehaviorNamed('PlatformerObject')
      ).toBe(false);
    });

    it('fails when the object/group name does not exist', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'DoesNotExist',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Object or group not found');
    });

    it('fails when adding a behavior to an empty group', async () => {
      testScene
        .getObjects()
        .getObjectGroups()
        .insertNew('EmptyGroup', 0);

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'EmptyGroup',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('has no object');
    });
  });

  describe('add_behavior (single object)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
      testScene.getObjects().insertNewObject(project, 'Sprite', 'MySprite', 0);
    });

    afterEach(() => {
      project.delete();
    });

    it('adds a behavior to an object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Added behavior');
      expect(
        testScene
          .getObjects()
          .getObject('MySprite')
          .hasBehaviorNamed('PlatformerObject')
      ).toBe(true);
    });

    it('is a no-op success when the behavior is already on the object', async () => {
      const object = testScene.getObjects().getObject('MySprite');
      object.addNewBehavior(
        project,
        'PlatformBehavior::PlatformerObjectBehavior',
        'PlatformerObject'
      );

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('already on');
    });

    it('fails when a behavior with the same name but a different type exists', async () => {
      const object = testScene.getObjects().getObject('MySprite');
      object.addNewBehavior(
        project,
        'PlatformBehavior::PlatformerObjectBehavior',
        'SharedName'
      );

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_type: 'TopDownMovementBehavior::TopDownMovementBehavior',
            behavior_name: 'SharedName',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('different type');
    });

    it('fails when the object does not exist', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Unknown',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Object or group not found');
    });
  });

  describe('remove_behavior (single object)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
      const object = testScene
        .getObjects()
        .insertNewObject(project, 'Sprite', 'MySprite', 0);
      object.addNewBehavior(
        project,
        'PlatformBehavior::PlatformerObjectBehavior',
        'PlatformerObject'
      );
    });

    afterEach(() => {
      project.delete();
    });

    it('removes a behavior from an object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.remove_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_name: 'PlatformerObject',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Removed behavior');
      expect(
        testScene
          .getObjects()
          .getObject('MySprite')
          .hasBehaviorNamed('PlatformerObject')
      ).toBe(false);
    });

    it('fails when the behavior is not on the object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.remove_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_name: 'NotThere',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not removed');
    });
  });

  describe('change_behavior_property (delete_this_behavior)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
      const object = testScene
        .getObjects()
        .insertNewObject(project, 'Sprite', 'MySprite', 0);
      object.addNewBehavior(
        project,
        'PlatformBehavior::PlatformerObjectBehavior',
        'PlatformerObject'
      );
    });

    afterEach(() => {
      project.delete();
    });

    it('deletes a behavior from an object when delete_this_behavior is true', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_name: 'PlatformerObject',
            delete_this_behavior: true,
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Removed behavior');
      expect(
        testScene
          .getObjects()
          .getObject('MySprite')
          .hasBehaviorNamed('PlatformerObject')
      ).toBe(false);
    });

    it('fails when the behavior is not on the object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_name: 'NotThere',
            delete_this_behavior: true,
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not removed');
    });
  });

  describe('inspect_behavior_properties (single object)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
      const object = testScene
        .getObjects()
        .insertNewObject(project, 'Sprite', 'MySprite', 0);
      object.addNewBehavior(
        project,
        'PlatformBehavior::PlatformerObjectBehavior',
        'PlatformerObject'
      );
    });

    afterEach(() => {
      project.delete();
    });

    it("returns an object's behavior properties", async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_name: 'PlatformerObject',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.behaviorName).toBe('PlatformerObject');
      expect(result.properties).toBeDefined();
    });

    it('fails when the behavior is not on the object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_name: 'NotThere',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('not on');
    });
  });

  describe('change_scene_properties_layers_effects_groups (delete_this_scene)', () => {
    let project: gdProject;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('TestScene', 0);
    });

    afterEach(() => {
      project.delete();
    });

    it('deletes a scene when delete_this_scene is true', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            delete_this_scene: true,
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Deleted scene "TestScene"');
      expect(project.hasLayoutNamed('TestScene')).toBe(false);
    });

    it('clears the first layout if the deleted scene was the first layout', async () => {
      project.setFirstLayout('TestScene');

      await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            delete_this_scene: true,
          },
        }
      );

      expect(project.getFirstLayout()).toBe('');
    });

    it('notifies the editor before the scene is deleted, so it can close any open tab', async () => {
      const scene = project.getLayout('TestScene');
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);

      await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scene_name: 'TestScene',
            delete_this_scene: true,
          },
        }
      );

      expect(fakeOptions.onWillDeleteScene).toHaveBeenCalledWith({ scene });
    });
  });

  describe('change_scene_properties_layers_effects_groups (group object membership)', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
      const sceneObjects = testScene.getObjects();
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy1', 0);
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy2', 1);
      const group = sceneObjects.getObjectGroups().insertNew('Enemies', 0);
      group.addObject('Enemy1');
      group.addObject('Enemy2');
    });

    afterEach(() => {
      project.delete();
    });

    it('renames a group', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [{ group_name: 'Enemies', new_group_name: 'Foes' }],
          },
        }
      );

      expect(result.success).toBe(true);
      const groups = testScene.getObjects().getObjectGroups();
      expect(groups.has('Foes')).toBe(true);
      expect(groups.has('Enemies')).toBe(false);
    });

    it('echoes the resulting content of the group in the message', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [
              {
                group_name: 'Enemies',
                objects_to_remove: ['Enemy2'],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      // The message reports the new state instead of a blind confirmation.
      expect(result.message).toContain(
        'Group "Enemies" in scene "TestScene" now contains 1 object(s): Enemy1.'
      );
    });

    it('adds objects incrementally with objects_to_add (keeping existing ones)', async () => {
      const sceneObjects = testScene.getObjects();
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy3', 2);

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [
              {
                group_name: 'Enemies',
                objects_to_add: ['Enemy3'],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      const group = testScene
        .getObjects()
        .getObjectGroups()
        .get('Enemies');
      // The objects already in the group are untouched, the new one is added.
      expect(group.find('Enemy1')).toBe(true);
      expect(group.find('Enemy2')).toBe(true);
      expect(group.find('Enemy3')).toBe(true);
      expect(result.message).toContain('Enemy1, Enemy2, Enemy3');
    });

    it('removes objects incrementally with objects_to_remove (keeping the others)', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [
              {
                group_name: 'Enemies',
                objects_to_remove: ['Enemy2'],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      const group = testScene
        .getObjects()
        .getObjectGroups()
        .get('Enemies');
      expect(group.find('Enemy1')).toBe(true);
      expect(group.find('Enemy2')).toBe(false);
    });

    it('adds and removes in a single call, ignoring duplicates and no-ops', async () => {
      const sceneObjects = testScene.getObjects();
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy3', 2);

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [
              {
                group_name: 'Enemies',
                // Enemy3 listed twice (duplicate), Enemy1 already in the group
                // (no-op), Enemy2 removed, GhostNotHere removed (no-op).
                objects_to_add: ['Enemy3', 'Enemy3', 'Enemy1'],
                objects_to_remove: ['Enemy2', 'GhostNotHere'],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      const group = testScene
        .getObjects()
        .getObjectGroups()
        .get('Enemies');
      expect(group.getAllObjectsNames().toJSArray()).toEqual([
        'Enemy1',
        'Enemy3',
      ]);
    });

    it('fills shared variables and behaviors when adding via objects_to_add', async () => {
      const sceneObjects = testScene.getObjects();

      // Enemy1 and Enemy2 share a behavior and a variable, so the group exposes
      // them. A freshly added Enemy3 should receive them too.
      for (const objectName of ['Enemy1', 'Enemy2']) {
        const object = sceneObjects.getObject(objectName);
        object.addNewBehavior(
          project,
          'PlatformBehavior::PlatformerObjectBehavior',
          'PlatformerObject'
        );
        object
          .getVariables()
          .insertNew('groupHealth', 0)
          .setValue(100);
      }
      sceneObjects.insertNewObject(project, 'Sprite', 'Enemy3', 2);

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [
              {
                group_name: 'Enemies',
                objects_to_add: ['Enemy3'],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      const enemy3 = sceneObjects.getObject('Enemy3');
      expect(enemy3.hasBehaviorNamed('PlatformerObject')).toBe(true);
      expect(enemy3.getVariables().has('groupHealth')).toBe(true);
    });

    it('warns when an object added via objects_to_add does not exist', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            changed_groups: [
              {
                group_name: 'Enemies',
                objects_to_add: ['Ghost'],
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Ghost');
      expect(
        testScene
          .getObjects()
          .getObjectGroups()
          .get('Enemies')
          .find('Ghost')
      ).toBe(false);
    });
  });

  describe('inspect_project_properties_resources', () => {
    let project: gdProject;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('TestScene', 0);
      project.insertNewLayout('MenuScene', 1);

      const imageResource = new gd.ImageResource();
      imageResource.setName('hero.png');
      imageResource.setFile('assets/hero.png');
      const audioResource = new gd.AudioResource();
      audioResource.setName('jump.aac');
      audioResource.setFile('assets/jump.aac');
      project.getResourcesManager().addResource(imageResource);
      project.getResourcesManager().addResource(audioResource);
      imageResource.delete();
      audioResource.delete();
    });

    afterEach(() => {
      project.delete();
    });

    it('returns the project properties, scene names and a resources summary', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {},
        }
      );

      expect(result.success).toBe(true);
      const properties = result.properties || {};
      expect(properties.name).toBe(project.getName());
      expect(properties.windowWidth).toBe(project.getGameResolutionWidth());
      expect(properties.windowHeight).toBe(project.getGameResolutionHeight());
      expect(properties.scaleMode).toBe(project.getScaleMode());
      expect(properties.firstLayout).toBe(project.getFirstLayout());
      expect(result.sceneNames).toEqual(['TestScene', 'MenuScene']);
      expect(result.resources).toBe(undefined);
      const resourcesSummary = result.resourcesSummary || {};
      expect(resourcesSummary.total).toBe(2);
      expect(resourcesSummary.byKind).toEqual({ image: 1, audio: 1 });
      expect(resourcesSummary.hint).toContain('filter_by_resource_name');
      expect(resourcesSummary.hint).toContain('list_all_resources');
    });

    it('lists all the resources when list_all_resources is true', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { list_all_resources: true },
        }
      );

      expect(result.success).toBe(true);
      expect(result.resourcesSummary).toBe(undefined);
      expect(result.resources).toEqual([
        {
          name: 'hero.png',
          kind: 'image',
          file: 'assets/hero.png',
          metadata: undefined,
          originName: undefined,
          originIdentifier: undefined,
        },
        {
          name: 'jump.aac',
          kind: 'audio',
          file: 'assets/jump.aac',
          metadata: undefined,
          originName: undefined,
          originIdentifier: undefined,
        },
      ]);
    });

    it('searches resources by name (case-insensitive)', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { filter_by_resource_name: 'JUMP' },
        }
      );

      expect(result.success).toBe(true);
      const resources = result.resources || [];
      expect(resources.map(resource => resource.name)).toEqual(['jump.aac']);
    });

    it('warns when no resource name matches the search', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { filter_by_resource_name: 'ghost' },
        }
      );

      expect(result.success).toBe(true);
      expect(result.resources).toEqual([]);
      expect(result.warnings).toContain('No resource name contains "ghost"');
      expect(result.warnings).toContain('2 resources in total');
    });
  });

  describe('change_project_properties_resources', () => {
    let project: gdProject;

    beforeEach(() => {
      // $FlowFixMe[invalid-constructor]
      project = new gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('TestScene', 0);
      project.insertNewLayout('MenuScene', 1);
    });

    afterEach(() => {
      project.delete();
    });

    it('changes the game name, resolution and first scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_properties: [
              { property_name: 'name', new_value: 'My Great Game' },
              { property_name: 'windowWidth', new_value: '1920' },
              { property_name: 'windowHeight', new_value: '1080' },
              { property_name: 'firstLayout', new_value: 'MenuScene' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(project.getName()).toBe('My Great Game');
      expect(project.getGameResolutionWidth()).toBe(1920);
      expect(project.getGameResolutionHeight()).toBe(1080);
      expect(project.getFirstLayout()).toBe('MenuScene');
    });

    it('accepts the game property names used by the scene tool', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_properties: [
              { property_name: 'gameName', new_value: 'Aliased Name' },
              { property_name: 'gameResolutionWidth', new_value: '640' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(project.getName()).toBe('Aliased Name');
      expect(project.getGameResolutionWidth()).toBe(640);
    });

    it('validates properties with a fixed set of values', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_properties: [
              { property_name: 'scaleMode', new_value: 'nearest' },
              { property_name: 'orientation', new_value: 'sideways' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(project.getScaleMode()).toBe('nearest');
      expect(result.message).toContain('Invalid orientation: "sideways"');
      expect(result.message).toContain('"landscape"');
    });

    it('refuses a first scene that does not exist and lists the scenes', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_properties: [
              { property_name: 'firstLayout', new_value: 'DoesNotExist' },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Scene not found: "DoesNotExist"');
      expect(result.message).toContain('"TestScene"');
      expect(result.message).toContain('"MenuScene"');
      expect(project.getFirstLayout()).toBe('');
    });

    it('warns on an unknown property and lists the supported ones', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_properties: [
              { property_name: 'gravity', new_value: '9.8' },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown project property: "gravity"');
      expect(result.message).toContain('firstLayout');
    });

    it('fails when no change is provided', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {},
        }
      );

      expect(result.success).toBe(false);
    });

    const addProjectResources = () => {
      const imageResource = new gd.ImageResource();
      imageResource.setName('hero.png');
      imageResource.setFile('assets/hero.png');
      const audioResource = new gd.AudioResource();
      audioResource.setName('jump.aac');
      audioResource.setFile('assets/jump.aac');
      project.getResourcesManager().addResource(imageResource);
      project.getResourcesManager().addResource(audioResource);
      imageResource.delete();
      audioResource.delete();
    };

    const addObjectUsingImageResource = (imageName: string) => {
      const object = project
        .getLayout('TestScene')
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Hero', 0);
      const spriteConfiguration = gd.asSpriteConfiguration(
        object.getConfiguration()
      );
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      sprite.setImageName(imageName);
      animation.getDirection(0).addSprite(sprite);
      spriteConfiguration.getAnimations().addAnimation(animation);
      sprite.delete();
      animation.delete();
      return object;
    };

    it('renames a resource and updates the objects using it', async () => {
      addProjectResources();
      const object = addObjectUsingImageResource('hero.png');

      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_resources: [
              {
                resource_name: 'hero.png',
                new_resource_name: 'hero-sprite.png',
              },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(project.getResourcesManager().hasResource('hero.png')).toBe(false);
      expect(project.getResourcesManager().hasResource('hero-sprite.png')).toBe(
        true
      );
      // The file is unchanged, only the resource name is.
      expect(
        project
          .getResourcesManager()
          .getResource('hero-sprite.png')
          .getFile()
      ).toBe('assets/hero.png');
      expect(
        gd
          .asSpriteConfiguration(object.getConfiguration())
          .getAnimations()
          .getAnimation(0)
          .getDirection(0)
          .getSprite(0)
          .getImageName()
      ).toBe('hero-sprite.png');
    });

    it('deletes a resource not used by any object', async () => {
      addProjectResources();

      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_resources: [
              { resource_name: 'jump.aac', delete_this_resource: true },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(project.getResourcesManager().hasResource('jump.aac')).toBe(false);
    });

    it('refuses to delete a resource still used by an object', async () => {
      addProjectResources();
      addObjectUsingImageResource('hero.png');

      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_resources: [
              { resource_name: 'hero.png', delete_this_resource: true },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('NOT deleted');
      expect(result.message).toContain('Hero');
      // Must steer away from modifying the objects to force the deletion.
      expect(result.message).toContain('Do NOT modify');
      expect(result.message).toContain('report the problem');
      expect(project.getResourcesManager().hasResource('hero.png')).toBe(true);
    });

    it('warns when the resource does not exist', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            changed_resources: [
              { resource_name: 'ghost.png', delete_this_resource: true },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Resource not found: "ghost.png"');
    });
  });
});
