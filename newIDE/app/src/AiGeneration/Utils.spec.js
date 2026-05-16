// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The Flow stub does not include React 18's act export.
import renderer, { act } from 'react-test-renderer';
import { processEditorFunctionCalls } from '../EditorFunctions/EditorFunctionCallRunner';
import { useProcessFunctionCalls } from './Utils';

jest.mock('../EditorFunctions/EditorFunctionCallRunner', () => ({
  processEditorFunctionCalls: jest.fn(),
}));

jest.mock('./UseEnsureExtensionInstalled', () => ({
  useEnsureExtensionInstalled: () => ({
    ensureExtensionInstalled: jest.fn(),
  }),
}));

jest.mock('./UseGenerateEvents', () => ({
  useGenerateEvents: () => ({
    generateEvents: jest.fn(),
  }),
}));

jest.mock('./UseSearchAndInstallAsset', () => ({
  useSearchAndInstallAsset: () => ({
    searchAndInstallAsset: jest.fn(),
  }),
}));

jest.mock('./UseSearchAndInstallResource', () => ({
  useSearchAndInstallResource: () => ({
    searchAndInstallResources: jest.fn(),
  }),
}));

const selectedAiRequest: any = {
  id: 'ai-request-1',
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
  userId: 'user-1',
  status: 'ready',
  mode: 'agent',
  error: null,
  output: [
    {
      type: 'message',
      status: 'completed',
      role: 'assistant',
      content: [
        {
          type: 'function_call',
          status: 'completed',
          call_id: 'call-1',
          name: 'create_scene',
          arguments: '{"scene_name":"Game"}',
        },
      ],
    },
  ],
};

const HookHarness = ({
  editorFunctionCallResults,
}: {|
  editorFunctionCallResults: any,
|}) => {
  useProcessFunctionCalls({
    i18n: ({ _: message => message.id || message }: any),
    project: null,
    resourceManagementProps: ({}: any),
    editorCallbacks: ({
      onOpenLayout: jest.fn(),
      onCreateProject: jest.fn(),
    }: any),
    selectedAiRequest,
    editorFunctionCallResults,
    onSendEditorFunctionCallResults: jest.fn(),
    addEditorFunctionCallResults: jest.fn(() => [
      { status: 'working', call_id: 'call-1' },
    ]),
    onSceneEventsModifiedOutsideEditor: jest.fn(),
    onInstancesModifiedOutsideEditor: jest.fn(),
    onObjectsModifiedOutsideEditor: jest.fn(),
    onObjectGroupsModifiedOutsideEditor: jest.fn(),
    onWillInstallExtension: jest.fn(),
    onExtensionInstalled: jest.fn(),
    isReadyToProcessFunctionCalls: true,
  });

  return null;
};

describe('useProcessFunctionCalls', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('does not reprocess a function call after it is marked working', async () => {
    let resolveProcessFunctionCalls: any = null;
    (processEditorFunctionCalls: any).mockReturnValue(
      new Promise(resolve => {
        resolveProcessFunctionCalls = resolve;
      })
    );
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    let tree: any = null;
    await act(async () => {
      tree = renderer.create(<HookHarness editorFunctionCallResults={null} />);
    });

    await act(async () => {
      if (!tree) throw new Error('Expected hook harness to render.');
      tree.update(
        <HookHarness
          editorFunctionCallResults={[{ status: 'working', call_id: 'call-1' }]}
        />
      );
    });

    expect(processEditorFunctionCalls).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalledWith(
      'All function calls are already being processed (in-flight guard), skipping.'
    );

    await act(async () => {
      resolveProcessFunctionCalls({
        results: [{ status: 'success', call_id: 'call-1', message: 'ok' }],
        createdSceneNames: [],
        createdProject: null,
      });
      await Promise.resolve();
    });
  });
});
