// @flow
import { fakeAssetShortHeader1 } from '../fixtures/GDevelopServicesTestData';
import { PixiResourcesLoaderMock } from '../fixtures/TestPixiResourcesLoader';
import {
  editorFunctions,
  type EditorFunctionGenericOutput,
  type LaunchFunctionOptionsWithProject,
} from './index';

const gd: libGDevelop = global.gd;

// $FlowExpectedError
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('editorFunctions', () => {
  describe('create_or_replace_object', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
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

    const makeFakeLaunchFunctionOptionsWithProject = (): LaunchFunctionOptionsWithProject => ({
      project,
      args: {},
      i18n: makeFakeI18n(),
      editorCallbacks: {
        onOpenLayout: jest.fn(),
        onCreateProject: jest.fn(),
      },
      generateEvents: jest.fn(),
      onInstancesModifiedOutsideEditor: jest.fn(),
      onObjectGroupsModifiedOutsideEditor: jest.fn(),
      onSceneEventsModifiedOutsideEditor: jest.fn(),
      toolOptions: {
        includeEventsJson: true,
      },
      ensureExtensionInstalled: jest.fn(),
      searchAndInstallAsset: async ({
        objectsContainer,
        objectName,
        objectType,
      }) => {
        const object = objectsContainer.insertNewObject(
          project,
          objectType,
          objectName,
          objectsContainer.getObjectsCount()
        );

        return Promise.resolve({
          status: 'asset-installed',
          message: 'Object installed',
          createdObjects: [object],
          assetShortHeader: fakeAssetShortHeader1,
        });
      },
      onObjectsModifiedOutsideEditor: jest.fn(),
      onWillInstallExtension: jest.fn(),
      onExtensionInstalled: jest.fn(),
      PixiResourcesLoader: PixiResourcesLoaderMock,
    });

    it('creates a new object (from the asset store)', async () => {
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
          args: {
            scene_name: 'TestScene',
            object_type: 'TextObject::Text',
            object_name: 'MyNewTextObject',
          },
          onObjectsModifiedOutsideEditor,
        }
      );

      expect(result.message).toMatchInlineSnapshot(
        `"Created (from the asset store) object \\"MyNewTextObject\\" of type \\"TextObject::Text\\" in scene \\"TestScene\\". It has the following properties: bold: false (boolean), characterSize: 20 (Pixel), color: 0;0;0 (color), font:  (resource), isOutlineEnabled: false (boolean), isShadowEnabled: false (boolean), italic: false (boolean), lineHeight: 0 (Pixel), outlineColor: 255;255;255 (color), outlineThickness: 2 (Pixel), shadowAngle: 90 (DegreeAngle), shadowBlurRadius: 2 (Pixel), shadowColor: 0;0;0 (color), shadowDistance: 4 (Pixel), shadowOpacity: 127 (Pixel), text: Text (multilinestring), textAlignment: left (choice, one of: [\\"left\\", \\"center\\", \\"right\\"]), verticalTextAlignment: top (choice, one of: [\\"top\\", \\"center\\", \\"bottom\\"])."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: true,
      });
    });

    it('creates a new object (from scratch if not found in the asset store)', async () => {
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Created a new object (from scratch) called \\"MyNewTextObject\\" of type \\"TextObject::Text\\" in scene \\"TestScene\\". It has the following properties: bold: false (boolean), characterSize: 20 (Pixel), color: 0;0;0 (color), font:  (resource), isOutlineEnabled: false (boolean), isShadowEnabled: false (boolean), italic: false (boolean), lineHeight: 0 (Pixel), outlineColor: 255;255;255 (color), outlineThickness: 2 (Pixel), shadowAngle: 90 (DegreeAngle), shadowBlurRadius: 2 (Pixel), shadowColor: 0;0;0 (color), shadowDistance: 4 (Pixel), shadowOpacity: 127 (Pixel), text: Text (multilinestring), textAlignment: left (choice, one of: [\\"left\\", \\"center\\", \\"right\\"]), verticalTextAlignment: top (choice, one of: [\\"top\\", \\"center\\", \\"bottom\\"])."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: true,
      });
    });

    it('returns success without creating when object already exists with same type', async () => {
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Object with name \\"Player\\" already exists, no need to re-create it."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when duplicating an existing object (same scene)', async () => {
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Duplicated object \\"Player\\" (from scene \\"TestScene\\") as \\"TheNewPlayer\\" (to scene \\"TestScene\\"). The new object \\"TheNewPlayer\\" has the same type, behaviors, properties and effects as the one it was duplicated from."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when duplicating an existing object (and making it global)', async () => {
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Duplicated object \\"Player\\" (from scene \\"TestScene\\") as \\"TheNewPlayer\\" (to the global objects). The new object \\"TheNewPlayer\\" has the same type, behaviors, properties and effects as the one it was duplicated from."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when duplicating an existing object (from another scene)', async () => {
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
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Duplicated object \\"OtherScenePlayer\\" (from scene \\"OtherScene\\") as \\"TheNewPlayer\\" (to scene \\"TestScene\\"). The new object \\"TheNewPlayer\\" has the same type, behaviors, properties and effects as the one it was duplicated from."`
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
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Object not found: \\"DoesNotExist\\" in scene \\"OtherScene\\" or as a global object. Nothing was duplicated."`
      );
    });

    it('fails when duplicating an object not existing (in the same scene)', async () => {
      project.insertNewLayout('OtherScene', 1);

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Object not found: \\"DoesNotExist\\" in scene \\"TestScene\\" or as a global object. Nothing was duplicated."`
      );
    });

    it('returns success when replacing an existing object', async () => {
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Replaced object \\"Player\\" by an object from the asset store fitting the search, with the same type (\\"Sprite\\")."`
      );
      expect(result.success).toBe(true);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('returns success when moving an existing object to the global objects', async () => {
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Moved object \\"Player\\" to the global objects. Its type, behaviors, properties and effects are unchanged."`
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
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Object \\"GlobalObjectPlayer\\" already exists in the global objects. Nothing was changed."`
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
      const onObjectsModifiedOutsideEditor = jest.fn();

      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(),
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
        `"Object \\"GlobalObjectPlayer\\" is a global object. Global objects can't be moved, so it cannot be moved to the scene \\"TestScene\\"."`
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
          ...makeFakeLaunchFunctionOptionsWithProject(),
          args: {
            scene_name: 'NonExistentScene',
            object_type: 'Sprite',
            object_name: 'Player',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatchInlineSnapshot(
        `"Scene not found: \\"NonExistentScene\\"."`
      );
    });
  });
});
