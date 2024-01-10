// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Coin from '../UI/CustomSvgIcons/Coin';
import { LineStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import CreditsPackagesDialog from './CreditsPackagesDialog';

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
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [
    creditsPackDialogOpen,
    setCreditsPackDialogOpen,
  ] = React.useState<boolean>(false);

  // Ensure credits are refreshed when this component is shown.
  React.useEffect(
    () => {
      authenticatedUser.onRefreshLimits();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!authenticatedUser.limits) {
    return null;
  }

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: gdevelopTheme.credits.backgroundColor,
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
            <Text noMargin>
              <Trans>
                Credits available:{' '}
                {authenticatedUser.limits.credits.userBalance.amount}
              </Trans>
            </Text>
          </LineStackLayout>
        </Column>
        {displayPurchaseAction && (
          <>
            <Column>
              <FlatButton
                label={<Trans>See credit packs</Trans>}
                onClick={() => setCreditsPackDialogOpen(true)}
                primary
              />
            </Column>
            {creditsPackDialogOpen && (
              <CreditsPackagesDialog
                onClose={() => setCreditsPackDialogOpen(false)}
              />
            )}
          </>
        )}
      </ResponsiveLineStackLayout>
    </div>
  );
};

export default CreditsStatusBanner;
