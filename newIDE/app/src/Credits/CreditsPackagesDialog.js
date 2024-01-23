// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import Dialog from '../UI/Dialog';
import CreditsStatusBanner from './CreditsStatusBanner';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import { formatProductPrice } from '../AssetStore/ProductPriceTag';
import BackgroundText from '../UI/BackgroundText';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import CreditsPackagePurchaseDialog from '../AssetStore/CreditsPackages/CreditsPackagePurchaseDialog';
import { type CreditsPackageListingData } from '../Utils/GDevelopServices/Shop';
import Coin from './Icons/Coin';
import TwoCoins from './Icons/TwoCoins';
import ThreeCoins from './Icons/ThreeCoins';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AlertMessage from '../UI/AlertMessage';

const styles = {
  creditsPackage: {
    display: 'flex',
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  titleContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
  },
  backgroundText: {
    textAlign: 'left',
  },
};

const getIconFromIndex = (index: number) => {
  switch (index) {
    case 0:
      return <Coin style={{ width: 15, height: 15 }} />;
    case 1:
      return <TwoCoins style={{ width: 30, height: 30 }} />;
    case 2:
    default:
      return <ThreeCoins style={{ width: 30, height: 30 }} />;
  }
};

type Props = {
  onClose: () => void,
};

const CreditsPackagesDialog = ({ onClose }: Props) => {
  const {
    error,
    fetchCreditsPackages,
    creditsPackageListingDatas,
  } = React.useContext(CreditsPackageStoreContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [
    purchasingCreditsPackageListingData,
    setPurchasingCreditsPackageListingData,
  ] = React.useState<?CreditsPackageListingData>(null);
  const { limits } = React.useContext(AuthenticatedUserContext);

  React.useEffect(
    () => {
      fetchCreditsPackages();
    },
    [fetchCreditsPackages]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Purchase credits</Trans>}
          open
          maxWidth="md"
          onRequestClose={onClose}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              onClick={onClose}
            />,
          ]}
        >
          <ColumnStackLayout noMargin>
            <CreditsStatusBanner displayPurchaseAction={false} />
            {limits && limits.credits.userBalance.amount > 0 && (
              <AlertMessage kind="info">
                <Trans>
                  You can use your credits to feature a game! Head down in the
                  "Manage" section, pick a game and go to the tab "Marketing".
                </Trans>
              </AlertMessage>
            )}
            {error ? (
              <PlaceholderError onRetry={fetchCreditsPackages}>
                <Trans>
                  Can't load the credits packages. Verify your internet
                  connection or retry later.
                </Trans>
              </PlaceholderError>
            ) : !creditsPackageListingDatas ? (
              <PlaceholderLoader />
            ) : (
              <ResponsiveLineStackLayout noColumnMargin>
                {creditsPackageListingDatas.map(
                  (creditsPackageListingData, index) => {
                    const { id, name, description } = creditsPackageListingData;
                    return (
                      <div
                        style={{
                          ...styles.creditsPackage,
                          border: `1px solid ${
                            gdevelopTheme.palette.secondary
                          }`,
                        }}
                        key={id}
                      >
                        <ColumnStackLayout
                          alignItems="center"
                          justifyContent="space-between"
                          noMargin
                          expand
                        >
                          <div style={styles.titleContainer}>
                            <div style={styles.iconContainer}>
                              {getIconFromIndex(index)}
                            </div>
                            <LineStackLayout
                              justifyContent="space-between"
                              alignItems="flex-end"
                              expand
                            >
                              <Line noMargin alignItems="flex-end">
                                <Text size="sub-title" noMargin>
                                  {name}
                                </Text>
                              </Line>
                              <Text
                                size="body-small"
                                color="secondary"
                                noMargin
                              >
                                {formatProductPrice({
                                  productListingData: creditsPackageListingData,
                                  i18n,
                                })}
                              </Text>
                            </LineStackLayout>
                          </div>

                          <Column noMargin alignItems="center" expand>
                            <Text
                              size="body-small"
                              noMargin
                              color="secondary"
                              align="left"
                            >
                              {description}
                            </Text>
                          </Column>
                          <RaisedButton
                            primary
                            onClick={() =>
                              setPurchasingCreditsPackageListingData(
                                creditsPackageListingData
                              )
                            }
                            label={<Trans>Purchase</Trans>}
                            fullWidth
                          />
                        </ColumnStackLayout>
                      </div>
                    );
                  }
                )}
              </ResponsiveLineStackLayout>
            )}
            <BackgroundText style={styles.backgroundText}>
              <Trans>
                Not sure how many credits you need? Check{' '}
                <Link
                  href="https://wiki.gdevelop.io/gdevelop5/interface/profile/credits"
                  onClick={() =>
                    Window.openExternalURL(
                      'https://wiki.gdevelop.io/gdevelop5/interface/profile/credits'
                    )
                  }
                >
                  this guide
                </Link>{' '}
                to help you decide.
              </Trans>
            </BackgroundText>
          </ColumnStackLayout>
          {!!purchasingCreditsPackageListingData && (
            <CreditsPackagePurchaseDialog
              creditsPackageListingData={purchasingCreditsPackageListingData}
              onClose={() => setPurchasingCreditsPackageListingData(null)}
            />
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default CreditsPackagesDialog;
