// @flow
import * as React from 'react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../MainFrame/EditorContainers/AskAi/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/Agent',
  component: AiRequestChat,
  decorators: [paperDecorator],
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

export const ReadyAiRequestWithFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
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
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
      quota={{
        limitReached: false,
        current: 1,
        max: 2,
      }}
      increaseQuotaOffering="subscribe"
      aiRequestPriceInCredits={5}
      lastSendError={null}
      availableCredits={400}
      onSendFeedback={async () => {}}
      hasOpenedProject={false}
      editorFunctionCallResults={[]}
      onProcessFunctionCalls={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithWorkingFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
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
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
      quota={{
        limitReached: false,
        current: 1,
        max: 2,
      }}
      increaseQuotaOffering="subscribe"
      aiRequestPriceInCredits={5}
      lastSendError={null}
      availableCredits={400}
      onSendFeedback={async () => {}}
      hasOpenedProject={false}
      editorFunctionCallResults={[
        {
          status: 'working',
          call_id: fakeFunctionCallId,
        },
      ]}
      onProcessFunctionCalls={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithFinishedFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
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
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
      quota={{
        limitReached: false,
        current: 1,
        max: 2,
      }}
      increaseQuotaOffering="subscribe"
      aiRequestPriceInCredits={5}
      lastSendError={null}
      availableCredits={400}
      onSendFeedback={async () => {}}
      hasOpenedProject={false}
      editorFunctionCallResults={[
        {
          status: 'finished',
          call_id: fakeFunctionCallId,
          success: true,
          output: {
            instances: [{ objectName: 'Player', layer: '', x: 400, y: 300 }],
          },
        },
      ]}
      onProcessFunctionCalls={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithIgnoredFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
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
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
      quota={{
        limitReached: false,
        current: 1,
        max: 2,
      }}
      increaseQuotaOffering="subscribe"
      aiRequestPriceInCredits={5}
      lastSendError={null}
      availableCredits={400}
      onSendFeedback={async () => {}}
      hasOpenedProject={false}
      editorFunctionCallResults={[
        {
          status: 'ignored',
          call_id: fakeFunctionCallId,
        },
      ]}
      onProcessFunctionCalls={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithFailedFunctionCall = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
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
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
      quota={{
        limitReached: false,
        current: 1,
        max: 2,
      }}
      increaseQuotaOffering="subscribe"
      aiRequestPriceInCredits={5}
      lastSendError={null}
      availableCredits={400}
      onSendFeedback={async () => {}}
      hasOpenedProject={false}
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
      onProcessFunctionCalls={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithFunctionCallAndOutput = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
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
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
      quota={{
        limitReached: false,
        current: 1,
        max: 2,
      }}
      increaseQuotaOffering="subscribe"
      aiRequestPriceInCredits={5}
      lastSendError={null}
      availableCredits={400}
      onSendFeedback={async () => {}}
      hasOpenedProject={false}
      editorFunctionCallResults={[]}
      onProcessFunctionCalls={async () => {}}
    />
  </FixedHeightFlexContainer>
);
