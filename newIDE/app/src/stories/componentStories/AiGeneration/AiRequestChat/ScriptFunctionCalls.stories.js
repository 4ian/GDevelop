// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import { fakeSilverAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import { CreditsPackageStoreStateProvider } from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { commonProps } from './Orchestrator.stories';
import {
  AiRequestContext,
  initialAiRequestContextState,
} from '../../../../AiGeneration/AiRequestContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';

// Script-based agents (toolsVersion v12): the edit and explorer sub-agents drive
// a single `run_script` tool instead of N discrete tool calls. These stories
// exercise how a script is displayed in the chat by `RunScriptFunctionCallRow`
// (title + status + how many operations it made, then the script source, these
// operations, its console output and its result as foldable sections, and the
// error that stopped it) — including the cases that only happen in a real v12
// flow: `run_script` lives on a SUB-AGENT, so it is rendered as a child row of
// `SubAgentFunctionCallRow`.
//
// Everything is folded by default: click a script row, then one of its sections,
// to read the code an agent is about to run (or has run) and what it did. This
// matters in particular when auto edit is off — the awaiting-approval story
// checks the row is then opened on the script the user has to approve.
export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/ScriptFunctionCalls',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

const WrappedChatComponent = (allProps: any) => {
  const {
    authenticatedUser,
    automaticallyApplyAiRequestEdits,
    ...chatProps
  } = allProps;
  const authenticatedUserToUse =
    authenticatedUser || fakeSilverAuthenticatedUser;
  const chatProjectId = chatProps.project
    ? chatProps.project.getProjectUuid()
    : null;
  const automaticallyApplyAiRequestEditsByProjectId =
    chatProjectId != null &&
    typeof automaticallyApplyAiRequestEdits === 'boolean'
      ? { [chatProjectId]: automaticallyApplyAiRequestEdits }
      : {};
  return (
    <FixedHeightFlexContainer height={800}>
      <FixedWidthFlexContainer width={600}>
        <PreferencesContext.Provider
          // $FlowFixMe[incompatible-type]
          value={{
            ...initialPreferences,
            // $FlowFixMe[incompatible-type]
            values: {
              ...initialPreferences.values,
              automaticallyApplyAiRequestEditsByProjectId,
            },
          }}
        >
          <AuthenticatedUserContext.Provider value={authenticatedUserToUse}>
            <SubscriptionProvider>
              <CreditsPackageStoreStateProvider>
                <I18n>
                  {({ i18n }) => (
                    <AiRequestChat
                      i18n={i18n}
                      {...commonProps}
                      {...chatProps}
                    />
                  )}
                </I18n>
              </CreditsPackageStoreStateProvider>
            </SubscriptionProvider>
          </AuthenticatedUserContext.Provider>
        </PreferencesContext.Provider>
      </FixedWidthFlexContainer>
    </FixedHeightFlexContainer>
  );
};

/**
 * Wraps the chat with an AiRequestContext carrying the sub-agent AI requests
 * (so their `run_script` child rows are rendered), the per-request editor
 * function call results (so a script can be shown mid-run) and the pending edit
 * approval (which the script row reads from the context).
 */
const WrappedChatComponentWithSubAgent = ({
  subAgentAiRequests,
  editorFunctionCallResultsByAiRequestId,
  pendingEditApproval,
  ...chatProps
}: any) => {
  const aiRequests = {};
  (subAgentAiRequests || []).forEach(subAgentAiRequest => {
    aiRequests[subAgentAiRequest.id] = subAgentAiRequest;
  });
  const resultsByAiRequestId = editorFunctionCallResultsByAiRequestId || {};
  return (
    <AiRequestContext.Provider
      // $FlowFixMe[incompatible-type]
      value={{
        ...initialAiRequestContextState,
        aiRequestStorage: {
          ...initialAiRequestContextState.aiRequestStorage,
          aiRequests,
        },
        editorFunctionCallResultsStorage: {
          ...initialAiRequestContextState.editorFunctionCallResultsStorage,
          getEditorFunctionCallResults: (aiRequestId: string) =>
            resultsByAiRequestId[aiRequestId] || [],
        },
        pendingEditApproval: pendingEditApproval || null,
      }}
    >
      <WrappedChatComponent
        pendingEditApproval={pendingEditApproval}
        {...chatProps}
      />
    </AiRequestContext.Provider>
  );
};

// Fixtures
// --------

const userRequestMessage = {
  type: 'message',
  status: 'completed',
  role: 'user',
  content: [
    {
      type: 'user_request',
      status: 'completed',
      text: 'Add 10 coins in an arc above the platforms, and a score text.',
    },
  ],
};

const SUB_AGENT_AI_REQUEST_ID = 'fake-edit-sub-agent-request-id';
const EXPLORER_SUB_AGENT_AI_REQUEST_ID = 'fake-explorer-sub-agent-request-id';

// A realistic edit script: the computed placement loop of the v12 prompt
// examples (create the object, place instances in a loop, declare a variable).
const coinsScriptJsCode = `const scene = 'Level1';
await create_or_replace_object({ scene_name: scene, object_type: 'Sprite', object_name: 'Coin', search_terms: 'coin, gold, collectible' });
for (let i = 0; i < 10; i++) {
  const x = 200 + i * 60;
  const y = 300 - Math.sin((i / 9) * Math.PI) * 120;
  await put_2d_instances({ scene_name: scene, object_name: 'Coin', layer_name: '', brush_kind: 'point', brush_position: \`\${x},\${y}\` });
}
await create_or_replace_object({ scene_name: scene, object_type: 'TextObject::Text', object_name: 'ScoreText', search_terms: 'text' });
await put_2d_instances({ scene_name: scene, object_name: 'ScoreText', layer_name: '', brush_kind: 'point', brush_position: '20,20' });
await add_or_edit_variable({
  variable_scope: 'scene',
  scene_name: scene,
  variables: [{ variable_name_or_path: 'Score', value: '0', variable_type: 'number' }],
});
console.log('Placed 10 coins between x=200 and x=740.');
return 'Placed 10 coins in an arc, added a ScoreText instance and the Score variable.';`;

const makeRunScriptCall = ({
  callId,
  title,
  jsCode,
}: {|
  callId: string,
  title: string,
  jsCode: string,
|}) => ({
  type: 'function_call',
  status: 'completed',
  call_id: callId,
  name: 'run_script',
  arguments: JSON.stringify({ title, js_code: jsCode }),
});

const makeAssistantMessageWithCalls = (calls: Array<Object>) => ({
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: calls,
});

const makeAssistantTextMessage = (text: string) => ({
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: [
    { type: 'output_text', status: 'completed', text, annotations: [] },
  ],
});

// The successful records of the coins script. Read-only records would only keep
// `{ message }` (their data must not re-enter the LLM context) — here every call
// is project-modifying, so they keep their full output.
const coinsScriptRecords = [
  {
    functionName: 'create_or_replace_object',
    args: { scene_name: 'Level1', object_name: 'Coin', object_type: 'Sprite' },
    success: true,
    output: { message: 'Created object "Coin" of type "Sprite".' },
    didModifyProject: true,
  },
  ...Array.from({ length: 10 }, (unusedValue, index) => ({
    functionName: 'put_2d_instances',
    args: {
      scene_name: 'Level1',
      object_name: 'Coin',
      brush_position: `${200 + index * 60},${Math.round(
        300 - Math.sin((index / 9) * Math.PI) * 120
      )}`,
    },
    success: true,
    output: { message: 'Placed 1 instance of "Coin".' },
    didModifyProject: true,
  })),
  {
    functionName: 'create_or_replace_object',
    args: {
      scene_name: 'Level1',
      object_name: 'ScoreText',
      object_type: 'TextObject::Text',
    },
    success: true,
    output: {
      message: 'Created object "ScoreText" of type "TextObject::Text".',
    },
    didModifyProject: true,
  },
  {
    functionName: 'put_2d_instances',
    args: { scene_name: 'Level1', object_name: 'ScoreText' },
    success: true,
    output: { message: 'Placed 1 instance of "ScoreText".' },
    didModifyProject: true,
  },
  {
    functionName: 'add_or_edit_variable',
    args: { scene_name: 'Level1', variable_scope: 'scene' },
    success: true,
    output: { message: 'Declared 1 variable(s): Score.' },
    didModifyProject: true,
  },
];

const makeRunScriptOutput = ({
  success,
  functionCallRecords,
  consoleLogs,
  returnValue,
  error,
}: {|
  success: boolean,
  functionCallRecords: Array<Object>,
  consoleLogs?: Array<string>,
  returnValue?: any,
  error?: Object | null,
|}) =>
  JSON.stringify({
    success,
    functionCallRecords,
    consoleLogs: consoleLogs || [],
    returnValue: returnValue === undefined ? null : returnValue,
    error: error || null,
  });

// The orchestrator call that launched the edit sub-agent.
const runEditAgentCall = {
  type: 'function_call',
  status: 'completed',
  call_id: 'tool_0_run_edit_agent',
  name: 'run_edit_agent',
  arguments: JSON.stringify({
    short_title: 'Adding coins in an arc and a score text',
    prompt:
      'In scene Level1, add 10 coins placed in an arc above the platforms, and a ScoreText showing the score (starting at 0).',
  }),
  subAgentAiRequestId: SUB_AGENT_AI_REQUEST_ID,
};

const runExplorerAgentCall = {
  type: 'function_call',
  status: 'completed',
  call_id: 'tool_0_run_explorer_agent',
  name: 'run_explorer_agent',
  arguments: JSON.stringify({
    short_title: 'Checking the objects and instances of Level1',
    prompt:
      'List the objects of Level1 with their behaviors, and how many instances of each are placed.',
  }),
  subAgentAiRequestId: EXPLORER_SUB_AGENT_AI_REQUEST_ID,
};

const makeOrchestratorAiRequest = ({
  output,
  status,
}: {|
  output: Array<Object>,
  status: string,
|}) => ({
  createdAt: '',
  updatedAt: '',
  id: 'fake-orchestrator-request',
  mode: 'orchestrator',
  toolsVersion: 'v12',
  status,
  userId: 'fake-user-id',
  gameProjectJson: 'FAKE DATA',
  output,
  error: null,
});

const makeSubAgentAiRequest = ({
  id,
  status,
  output,
}: {|
  id: string,
  status: string,
  output: Array<Object>,
|}) => ({
  id,
  createdAt: '',
  updatedAt: '',
  userId: 'fake-user-id',
  mode: 'orchestrator',
  toolsVersion: 'v12',
  status,
  gameProjectJson: null,
  error: null,
  output,
});

// An edit sub-agent that ran one script, with a given outcome.
const makeEditSubAgentWithScript = ({
  status,
  callId,
  title,
  jsCode,
  scriptOutput,
  finalText,
}: {|
  status: string,
  callId?: string,
  title?: string,
  jsCode?: string,
  scriptOutput?: string | null,
  finalText?: string | null,
|}) =>
  makeSubAgentAiRequest({
    id: SUB_AGENT_AI_REQUEST_ID,
    status,
    output: [
      makeAssistantMessageWithCalls([
        makeRunScriptCall({
          callId: callId || 'sub_tool_0_run_script',
          title: title || 'Place 10 coins in an arc and add a score text',
          jsCode: jsCode || coinsScriptJsCode,
        }),
      ]),
      ...(scriptOutput
        ? [
            {
              type: 'function_call_output',
              call_id: callId || 'sub_tool_0_run_script',
              output: scriptOutput,
            },
          ]
        : []),
      ...(finalText ? [makeAssistantTextMessage(finalText)] : []),
    ],
  });

// A script running inside an edit sub-agent
// ----------------------------------------

// The script has been sent to the editor and is being executed: the row shows a
// spinner, and the code is already inspectable in the details.
export const editAgentScriptWorking = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({ status: 'ready', scriptOutput: null }),
    ]}
    editorFunctionCallResultsByAiRequestId={{
      [SUB_AGENT_AI_REQUEST_ID]: [
        { status: 'working', call_id: 'sub_tool_0_run_script' },
      ],
    }}
    aiRequest={makeOrchestratorAiRequest({
      status: 'working',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
      ],
    })}
  />
);

// A clean run: 14 project-modifying calls in a single script (one tool call
// instead of 14 round trips), the logged line, and the script's return value.
export const editAgentScriptSucceeded = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({
        status: 'ready',
        scriptOutput: makeRunScriptOutput({
          success: true,
          functionCallRecords: coinsScriptRecords,
          consoleLogs: ['Placed 10 coins between x=200 and x=740.'],
          returnValue:
            'Placed 10 coins in an arc, added a ScoreText instance and the Score variable.',
        }),
        finalText: 'Done.',
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// Execution stops at the first call returning `success: false`: the records show
// exactly what was applied before the failure (no rollback), and the error names
// the failing function.
export const editAgentScriptFailedOnFunctionCall = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({
        status: 'ready',
        scriptOutput: makeRunScriptOutput({
          success: false,
          functionCallRecords: [
            coinsScriptRecords[0],
            coinsScriptRecords[1],
            {
              functionName: 'put_2d_instances',
              args: {
                scene_name: 'Level1',
                object_name: 'Coni',
                brush_position: '320,262',
              },
              success: false,
              output: {
                message:
                  'Object not found: "Coni" in scene "Level1" nor globally.',
              },
            },
          ],
          consoleLogs: [],
          error: {
            message:
              'Function "put_2d_instances" failed: Object not found: "Coni" in scene "Level1" nor globally. The script was stopped (everything executed before is applied).',
            lineNumber: null,
            lastCalledFunctionName: 'put_2d_instances',
          },
        }),
        finalText:
          'I mistyped the object name on the third placement. The Coin object and its first instance were created; I will place the remaining coins in a follow-up script.',
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// A script that could not even be compiled: no call was made, and the error
// carries the line number in the script source.
export const editAgentScriptFailedWithSyntaxError = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({
        status: 'ready',
        title: 'Place the coins',
        jsCode: `const scene = 'Level1';
for (let i = 0; i < 10; i++ {
  await put_2d_instances({ scene_name: scene, object_name: 'Coin' });
}`,
        scriptOutput: makeRunScriptOutput({
          success: false,
          functionCallRecords: [],
          error: {
            message: 'SyntaxError: missing ) after argument list',
            lineNumber: 2,
            lastCalledFunctionName: null,
          },
        }),
        finalText: 'The script had a syntax error; retrying with a fixed loop.',
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// An idempotent no-op (the requested values already match the current ones) is a
// SUCCESS from v12 and carries `nothingChanged: true` in its output: it must NOT
// stop the script, so the call after it still ran. Visible here as a green
// (successful) record whose message explains that nothing changed — before v12
// the same call was a failure that killed the script.
export const editAgentScriptWithNoOpCall = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({
        status: 'ready',
        title: 'Bring the score text to the front',
        jsCode: `await put_2d_instances({ scene_name: 'Level1', object_name: 'ScoreText', layer_name: '', brush_kind: 'none', existing_instance_ids: ['instance-7'], instances_z_order: 10 });
await change_object_properties_effects({ scene_name: 'Level1', object_name: 'ScoreText', changed_properties: [{ property_name: 'Text', new_value: 'Score: 0' }] });
return 'Score text brought to the front.';`,
        scriptOutput: makeRunScriptOutput({
          success: true,
          functionCallRecords: [
            {
              functionName: 'put_2d_instances',
              args: {
                scene_name: 'Level1',
                object_name: 'ScoreText',
                instances_z_order: 10,
              },
              success: true,
              output: {
                message:
                  'Matched 1 existing instance but the requested values are identical to their current ones, so nothing changed. To move instances, use the "point" brush with `brush_position` (the "none" brush never changes position).',
                nothingChanged: true,
              },
            },
            {
              functionName: 'change_object_properties_effects',
              args: { scene_name: 'Level1', object_name: 'ScoreText' },
              success: true,
              output: { message: 'Updated properties of "ScoreText".' },
              didModifyProject: true,
            },
          ],
          returnValue: 'Score text brought to the front.',
        }),
        finalText: 'Done.',
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// The output caps (script-api README §3.4). The visible effect in this row is
// the console-log cut with its dropped-lines note; the truncated `args` are kept
// in the payload for realism (the row renders a record's name and message only,
// not its args).
export const editAgentScriptWithTruncatedOutput = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({
        status: 'ready',
        title: 'Build the 10x10 arena floor',
        scriptOutput: makeRunScriptOutput({
          success: true,
          functionCallRecords: [
            {
              functionName: 'put_3d_instances',
              args: `{"scene_name":"Arena","object_name":"FloorTile","brush_kind":"line","brush_position":"0,0,0","brush_end_position":"1152,0,0","new_instances_count":10,"instances_size":"128,128,32"}…[truncated from 4210 chars]`,
              success: true,
              output: { message: 'Placed 10 instances of "FloorTile".' },
              didModifyProject: true,
            },
            {
              functionName: 'put_3d_instances',
              args: '…[truncated from 3980 chars]',
              success: true,
              output: { message: 'Placed 10 instances of "FloorTile".' },
              didModifyProject: true,
            },
          ],
          consoleLogs: [
            'Row 0: 10 tiles from 0,0 to 1152,0',
            'Row 1: 10 tiles from 0,128 to 1152,128',
            'Row 2: 10 tiles from 0,256 to 1152,256',
            '…[console output truncated, 97 more line(s) dropped]',
          ],
          returnValue: 'Floor (10x10) and 20 perimeter walls placed.',
        }),
        finalText: 'Done.',
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// Forward compatibility: a record whose function name the editor does not know
// (e.g. an AI request made with a newer toolsVersion) still renders as a row,
// and a record with no message renders with its name only.
export const editAgentScriptWithUnknownRecordedFunction = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({
        status: 'ready',
        title: 'Use a function from a newer tools version',
        scriptOutput: makeRunScriptOutput({
          success: true,
          functionCallRecords: [
            {
              functionName: 'some_future_function',
              args: { whatever: true },
              success: true,
              output: { message: 'Did something the editor does not know.' },
              didModifyProject: true,
            },
            {
              functionName: 'create_or_replace_object',
              args: { scene_name: 'Level1', object_name: 'Coin' },
              success: true,
              output: {},
              didModifyProject: true,
            },
            {
              // A malformed record (no functionName): must not break the row.
              args: {},
              success: true,
              output: { message: 'Recorded without a function name.' },
            },
          ],
        }),
        finalText: 'Done.',
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// The orchestrator's `initial_script` (zero-LLM path)
// --------------------------------------------------

// The orchestrator authored the script itself when launching the edit agent: the
// child is seeded with the script (call id prefixed `initial-script-`) and, when
// it runs clean, finishes with ZERO LLM calls (only the synthetic closing
// message).
export const initialScriptSucceededWithZeroLlmCall = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({
        status: 'ready',
        callId: 'initial-script-01KYAETCTGHGRM6EY6RKZXW6CJ',
        title: 'Place 10 coins in an arc and add a score text',
        scriptOutput: makeRunScriptOutput({
          success: true,
          functionCallRecords: coinsScriptRecords,
          consoleLogs: ['Placed 10 coins between x=200 and x=740.'],
          returnValue:
            'Placed 10 coins in an arc, added a ScoreText instance and the Score variable.',
        }),
        finalText: 'Done.',
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// When the seeded script fails, the edit agent's LLM takes over to repair it:
// the failed initial script and the agent's own follow-up script are both shown.
export const initialScriptFailedThenAgentRepaired = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeSubAgentAiRequest({
        id: SUB_AGENT_AI_REQUEST_ID,
        status: 'ready',
        output: [
          makeAssistantMessageWithCalls([
            makeRunScriptCall({
              callId: 'initial-script-01KYAETCTGHGRM6EY6RKZXW6CJ',
              title: 'Place 10 coins in an arc and add a score text',
              jsCode: coinsScriptJsCode,
            }),
          ]),
          {
            type: 'function_call_output',
            call_id: 'initial-script-01KYAETCTGHGRM6EY6RKZXW6CJ',
            output: makeRunScriptOutput({
              success: false,
              functionCallRecords: [coinsScriptRecords[0]],
              error: {
                message:
                  'Function "put_2d_instances" failed: Scene "Level 1" not found. The script was stopped (everything executed before is applied).',
                lineNumber: null,
                lastCalledFunctionName: 'put_2d_instances',
              },
            }),
          },
          makeAssistantTextMessage(
            'The scene is named "Level1" (no space). Re-running the placement from where it stopped.'
          ),
          makeAssistantMessageWithCalls([
            makeRunScriptCall({
              callId: 'sub_tool_1_run_script',
              title: 'Place the coins with the right scene name',
              jsCode: `const scene = 'Level1';
for (let i = 0; i < 10; i++) {
  const x = 200 + i * 60;
  const y = 300 - Math.sin((i / 9) * Math.PI) * 120;
  await put_2d_instances({ scene_name: scene, object_name: 'Coin', layer_name: '', brush_kind: 'point', brush_position: \`\${x},\${y}\` });
}
return 'Placed the 10 coins.';`,
            }),
          ]),
          {
            type: 'function_call_output',
            call_id: 'sub_tool_1_run_script',
            output: makeRunScriptOutput({
              success: true,
              functionCallRecords: coinsScriptRecords.slice(1, 11),
              returnValue: 'Placed the 10 coins.',
            }),
          },
          makeAssistantTextMessage(
            'Coins placed. The scene name in the initial script had a typo ("Level 1"), fixed to "Level1".'
          ),
        ],
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// An explorer sub-agent's script (read-only)
// ------------------------------------------

// Explorer scripts only call read-only functions, whose records keep just their
// `{ message }` (their data must not re-enter the LLM context): the agent
// `console.log`s the few values it needs instead.
export const explorerAgentScriptSucceeded = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeSubAgentAiRequest({
        id: EXPLORER_SUB_AGENT_AI_REQUEST_ID,
        status: 'ready',
        output: [
          makeAssistantMessageWithCalls([
            makeRunScriptCall({
              callId: 'sub_tool_0_run_script',
              title: 'Inspect the objects and instances of Level1',
              jsCode: `const objects = await inspect_object_properties_effects({ scene_name: 'Level1' });
console.log('Objects:', (objects.objects || []).map((o) => o.objectName).join(', '));
const instances = await describe_instances({ scene_name: 'Level1' });
console.log('Instance count:', (instances.instances || []).length);
return 'Inspected Level1.';`,
            }),
          ]),
          {
            type: 'function_call_output',
            call_id: 'sub_tool_0_run_script',
            output: makeRunScriptOutput({
              success: true,
              functionCallRecords: [
                {
                  functionName: 'inspect_object_properties_effects',
                  args: { scene_name: 'Level1' },
                  success: true,
                  // Reduced to `{ message }` by the read-only reduction.
                  output: {
                    message:
                      'All objects of the scene, with their behaviors and variables.',
                  },
                },
                {
                  functionName: 'describe_instances',
                  args: { scene_name: 'Level1' },
                  success: true,
                  output: {
                    message: 'The instances placed in the scene.',
                  },
                },
              ],
              consoleLogs: [
                'Objects: Player, Coin, Platform, ScoreText',
                'Instance count: 24',
              ],
              returnValue: 'Inspected Level1.',
            }),
          },
          makeAssistantTextMessage(
            'Level1 has Player, Coin, Platform and ScoreText, with 24 instances placed in total.'
          ),
        ],
      }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runExplorerAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_explorer_agent',
          output: '{"success":true}',
        },
      ],
    })}
  />
);

// Approval and interruption
// ------------------------

// Auto edit off: the whole script is gated behind ONE approval. The user must be
// able to expand the row and read the code before applying it.
export const editAgentScriptAwaitingEditApproval = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    project={testProject.project}
    automaticallyApplyAiRequestEdits={false}
    subAgentAiRequests={[
      makeEditSubAgentWithScript({ status: 'ready', scriptOutput: null }),
    ]}
    pendingEditApproval={{
      aiRequestId: SUB_AGENT_AI_REQUEST_ID,
      callIds: ['sub_tool_0_run_script'],
      label: 'Adding coins in an arc and a score text',
    }}
    onResolveEditApproval={action('onResolveEditApproval')}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
      ],
    })}
  />
);

// The request was stopped while the script was pending: the row shows the
// interrupted state instead of a spinner.
export const editAgentScriptStopped = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequests={[
      makeEditSubAgentWithScript({ status: 'ready', scriptOutput: null }),
    ]}
    aiRequest={makeOrchestratorAiRequest({
      status: 'ready',
      output: [
        userRequestMessage,
        makeAssistantMessageWithCalls([runEditAgentCall]),
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true,"stopped":true}',
        },
      ],
    })}
  />
);
