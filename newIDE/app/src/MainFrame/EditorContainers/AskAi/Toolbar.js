// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../../../UI/Toolbar';
import AddIcon from '../../../UI/CustomSvgIcons/Add';
import RaisedButton from '../../../UI/RaisedButton';

type Props = {|
  onStartNewChat: () => void,
  canStartNewChat: boolean,
|};

export const Toolbar = ({ onStartNewChat, canStartNewChat }: Props) => {
  return (
    <ToolbarGroup lastChild>
      <RaisedButton
        primary
        onClick={onStartNewChat}
        icon={<AddIcon />}
        label={<Trans>Start a new chat</Trans>}
        disabled={!canStartNewChat}
      />
    </ToolbarGroup>
  );
};
