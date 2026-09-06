// @flow
import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import classNames from 'classnames';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import {
  type AiRequestSummary,
  type AiRequestSummariesFilter,
} from '../Utils/GDevelopServices/Generation';
import ScrollView from '../UI/ScrollView';
import DrawerTopBar from '../UI/DrawerTopBar';
import PlaceholderError from '../UI/PlaceholderError';
import TextButton from '../UI/TextButton';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';
import CollapsibleSidePanel from '../UI/CollapsibleSidePanel';
import Add from '../UI/CustomSvgIcons/Add';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import Tune from '../UI/CustomSvgIcons/Tune';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import InlineRenameInput from '../UI/InlineRenameInput';
import { useLongTouch } from '../Utils/UseLongTouch';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { AiRequestContext } from './AiRequestContext';
import { getAiRequestSummaryTitle } from './AiRequestUtils';
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
  isRenaming,
  showMenuButton,
  onOpen,
  onOpenContextMenu,
  onEndRenaming,
}: {|
  aiRequestSummary: AiRequestSummary,
  isSelected: boolean,
  isWaitingForUser: boolean,
  isRenaming: boolean,
  showMenuButton: boolean,
  onOpen: () => void,
  onOpenContextMenu: (x: number, y: number) => void,
  onEndRenaming: (newTitle: string) => void,
|}): React.Node => {
  const title = getAiRequestSummaryTitle(aiRequestSummary);
  const { contextMenuProps: longTouchProps } = useLongTouch(
    React.useCallback(
      ({ clientX, clientY }) => onOpenContextMenu(clientX, clientY),
      [onOpenContextMenu]
    )
  );
  return (
    <div
      className={classNames(classes.item, {
        [classes.itemSelected]: isSelected,
      })}
      onContextMenu={
        isRenaming
          ? undefined
          : event => {
              event.preventDefault();
              onOpenContextMenu(event.clientX, event.clientY);
            }
      }
      {...(isRenaming ? {} : longTouchProps)}
    >
      {isRenaming ? (
        // Same padding and font as the name it replaces: only the underline
        // shows the name is being edited.
        <div className={classes.itemRenameContainer}>
          <InlineRenameInput
            initialValue={title}
            onEndRenaming={onEndRenaming}
          />
        </div>
      ) : (
        <button
          type="button"
          className={classes.itemButton}
          onClick={onOpen}
          title={title}
          aria-current={isSelected ? 'true' : undefined}
        >
          <span
            className={classNames(classes.itemText, {
              [classes.itemTextUntitled]: !title,
              // Muted when shown among the active chats.
              [classes.itemTextArchived]: !!aiRequestSummary.archivedAt,
            })}
          >
            {title || <Trans>Untitled chat</Trans>}
          </span>
          <ChatStatusDot
            status={getChatStatus(aiRequestSummary, isWaitingForUser)}
          />
        </button>
      )}
      {showMenuButton && !isRenaming && (
        <button
          type="button"
          className={classes.itemMenuButton}
          onClick={event => {
            event.stopPropagation();
            const {
              left,
              bottom,
            } = event.currentTarget.getBoundingClientRect();
            onOpenContextMenu(left, bottom);
          }}
          aria-label={t`Chat actions`.id}
        >
          <ThreeDotsMenu />
        </button>
      )}
    </div>
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

const matchesFilter = (
  aiRequestSummary: AiRequestSummary,
  filter: AiRequestSummariesFilter
): boolean =>
  filter === 'all' ||
  (filter === 'archived'
    ? !!aiRequestSummary.archivedAt
    : !aiRequestSummary.archivedAt);

const filters: Array<AiRequestSummariesFilter> = ['active', 'archived', 'all'];

const filterLabels = {
  active: t`Active`,
  archived: t`Archived`,
  all: t`All`,
};

const sectionTitles = {
  active: <Trans>Recents</Trans>,
  archived: <Trans>Archived</Trans>,
  all: <Trans>All chats</Trans>,
};

const emptyMessages = {
  active: (
    <Trans>
      Your chats with the AI will be listed here. Start by asking anything!
    </Trans>
  ),
  archived: <Trans>No archived chat.</Trans>,
  all: (
    <Trans>
      Your chats with the AI will be listed here. Start by asking anything!
    </Trans>
  ),
};

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
  const {
    renameAiRequest,
    setAiRequestArchived,
    deleteAiRequest,
    aiRequestSummariesFilter,
    setAiRequestSummariesFilter,
  } = React.useContext(AiRequestContext).aiRequestStorage;
  const { isMobile } = useResponsiveWindowSize();
  const { showConfirmation } = useAlertDialog();
  const contextMenuRef = React.useRef<?ContextMenuInterface>(null);
  const [renamedAiRequestId, setRenamedAiRequestId] = React.useState<
    string | null
  >(null);
  const onDeleteAiRequest = React.useCallback(
    async (aiRequestId: string) => {
      const shouldDelete = await showConfirmation({
        title: t`Delete this chat?`,
        message: t`The chat and its history will be removed. This cannot be undone.`,
        confirmButtonLabel: t`Delete`,
        dismissButtonLabel: t`Cancel`,
      });
      if (!shouldDelete) return;
      // Nothing to show anymore for a deleted chat: leave it first.
      if (selectedAiRequestId === aiRequestId) onStartNewChat();
      deleteAiRequest(aiRequestId);
    },
    [showConfirmation, selectedAiRequestId, onStartNewChat, deleteAiRequest]
  );
  const buildMenuTemplate = React.useCallback(
    (
      i18n: I18nType,
      {
        aiRequestId,
        isArchived,
      }: {| aiRequestId: string, isArchived: boolean |}
    ): Array<MenuItemTemplate> => [
      {
        label: i18n._(t`Rename`),
        click: () => setRenamedAiRequestId(aiRequestId),
      },
      isArchived
        ? {
            label: i18n._(t`Unarchive`),
            click: () => setAiRequestArchived(aiRequestId, false),
          }
        : {
            label: i18n._(t`Archive`),
            click: () => setAiRequestArchived(aiRequestId, true),
          },
      ...(isArchived
        ? [
            {
              label: i18n._(t`Delete`),
              click: () => onDeleteAiRequest(aiRequestId),
            },
          ]
        : []),
    ],
    [setAiRequestArchived, onDeleteAiRequest]
  );
  const buildFilterMenuTemplate = React.useCallback(
    (i18n: I18nType): Array<MenuItemTemplate> =>
      filters.map(filter => ({
        type: 'checkbox',
        label: i18n._(filterLabels[filter]),
        checked: aiRequestSummariesFilter === filter,
        click: () => setAiRequestSummariesFilter(filter),
      })),
    [aiRequestSummariesFilter, setAiRequestSummariesFilter]
  );
  const sortedAiRequestSummaries = React.useMemo(
    () =>
      Object.keys(aiRequestSummaries)
        .map(aiRequestId => aiRequestSummaries[aiRequestId])
        .filter(aiRequestSummary =>
          matchesFilter(aiRequestSummary, aiRequestSummariesFilter)
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [aiRequestSummaries, aiRequestSummariesFilter]
  );
  const hasChats = sortedAiRequestSummaries.length > 0;

  return (
    <div className={classNames(classes.panel, className)}>
      <div className={classes.header}>
        <RaisedButton
          primary
          fullWidth
          icon={<Add />}
          label={<Trans>New chat</Trans>}
          onClick={onStartNewChat}
          disabled={!canStartNewChat}
          id="ask-ai-new-chat-button"
        />
      </div>
      <div className={classes.sectionTitle}>
        {sectionTitles[aiRequestSummariesFilter]}
        <span className={classes.sectionTitleButtons}>
          <IconButton
            size="small"
            color="inherit"
            tooltip={t`Refresh the chats`}
            onClick={fetchAiRequestSummaries}
            disabled={isLoading}
          >
            <Refresh fontSize="small" />
          </IconButton>
          <ElementWithMenu
            element={
              <IconButton
                size="small"
                color="inherit"
                tooltip={t`Choose which chats to show`}
                selected={aiRequestSummariesFilter !== 'active'}
              >
                <Tune fontSize="small" />
              </IconButton>
            }
            buildMenuTemplate={buildFilterMenuTemplate}
          />
        </span>
      </div>
      {error && !hasChats ? (
        <PlaceholderError onRetry={fetchAiRequestSummaries}>
          <Trans>Your chats could not be loaded.</Trans>
        </PlaceholderError>
      ) : isLoading && !hasChats ? (
        <LoadingSkeleton />
      ) : !hasChats ? (
        <div className={classes.emptyMessage}>
          {emptyMessages[aiRequestSummariesFilter]}
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
                  isRenaming={renamedAiRequestId === aiRequestSummary.id}
                  // On touch screens, a long press opens the menu.
                  showMenuButton={!isMobile}
                  onOpen={() => onOpenAiRequest(aiRequestSummary.id)}
                  onOpenContextMenu={(x, y) => {
                    if (contextMenuRef.current)
                      contextMenuRef.current.open(x, y, {
                        aiRequestId: aiRequestSummary.id,
                        isArchived: !!aiRequestSummary.archivedAt,
                      });
                  }}
                  onEndRenaming={newTitle => {
                    setRenamedAiRequestId(null);
                    renameAiRequest(aiRequestSummary.id, newTitle);
                  }}
                />
              );
            })}
          </div>
          <ContextMenu
            ref={contextMenuRef}
            buildMenuTemplate={buildMenuTemplate}
          />
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
