//@flow
import React from 'react';
import { LeaderboardAdmin } from '../GameDashboard/LeaderboardAdmin';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Trans } from '@lingui/macro';

type Props = {|
  onClose: () => void,
  open: boolean,
  project: gdProject,
|};

const LeaderboardDialog = ({ onClose, open, project }: Props) => {
  return (
    <Dialog
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          onClick={onClose}
          key={'Cancel'}
        />,
      ]}
      open={open}
      cannotBeDismissed={true}
      onRequestClose={onClose}
      title="Leaderboards"
      flexBody
      fullHeight
    >
      <LeaderboardAdmin onLoading={() => {}} />
    </Dialog>
  );
};

export default LeaderboardDialog;
