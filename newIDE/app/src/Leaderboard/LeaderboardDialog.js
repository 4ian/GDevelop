//@flow
import React from 'react';
import { LeaderboardAdmin } from '../GameDashboard/LeaderboardAdmin';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { Trans } from '@lingui/macro';

type Props = {|
  onClose: () => void,
  open: boolean,
  project: gdProject,
  leaderboardId?: string,
|};

const LeaderboardDialog = ({
  onClose,
  open,
  project,
  leaderboardId,
}: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Dialog
      title={<Trans>Leaderboards</Trans>}
      id="leaderboard-admin-dialog"
      actions={[
        <FlatButton
          id="close-button"
          label={<Trans>Close</Trans>}
          disabled={isLoading}
          onClick={onClose}
          key={'Close'}
        />,
      ]}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/interface/games-dashboard/leaderboard-administration"
        />,
      ]}
      open={open}
      cannotBeDismissed={isLoading}
      onRequestClose={onClose}
      flexBody
      fullHeight
    >
      <LeaderboardAdmin
        onLoading={setIsLoading}
        project={project}
        leaderboardIdToSelectAtOpening={leaderboardId}
      />
    </Dialog>
  );
};

export default LeaderboardDialog;
