// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { LineStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import Coin from './Icons/Coin';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';

const styles = {
  container: {
    borderRadius: 8,
    padding: 8,
  },
};

type Props = {|
  displayPurchaseAction: boolean,
|};

const CreditsStatusBanner = ({ displayPurchaseAction }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { limits, onRefreshLimits } = React.useContext(
    AuthenticatedUserContext
  );
  const { openCreditsPackageDialog } = React.useContext(
    CreditsPackageStoreContext
  );

  // Ensure credits are refreshed when this component is shown.
  React.useEffect(
    () => {
      onRefreshLimits();
    },
    [onRefreshLimits]
  );

  if (!limits) {
    return null;
  }

  return (
    <>
      <div
        style={{
          ...styles.container,
          backgroundColor: gdevelopTheme.credits.backgroundColor,
          color: gdevelopTheme.credits.color,
        }}
      >
        <ResponsiveLineStackLayout
          alignItems="center"
          justifyContent="space-between"
          noMargin
        >
          <Column>
            <LineStackLayout alignItems="flex-end" noMargin>
              <Coin />
              <Text noMargin color="inherit">
                <Trans>
                  Credits available: {limits.credits.userBalance.amount}
                </Trans>
              </Text>
            </LineStackLayout>
          </Column>
          {displayPurchaseAction && (
            <Column>
              <FlatButton
                label={<Trans>Get credit packs</Trans>}
                onClick={() =>
                  openCreditsPackageDialog({ showCalloutTip: true })
                }
                style={{
                  color: gdevelopTheme.credits.color,
                  borderColor: gdevelopTheme.credits.color,
                }}
              />
            </Column>
          )}
        </ResponsiveLineStackLayout>
      </div>
    </>
  );
};

export default CreditsStatusBanner;
