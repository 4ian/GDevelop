// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import AddIcon from '../UI/CustomSvgIcons/Add';
import ChatBubblesIcon from '../UI/CustomSvgIcons/ChatBubbles';
import IconButton from '../UI/IconButton';
import RaisedButton from '../UI/RaisedButton';
import FadeIn from '../UI/FadeIn';

type Props = {|
  isHistoryOpen: boolean,
  onToggleHistory: () => void,
  onStartNewChat: () => void,
  canStartNewChat: boolean,
  // The "New chat" button is always visible: in the list of chats when it's
  // shown next to the chat, in the toolbar otherwise.
  showNewChatButton: boolean,
|};

export const Toolbar = ({
  isHistoryOpen,
  onToggleHistory,
  onStartNewChat,
  canStartNewChat,
  showNewChatButton,
}: Props): React.Node => {
  return (
    <>
      <ToolbarGroup firstChild>
        <IconButton
          size="small"
          color="default"
          tooltip={isHistoryOpen ? t`Hide the chats` : t`Show the chats`}
          onClick={onToggleHistory}
          selected={isHistoryOpen}
          id="ask-ai-toggle-history-button"
        >
          <ChatBubblesIcon />
        </IconButton>
      </ToolbarGroup>
      <ToolbarGroup lastChild>
        {showNewChatButton && (
          <FadeIn>
            <RaisedButton
              primary
              onClick={onStartNewChat}
              icon={<AddIcon />}
              label={<Trans>New chat</Trans>}
              disabled={!canStartNewChat}
              style={{
                flexShrink: 0,
              }}
            />
          </FadeIn>
        )}
      </ToolbarGroup>
    </>
  );
};
