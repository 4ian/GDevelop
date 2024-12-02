// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import DashboardWidget from '../Widgets/DashboardWidget';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Coin from '../../Credits/Icons/Coin';
import Text from '../../UI/Text';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  EarnBadges,
  hasMissingBadges,
} from '../../MainFrame/EditorContainers/HomePage/GetStartedSection/EarnBadges';
import FlatButton from '../../UI/FlatButton';

type Props = {|
  onOpenProfile: () => void,
  fullWidth?: boolean,
  showRandomBadge?: boolean,
|};

const WalletWidget = ({ onOpenProfile, fullWidth, showRandomBadge }: Props) => {
  const {
    profile,
    limits,
    achievements,
    badges,
    onOpenCreateAccountDialog,
  } = React.useContext(AuthenticatedUserContext);
  const creditsAvailable = limits ? limits.credits.userBalance.amount : 0;
  return (
    <DashboardWidget
      gridSize={fullWidth ? 3 : 1.5}
      title={<Trans>Wallet</Trans>}
      topRightAction={
        <LineStackLayout alignItems="center" noMargin>
          {hasMissingBadges(badges, achievements) && (
            <FlatButton
              label={<Trans>Claim in profile</Trans>}
              onClick={profile ? onOpenProfile : onOpenCreateAccountDialog}
            />
          )}
          <Coin />
          <Text noMargin color="inherit">
            <Trans>{creditsAvailable} Credits</Trans>
          </Text>
        </LineStackLayout>
      }
      minHeight="small"
    >
      <ColumnStackLayout noMargin expand>
        <EarnBadges
          achievements={achievements}
          badges={badges}
          onOpenProfile={onOpenProfile}
          showRandomBadge={showRandomBadge}
          hideStatusBanner
        />
      </ColumnStackLayout>
    </DashboardWidget>
  );
};

export default WalletWidget;
