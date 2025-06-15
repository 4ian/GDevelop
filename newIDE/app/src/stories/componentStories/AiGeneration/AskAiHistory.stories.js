// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { AskAiHistoryContent } from '../../../AiGeneration/AskAiHistory';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

// Re-use fake AI request data from AiRequestChat.stories.js
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

const fakeOutputWithAiResponses = [
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
          "Creating a leaderboard for player best scores in GDevelop is straightforward. Here's how you can do it:\n\n1. First, you need to use the Leaderboard extension to handle saving and retrieving scores.",
        annotations: [],
      },
    ],
  },
];

const fakeOutputWithDifferentUserRequest = [
  {
    type: 'message',
    status: 'completed',
    role: 'user',
    content: [
      {
        type: 'user_request',
        status: 'completed',
        text: 'How to create a GTA-style game?',
      },
    ],
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
          "Creating a GTA-style game is complex but doable in GDevelop. You'll need to implement several core systems...",
        annotations: [],
      },
    ],
  },
];

// Factory function to create AI request objects with different properties
const createFakeAiRequest = ({
  id,
  status = 'ready',
  createdAt = '2024-01-01T12:00:00Z',
  output = fakeOutputWithUserRequestOnly,
  error = null,
}) => ({
  id,
  status,
  createdAt,
  updatedAt: createdAt,
  userId: 'fake-user-id',
  gameProjectJson: 'FAKE DATA',
  output,
  error,
  lastUserMessagePriceInCredits: 5,
  totalPriceInCredits: 5,
});

export default {
  title: 'AskAi/AskAiHistory',
  component: AskAiHistoryContent,
  decorators: [paperDecorator],
};

export const Loading = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={null}
      isLoading={true}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const Errored = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={null}
      isLoading={false}
      error={new Error('Failed to fetch AI requests')}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const Empty = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={[]}
      isLoading={false}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const SingleAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={[
        createFakeAiRequest({
          id: 'request-1',
          createdAt: '2024-03-15T10:30:00Z',
          output: fakeOutputWithAiResponses,
        }),
      ]}
      isLoading={false}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const MultipleAiRequests = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={[
        createFakeAiRequest({
          id: 'request-1',
          createdAt: '2024-03-15T14:30:00Z',
          output: fakeOutputWithAiResponses,
        }),
        createFakeAiRequest({
          id: 'request-2',
          createdAt: '2024-03-14T09:45:00Z',
          output: fakeOutputWithDifferentUserRequest,
        }),
        createFakeAiRequest({
          id: 'request-3',
          createdAt: '2024-03-10T16:20:00Z',
        }),
      ]}
      isLoading={false}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const WithSelectedRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={[
        createFakeAiRequest({
          id: 'request-1',
          createdAt: '2024-03-15T14:30:00Z',
          output: fakeOutputWithAiResponses,
        }),
        createFakeAiRequest({
          id: 'request-2',
          createdAt: '2024-03-14T09:45:00Z',
          output: fakeOutputWithDifferentUserRequest,
        }),
      ]}
      isLoading={false}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId="request-2"
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const WithWorkingRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={[
        createFakeAiRequest({
          id: 'request-1',
          status: 'working',
          createdAt: '2024-03-15T14:30:00Z',
        }),
        createFakeAiRequest({
          id: 'request-2',
          createdAt: '2024-03-14T09:45:00Z',
          output: fakeOutputWithDifferentUserRequest,
        }),
      ]}
      isLoading={false}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const WithErroredRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={[
        createFakeAiRequest({
          id: 'request-1',
          status: 'error',
          createdAt: '2024-03-15T14:30:00Z',
          error: { code: 'internal-error', message: 'Some error happened' },
        }),
        createFakeAiRequest({
          id: 'request-2',
          createdAt: '2024-03-14T09:45:00Z',
          output: fakeOutputWithDifferentUserRequest,
        }),
      ]}
      isLoading={false}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);

export const RefreshingRequests = () => (
  <FixedHeightFlexContainer height={500}>
    <AskAiHistoryContent
      aiRequests={[
        createFakeAiRequest({
          id: 'request-1',
          createdAt: '2024-03-15T14:30:00Z',
        }),
        createFakeAiRequest({
          id: 'request-2',
          createdAt: '2024-03-14T09:45:00Z',
        }),
      ]}
      isLoading={true}
      error={null}
      onSelectAiRequest={() => {}}
      selectedAiRequestId={null}
      onFetchAiRequests={async () => {}}
    />
  </FixedHeightFlexContainer>
);
