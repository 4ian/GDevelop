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
|};

const LeaderboardDialog = ({ onClose, open, project }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Dialog
      actions={[
        <FlatButton
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
      onRequestClose={() => {
        if (!isLoading) onClose();
      }}
      title={<Trans>Leaderboards</Trans>}
      flexBody
      fullHeight
    >
      <LeaderboardAdmin onLoading={setIsLoading} project={project} />
    </Dialog>
  );
};

export default LeaderboardDialog;
