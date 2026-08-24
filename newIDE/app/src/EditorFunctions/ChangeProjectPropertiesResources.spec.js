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
});
