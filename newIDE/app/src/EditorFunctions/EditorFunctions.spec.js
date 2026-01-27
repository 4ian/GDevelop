// @flow
import { fakeAssetShortHeader1 } from '../fixtures/GDevelopServicesTestData';
import { PixiResourcesLoaderMock } from '../fixtures/TestPixiResourcesLoader';
import {
  editorFunctions,
  parseDimensionValue,
  type EditorFunctionGenericOutput,
  type LaunchFunctionOptionsWithProject,
} from './index';

const gd: libGDevelop = global.gd;

describe('parseDimensionValue', () => {
  it('parses comma-separated 2D values', () => {
    expect(parseDimensionValue('100,200')).toEqual({
      width: '100',
      height: '200',
    });
    expect(parseDimensionValue('100, 200')).toEqual({
      width: '100',
      height: '200',
    });
    expect(parseDimensionValue(' 100 , 200 ')).toEqual({
      width: '100',
      height: '200',
    });
  });

  it('parses semicolon-separated 2D values', () => {
    expect(parseDimensionValue('100;200')).toEqual({
      width: '100',
      height: '200',
    });
    expect(parseDimensionValue('100; 200')).toEqual({
      width: '100',
      height: '200',
    });
  });

  it('parses x-separated 2D values', () => {
    expect(parseDimensionValue('100x200')).toEqual({
      width: '100',
      height: '200',
    });
    expect(parseDimensionValue('100x 200')).toEqual({
      width: '100',
      height: '200',
    });
  });

  it('parses comma-separated 3D values', () => {
    expect(parseDimensionValue('100,200,300')).toEqual({
      width: '100',
      height: '200',
      depth: '300',
    });
    expect(parseDimensionValue('100, 200, 300')).toEqual({
      width: '100',
      height: '200',
      depth: '300',
    });
  });

  it('parses semicolon-separated 3D values', () => {
    expect(parseDimensionValue('100;200;300')).toEqual({
      width: '100',
      height: '200',
      depth: '300',
    });
  });

  it('parses x-separated 3D values', () => {
    expect(parseDimensionValue('100x200x300')).toEqual({
      width: '100',
      height: '200',
      depth: '300',
    });
  });

  it('returns null for single values', () => {
    expect(parseDimensionValue('100')).toBeNull();
    expect(parseDimensionValue('abc')).toBeNull();
  });

  it('returns null for invalid formats', () => {
    expect(parseDimensionValue('100,abc')).toBeNull();
    expect(parseDimensionValue('abc,200')).toBeNull();
    expect(parseDimensionValue('100,200,abc')).toBeNull();
    expect(parseDimensionValue('')).toBeNull();
    expect(parseDimensionValue(',')).toBeNull();
    expect(parseDimensionValue('100,')).toBeNull();
  });

  it('handles decimal values', () => {
    expect(parseDimensionValue('100.5,200.5')).toEqual({
      width: '100.5',
      height: '200.5',
    });
    expect(parseDimensionValue('100.5x200.5x300.5')).toEqual({
      width: '100.5',
      height: '200.5',
      depth: '300.5',
    });
  });

  it('handles negative values', () => {
    expect(parseDimensionValue('-100,200')).toEqual({
      width: '-100',
      height: '200',
    });
    expect(parseDimensionValue('100,-200,-300')).toEqual({
      width: '100',
      height: '-200',
      depth: '-300',
    });
  });
});

// $FlowExpectedError
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
    onWillInstallExtension: jest.fn(),
    onExtensionInstalled: jest.fn(),
    PixiResourcesLoader: PixiResourcesLoaderMock,
  });

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

    it('creates a new object (from the asset store)', async () => {
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
        `"Object not found: \\"DoesNotExist\\" in scene \\"OtherScene\\" or as a global object. Nothing was duplicated."`
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
        `"Object not found: \\"DoesNotExist\\" in scene \\"TestScene\\" or as a global object. Nothing was duplicated."`
      );
    });

    it('returns success when replacing an existing object', async () => {
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
        `"Scene not found: \\"NonExistentScene\\"."`
      );
    });
  });

  describe('change_object_property', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
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
        "Successfully done the changes.
        Changed property \\"font\\" of object \\"MyTextObject\\" to \\"font2.ttf\\"."
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
        "No changes were made because of these issues:
        Could not change property \\"font\\" of object \\"MyTextObject\\" to \\"non-existing-font.ttf\\" because the resource \\"non-existing-font.ttf\\" does not exist in the project. New resources can't be added just by setting a new name that does not exist. Instead, use \`create_or_replace_object\` to replace the assets of an existing object by new one(s) that will be searched and imported from the asset store (this will keep the object properties, behaviors, events, etc. unchanged)."
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
        "No changes were made because of these issues:
        Could not change property \\"font\\" of object \\"MyTextObject\\" to \\"audio1.aac\\" because the resource \\"audio1.aac\\" exists in project but has type \\"audio\\", which is not the expected type \\"font\\"."
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

  describe('add_scene_events', () => {
    let project: gdProject;
    let testScene: gdLayout;

    beforeEach(() => {
      project = new gd.ProjectHelper.createNewGDJSProject();
      testScene = project.insertNewLayout('TestScene', 0);
    });

    afterEach(() => {
      project.delete();
    });

    it('adds events to a scene and installs missing resources', async () => {
      const onSceneEventsModifiedOutsideEditor = jest.fn();
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
                operationName: 'add',
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
});
