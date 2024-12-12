// @flow

import * as React from 'react';
import DashboardWidget, {
  type DashboardWidgetSize,
} from '../Widgets/DashboardWidget';
import { ColumnStackLayout } from '../../UI/Layout';
import Coin from '../../Credits/Icons/Coin';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { EarnBadges } from '../../MainFrame/EditorContainers/HomePage/GetStartedSection/EarnBadges';
import TextButton from '../../UI/TextButton';
import { Trans } from '@lingui/macro';

type Props = {|
  onOpenProfile: () => void,
  size: DashboardWidgetSize,
  showRandomBadge?: boolean,
  showAllBadges?: boolean,
|};

const WalletWidget = ({
  onOpenProfile,
  size,
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
      widgetSize={size}
      title={<Trans>Wallet</Trans>}
      topRightAction={
        <TextButton
          icon={<Coin fontSize="small" />}
          label={creditsAvailable.toString()}
          onClick={profile ? onOpenProfile : onOpenCreateAccountDialog}
        />
      }
      widgetName="wallet"
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
