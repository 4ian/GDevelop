// @flow

import * as React from 'react';
import DashboardWidget from '../Widgets/DashboardWidget';
import { ColumnStackLayout } from '../../UI/Layout';
import Coin from '../../Credits/Icons/Coin';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { EarnBadges } from '../../MainFrame/EditorContainers/HomePage/GetStartedSection/EarnBadges';
import TextButton from '../../UI/TextButton';

type Props = {|
  onOpenProfile: () => void,
  fullWidth?: boolean,
  showRandomBadge?: boolean,
  showAllBadges?: boolean,
|};

const WalletWidget = ({
  onOpenProfile,
  fullWidth,
  showRandomBadge,
  showAllBadges,
}: Props) => {
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
      gridSize={fullWidth ? 3 : 1}
      title={null}
      topRightAction={
        <TextButton
          icon={<Coin fontSize="small" />}
          label={creditsAvailable.toString()}
          onClick={profile ? onOpenProfile : onOpenCreateAccountDialog}
        />
      }
    >
      <ColumnStackLayout noMargin expand>
        <EarnBadges
          achievements={achievements}
          badges={badges}
          onOpenProfile={onOpenProfile}
          showRandomBadge={showRandomBadge}
          showAllBadges={showAllBadges}
        />
      </ColumnStackLayout>
    </DashboardWidget>
  );
};

export default WalletWidget;
