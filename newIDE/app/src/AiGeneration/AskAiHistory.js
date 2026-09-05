// @flow
import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import ButtonBase from '@material-ui/core/ButtonBase';
import { Line, Column } from '../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { type AiRequestSummary } from '../Utils/GDevelopServices/Generation';
import Paper from '../UI/Paper';
import ScrollView from '../UI/ScrollView';
import FlatButton from '../UI/FlatButton';
import EmptyMessage from '../UI/EmptyMessage';
import CircularProgress from '../UI/CircularProgress';
import formatDate from 'date-fns/format';
import DrawerTopBar from '../UI/DrawerTopBar';
import PlaceholderError from '../UI/PlaceholderError';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { AiRequestContext } from './AiRequestContext';
import { getUserRequestText } from './AiRequestUtils';

type Props = {|
  open: boolean,
  onClose: () => void,
  onOpenAiRequest: (aiRequestId: string) => void,
  selectedAiRequestId: string | null,
|};

const styles = {
  drawer: {
    width: 320,
    height: '100%',
  },
  requestItem: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
    borderRadius: 4,
    alignItems: 'stretch',
  },
  requestItemContent: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
  },
  paperItem: {
    marginBottom: 4,
    borderRadius: 4,
  },
  selectedRequestItem: {
    // Give a light shade to a selected item.
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
};

type AskAiHistoryContentProps = {|
  onOpenAiRequest: (aiRequestId: string) => void,
  selectedAiRequestId: string | null,
|};

export const AskAiHistoryContent = ({
  onOpenAiRequest,
  selectedAiRequestId,
}: AskAiHistoryContentProps): React.Node => {
  const {
    aiRequestStorage: {
      aiRequestSummaries,
      fetchAiRequestSummaries,
      onLoadMoreAiRequestSummaries,
      canLoadMore,
      isLoading,
      error,
    },
  } = React.useContext(AiRequestContext);
  const aiRequestSummariesArray: AiRequestSummary[] = Object.keys(
    aiRequestSummaries
  )
    .map(aiRequestId => aiRequestSummaries[aiRequestId])
    .sort((a: AiRequestSummary, b: AiRequestSummary) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  if (!aiRequestSummariesArray.length && isLoading) {
    return (
      <Column
        noMargin
        useFullHeight
        expand
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Column>
    );
  }

  if (error) {
    return (
      <PlaceholderError onRetry={fetchAiRequestSummaries}>
        <Trans>An error occurred while loading your AI requests.</Trans>
      </PlaceholderError>
    );
  }

  if (aiRequestSummariesArray.length === 0) {
    return (
      <EmptyMessage>
        <Trans>
          You don't have any previous chat. Ask the AI your first question!
        </Trans>
      </EmptyMessage>
    );
  }

  return (
    <ScrollView>
      <ColumnStackLayout expand>
        {aiRequestSummariesArray.map(aiRequestSummary => {
          const isSelected = selectedAiRequestId === aiRequestSummary.id;
          const userRequestText = aiRequestSummary.firstUserMessage
            ? getUserRequestText(aiRequestSummary.firstUserMessage)
            : '';
          const requestDate = new Date(aiRequestSummary.createdAt);
          const formattedDate = formatDate(requestDate, 'MMM d, yyyy h:mm a');

          return (
            <Paper
              key={aiRequestSummary.id}
              background={isSelected ? 'dark' : 'medium'}
              style={{
                ...styles.paperItem,
                ...(isSelected ? styles.selectedRequestItem : {}),
              }}
            >
              <ButtonBase
                style={styles.requestItem}
                onClick={() => onOpenAiRequest(aiRequestSummary.id)}
                focusRipple
              >
                <div style={styles.requestItemContent}>
                  <Line noMargin justifyContent="space-between">
                    <Text size="body-small" color="secondary">
                      {formattedDate}
                    </Text>
                    <Text
                      size="body-small"
                      color={
                        aiRequestSummary.status === 'error'
                          ? 'error'
                          : 'secondary'
                      }
                    >
                      {aiRequestSummary.status === 'working' ? (
                        <Trans>Working...</Trans>
                      ) : aiRequestSummary.status === 'error' ? (
                        <Trans>Error</Trans>
                      ) : null}
                    </Text>
                  </Line>
                  <Text noMargin style={textEllipsisStyle} align="left">
                    {userRequestText}
                  </Text>
                </div>
              </ButtonBase>
            </Paper>
          );
        })}
        <LineStackLayout justifyContent="center">
          <FlatButton
            primary
            label={<Trans>Refresh</Trans>}
            onClick={fetchAiRequestSummaries}
            disabled={isLoading}
          />
          <FlatButton
            primary
            label={<Trans>Load more</Trans>}
            onClick={onLoadMoreAiRequestSummaries}
            disabled={isLoading || !canLoadMore}
          />
        </LineStackLayout>
      </ColumnStackLayout>
    </ScrollView>
  );
};

export const AskAiHistory = ({
  open,
  onClose,
  onOpenAiRequest,
  selectedAiRequestId,
}: Props): React.Node => {
  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={onClose}
      PaperProps={{
        style: styles.drawer,
        className: 'safe-area-aware-left-container',
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <ColumnStackLayout expand noMargin>
        <DrawerTopBar
          title={<Trans>AI Chat History</Trans>}
          drawerAnchor="right"
          id="ai-chat-history-drawer-top-bar"
          onClose={onClose}
        />
        <AskAiHistoryContent
          onOpenAiRequest={onOpenAiRequest}
          selectedAiRequestId={selectedAiRequestId}
        />
      </ColumnStackLayout>
    </Drawer>
  );
};
