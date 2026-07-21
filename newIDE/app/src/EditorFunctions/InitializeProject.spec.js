// @flow
import {
  editorFunctionsWithoutProject,
  type EditorFunctionGenericOutput,
} from './index';
import { makeFakeLaunchFunctionOptionsWithoutProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('initialize_project (without project)', () => {
  let createdProject: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    createdProject = new gd.ProjectHelper.createNewGDJSProject();
    createdProject.insertNewLayout('Scene1', 0);
  });

  afterEach(() => {
    createdProject.delete();
  });

  const makeOptionsWithOnCreateProject = (onCreateProject: Function) => {
    const options = makeFakeLaunchFunctionOptionsWithoutProject();
    return {
      ...options,
      editorCallbacks: {
        ...options.editorCallbacks,
        onCreateProject,
      },
    };
  };

  it('initializes a project from a template', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onCreateProject = jest.fn().mockResolvedValue({
      exampleSlug: 'starting-platformer',
      createdProject,
    });

    const result: EditorFunctionGenericOutput = await editorFunctionsWithoutProject.initialize_project.launchFunction(
      {
        ...makeOptionsWithOnCreateProject(onCreateProject),
        args: {
          project_name: 'My Platformer',
          template_slug: 'starting-platformer',
        },
      }
    );

    expect(onCreateProject).toHaveBeenCalledWith({
      name: 'My Platformer',
      exampleSlug: 'starting-platformer',
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Initialized project from template "starting-platformer".'
    );
    expect(result.initializedProject).toBe(true);
    expect(result.initializedFromTemplateSlug).toBe('starting-platformer');
    expect(result.meta && result.meta.createdProject).toBe(createdProject);
  });

  it('initializes an empty project when the template slug is "empty"', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onCreateProject = jest.fn().mockResolvedValue({
      exampleSlug: null,
      createdProject,
    });

    const result: EditorFunctionGenericOutput = await editorFunctionsWithoutProject.initialize_project.launchFunction(
      {
        ...makeOptionsWithOnCreateProject(onCreateProject),
        args: {
          project_name: 'My Game',
          template_slug: 'empty',
        },
      }
    );

    // No example is requested from the editor for an empty project.
    expect(onCreateProject).toHaveBeenCalledWith({
      name: 'My Game',
      exampleSlug: null,
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe('Initialized empty project (1 scene).');
    expect(result.initializedProject).toBe(true);
    expect(result.initializedFromTemplateSlug).toBeUndefined();
  });

  it('reads the existing events of the created project when asked to', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onCreateProject = jest.fn().mockResolvedValue({
      exampleSlug: 'starting-platformer',
      createdProject,
    });

    const result: EditorFunctionGenericOutput = await editorFunctionsWithoutProject.initialize_project.launchFunction(
      {
        ...makeOptionsWithOnCreateProject(onCreateProject),
        args: {
          project_name: 'My Platformer',
          template_slug: 'starting-platformer',
          also_read_existing_events: true,
        },
      }
    );

    expect(result.success).toBe(true);
    const eventsAsTextByScene = result.eventsAsTextByScene || {};
    expect(Object.keys(eventsAsTextByScene)).toEqual(['Scene1']);
    expect(typeof eventsAsTextByScene['Scene1']).toBe('string');
  });

  it('retries once and fails with a generic message when the project creation fails', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onCreateProject = jest.fn();
    onCreateProject.mockRejectedValue(new Error('Network error'));

    const result: EditorFunctionGenericOutput = await editorFunctionsWithoutProject.initialize_project.launchFunction(
      {
        ...makeOptionsWithOnCreateProject(onCreateProject),
        args: {
          project_name: 'My Game',
          template_slug: 'empty',
        },
      }
    );

    expect(onCreateProject).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Unable to initialize project (possibly a network error). Try again.'
    );
  });

  it('fails with the generic message when no project is returned', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onCreateProject = jest.fn().mockResolvedValue({
      exampleSlug: null,
      createdProject: null,
    });

    const result: EditorFunctionGenericOutput = await editorFunctionsWithoutProject.initialize_project.launchFunction(
      {
        ...makeOptionsWithOnCreateProject(onCreateProject),
        args: {
          project_name: 'My Game',
          template_slug: 'empty',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Unable to initialize project (possibly a network error). Try again.'
    );
  });
});

describe('get_game_starter_summary (without project)', () => {
  it('fails as it is handled on the backend', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctionsWithoutProject.get_game_starter_summary.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithoutProject(),
        args: { template_slug: 'starting-platformer' },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'get_game_starter_summary is handled on the backend.'
    );
  });
});
