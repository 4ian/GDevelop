// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
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

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/SpecificFunctionCalls',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

const WrappedChatComponent = (allProps: any) => {
  const {
    authenticatedUser,
    automaticallyUseCreditsForAiRequests,
    ...chatProps
  } = allProps;
  const authenticatedUserToUse =
    authenticatedUser || fakeSilverAuthenticatedUser;
  const [automaticallyUseCredits, setAutomaticallyUseCredits] = React.useState(
    automaticallyUseCreditsForAiRequests || false
  );
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
              automaticallyUseCreditsForAiRequests: automaticallyUseCredits,
            },
            setAutomaticallyUseCreditsForAiRequests: (value: boolean) => {
              setAutomaticallyUseCredits(value);
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

const userRequestMessage = {
  type: 'message',
  status: 'completed',
  role: 'user',
  content: [
    {
      type: 'user_request',
      status: 'completed',
      text: 'How to add a leaderboard with the player best score?',
    },
  ],
};
const addSceneEventsFunctionCallMessage = {
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: [
    {
      name: 'add_scene_events',
      arguments:
        '{"objects_list":"Mario, Coin","events_description":"When Mario collides with Coin, delete Coin and add 100 to the scene variable Score","extension_names_list":"Sprite, Variables","scene_name":"Level1"}',
      type: 'function_call',
      status: 'completed',
      call_id: 'tool_0_add_scene_events',
    },
  ],
};

export const addSceneEventsWithNewlyAddedResources = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        addSceneEventsFunctionCallMessage,
        {
          type: 'function_call_output',
          call_id: 'tool_0_add_scene_events',
          output:
            '{"success":true,"newlyAddedResources":[{"resourceName":"jump.wav","resourceKind":"audio"}]}',
        },
      ],
      error: null,
    }}
  />
);

export const addSceneEventsWithNewlyAddedResourcesWithEditorFunctionCallResult = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [userRequestMessage, addSceneEventsFunctionCallMessage],
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'finished',
        call_id: 'tool_0_add_scene_events',
        success: true,
        output: {
          newlyAddedResources: [
            {
              resourceName: 'jump.wav',
              resourceKind: 'audio',
            },
            {
              resourceName: 'another-resource',
              resourceKind: 'font',
            },
          ],
        },
      },
    ]}
  />
);

// --- Sub-agent function call stories ---

const fakeSubAgentAiRequest = {
  id: 'fake-sub-agent-request-id',
  createdAt: '',
  updatedAt: '',
  userId: 'fake-user-id',
  mode: 'orchestrator',
  status: 'ready',
  gameProjectJson: null,
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
          call_id: 'sub_tool_0_create_object',
          name: 'create_or_replace_object',
          arguments:
            '{"object_name":"Enemy","object_type":"Sprite","scene_name":"Level1"}',
        },
        {
          type: 'function_call',
          status: 'completed',
          call_id: 'sub_tool_1_add_scene_events',
          name: 'add_scene_events',
          arguments:
            '{"objects_list":"Enemy","events_description":"When Enemy falls off screen, delete it","extension_names_list":"Sprite","scene_name":"Level1"}',
        },
      ],
    },
    {
      type: 'function_call_output',
      call_id: 'sub_tool_0_create_object',
      output: '{"success":true}',
    },
    {
      type: 'function_call_output',
      call_id: 'sub_tool_1_add_scene_events',
      output: '{"success":true}',
    },
  ],
};

const fakeSubAgentAiRequestWithText = {
  id: 'fake-sub-agent-request-id',
  createdAt: '',
  updatedAt: '',
  userId: 'fake-user-id',
  mode: 'orchestrator',
  status: 'ready',
  gameProjectJson: null,
  error: null,
  output: [
    {
      type: 'message',
      status: 'completed',
      role: 'assistant',
      content: [
        {
          type: 'output_text',
          status: 'completed',
          text:
            "I'll start by creating the Enemy object and then add the necessary events to handle its behavior.",
          annotations: [],
        },
        {
          type: 'function_call',
          status: 'completed',
          call_id: 'sub_tool_0_create_object',
          name: 'create_or_replace_object',
          arguments:
            '{"object_name":"Enemy","object_type":"Sprite","scene_name":"Level1"}',
        },
      ],
    },
    {
      type: 'function_call_output',
      call_id: 'sub_tool_0_create_object',
      output: '{"success":true}',
    },
    {
      type: 'message',
      status: 'completed',
      role: 'assistant',
      content: [
        {
          type: 'output_text',
          status: 'completed',
          text:
            "The Enemy object has been created. Now I'll add the events to delete it when it falls off screen. This will use the Y position check to determine when the enemy has gone below the visible area.",
          annotations: [],
        },
        {
          type: 'function_call',
          status: 'completed',
          call_id: 'sub_tool_1_add_scene_events',
          name: 'add_scene_events',
          arguments:
            '{"objects_list":"Enemy","events_description":"When Enemy falls off screen, delete it","extension_names_list":"Sprite","scene_name":"Level1"}',
        },
      ],
    },
    {
      type: 'function_call_output',
      call_id: 'sub_tool_1_add_scene_events',
      output: '{"success":true}',
    },
  ],
};

const subAgentFunctionCallMessage = {
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: [
    {
      type: 'function_call',
      status: 'completed',
      call_id: 'tool_0_run_edit_agent',
      name: 'run_edit_agent',
      arguments:
        '{"short_title":"Adding an enemy that falls off screen","prompt":"Add an enemy to the game. The enemy should be a Sprite object placed in Level1, and should be deleted automatically when it falls off the bottom of the screen."}',
      subAgentAiRequestId: 'fake-sub-agent-request-id',
    },
  ],
};

const subAgentExplorerFunctionCallMessage = {
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: [
    {
      type: 'function_call',
      status: 'completed',
      call_id: 'tool_0_run_explorer_agent',
      name: 'run_explorer_agent',
      arguments:
        '{"short_title":"Listing all scenes and their objects","prompt":"List every scene of the game project together with the objects placed on each of them."}',
      subAgentAiRequestId: 'fake-sub-agent-request-id',
    },
  ],
};

const subAgentFunctionCallMessageWithLongTitle = {
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: [
    {
      type: 'function_call',
      status: 'completed',
      call_id: 'tool_0_run_edit_agent',
      name: 'run_edit_agent',
      arguments: JSON.stringify({
        short_title:
          'Adding a complete double jump mechanic to the player object including animations sounds particle effects and proper collision handling with platforms and enemies while also updating the existing event sheet to use the new mechanic everywhere',
        prompt: 'Implement a polished double jump for the Player object.',
      }),
      subAgentAiRequestId: 'fake-sub-agent-request-id',
    },
  ],
};

const subAgentFunctionCallMessageWithoutShortTitle = {
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: [
    {
      type: 'function_call',
      status: 'completed',
      call_id: 'tool_0_run_edit_agent',
      name: 'run_edit_agent',
      arguments:
        '{"prompt":"Add an enemy to the game. The enemy should be a Sprite object placed in Level1, and should be deleted automatically when it falls off the bottom of the screen."}',
      subAgentAiRequestId: 'fake-sub-agent-request-id',
    },
  ],
};

const WrappedChatComponentWithSubAgent = ({
  subAgentAiRequest,
  ...chatProps
}: any) => (
  <AiRequestContext.Provider
    // $FlowFixMe[incompatible-type]
    value={{
      ...initialAiRequestContextState,
      aiRequestStorage: {
        ...initialAiRequestContextState.aiRequestStorage,
        aiRequests: subAgentAiRequest
          ? { [subAgentAiRequest.id]: subAgentAiRequest }
          : {},
      },
    }}
  >
    <WrappedChatComponent {...chatProps} />
  </AiRequestContext.Provider>
);

export const subAgentFunctionCallWorking = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={{
      ...fakeSubAgentAiRequest,
      status: 'working',
      output: [
        {
          type: 'message',
          status: 'completed',
          role: 'assistant',
          content: [
            {
              type: 'function_call',
              status: 'completed',
              call_id: 'sub_tool_0_create_object',
              name: 'create_or_replace_object',
              arguments:
                '{"object_name":"Enemy","object_type":"Sprite","scene_name":"Level1"}',
            },
          ],
        },
        {
          type: 'function_call_output',
          call_id: 'sub_tool_0_create_object',
          output: '{"success":true}',
        },
      ],
    }}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'working',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [userRequestMessage, subAgentFunctionCallMessage],
      error: null,
    }}
  />
);

export const subAgentFunctionCallFinished = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={fakeSubAgentAiRequest}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        subAgentFunctionCallMessage,
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
      error: null,
    }}
  />
);

export const subAgentFunctionCallWithTextFinished = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={fakeSubAgentAiRequestWithText}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        subAgentFunctionCallMessage,
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
      error: null,
    }}
  />
);

export const subAgentFunctionCallWithTextWorking = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={{
      ...fakeSubAgentAiRequestWithText,
      status: 'working',
      output: [
        {
          type: 'message',
          status: 'completed',
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              status: 'completed',
              text:
                "I'll start by creating the Enemy object and then add the necessary events to handle its behavior.",
              annotations: [],
            },
            {
              type: 'function_call',
              status: 'completed',
              call_id: 'sub_tool_0_create_object',
              name: 'create_or_replace_object',
              arguments:
                '{"object_name":"Enemy","object_type":"Sprite","scene_name":"Level1"}',
            },
          ],
        },
        {
          type: 'function_call_output',
          call_id: 'sub_tool_0_create_object',
          output: '{"success":true}',
        },
      ],
    }}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'working',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [userRequestMessage, subAgentFunctionCallMessage],
      error: null,
    }}
  />
);

// Reproduces a parent AI request reopened from history whose sub-agent's
// AiRequest data has not (yet) been loaded into aiRequests storage.
// Before the load, only the prompt extracted from the function call arguments
// is shown. Once the sub-agent data is loaded (see useLoadSubAgentRequests),
// the nested function calls and output text appear.
export const subAgentFunctionCallFromHistoryNotYetLoaded = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={null}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        subAgentFunctionCallMessage,
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
      error: null,
    }}
  />
);

// Shows the explorer sub-agent variant, so the rendering of the
// short_title for run_explorer_agent can be checked.
export const subAgentExplorerFunctionCallFinished = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={fakeSubAgentAiRequest}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        subAgentExplorerFunctionCallMessage,
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_explorer_agent',
          output: '{"success":true}',
        },
      ],
      error: null,
    }}
  />
);

// Verifies that a short_title longer than 30 words is truncated with
// an ellipsis.
export const subAgentFunctionCallWithLongShortTitle = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={fakeSubAgentAiRequest}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        subAgentFunctionCallMessageWithLongTitle,
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
      error: null,
    }}
  />
);

// Verifies the fallback to "Editing the game." when short_title is
// missing (e.g. for old AI requests created before this parameter
// existed).
export const subAgentFunctionCallWithoutShortTitle = (): React.Node => (
  <WrappedChatComponentWithSubAgent
    subAgentAiRequest={fakeSubAgentAiRequest}
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-orchestrator-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        subAgentFunctionCallMessageWithoutShortTitle,
        {
          type: 'function_call_output',
          call_id: 'tool_0_run_edit_agent',
          output: '{"success":true}',
        },
      ],
      error: null,
    }}
  />
);
