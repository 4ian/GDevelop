//@flow
import React from 'react';
import { LeaderboardAdmin } from '../GameDashboard/LeaderboardAdmin';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

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
}: Props): React.Node => {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <I18n>
      {({ i18n }) => (
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
              scopeName={i18n._(t`Leaderboards`)}
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
      )}
    </I18n>
  );
};

export default LeaderboardDialog;
