// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import alertDecorator from '../../AlertDecorator';
import { AskAiHistory } from '../../../AiGeneration/AskAiHistory';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';
import {
  AiRequestContext,
  initialAiRequestContextState,
} from '../../../AiGeneration/AiRequestContext';
import {
  getAiRequestSummary,
  type AiRequest,
  type AiRequestSummary,
  type AiRequestSummariesFilter,
  type GenerationStatus,
} from '../../../Utils/GDevelopServices/Generation';
import Paper from '../../../UI/Paper';
import RaisedButton from '../../../UI/RaisedButton';
import Text from '../../../UI/Text';

const createFakeAiRequestSummary = ({
  id,
  text,
  title = null,
  archivedAt = null,
  status = 'ready',
  createdAt = '2024-01-01T12:00:00Z',
}: {|
  id: string,
  text: string | null,
  title?: string | null,
  archivedAt?: string | null,
  status?: GenerationStatus,
  createdAt?: string,
|}): AiRequestSummary => {
  const aiRequest: AiRequest = {
    id,
    title,
    archivedAt,
    status,
    createdAt,
    updatedAt: createdAt,
    userId: 'fake-user-id',
    error: null,
    output:
      text === null
        ? []
        : [
            {
              type: 'message',
              status: 'completed',
              role: 'user',
              content: [{ type: 'user_request', status: 'completed', text }],
            },
          ],
    lastUserMessagePriceInCredits: 5,
    totalPriceInCredits: 5,
  };
  return getAiRequestSummary(aiRequest);
};

const toAiRequestSummariesById = (
  aiRequestSummaries: Array<AiRequestSummary>
): { [string]: AiRequestSummary } => {
  const aiRequestSummariesById: { [string]: AiRequestSummary } = {};
  aiRequestSummaries.forEach(aiRequestSummary => {
    aiRequestSummariesById[aiRequestSummary.id] = aiRequestSummary;
  });
  return aiRequestSummariesById;
};

const fakeAiRequestSummaries = toAiRequestSummariesById([
  createFakeAiRequestSummary({
    id: 'request-1',
    text: 'Add a leaderboard with the player best score',
    status: 'working',
    createdAt: '2024-03-15T10:30:00Z',
  }),
  createFakeAiRequestSummary({
    id: 'request-2',
    text: 'Create a GTA-style game with cars, pedestrians and a city',
    // A chat renamed by the user.
    title: 'City game',
    status: 'ready',
    createdAt: '2024-03-14T16:20:00Z',
  }),
  createFakeAiRequestSummary({
    id: 'request-3',
    text: 'Make the enemies shoot at the player',
    status: 'error',
    createdAt: '2024-03-13T09:15:00Z',
  }),
  createFakeAiRequestSummary({
    id: 'request-4',
    text: 'How to make a platformer?',
    status: 'suspended',
    createdAt: '2024-03-12T09:15:00Z',
  }),
  createFakeAiRequestSummary({
    id: 'request-5',
    text: null,
    status: 'ready',
    createdAt: '2024-03-11T09:15:00Z',
  }),
  createFakeAiRequestSummary({
    id: 'archived-1',
    text: 'An old idea about a racing game',
    archivedAt: '2024-03-01T09:15:00Z',
    createdAt: '2024-02-29T09:15:00Z',
  }),
  createFakeAiRequestSummary({
    id: 'archived-2',
    text: 'Prototype of a match-3 puzzle',
    title: 'Match-3 prototype',
    archivedAt: '2024-03-01T09:15:00Z',
    createdAt: '2024-02-28T20:15:00Z',
  }),
  ...Array.from({ length: 12 }, (_, index) =>
    createFakeAiRequestSummary({
      id: `request-old-${index}`,
      text: `Older chat number ${index + 1} about a game mechanic`,
      createdAt: `2024-02-${String(28 - index).padStart(2, '0')}T09:15:00Z`,
    })
  ),
]);

export default {
  title: 'AskAi/AskAiHistory',
  component: AskAiHistory,
  decorators: [alertDecorator],
};

const AskAiHistoryStoryTemplate = ({
  layout,
  aiRequestSummaries = fakeAiRequestSummaries,
  isLoading = false,
  error = null,
  canLoadMore = false,
  selectedAiRequestId = 'request-2',
  isWaitingForUser = false,
  filter = 'active',
  width = 1000,
  height = 600,
  initiallyOpen = true,
}: {|
  layout: 'side-panel' | 'left-drawer' | 'right-drawer',
  aiRequestSummaries?: { [string]: AiRequestSummary },
  isLoading?: boolean,
  error?: ?Error,
  canLoadMore?: boolean,
  selectedAiRequestId?: string | null,
  isWaitingForUser?: boolean,
  filter?: AiRequestSummariesFilter,
  width?: number,
  height?: number,
  initiallyOpen?: boolean,
|}) => {
  const [open, setOpen] = React.useState<boolean>(initiallyOpen);
  return (
    <FixedHeightFlexContainer height={height}>
      <FixedWidthFlexContainer width={width}>
        <AiRequestContext.Provider
          value={{
            ...initialAiRequestContextState,
            aiRequestStorage: {
              ...initialAiRequestContextState.aiRequestStorage,
              aiRequestSummaries,
              isLoading,
              error,
              canLoadMore,
              fetchAiRequestSummaries: async () =>
                action('fetchAiRequestSummaries')(),
              onLoadMoreAiRequestSummaries: async () =>
                action('onLoadMoreAiRequestSummaries')(),
              renameAiRequest: async (aiRequestId, title) =>
                action('renameAiRequest')(aiRequestId, title),
              setAiRequestArchived: async (aiRequestId, archived) =>
                action('setAiRequestArchived')(aiRequestId, archived),
              deleteAiRequest: async aiRequestId =>
                action('deleteAiRequest')(aiRequestId),
              aiRequestSummariesFilter: filter,
              setAiRequestSummariesFilter: action(
                'setAiRequestSummariesFilter'
              ),
            },
            selectedAiRequestId,
            pendingEditApproval: isWaitingForUser
              ? {
                  aiRequestId: selectedAiRequestId || '',
                  callIds: ['call-1'],
                  label: 'Edit agent',
                }
              : null,
          }}
        >
          <AskAiHistory
            layout={layout}
            open={open}
            onClose={() => setOpen(false)}
            onOpenAiRequest={action('onOpenAiRequest')}
            onStartNewChat={action('onStartNewChat')}
            canStartNewChat={!!selectedAiRequestId}
            selectedAiRequestId={selectedAiRequestId}
          />
          <Paper
            background="dark"
            square
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text color="secondary">The chat is displayed here.</Text>
            <RaisedButton
              label={open ? 'Hide the chats' : 'Show the chats'}
              onClick={() => setOpen(!open)}
            />
          </Paper>
        </AiRequestContext.Provider>
      </FixedWidthFlexContainer>
    </FixedHeightFlexContainer>
  );
};

export const SidePanel = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="side-panel" />
);

export const SidePanelArchivedChats = (): React.Node => (
  <AskAiHistoryStoryTemplate
    layout="side-panel"
    filter="archived"
    selectedAiRequestId="archived-2"
  />
);

export const SidePanelAllChats = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="side-panel" filter="all" />
);

export const SidePanelNoArchivedChat = (): React.Node => (
  <AskAiHistoryStoryTemplate
    layout="side-panel"
    filter="archived"
    aiRequestSummaries={{}}
    selectedAiRequestId={null}
  />
);

export const SidePanelInitiallyClosed = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="side-panel" initiallyOpen={false} />
);

export const SidePanelWaitingForUser = (): React.Node => (
  <AskAiHistoryStoryTemplate
    layout="side-panel"
    selectedAiRequestId="request-1"
    isWaitingForUser
  />
);

export const SidePanelNoSelectedChat = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="side-panel" selectedAiRequestId={null} />
);

export const SidePanelCanLoadMore = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="side-panel" canLoadMore />
);

export const SidePanelLoadingMore = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="side-panel" canLoadMore isLoading />
);

export const SidePanelLoading = (): React.Node => (
  <AskAiHistoryStoryTemplate
    layout="side-panel"
    aiRequestSummaries={{}}
    isLoading
    selectedAiRequestId={null}
  />
);

export const SidePanelErrored = (): React.Node => (
  <AskAiHistoryStoryTemplate
    layout="side-panel"
    aiRequestSummaries={{}}
    error={new Error('Failed to fetch AI requests')}
    selectedAiRequestId={null}
  />
);

export const SidePanelEmpty = (): React.Node => (
  <AskAiHistoryStoryTemplate
    layout="side-panel"
    aiRequestSummaries={{}}
    selectedAiRequestId={null}
  />
);

export const LeftDrawerOnMobile = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="left-drawer" width={360} height={640} />
);

export const LeftDrawerOnMediumScreen = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="left-drawer" width={900} height={600} />
);

export const RightDrawerInRightPane = (): React.Node => (
  <AskAiHistoryStoryTemplate layout="right-drawer" width={450} height={600} />
);

export const RightDrawerEmpty = (): React.Node => (
  <AskAiHistoryStoryTemplate
    layout="right-drawer"
    aiRequestSummaries={{}}
    selectedAiRequestId={null}
    width={450}
    height={600}
  />
);
