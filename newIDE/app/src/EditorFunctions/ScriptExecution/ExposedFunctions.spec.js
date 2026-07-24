// @flow
import { runScript } from './ScriptRunner';
import {
  buildExposedScriptFunctions,
  NON_SCRIPTABLE_FUNCTION_NAMES,
} from './ExposedFunctions';
import { capScriptExecutionResult } from './capScriptOutput';

// Deliberately gd-free (like ScriptRunner.spec.js): fake registries following
// the EditorFunction contract, so the exposed-functions bridge and the output
// caps can be tested without a real project.

const makeFakeEditorFunction = ({
  modifiesProject,
  launch,
}: {|
  modifiesProject?: boolean,
  launch?: (options: any) => Promise<any>,
|}) => ({
  modifiesProject: !!modifiesProject,
  launchFunction:
    launch ||
    (async (options: any) => ({ success: true, message: 'ok', options })),
});

describe('buildExposedScriptFunctions', () => {
  it('exposes client-side functions, excluding non-scriptable ones', () => {
    const editorFunctions = {
      create_scene: makeFakeEditorFunction({ modifiesProject: true }),
      describe_instances: makeFakeEditorFunction({}),
      run_script: makeFakeEditorFunction({ modifiesProject: true }),
      read_full_docs: makeFakeEditorFunction({}),
      generate_events: makeFakeEditorFunction({ modifiesProject: true }),
    };
    const editorFunctionsWithoutProject = {
      initialize_project: makeFakeEditorFunction({ modifiesProject: true }),
    };

    const exposed = buildExposedScriptFunctions({
      editorFunctions,
      editorFunctionsWithoutProject,
      launchOptions: {},
      project: {},
    });

    const names = exposed.map(f => f.name).sort();
    expect(names).toEqual(['create_scene', 'describe_instances']);
    // Sanity: the excluded names are the non-scriptable ones.
    expect(NON_SCRIPTABLE_FUNCTION_NAMES.has('run_script')).toBe(true);
    expect(NON_SCRIPTABLE_FUNCTION_NAMES.has('read_full_docs')).toBe(true);
  });

  it('restricts to allowedFunctionNames when given', () => {
    const editorFunctions = {
      create_scene: makeFakeEditorFunction({ modifiesProject: true }),
      describe_instances: makeFakeEditorFunction({}),
      put_2d_instances: makeFakeEditorFunction({ modifiesProject: true }),
    };
    const exposed = buildExposedScriptFunctions({
      editorFunctions,
      editorFunctionsWithoutProject: {},
      launchOptions: {},
      project: {},
      allowedFunctionNames: ['describe_instances'],
    });
    expect(exposed.map(f => f.name)).toEqual(['describe_instances']);
  });

  it('binds launch to the collaborators bag + per-call args + project', async () => {
    let received = null;
    const editorFunctions = {
      create_scene: makeFakeEditorFunction({
        modifiesProject: true,
        launch: async options => {
          received = options;
          return { success: true, message: 'created' };
        },
      }),
    };
    const exposed = buildExposedScriptFunctions({
      editorFunctions,
      editorFunctionsWithoutProject: {},
      launchOptions: { i18n: 'FAKE_I18N', toolOptions: null },
      project: 'FAKE_PROJECT',
    });

    const result = await runScript({
      jsCode: `await create_scene({ scene_name: 'Level1' });`,
      exposedFunctions: exposed,
    });

    expect(result.success).toBe(true);
    expect(received).toEqual({
      i18n: 'FAKE_I18N',
      toolOptions: null,
      args: { scene_name: 'Level1' },
      project: 'FAKE_PROJECT',
    });
  });
});

describe('capScriptExecutionResult', () => {
  it('reduces read-only outputs to { message } and keeps modifying outputs', async () => {
    const editorFunctions = {
      describe_instances: makeFakeEditorFunction({
        launch: async () => ({
          success: true,
          message: 'found',
          instances: Array.from({ length: 500 }, () => ({ x: 1, y: 2 })),
        }),
      }),
      create_scene: makeFakeEditorFunction({
        modifiesProject: true,
        launch: async () => ({
          success: true,
          message: 'created',
          sceneNames: ['A', 'B'],
        }),
      }),
    };
    const exposed = buildExposedScriptFunctions({
      editorFunctions,
      editorFunctionsWithoutProject: {},
      launchOptions: {},
      project: {},
    });
    const result = await runScript({
      jsCode: [
        `await describe_instances({ scene_name: 'L' });`,
        `await create_scene({ scene_name: 'L2' });`,
      ].join('\n'),
      exposedFunctions: exposed,
    });

    const capped = capScriptExecutionResult(result);
    const readOnlyRecord = capped.functionCallRecords[0];
    const modifyingRecord = capped.functionCallRecords[1];

    // Read-only: output reduced to just { message } (no big `instances` array).
    expect(readOnlyRecord.output).toEqual({ message: 'found' });
    expect(readOnlyRecord.output.instances).toBeUndefined();
    // Modifying: full output kept, and flagged.
    expect(modifyingRecord.output.sceneNames).toEqual(['A', 'B']);
    expect(modifyingRecord.didModifyProject).toBe(true);
    // The whole script modified the project.
    expect(capped.didModifyProject).toBe(true);
  });

  it('caps console logs with a truncation note', async () => {
    const jsCode = [
      'for (let i = 0; i < 150; i++) {',
      "  console.log('line ' + i);",
      '}',
    ].join('\n');
    const result = await runScript({ jsCode, exposedFunctions: [] });
    const capped = capScriptExecutionResult(result);
    // 100 kept + 1 note line.
    expect(capped.consoleLogs.length).toBe(101);
    expect(capped.consoleLogs[100]).toContain('truncated');
  });
});
