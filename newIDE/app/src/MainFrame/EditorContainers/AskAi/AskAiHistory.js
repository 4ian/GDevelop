// @flow
import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import ButtonBase from '@material-ui/core/ButtonBase';
import { Line, Column } from '../../../UI/Grid';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import { Trans } from '@lingui/macro';
import {
  getAiRequests,
  type AiRequest,
} from '../../../Utils/GDevelopServices/Generation';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import Paper from '../../../UI/Paper';
import ScrollView from '../../../UI/ScrollView';
import FlatButton from '../../../UI/FlatButton';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import EmptyMessage from '../../../UI/EmptyMessage';
import CircularProgress from '../../../UI/CircularProgress';
import formatDate from 'date-fns/format';
import DrawerTopBar from '../../../UI/DrawerTopBar';
import PlaceholderError from '../../../UI/PlaceholderError';
import { textEllipsisStyle } from '../../../UI/TextEllipsis';

type Props = {|
  open: boolean,
  onClose: () => void,
  onSelectAiRequest: (aiRequest: AiRequest) => void,
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

const getFirstUserRequestText = (aiRequest: AiRequest): string => {
  if (!aiRequest.output || aiRequest.output.length === 0) return '';

  // Find the first user message
  const userMessage = aiRequest.output.find(message => message.role === 'user');
  if (!userMessage) return '';

  // Extract text from user message content
  return userMessage.content
    .map(content => (content.type === 'user_request' ? content.text : null))
    .filter(Boolean)
    .join(' ');
};

type AskAiHistoryContentProps = {|
  aiRequests: Array<AiRequest> | null,
  isLoading: boolean,
  error: ?Error,
  onSelectAiRequest: (aiRequest: AiRequest) => void,
  selectedAiRequestId: string | null,
  onFetchAiRequests: () => Promise<void>,
|};

export const AskAiHistoryContent = ({
  aiRequests,
  isLoading,
  error,
  onSelectAiRequest,
  selectedAiRequestId,
  onFetchAiRequests,
}: AskAiHistoryContentProps) => {
  if (!aiRequests && isLoading) {
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
      <PlaceholderError onRetry={onFetchAiRequests}>
        <Trans>An error occurred while loading your AI requests.</Trans>
      </PlaceholderError>
    );
  }

  if (!aiRequests || aiRequests.length === 0) {
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
        {aiRequests.map(aiRequest => {
          const isSelected = selectedAiRequestId === aiRequest.id;
          const userRequestText = getFirstUserRequestText(aiRequest);
          const requestDate = new Date(aiRequest.createdAt);
          const formattedDate = formatDate(requestDate, 'MMM d, yyyy h:mm a');

          return (
            <Paper
              key={aiRequest.id}
              background={isSelected ? 'dark' : 'medium'}
              style={{
                ...styles.paperItem,
                ...(isSelected ? styles.selectedRequestItem : {}),
              }}
            >
              <ButtonBase
                style={styles.requestItem}
                onClick={() => onSelectAiRequest(aiRequest)}
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
                        aiRequest.status === 'error' ? 'error' : 'secondary'
                      }
                    >
                      {aiRequest.status === 'working' ? (
                        <Trans>Working...</Trans>
                      ) : aiRequest.status === 'error' ? (
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
        <Line justifyContent="center">
          <FlatButton
            primary
            label={<Trans>Refresh</Trans>}
            onClick={onFetchAiRequests}
            disabled={isLoading}
          />
        </Line>
      </ColumnStackLayout>
    </ScrollView>
  );
};

export const AskAiHistory = ({
  open,
  onClose,
  onSelectAiRequest,
  selectedAiRequestId,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const [aiRequests, setAiRequests] = React.useState<Array<AiRequest> | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  const fetchAiRequests = React.useCallback(
    async () => {
      if (!profile) return;

      setIsLoading(true);
      setError(null);

      try {
        const requests = await getAiRequests(getAuthorizationHeader, {
          userId: profile.id,
        });
        setAiRequests(requests);
      } catch (err) {
        setError(err);
        console.error('Error fetching AI requests:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [profile, getAuthorizationHeader]
  );

  React.useEffect(
    () => {
      if (open) {
        fetchAiRequests();
      }
    },
    [open, fetchAiRequests]
  );

  const handleSelectAiRequest = (aiRequest: AiRequest) => {
    onSelectAiRequest(aiRequest);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Drawer
      open={open}
      anchor="left"
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
          id="ai-chat-history-drawer-top-bar"
          onClose={onClose}
        />
        <AskAiHistoryContent
          aiRequests={aiRequests}
          isLoading={isLoading}
          error={error}
          onSelectAiRequest={handleSelectAiRequest}
          selectedAiRequestId={selectedAiRequestId}
          onFetchAiRequests={fetchAiRequests}
        />
      </ColumnStackLayout>
    </Drawer>
  );
};
