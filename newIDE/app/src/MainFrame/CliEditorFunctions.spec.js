// @flow
import {
  describeCliEditorFunctions,
  parseCliEditorFunctionCalls,
  runCliEditorFunctionCalls,
  type CliEditorFunctionsCollaborators,
} from './CliEditorFunctions';
import {
  makeFakeI18n,
  makeFakeLaunchFunctionOptionsWithProject,
} from '../EditorFunctions/TestHelpers';
import { fakeEventsFunctionsExtensionsState } from '../stories/FakeEventsFunctionsExtensionsContext';

// The real PixiResourcesLoader transitively imports ESM-only packages that
// Jest cannot parse: replace it with the test mock.
jest.mock('../ObjectsRendering/PixiResourcesLoader', () => {
  const {
    PixiResourcesLoaderMock,
  } = require('../fixtures/TestPixiResourcesLoader');
  return { __esModule: true, default: PixiResourcesLoaderMock };
});

const gd: libGDevelop = global.gd;

const makeFakeCliEditorFunctionsCollaborators = (
  project: gdProject
): CliEditorFunctionsCollaborators => {
  const launchFunctionOptions = makeFakeLaunchFunctionOptionsWithProject(
    project
  );
  return {
    services: {
      ensureExtensionInstalled: launchFunctionOptions.ensureExtensionInstalled,
      searchAndInstallAsset: launchFunctionOptions.searchAndInstallAsset,
      searchAndInstallEffectAsset:
        launchFunctionOptions.searchAndInstallEffectAsset,
      searchAndInstallResources:
        launchFunctionOptions.searchAndInstallResources,
      attachmentsForResources: launchFunctionOptions.attachmentsForResources,
      generateEvents: launchFunctionOptions.generateEvents,
      getAssetStoreTagForNewObject:
        launchFunctionOptions.getAssetStoreTagForNewObject,
      prefetchStores: jest.fn(),
    },
    eventsFunctionsExtensionsState: fakeEventsFunctionsExtensionsState,
    notifications: {
      onSceneEventsModifiedOutsideEditor: jest.fn(),
      onInstancesModifiedOutsideEditor: jest.fn(),
      onObjectsModifiedOutsideEditor: jest.fn(),
      onEffectsModifiedOutsideEditor: jest.fn(),
      onObjectGroupsModifiedOutsideEditor: jest.fn(),
      onExtensionsModifiedOutsideEditor: jest.fn(),
    },
    onProjectItemRenamedOutsideEditor: jest.fn(),
    onWillDeleteScene: jest.fn(() => Promise.resolve()),
    onWillDeleteGameplayTest: jest.fn(() => Promise.resolve()),
    onWillDeleteObject: jest.fn(),
    onWillDeleteExtensionItem: jest.fn(() => Promise.resolve()),
    onWillInstallExtension: jest.fn(),
    onExtensionInstalled: jest.fn(),
    onExtensionsRegenerated: jest.fn(),
  };
};

describe('CliEditorFunctions', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('lists the functions run by the editor, but not the ones handled by the GDevelop AI', () => {
    const functionNames = describeCliEditorFunctions().map(
      description => description.name
    );

    expect(functionNames).toContain('create_or_replace_object');
    expect(functionNames).toContain('read_game_project_json');
    expect(functionNames).toContain('run_script');
    expect(functionNames).toContain('generate_events');
    expect(functionNames).not.toContain('add_scene_events');
    expect(functionNames).not.toContain('run_edit_agent');
    expect(functionNames).not.toContain('search_docs');
    expect(functionNames).not.toContain('initialize_project');
    expect(functionNames).not.toContain('create_object');
  });

  it('reads one call or a list of calls, with arguments as an object or a JSON string', () => {
    expect(
      parseCliEditorFunctionCalls({
        name: 'inspect_variables',
        arguments: { variable_scope: 'global' },
      })
    ).toEqual([
      { name: 'inspect_variables', arguments: { variable_scope: 'global' } },
    ]);
    expect(
      parseCliEditorFunctionCalls([
        { name: 'create_scene', arguments: '{"scene_name":"Level2"}' },
        { name: 'inspect_variables' },
      ])
    ).toEqual([
      { name: 'create_scene', arguments: { scene_name: 'Level2' } },
      { name: 'inspect_variables', arguments: {} },
    ]);
    expect(() => parseCliEditorFunctionCalls([{ arguments: {} }])).toThrow(
      'Call #0 must be an object'
    );
  });

  it('runs the calls one after the other and reports if the project was modified', async () => {
    const report = await runCliEditorFunctionCalls({
      project,
      i18n: makeFakeI18n(),
      functionCalls: [
        {
          name: 'add_or_edit_variable',
          arguments: {
            variable_name_or_path: 'Score',
            variable_scope: 'global',
            value: '10',
          },
        },
        {
          name: 'inspect_variables',
          arguments: { variable_scope: 'global' },
        },
      ],
      runScriptReadOnly: false,
      collaborators: makeFakeCliEditorFunctionsCollaborators(project),
    });

    expect(report.success).toBe(true);
    expect(report.didModifyProject).toBe(true);
    expect(report.notRunCalls).toEqual([]);
    expect(report.results.map(result => result.success)).toEqual([true, true]);
    expect(report.results[1].output.variables).toEqual([
      { variableName: 'Score', type: 'Number', value: '10' },
    ]);
    expect(
      project
        .getVariables()
        .get('Score')
        .getValue()
    ).toBe(10);
  });

  it('stops at the first failed call, keeping what was done before', async () => {
    const report = await runCliEditorFunctionCalls({
      project,
      i18n: makeFakeI18n(),
      functionCalls: [
        { name: 'create_scene', arguments: { scene_name: 'Level2' } },
        { name: 'search_docs', arguments: { query: 'platformer' } },
        { name: 'create_scene', arguments: { scene_name: 'Level3' } },
      ],
      runScriptReadOnly: false,
      collaborators: makeFakeCliEditorFunctionsCollaborators(project),
    });

    expect(report.success).toBe(false);
    expect(report.results.map(result => result.success)).toEqual([true, false]);
    expect(report.results[1].output.message).toBe(
      `"search_docs" is handled by the GDevelop AI, it can't be called from the CLI.`
    );
    expect(report.notRunCalls).toEqual([
      { name: 'create_scene', arguments: { scene_name: 'Level3' } },
    ]);
    expect(project.hasLayoutNamed('Level2')).toBe(true);
    expect(project.hasLayoutNamed('Level3')).toBe(false);
  });

  it('runs a script calling the editor functions', async () => {
    const report = await runCliEditorFunctionCalls({
      project,
      i18n: makeFakeI18n(),
      functionCalls: [
        {
          name: 'run_script',
          arguments: {
            js_code: `
              await add_or_edit_variable({ variable_name_or_path: 'Lives', variable_scope: 'global', value: '3' });
              const { variables } = await inspect_variables({ variable_scope: 'global' });
              return variables.map(variable => variable.variableName);
            `,
          },
        },
      ],
      runScriptReadOnly: false,
      collaborators: makeFakeCliEditorFunctionsCollaborators(project),
    });

    expect(report.success).toBe(true);
    expect(report.didModifyProject).toBe(true);
    expect(report.results[0].output.returnValue).toEqual(['Lives']);
  });

  it('only exposes the functions not modifying the project to a read-only script', async () => {
    const report = await runCliEditorFunctionCalls({
      project,
      i18n: makeFakeI18n(),
      functionCalls: [
        {
          name: 'run_script',
          arguments: {
            js_code: `await create_scene({ scene_name: 'Level2' });`,
          },
        },
      ],
      runScriptReadOnly: true,
      collaborators: makeFakeCliEditorFunctionsCollaborators(project),
    });

    expect(report.success).toBe(false);
    expect(report.didModifyProject).toBe(false);
    expect(project.hasLayoutNamed('Level2')).toBe(false);
  });

  it('notifies the editors once per scene for all the objects changed by the calls', async () => {
    const collaborators = makeFakeCliEditorFunctionsCollaborators(project);
    const report = await runCliEditorFunctionCalls({
      project,
      i18n: makeFakeI18n(),
      functionCalls: ['Player', 'Enemy'].map(objectName => ({
        name: 'create_or_replace_object',
        arguments: {
          scene_name: 'Level1',
          object_name: objectName,
          object_type: 'Sprite',
          search_terms: objectName,
          description: objectName,
        },
      })),
      runScriptReadOnly: false,
      collaborators,
    });

    expect(report.success).toBe(true);
    expect(
      collaborators.notifications.onObjectsModifiedOutsideEditor
    ).toHaveBeenCalledTimes(1);
  });
});
