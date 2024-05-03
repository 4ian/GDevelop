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
import { renderProductPrice } from '../AssetStore/ProductPriceTag';
import BackgroundText from '../UI/BackgroundText';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import CreditsPackagePurchaseDialog from '../AssetStore/CreditsPackages/CreditsPackagePurchaseDialog';
import { type CreditsPackageListingData } from '../Utils/GDevelopServices/Shop';
import OneCoin from './Icons/OneCoin';
import TwoCoins from './Icons/TwoCoins';
import ThreeCoins from './Icons/ThreeCoins';
import FourCoins from './Icons/FourCoins';
import FiveCoins from './Icons/FiveCoins';
import AlertMessage from '../UI/AlertMessage';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { getItemsSplitInLines } from './CreditsPackagesHelper';

const styles = {
  creditsPackage: {
    display: 'flex',
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  iconStyle: {
    width: 30,
    height: 30,
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
      return <OneCoin style={styles.iconStyle} />;
    case 1:
      return <TwoCoins style={styles.iconStyle} />;
    case 2:
      return <ThreeCoins style={styles.iconStyle} />;
    case 3:
      return <FourCoins style={styles.iconStyle} />;
    case 4:
    default:
      return <FiveCoins style={styles.iconStyle} />;
  }
};

type Props = {|
  onClose: () => void,
  suggestedPackage: ?CreditsPackageListingData,
  missingCredits: ?number,
  showCalloutTip?: boolean,
|};

const CreditsPackagesDialog = ({
  onClose,
  suggestedPackage,
  missingCredits,
  showCalloutTip,
}: Props) => {
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
  const { isMediumScreen } = useResponsiveWindowSize();

  React.useEffect(
    () => {
      fetchCreditsPackages();
    },
    [fetchCreditsPackages]
  );

  // Split credit packages on multiple lines to spread them as much as possible.
  // Logic is different based on the screen size so that it looks ok.
  const creditsPackageListingDatasArrays: ?(CreditsPackageListingData[][]) = React.useMemo(
    () => getItemsSplitInLines(creditsPackageListingDatas, isMediumScreen),
    [creditsPackageListingDatas, isMediumScreen]
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
            {showCalloutTip && (
              <AlertMessage kind="info">
                <Trans>
                  You can use credits to feature a game or purchase asset packs
                  and game templates in the store!
                </Trans>
              </AlertMessage>
            )}
            {!!missingCredits && (
              <Column noMargin>
                <Text size="sub-title">
                  <Trans>You're {missingCredits} credits short.</Trans>
                </Text>
                <Text noMargin>
                  <Trans>Recharge your account to purchase this item.</Trans>
                </Text>
              </Column>
            )}
            {error ? (
              <PlaceholderError onRetry={fetchCreditsPackages}>
                <Trans>
                  Can't load the credits packages. Verify your internet
                  connection or retry later.
                </Trans>
              </PlaceholderError>
            ) : !creditsPackageListingDatasArrays ? (
              <PlaceholderLoader />
            ) : (
              creditsPackageListingDatasArrays.map(
                (creditsPackageListingDatasArray, lineIndex) => (
                  <ResponsiveLineStackLayout
                    noColumnMargin
                    key={`line-${lineIndex}`}
                  >
                    {creditsPackageListingDatasArray.map(
                      (creditsPackageListingData, index) => {
                        const {
                          id,
                          name,
                          description,
                        } = creditsPackageListingData;
                        const shouldSuggestPackage =
                          !suggestedPackage || suggestedPackage.id === id;
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
                                    {renderProductPrice({
                                      productListingData: creditsPackageListingData,
                                      usageType: 'default',
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
                              {shouldSuggestPackage ? (
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
                              ) : (
                                <FlatButton
                                  primary
                                  onClick={() =>
                                    setPurchasingCreditsPackageListingData(
                                      creditsPackageListingData
                                    )
                                  }
                                  label={<Trans>Purchase</Trans>}
                                  fullWidth
                                />
                              )}
                            </ColumnStackLayout>
                          </div>
                        );
                      }
                    )}
                  </ResponsiveLineStackLayout>
                )
              )
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
              onCloseWhenPurchaseSuccessful={() => {
                if (suggestedPackage) {
                  // If a package was suggested, we can close the dialog as the user
                  // is going through a flow to purchase a product.
                  onClose();
                }
              }}
            />
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default CreditsPackagesDialog;
