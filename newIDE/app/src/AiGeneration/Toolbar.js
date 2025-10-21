// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import AddIcon from '../UI/CustomSvgIcons/Add';
import ChatBubblesIcon from '../UI/CustomSvgIcons/ChatBubbles';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import IconButton from '../UI/IconButton';

type Props = {|
  onStartOrOpenChat: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
  |}) => void,
  canStartNewChat: boolean,
  onOpenHistory: () => void,
|};

export const Toolbar = ({
  onStartOrOpenChat,
  canStartNewChat,
  onOpenHistory,
}: Props) => {
  return (
    <>
      <ToolbarGroup firstChild>
        <IconButton
          size="small"
          color="default"
          tooltip={t`View history`}
          onClick={onOpenHistory}
        >
          <ChatBubblesIcon />
        </IconButton>
      </ToolbarGroup>
      <ToolbarGroup lastChild>
        <ResponsiveRaisedButton
          primary
          onClick={() =>
            onStartOrOpenChat({
              mode: 'agent',
              aiRequestId: null,
            })
          }
          icon={<AddIcon />}
          label={<Trans>Start a new chat</Trans>}
          disabled={!canStartNewChat}
          style={{
            flexShrink: 0,
          }}
        />
      </ToolbarGroup>
    </>
  );
};
