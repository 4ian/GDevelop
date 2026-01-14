// @flow
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
          assetShortHeader: null,
        });
      },
      onObjectsModifiedOutsideEditor: jest.fn(),
      onWillInstallExtension: jest.fn(),
      onExtensionInstalled: jest.fn(),
      PixiResourcesLoader: PixiResourcesLoaderMock,
    });

    it('should create a new object (from the asset store)', async () => {
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

    it('should create a new object (from scratch if not found in the asset store)', async () => {
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

    it('should return success without creating when object already exists with same type', async () => {
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

    it('should return success when duplicating an existing object (same scene)', async () => {
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
        `"Duplicated object \\"Player\\" as \\"TheNewPlayer\\". The new object \\"TheNewPlayer\\" has the same type, behaviors, properties and effects as the one it was duplicated from."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('should return success when duplicating an existing object (and making it global)', async () => {
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
        `"Duplicated object \\"Player\\" as \\"TheNewPlayer\\". The new object \\"TheNewPlayer\\" has the same type, behaviors, properties and effects as the one it was duplicated from."`
      );
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: testScene,
        isNewObjectTypeUsed: false,
      });
    });

    it('should return failure when scene does not exist', async () => {
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
