// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('change_project_properties_resources', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
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

  it('sets description, version, author and packageName in one call', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'description', new_value: 'A grand adventure.' },
            { property_name: 'version', new_value: '1.2.3' },
            { property_name: 'author', new_value: 'Jane Doe' },
            { property_name: 'packageName', new_value: 'com.janedoe.game' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('Set game description.');
    expect(result.message).toContain('Set game version to "1.2.3".');
    expect(result.message).toContain('Set game author to "Jane Doe".');
    expect(result.message).toContain('Set package name to "com.janedoe.game".');
    expect(project.getDescription()).toBe('A grand adventure.');
    expect(project.getVersion()).toBe('1.2.3');
    expect(project.getAuthor()).toBe('Jane Doe');
    expect(project.getPackageName()).toBe('com.janedoe.game');
  });

  // The backend tool description documents an empty `firstLayout` as valid:
  // it means "the first scene of the project".
  it('resets firstLayout with an empty value', async () => {
    project.setFirstLayout('TestScene');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [{ property_name: 'firstLayout', new_value: '' }],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Reset firstLayout: the first scene of the project will be loaded when the game starts.'
    );
    expect(project.getFirstLayout()).toBe('');
  });

  it('rejects a non-boolean value for pixelsRounding instead of silently storing false', async () => {
    project.setPixelsRounding(true);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'pixelsRounding', new_value: 'yes' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Invalid pixelsRounding: "yes". Must be "true" or "false". Skipped.'
    );
    expect(project.getPixelsRounding()).toBe(true);
  });

  it('rejects a non-boolean value for adaptGameResolutionAtRuntime', async () => {
    project.setAdaptGameResolutionAtRuntime(true);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'adaptGameResolutionAtRuntime', new_value: '1' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Invalid adaptGameResolutionAtRuntime: "1". Must be "true" or "false". Skipped.'
    );
    expect(project.getAdaptGameResolutionAtRuntime()).toBe(true);
  });

  // The objects scan alone would miss this usage: a sound only referenced by
  // a "Play sound" action must still block the deletion.
  it('refuses to delete a resource used only in events', async () => {
    addProjectResources();
    const scene = project.getLayout('TestScene');
    const event = new gd.StandardEvent();
    const action = new gd.Instruction();
    action.setType('PlaySound');
    action.setParametersCount(5);
    action.setParameter(0, ''); // The runtime scene passed as parameter.
    action.setParameter(1, 'jump.aac');
    action.setParameter(2, 'no');
    action.setParameter(3, '100');
    action.setParameter(4, '1');
    event.getActions().insert(action, 0);
    scene.getEvents().insertEvent(event, 0);
    action.delete();
    event.delete();

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

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Resource "jump.aac" was NOT deleted because it is still used by the project'
    );
    expect(project.getResourcesManager().hasResource('jump.aac')).toBe(true);
  });

  // Guards the whole-project usage scan against false positives: a resource
  // that is genuinely unused must still be deletable.
  it('deletes an unused resource', async () => {
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
    expect(result.message).toContain('Deleted resource "jump.aac".');
    expect(project.getResourcesManager().hasResource('jump.aac')).toBe(false);
    // The other resource is untouched.
    expect(project.getResourcesManager().hasResource('hero.png')).toBe(true);
  });

  it('fails when an invalid orientation is the only requested change', async () => {
    const initialOrientation = project.getOrientation();

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'orientation', new_value: 'upside-down' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Invalid orientation: "upside-down". Must be "default", "landscape" or "portrait". Skipped.'
    );
    expect(project.getOrientation()).toBe(initialOrientation);
  });

  it('rejects an invalid sizeOnStartupMode but applies a valid one', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'sizeOnStartupMode', new_value: 'stretch' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Invalid sizeOnStartupMode: "stretch". Must be "adaptWidth", "adaptHeight" or an empty string. Skipped.'
    );

    const result2: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'sizeOnStartupMode', new_value: 'adaptWidth' },
          ],
        },
      }
    );

    expect(result2.success).toBe(true);
    expect(result2.message).toContain('Set sizeOnStartupMode to "adaptWidth".');
    expect(project.getSizeOnStartupMode()).toBe('adaptWidth');
  });

  it('rejects an invalid antialiasingMode', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'antialiasingMode', new_value: 'FXAA' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Invalid antialiasingMode: "FXAA". Must be "none" or "MSAA". Skipped.'
    );
  });

  it('rejects non-numeric minFPS and windowWidth values', async () => {
    const initialWidth = project.getGameResolutionWidth();
    const initialMinFPS = project.getMinimumFPS();

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            { property_name: 'minFPS', new_value: 'very fast' },
            { property_name: 'windowWidth', new_value: 'wide' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid minFPS: "very fast". Skipped.');
    expect(result.message).toContain(
      'Invalid windowWidth: "wide". Must be a number of pixels. Skipped.'
    );
    expect(project.getGameResolutionWidth()).toBe(initialWidth);
    expect(project.getMinimumFPS()).toBe(initialMinFPS);
  });

  it('sets boolean properties adaptGameResolutionAtRuntime and pixelsRounding', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            {
              property_name: 'adaptGameResolutionAtRuntime',
              new_value: 'false',
            },
            { property_name: 'pixelsRounding', new_value: 'true' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Set adaptGameResolutionAtRuntime to false.'
    );
    expect(result.message).toContain('Set pixelsRounding to true.');
    expect(project.getAdaptGameResolutionAtRuntime()).toBe(false);
    expect(project.getPixelsRounding()).toBe(true);

    const result2: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_properties: [
            {
              property_name: 'adaptGameResolutionAtRuntime',
              new_value: 'true',
            },
            { property_name: 'pixelsRounding', new_value: 'false' },
          ],
        },
      }
    );

    expect(result2.success).toBe(true);
    expect(project.getAdaptGameResolutionAtRuntime()).toBe(true);
    expect(project.getPixelsRounding()).toBe(false);
  });

  it('reports a rename to the same name as already done', async () => {
    addProjectResources();

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_resources: [
            { resource_name: 'hero.png', new_resource_name: 'hero.png' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('Resource already named "hero.png".');
    expect(project.getResourcesManager().hasResource('hero.png')).toBe(true);
  });

  it('refuses to rename a resource to the name of another existing resource', async () => {
    addProjectResources();

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_resources: [
            { resource_name: 'hero.png', new_resource_name: 'jump.aac' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'A resource named "jump.aac" already exists. "hero.png" was not renamed.'
    );
    // Both resources are untouched.
    expect(project.getResourcesManager().hasResource('hero.png')).toBe(true);
    expect(project.getResourcesManager().hasResource('jump.aac')).toBe(true);
  });

  it('warns when a changed_resources item requests no change', async () => {
    addProjectResources();

    const result: EditorFunctionGenericOutput = await editorFunctions.change_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          changed_resources: [{ resource_name: 'hero.png' }],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'No change requested for resource "hero.png": set `new_resource_name` or `delete_this_resource`. Skipped.'
    );
    expect(project.getResourcesManager().hasResource('hero.png')).toBe(true);
  });

  describe('files attached by the user', () => {
    // The browser `File`, not exposed by the test environment.
    const { File: NodeFile } = require('buffer');
    const logoFile = new NodeFile(['fake png'], 'logo.png', {
      type: 'image/png',
    });
    const fontFile = new NodeFile(['fake ttf'], 'title.ttf', {
      type: 'font/ttf',
    });

    /** Stores the in-memory files like the cloud or local storage would. */
    const storeResourceFilesInProject = async () => {
      const resourcesManager = project.getResourcesManager();
      resourcesManager
        .getAllResourceNames()
        .toJSArray()
        .forEach(name => {
          const resource = resourcesManager.getResource(name);
          if (resource.getFile().startsWith('blob:'))
            resource.setFile(`https://project-resources/${name}`);
        });
      return true;
    };

    const launchWithAttachments = (
      args: Object,
      storeResourceFiles: () => Promise<boolean> = storeResourceFilesInProject
    ) =>
      editorFunctions.change_project_properties_resources.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        attachmentsForResources: {
          getFiles: async attachmentIds => {
            const files: { [attachmentId: string]: ?File } = {};
            attachmentIds.forEach(attachmentId => {
              files[attachmentId] =
                attachmentId === 'logo-id'
                  ? logoFile
                  : attachmentId === 'font-id'
                  ? fontFile
                  : null;
            });
            return files;
          },
          storeResourceFiles,
        },
        args,
      });

    it('adds attached files as new resources, with a unique name', async () => {
      addProjectResources();

      const result: EditorFunctionGenericOutput = await launchWithAttachments({
        added_resources: [
          { attachment_id: 'logo-id', resource_name: 'hero.png' },
          { attachment_id: 'font-id' },
        ],
      });

      expect(result.success).toBe(true);
      const resourcesManager = project.getResourcesManager();
      expect(resourcesManager.getResource('hero2.png').getKind()).toBe('image');
      expect(resourcesManager.getResource('hero2.png').getFile()).toBe(
        'https://project-resources/hero2.png'
      );
      expect(resourcesManager.getResource('title.ttf').getKind()).toBe('font');
      expect(result.message).toContain(
        'Added the image resource "hero2.png" (from the attached file "logo.png").'
      );
      // The previous resource with this name is untouched.
      expect(resourcesManager.getResource('hero.png').getFile()).toBe(
        'assets/hero.png'
      );
    });

    it('replaces the file of an existing resource, keeping its name', async () => {
      addProjectResources();

      const result: EditorFunctionGenericOutput = await launchWithAttachments({
        changed_resources: [
          {
            resource_name: 'hero.png',
            replace_file_with_attachment_id: 'logo-id',
          },
          {
            resource_name: 'jump.aac',
            replace_file_with_attachment_id: 'logo-id',
          },
        ],
      });

      const resourcesManager = project.getResourcesManager();
      expect(resourcesManager.getResource('hero.png').getFile()).toBe(
        'https://project-resources/hero.png'
      );
      expect(result.message).toContain(
        'Replaced the file of the resource "hero.png" by the attached file "logo.png"'
      );
      // An image can't be the file of an audio resource.
      expect(resourcesManager.getResource('jump.aac').getFile()).toBe(
        'assets/jump.aac'
      );
      expect(result.message).toContain(
        '"logo.png" cannot be the file of "jump.aac", which is a audio resource. Skipped.'
      );
    });

    it('undoes the changes whose file could not be stored', async () => {
      addProjectResources();

      const result: EditorFunctionGenericOutput = await launchWithAttachments(
        {
          added_resources: [{ attachment_id: 'font-id' }],
          changed_resources: [
            {
              resource_name: 'hero.png',
              replace_file_with_attachment_id: 'logo-id',
            },
          ],
        },
        async () => true
      );

      expect(result.success).toBe(false);
      const resourcesManager = project.getResourcesManager();
      expect(resourcesManager.hasResource('title.ttf')).toBe(false);
      expect(resourcesManager.getResource('hero.png').getFile()).toBe(
        'assets/hero.png'
      );
      expect(result.message).toContain(
        'The file for "hero.png" could not be stored in the project: nothing was changed.'
      );
    });

    it('keeps the files in memory until a project not saved yet is saved', async () => {
      const result: EditorFunctionGenericOutput = await launchWithAttachments(
        { added_resources: [{ attachment_id: 'logo-id' }] },
        async () => false
      );

      expect(result.success).toBe(true);
      expect(
        project
          .getResourcesManager()
          .getResource('logo.png')
          .getFile()
      ).toMatch(/^blob:/);
      expect(result.message).toContain(
        'The project is not saved yet: the files will be stored in it when it is saved.'
      );
    });

    it('asks to attach again a file that is not available anymore', async () => {
      const result: EditorFunctionGenericOutput = await launchWithAttachments({
        added_resources: [{ attachment_id: 'expired-id' }],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'The attached file "expired-id" is not available (attached files are kept 30 days): ask the user to attach it again.'
      );
    });
  });
});
