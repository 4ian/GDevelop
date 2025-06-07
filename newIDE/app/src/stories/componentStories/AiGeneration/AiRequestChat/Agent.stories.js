// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import {
  agentAiRequest,
  agentAiRequestWithFailedAndIgnoredFunctionCallOutputs,
  agentAiRequestWithFunctionCallToDo,
} from '../../../../fixtures/GDevelopServicesTestData/FakeAiRequests';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/Agent',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

const commonProps = {
  editorCallbacks: {
    onOpenLayout: () => {},
    onOpenEvents: () => {},
  },
  project: null,
  quota: {
    limitReached: false,
    current: 1,
    max: 2,
  },
  onStartNewAiRequest: () => {},
  onSendMessage: async () => {},
  isSending: false,
  price: {
    priceInCredits: 5,
    variablePrice: {
      agent: {
        maximumPriceInCredits: 20,
      },
    },
  },
  lastSendError: null,
  availableCredits: 400,
  onSendFeedback: async () => {},
  hasOpenedProject: false,
  editorFunctionCallResults: [],
  increaseQuotaOffering: 'subscribe',
  onProcessFunctionCalls: async () => {},
  setAutoProcessFunctionCalls: () => {},
  isAutoProcessingFunctionCalls: false,
};

const fakeOutputWithUserRequestOnly = [
  {
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
  },
];

const fakeFunctionCallId = 'fake_function_call_1';

// Function call example outputs
const fakeOutputWithFunctionCall = [
  ...fakeOutputWithUserRequestOnly,
  {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    content: [
      {
        type: 'output_text',
        status: 'completed',
        text:
          'I can help you add a leaderboard. Let me check the objects in your scene first.',
        annotations: [],
      },
      {
        type: 'function_call',
        status: 'completed',
        call_id: fakeFunctionCallId,
        name: 'describe_instances',
        arguments: '{"scene_name": "Game"}',
      },
    ],
  },
];

const fakeOutputWithFunctionCallAndOutput = [
  ...fakeOutputWithUserRequestOnly,
  {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    content: [
      {
        type: 'output_text',
        status: 'completed',
        text:
          'I can help you add a leaderboard. Let me check the objects in your scene first.',
        annotations: [],
      },
      {
        type: 'function_call',
        status: 'completed',
        call_id: fakeFunctionCallId,
        name: 'describe_instances',
        arguments: '{"scene_name": "Game"}',
      },
    ],
  },
  {
    type: 'function_call_output',
    call_id: fakeFunctionCallId,
    output:
      '{"success":true,"instances":[{"objectName":"Player","layer":"","x":400,"y":300}]}',
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
          'I see you have a Player object in your scene. Now I can help add a leaderboard system.',
        annotations: [],
      },
    ],
  },
];

const fakeOutputWithFunctionCallWithSameCallId = [
  ...fakeOutputWithFunctionCallAndOutput,
  {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    content: [
      {
        type: 'output_text',
        status: 'completed',
        text:
          'This is another message and now a function call with the same call_id (as done by some LLM APIs):',
        annotations: [],
      },
      {
        type: 'function_call',
        status: 'completed',
        call_id: fakeFunctionCallId,
        name: 'describe_instances',
        arguments: '{"scene_name": "Game"}',
      },
    ],
  },
];

export const ReadyAiRequestWithFunctionCallWithoutAutoProcess = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCall,
            error: null,
          }}
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithWorkingFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCall,
            error: null,
          }}
          {...commonProps}
          editorFunctionCallResults={[
            {
              status: 'working',
              call_id: fakeFunctionCallId,
            },
          ]}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);
export const ReadyAiRequestWithFinishedFunctionCallAndLaunchingRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCall,
            error: null,
          }}
          {...commonProps}
          isSending={true}
          editorFunctionCallResults={[
            {
              status: 'finished',
              call_id: fakeFunctionCallId,
              success: true,
              output: {
                instances: [
                  { objectName: 'Player', layer: '', x: 400, y: 300 },
                ],
              },
            },
          ]}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const WorkingAiRequestWithFinishedFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'working',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCall,
            error: null,
          }}
          {...commonProps}
          editorFunctionCallResults={[
            {
              status: 'finished',
              call_id: fakeFunctionCallId,
              success: true,
              output: {
                instances: [
                  { objectName: 'Player', layer: '', x: 400, y: 300 },
                ],
              },
            },
          ]}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithIgnoredFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCall,
            error: null,
          }}
          {...commonProps}
          editorFunctionCallResults={[
            {
              status: 'ignored',
              call_id: fakeFunctionCallId,
            },
          ]}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithFailedFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCall,
            error: null,
          }}
          {...commonProps}
          editorFunctionCallResults={[
            {
              status: 'finished',
              call_id: fakeFunctionCallId,
              success: false,
              output: {
                message: 'Something bad happened.',
              },
            },
          ]}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithFunctionCallAndOutput = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCallAndOutput,
            error: null,
          }}
          {...commonProps}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithFunctionCallWithSameCallId = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithFunctionCallWithSameCallId,
            error: null,
          }}
          {...commonProps}
          editorFunctionCallResults={[
            {
              status: 'finished',
              call_id: fakeFunctionCallId,
              success: false,
              output: {
                message: 'Something bad happened.',
              },
            },
          ]}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithFailedAndIgnoredFunctionCallOutputs = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={agentAiRequestWithFailedAndIgnoredFunctionCallOutputs}
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const LongReadyAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={agentAiRequest}
          {...commonProps}
          isAutoProcessingFunctionCalls={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const LongReadyAiRequestWithFunctionCallToDo = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={agentAiRequestWithFunctionCallToDo}
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);
