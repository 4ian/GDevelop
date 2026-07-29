// @flow
import { editorFunctions } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

// These tools are handled server-side (or are no-ops in the editor): the
// editor implementations only return a constant output. These tests lock in
// the exact messages sent back to the AI.
describe('server-side handled tools', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  const launch = (functionName: string) =>
    editorFunctions[functionName].launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {},
    });

  it('create_or_update_plan fails as it is handled server-side', async () => {
    const result = await launch('create_or_update_plan');
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Unable to create or update plan - this is handled server-side.'
    );
  });

  it('report_fulfilment_problem fails as it is handled server-side', async () => {
    const result = await launch('report_fulfilment_problem');
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Unable to report a fulfilment problem - this is handled server-side.'
    );
  });

  it('read_full_docs and search_docs fail and tell the AI to continue', async () => {
    for (const functionName of ['read_full_docs', 'search_docs']) {
      const result = await launch(functionName);
      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Unable to read full documentation - continue with your existing GDevelop knowledge.'
      );
    }
  });

  it('run_explorer_agent and run_edit_agent fail as they are handled server-side', async () => {
    const explorerResult = await launch('run_explorer_agent');
    expect(explorerResult.success).toBe(false);
    expect(explorerResult.message).toBe(
      'Unable to run project explorer agent - this is handled server-side.'
    );

    const editResult = await launch('run_edit_agent');
    expect(editResult.success).toBe(false);
    expect(editResult.message).toBe(
      'Unable to run project edit agent - this is handled server-side.'
    );
  });

  it('search_object_asset_store fails as it is handled server-side', async () => {
    const result = await launch('search_object_asset_store');
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Unable to search the asset store - this is handled server-side.'
    );
  });

  it('read_game_project_json is a no-op returning success (the backend computes the result)', async () => {
    const result = await launch('read_game_project_json');
    expect(result.success).toBe(true);
  });

  it('keeps old tool names as aliases of the new implementations', () => {
    expect(editorFunctions.create_object).toBe(
      editorFunctions.create_or_replace_object
    );
    expect(editorFunctions.generate_events).toBe(
      editorFunctions.add_scene_events
    );
    expect(editorFunctions.change_object_property).toBe(
      editorFunctions.change_object_properties_effects
    );
    expect(editorFunctions.inspect_object_properties).toBe(
      editorFunctions.inspect_object_properties_effects
    );
  });
});
