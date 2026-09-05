// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import SidePanelIcon from '../UI/CustomSvgIcons/SidePanel';
import IconButton from '../UI/IconButton';

type Props = {|
  isHistoryOpen: boolean,
  onToggleHistory: () => void,
|};

export const Toolbar = ({
  isHistoryOpen,
  onToggleHistory,
}: Props): React.Node => {
  return (
    <ToolbarGroup firstChild>
      <IconButton
        size="small"
        color="default"
        tooltip={isHistoryOpen ? t`Hide the chats` : t`Show the chats`}
        onClick={onToggleHistory}
        selected={isHistoryOpen}
        id="ask-ai-toggle-history-button"
      >
        <SidePanelIcon />
      </IconButton>
    </ToolbarGroup>
  );
};
