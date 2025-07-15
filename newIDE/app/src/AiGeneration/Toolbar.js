// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import AddIcon from '../UI/CustomSvgIcons/Add';
import HistoryIcon from '../UI/CustomSvgIcons/History';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';

type Props = {|
  onStartNewChat: () => void,
  canStartNewChat: boolean,
  onOpenHistory: () => void,
|};

export const Toolbar = ({
  onStartNewChat,
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
          <HistoryIcon />
        </IconButton>
      </ToolbarGroup>
      <ToolbarGroup lastChild>
        <RaisedButton
          primary
          onClick={onStartNewChat}
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
