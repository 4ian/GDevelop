// @flow
import {
  addInGameEditorExtensionErrorsToFunctionCallOutputs,
  getInGameEditorExtensionErrorCallChain,
  type InGameEditorExtensionError,
} from '.';
import { EXTENSION_STORE_ORIGIN_NAME } from '../EditorFunctions/SimplifiedProject/SimplifiedExtensions';
import { type AiRequestFunctionCallOutput } from '../Utils/GDevelopServices/Generation';

const gd: libGDevelop = global.gd;

const createFakeError = (
  overrides: Partial<InGameEditorExtensionError>
): InGameEditorExtensionError => ({
  id: 1,
  key: 'key',
  extensionName: 'MyExtension',
  phase: 'doStepPostEvents',
  type: 'MyExtension::MyObject',
  message: 'object.getFoo is not a function',
  stack: [
    'TypeError: object.getFoo is not a function',
    '    at Object.GDJSInlineCode [as userFunc0x1a2b] (http://127.0.0.1/code1.js:2:110)',
    '    at gdjs.evtsExt__MyExtension__Update_95Mesh.eventsList0 (http://127.0.0.1/code1.js:3:97)',
    '    at gdjs.evtsExt__MyExtension__Update_95Mesh.func (http://127.0.0.1/code1.js:4:90)',
    '    at gdjs.evtsExt__MyExtension__MyObject.MyObject.doStepPostEventsContext.eventsList0 (http://127.0.0.1/code2.js:7:139)',
    '    at gdjs.evtsExt__MyExtension__MyObject.MyObject.doStepPostEventsContext.func (http://127.0.0.1/code2.js:8:179)',
    '    at MyObject.doStepPostEvents (http://127.0.0.1/code2.js:5:173)',
    '    at gdjs.CustomRuntimeObject3D.update (http://127.0.0.1/runtime.js:9:58)',
  ].join('\n'),
  count: 120,
  ...overrides,
});

const functionCallOutputs: Array<AiRequestFunctionCallOutput> = [
  {
    type: 'function_call_output',
    call_id: 'call-1',
    output: JSON.stringify({ success: true }),
  },
  {
    type: 'function_call_output',
    call_id: 'call-2',
    output: JSON.stringify({ success: true, message: 'Done.' }),
  },
];

describe('addInGameEditorExtensionErrorsToFunctionCallOutputs', () => {
  let project: gdProject;
  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewEventsFunctionsExtension('MyExtension', 0);
    project
      .insertNewEventsFunctionsExtension('StoreExtension', 1)
      .setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'StoreExtension');
  });
  afterEach(() => {
    project.delete();
  });

  it('gives the errors not given yet to the AI, a few at most, in the last output', () => {
    const errors = [
      createFakeError({ id: 1 }),
      createFakeError({
        id: 2,
        extensionName: 'StoreExtension',
        phase: 'editorCallback',
        type: null,
        message: 'Store extension failed',
        count: 1,
      }),
      createFakeError({ id: 3 }),
      createFakeError({ id: 4 }),
      createFakeError({ id: 5 }),
    ];

    const result = addInGameEditorExtensionErrorsToFunctionCallOutputs({
      functionCallOutputs,
      errors,
      givenErrorIds: new Set([1]),
      project,
    });

    expect(result.newlyGivenErrorIds).toEqual([2, 3, 4]);
    expect(result.functionCallOutputs[0]).toBe(functionCallOutputs[0]);
    const lastOutput = JSON.parse(result.functionCallOutputs[1].output);
    expect(lastOutput.message).toBe('Done.');
    expect(lastOutput.inGameEditorErrors.notShownCount).toBe(1);
    expect(lastOutput.inGameEditorErrors.errors[0]).toEqual({
      extensionName: 'StoreExtension',
      isStoreExtension: true,
      where: 'editorCallback of StoreExtension',
      message: 'Store extension failed',
      timesThrown: 1,
      callChain:
        'MyExtension::MyObject.doStepPostEvents → MyExtension::Update_Mesh → JavaScript code event',
    });
    expect(lastOutput.inGameEditorErrors.errors[1]).toMatchObject({
      extensionName: 'MyExtension',
      where: 'doStepPostEvents of MyExtension::MyObject',
      timesThrown: 120,
    });
    expect(lastOutput.inGameEditorErrors.errors[1].isStoreExtension).toBe(
      undefined
    );
  });

  it('leaves the outputs unchanged when every error was already given', () => {
    const result = addInGameEditorExtensionErrorsToFunctionCallOutputs({
      functionCallOutputs,
      errors: [createFakeError({ id: 1 })],
      givenErrorIds: new Set([1]),
      project,
    });

    expect(result).toEqual({ functionCallOutputs, newlyGivenErrorIds: [] });
  });
});

describe('getInGameEditorExtensionErrorCallChain', () => {
  it('keeps where the error was thrown, even outside of an extension', () => {
    expect(
      getInGameEditorExtensionErrorCallChain(
        [
          "TypeError: Cannot read properties of undefined (reading 'getX')",
          '    at gdjs.RuntimeObject.getAABB (http://127.0.0.1/runtime.js:1:1)',
          '    at gdjs.evtsExt__MyExtension__MyBehavior.MyBehavior.prototype.onCreatedContext.func (http://127.0.0.1/code.js:2:1)',
        ].join('\n')
      )
    ).toBe('MyExtension::MyBehavior.onCreated → gdjs.RuntimeObject.getAABB');
  });

  it('trims the middle of a long chain of functions', () => {
    expect(
      getInGameEditorExtensionErrorCallChain(
        [
          'Error: Too deep',
          ...[7, 6, 5, 4, 3, 2, 1].map(
            index =>
              `    at gdjs.evtsExt__MyExtension__Function${index}.func (http://127.0.0.1/code.js:${index}:1)`
          ),
        ].join('\n')
      )
    ).toBe(
      'MyExtension::Function1 → MyExtension::Function2 → … → MyExtension::Function5 → MyExtension::Function6 → MyExtension::Function7'
    );
  });
});
