// @flow
import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import classNames from 'classnames';
import { Trans, t } from '@lingui/macro';
import { type AiRequestSummary } from '../Utils/GDevelopServices/Generation';
import ScrollView from '../UI/ScrollView';
import DrawerTopBar from '../UI/DrawerTopBar';
import PlaceholderError from '../UI/PlaceholderError';
import TextButton from '../UI/TextButton';
import IconButton from '../UI/IconButton';
import CollapsibleSidePanel from '../UI/CollapsibleSidePanel';
import Add from '../UI/CustomSvgIcons/Add';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import { AiRequestContext } from './AiRequestContext';
import { getUserRequestText } from './AiRequestUtils';
import classes from './AskAiHistory.module.css';

/**
 * How the history is displayed:
 * - `side-panel`: a list on the side of the chat, when there is room for it;
 * - `left-drawer`: a drawer coming from the left, on small screens;
 * - `right-drawer`: a drawer coming from the right, when the chat is in the
 *   right pane of the editor.
 */
export type AskAiHistoryLayout = 'side-panel' | 'left-drawer' | 'right-drawer';

export const askAiHistoryWidth = 280;

type Props = {|
  layout: AskAiHistoryLayout,
  open: boolean,
  onClose: () => void,
  onOpenAiRequest: (aiRequestId: string) => void,
  onStartNewChat: () => void,
  canStartNewChat: boolean,
  selectedAiRequestId: string | null,
|};

type ChatStatus =
  | 'working'
  | 'waiting-for-user'
  | 'error'
  | 'suspended'
  | 'ready';

const getChatStatus = (
  aiRequestSummary: AiRequestSummary,
  isWaitingForUser: boolean
): ChatStatus => {
  if (isWaitingForUser) return 'waiting-for-user';
  if (aiRequestSummary.status === 'working') return 'working';
  if (aiRequestSummary.status === 'error') return 'error';
  if (aiRequestSummary.status === 'suspended') return 'suspended';
  return 'ready';
};

const statusDotClassNames = {
  working: classes.statusDotWorking,
  'waiting-for-user': classes.statusDotWaitingForUser,
  error: classes.statusDotError,
  suspended: classes.statusDotSuspended,
};

const statusLabels = {
  working: t`Working`,
  'waiting-for-user': t`Waiting for you`,
  error: t`Stopped on an error`,
  suspended: t`Paused`,
};

const ChatStatusDot = ({ status }: {| status: ChatStatus |}): React.Node => {
  if (status === 'ready') return null;
  return (
    <span
      className={classNames(classes.statusDot, statusDotClassNames[status])}
      role="img"
      aria-label={statusLabels[status].id}
      title={statusLabels[status].id}
    />
  );
};

const ChatItem = ({
  aiRequestSummary,
  isSelected,
  isWaitingForUser,
  onOpen,
}: {|
  aiRequestSummary: AiRequestSummary,
  isSelected: boolean,
  isWaitingForUser: boolean,
  onOpen: () => void,
|}): React.Node => {
  const title = aiRequestSummary.firstUserMessage
    ? getUserRequestText(aiRequestSummary.firstUserMessage)
    : '';
  return (
    <button
      className={classNames(classes.item, {
        [classes.itemSelected]: isSelected,
      })}
      onClick={onOpen}
      title={title}
      aria-current={isSelected ? 'true' : undefined}
    >
      <span
        className={classNames(classes.itemText, {
          [classes.itemTextUntitled]: !title,
        })}
      >
        {title || <Trans>Untitled chat</Trans>}
      </span>
      <ChatStatusDot
        status={getChatStatus(aiRequestSummary, isWaitingForUser)}
      />
    </button>
  );
};

const LoadingSkeleton = (): React.Node => (
  <div className={classes.list}>
    {[80, 55, 70, 40, 65].map((widthPercent, index) => (
      <div
        key={index}
        className={classes.skeletonRow}
        style={{ width: `${widthPercent}%` }}
      />
    ))}
  </div>
);

type AskAiHistoryContentProps = {|
  onOpenAiRequest: (aiRequestId: string) => void,
  onStartNewChat: () => void,
  canStartNewChat: boolean,
  selectedAiRequestId: string | null,
  className?: string,
|};

export const AskAiHistoryContent = ({
  onOpenAiRequest,
  onStartNewChat,
  canStartNewChat,
  selectedAiRequestId,
  className,
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
    pendingEditApproval,
  } = React.useContext(AiRequestContext);
  const sortedAiRequestSummaries = React.useMemo(
    () =>
      Object.keys(aiRequestSummaries)
        .map(aiRequestId => aiRequestSummaries[aiRequestId])
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [aiRequestSummaries]
  );
  const hasChats = sortedAiRequestSummaries.length > 0;

  return (
    <div className={classNames(classes.panel, className)}>
      <div className={classes.header}>
        <button
          className={classes.newChatButton}
          onClick={onStartNewChat}
          disabled={!canStartNewChat}
          id="ask-ai-new-chat-button"
        >
          <span className={classes.newChatButtonIcon}>
            <Add fontSize="inherit" />
          </span>
          <Trans>New chat</Trans>
        </button>
      </div>
      <div className={classes.sectionTitle}>
        <Trans>Recents</Trans>
        <IconButton
          size="small"
          color="inherit"
          tooltip={t`Refresh the chats`}
          onClick={fetchAiRequestSummaries}
          disabled={isLoading}
        >
          <Refresh fontSize="small" />
        </IconButton>
      </div>
      {error && !hasChats ? (
        <PlaceholderError onRetry={fetchAiRequestSummaries}>
          <Trans>Your chats could not be loaded.</Trans>
        </PlaceholderError>
      ) : isLoading && !hasChats ? (
        <LoadingSkeleton />
      ) : !hasChats ? (
        <div className={classes.emptyMessage}>
          <Trans>
            Your chats with the AI will be listed here. Start by asking
            anything!
          </Trans>
        </div>
      ) : (
        <ScrollView>
          <div className={classes.list}>
            {sortedAiRequestSummaries.map(aiRequestSummary => {
              const isSelected = selectedAiRequestId === aiRequestSummary.id;
              return (
                <ChatItem
                  key={aiRequestSummary.id}
                  aiRequestSummary={aiRequestSummary}
                  isSelected={isSelected}
                  isWaitingForUser={isSelected && !!pendingEditApproval}
                  onOpen={() => onOpenAiRequest(aiRequestSummary.id)}
                />
              );
            })}
          </div>
          {canLoadMore && (
            <div className={classes.footer}>
              <TextButton
                label={
                  isLoading ? (
                    <Trans>Loading...</Trans>
                  ) : (
                    <Trans>Load more</Trans>
                  )
                }
                onClick={onLoadMoreAiRequestSummaries}
                disabled={isLoading}
              />
            </div>
          )}
        </ScrollView>
      )}
    </div>
  );
};

export const AskAiHistory = ({
  layout,
  open,
  onClose,
  onOpenAiRequest,
  onStartNewChat,
  canStartNewChat,
  selectedAiRequestId,
}: Props): React.Node => {
  const isDrawer = layout !== 'side-panel';
  // In a drawer, choosing a chat is the end of the interaction: close it.
  const closeIfDrawer = () => {
    if (isDrawer) onClose();
  };
  const content = (
    <AskAiHistoryContent
      onOpenAiRequest={aiRequestId => {
        onOpenAiRequest(aiRequestId);
        closeIfDrawer();
      }}
      onStartNewChat={() => {
        onStartNewChat();
        closeIfDrawer();
      }}
      canStartNewChat={canStartNewChat}
      selectedAiRequestId={selectedAiRequestId}
      className={isDrawer ? undefined : classes.sidePanel}
    />
  );

  if (!isDrawer) {
    return (
      <CollapsibleSidePanel open={open} width={askAiHistoryWidth} anchor="left">
        {content}
      </CollapsibleSidePanel>
    );
  }

  const anchor = layout === 'right-drawer' ? 'right' : 'left';
  return (
    <Drawer
      open={open}
      anchor={anchor}
      onClose={onClose}
      PaperProps={{
        style: { width: askAiHistoryWidth, maxWidth: '85%', height: '100%' },
        className:
          anchor === 'left'
            ? 'safe-area-aware-left-container'
            : 'safe-area-aware-right-container',
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <DrawerTopBar
        title={<Trans>Chats</Trans>}
        drawerAnchor={anchor}
        id="ai-chat-history-drawer-top-bar"
        onClose={onClose}
      />
      {content}
    </Drawer>
  );
};
