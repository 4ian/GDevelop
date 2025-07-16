// @flow

import * as React from 'react';
import DashboardWidget, {
  type DashboardWidgetSize,
} from '../Widgets/DashboardWidget';
import { ColumnStackLayout } from '../../UI/Layout';
import Coin from '../../Credits/Icons/Coin';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { EarnCredits } from './EarnCredits';
import TextButton from '../../UI/TextButton';
import { Trans } from '@lingui/macro';

type Props = {|
  onOpenProfile: () => void,
  size: DashboardWidgetSize,
  showOneItem?: boolean,
  showAllItems?: boolean,
|};

const WalletWidget = ({
  onOpenProfile,
  size,
  showOneItem,
  showAllItems,
}: Props) => {
  const {
    profile,
    limits,
    achievements,
    badges,
    onOpenCreateAccountDialog,
  } = React.useContext(AuthenticatedUserContext);
  const availableCredits = limits ? limits.credits.userBalance.amount : 0;

  return (
    <DashboardWidget
      widgetSize={size}
      title={<Trans>Wallet</Trans>}
      topRightAction={
        <TextButton
          icon={<Coin fontSize="small" />}
          label={availableCredits.toString()}
          onClick={profile ? onOpenProfile : onOpenCreateAccountDialog}
        />
      }
      widgetName="wallet"
    >
      <ColumnStackLayout noMargin expand>
        <EarnCredits
          achievements={achievements}
          badges={badges}
          onOpenProfile={onOpenProfile}
          showRandomItem={showOneItem}
          showAllItems={showAllItems}
        />
      </ColumnStackLayout>
    </DashboardWidget>
  );
};

export default WalletWidget;
