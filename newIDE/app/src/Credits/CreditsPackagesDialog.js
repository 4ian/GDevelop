// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Text from '../UI/Text';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  CreditsPackageStoreContext,
  getCreditsAmountFromId,
} from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import CreditsPackagePurchaseDialog from '../AssetStore/CreditsPackages/CreditsPackagePurchaseDialog';
import { type CreditsPackageListingData } from '../Utils/GDevelopServices/Shop';
import { renderProductPrice } from '../AssetStore/ProductPriceTag';
import { type CreditsPackageDialogVariant } from './CreditsPackagesDialogDisplay';
import Coin from './Icons/Coin';
import OneCoin from './Icons/OneCoin';
import TwoCoins from './Icons/TwoCoins';
import ThreeCoins from './Icons/ThreeCoins';
import FourCoins from './Icons/FourCoins';
import FiveCoins from './Icons/FiveCoins';
import MultipleCoins from './Icons/MultipleCoins';
import RobotFace from '../UI/CustomSvgIcons/RobotFace';
import Store from '../UI/CustomSvgIcons/Store';
import Publish from '../UI/CustomSvgIcons/Publish';
import classes from './CreditsPackagesDialog.module.css';

const CREDITS_GUIDE_URL =
  'https://wiki.gdevelop.io/gdevelop5/interface/profile/credits';

const styles = {
  packageIcon: {
    width: 34,
    height: 34,
  },
};

const getIconFromIndex = (index: number) => {
  switch (index) {
    case 0:
      return <OneCoin style={styles.packageIcon} />;
    case 1:
      return <TwoCoins style={styles.packageIcon} />;
    case 2:
      return <ThreeCoins style={styles.packageIcon} />;
    case 3:
      return <FourCoins style={styles.packageIcon} />;
    case 4:
    default:
      return <FiveCoins style={styles.packageIcon} />;
  }
};

/**
 * The price of a package, in cents, or null when the package has no comparable
 * price (so it is left out of the "best value" comparison).
 */
const getPriceInCents = (
  creditsPackageListingData: CreditsPackageListingData
): {| valueInCents: number, currency: string |} | null => {
  const price =
    creditsPackageListingData.prices.find(
      price => price.usageType === 'default'
    ) || creditsPackageListingData.prices[0];
  if (!price) return null;
  return { valueInCents: price.value, currency: price.currency };
};

type SavingsPercentages = { [packageId: string]: number };

/**
 * How much cheaper each credit is in a package, compared to the package with
 * the worst rate (usually the smallest one) - the reason to buy a bigger pack,
 * made explicit.
 *
 * Packages priced in another currency (or without a price) are ignored, so the
 * comparison always holds.
 */
const getSavingsPercentages = (
  creditsPackageListingDatas: Array<CreditsPackageListingData>
): SavingsPercentages => {
  const centsPerCreditByPackageId: { [packageId: string]: number } = {};
  let referenceCurrency: string | null = null;
  let worstCentsPerCredit: number | null = null;

  creditsPackageListingDatas.forEach(creditsPackageListingData => {
    const price = getPriceInCents(creditsPackageListingData);
    const creditsAmount = getCreditsAmountFromId(creditsPackageListingData.id);
    if (!price || !price.valueInCents || !creditsAmount) return;
    if (!referenceCurrency) referenceCurrency = price.currency;
    if (price.currency !== referenceCurrency) return;

    const centsPerCredit = price.valueInCents / creditsAmount;
    centsPerCreditByPackageId[creditsPackageListingData.id] = centsPerCredit;
    if (worstCentsPerCredit === null || centsPerCredit > worstCentsPerCredit) {
      worstCentsPerCredit = centsPerCredit;
    }
  });

  const savingsPercentages: SavingsPercentages = {};
  if (!worstCentsPerCredit) return savingsPercentages;
  Object.keys(centsPerCreditByPackageId).forEach(packageId => {
    const savingsPercentage = Math.round(
      (1 - centsPerCreditByPackageId[packageId] / Number(worstCentsPerCredit)) *
        100
    );
    if (savingsPercentage > 0)
      savingsPercentages[packageId] = savingsPercentage;
  });
  return savingsPercentages;
};

/**
 * What a given amount of credits realistically allows: an AI request costs a
 * few credits, an asset pack or a mobile build a few hundred. Thresholds are
 * kept deliberately coarse so the promise stays true if prices move a little.
 *
 * Nothing is promised for a package whose id doesn't say how many credits it
 * gives (a package shape added later by the shop): a wrong promise would be
 * worse than none.
 */
const renderPackageValue = ({
  creditsAmount,
  isAiFocused,
}: {|
  creditsAmount: number,
  isAiFocused: boolean,
|}): React.Node => {
  if (!creditsAmount) return null;
  if (creditsAmount >= 10000) {
    return isAiFocused ? (
      <Trans>Build and iterate on entire games, every day</Trans>
    ) : (
      <Trans>Make entire games, every day</Trans>
    );
  }
  if (creditsAmount >= 5000) {
    return isAiFocused ? (
      <Trans>Advanced features on an ambitious game, with the AI</Trans>
    ) : (
      <Trans>Advanced features on an ambitious game</Trans>
    );
  }
  if (creditsAmount >= 2000) {
    return isAiFocused ? (
      <Trans>Build a whole game with the AI</Trans>
    ) : (
      <Trans>A whole game, assets and exports</Trans>
    );
  }
  if (creditsAmount >= 1000) {
    return isAiFocused ? (
      <Trans>Several features built with the AI</Trans>
    ) : (
      <Trans>Several features, or an asset pack</Trans>
    );
  }
  return isAiFocused ? (
    <Trans>A few features built with the AI</Trans>
  ) : (
    <Trans>A few AI features, or some assets</Trans>
  );
};

type CreditsUsage = {|
  key: string,
  icon: React.Node,
  title: React.Node,
  description: React.Node,
|};

const getCreditsUsages = (isAiFocused: boolean): Array<CreditsUsage> => {
  const aiUsage: CreditsUsage = {
    key: 'ai',
    icon: <RobotFace fontSize="inherit" />,
    title: <Trans>Build with the AI</Trans>,
    description: isAiFocused ? (
      <Trans>
        Keep asking the AI to add features, fix bugs and build entire scenes,
        without waiting for your usage to reset.
      </Trans>
    ) : (
      <Trans>
        Ask the AI to add features, fix bugs and build entire scenes for you.
      </Trans>
    ),
  };
  const assetStoreUsage: CreditsUsage = {
    key: 'asset-store',
    icon: <Store fontSize="inherit" />,
    title: <Trans>Fill your game</Trans>,
    description: (
      <Trans>
        Buy asset packs, game templates and sounds in the GDevelop asset store.
      </Trans>
    ),
  };
  const publishUsage: CreditsUsage = {
    key: 'publish',
    icon: <Publish fontSize="inherit" />,
    title: <Trans>Publish and grow</Trans>,
    description: (
      <Trans>
        Export to Android and iOS, and get your game featured on gd.games.
      </Trans>
    ),
  };

  return isAiFocused
    ? [aiUsage, assetStoreUsage, publishUsage]
    : [assetStoreUsage, aiUsage, publishUsage];
};

type Props = {|
  onClose: () => void,
  suggestedPackage: ?CreditsPackageListingData,
  missingCredits: ?number,
  showCalloutTip?: boolean,
  /** Which wording/layout of the dialog to show (see `CreditsPackagesDialogDisplay`). */
  dialogVariant?: CreditsPackageDialogVariant,
|};

const CreditsPackagesDialog = ({
  onClose,
  suggestedPackage,
  missingCredits,
  showCalloutTip,
  dialogVariant = 'standard',
}: Props): React.Node => {
  const {
    error,
    fetchCreditsPackages,
    creditsPackageListingDatas,
  } = React.useContext(CreditsPackageStoreContext);
  const { limits, onRefreshLimits } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    purchasingCreditsPackageListingData,
    setPurchasingCreditsPackageListingData,
  ] = React.useState<?CreditsPackageListingData>(null);

  React.useEffect(
    () => {
      fetchCreditsPackages();
    },
    [fetchCreditsPackages]
  );

  // Ensure the credits balance shown in the dialog is up to date.
  React.useEffect(
    () => {
      onRefreshLimits();
    },
    [onRefreshLimits]
  );

  const isAiFocused = dialogVariant === 'ai';
  const shouldShowCreditsUsages = dialogVariant !== 'compact';
  const availableCredits = limits ? limits.credits.userBalance.amount : null;

  const savingsPercentages: SavingsPercentages = React.useMemo(
    () =>
      creditsPackageListingDatas
        ? getSavingsPercentages(creditsPackageListingDatas)
        : {},
    [creditsPackageListingDatas]
  );

  // The package to visually feature: the one that covers what the user is
  // missing, or - when they are just topping up - the one giving the most
  // credits for their money.
  const highlightedPackageId = React.useMemo(
    () => {
      if (suggestedPackage) return suggestedPackage.id;
      if (!creditsPackageListingDatas) return null;
      let bestPackageId = null;
      let bestSavingsPercentage = 0;
      creditsPackageListingDatas.forEach(creditsPackageListingData => {
        const savingsPercentage =
          savingsPercentages[creditsPackageListingData.id] || 0;
        if (savingsPercentage > bestSavingsPercentage) {
          bestSavingsPercentage = savingsPercentage;
          bestPackageId = creditsPackageListingData.id;
        }
      });
      return bestPackageId;
    },
    [suggestedPackage, creditsPackageListingDatas, savingsPercentages]
  );

  const renderPackages = (i18n: I18nType) => {
    if (error) {
      return (
        <PlaceholderError onRetry={fetchCreditsPackages}>
          <Trans>
            Can't load the credits packages. Verify your internet connection or
            retry later.
          </Trans>
        </PlaceholderError>
      );
    }
    if (!creditsPackageListingDatas) return <PlaceholderLoader />;

    return (
      <div className={classes.packages}>
        {creditsPackageListingDatas.map((creditsPackageListingData, index) => {
          const { id, name } = creditsPackageListingData;
          const creditsAmount = getCreditsAmountFromId(id);
          const isHighlighted = highlightedPackageId === id;
          const savingsPercentage = savingsPercentages[id];

          return (
            <div
              key={id}
              className={
                isHighlighted
                  ? `${classes.package} ${classes.highlightedPackage}`
                  : classes.package
              }
            >
              {isHighlighted && (
                <span className={classes.packageBadge}>
                  {suggestedPackage ? (
                    <Trans>Recommended</Trans>
                  ) : (
                    <Trans>Best value</Trans>
                  )}
                </span>
              )}
              <div className={classes.packageIconContainer}>
                {getIconFromIndex(index)}
              </div>
              <div className={classes.packageAmount}>
                {creditsAmount ? (
                  <>
                    <span className={classes.packageAmountNumber}>
                      {i18n.number(creditsAmount)}
                    </span>
                    <Text noMargin size="body-small" color="secondary">
                      <Trans>credits</Trans>
                    </Text>
                  </>
                ) : (
                  <span className={classes.packageAmountNumber}>{name}</span>
                )}
              </div>
              <div className={classes.packagePrice}>
                <Text noMargin size="sub-title">
                  {renderProductPrice({
                    productListingData: creditsPackageListingData,
                    usageType: 'default',
                    i18n,
                  })}
                </Text>
                {savingsPercentage ? (
                  <span className={classes.savingsChip}>
                    <Trans>Save {savingsPercentage}%</Trans>
                  </span>
                ) : null}
              </div>
              <div className={classes.packageValue}>
                <Text noMargin size="body-small" color="secondary">
                  {renderPackageValue({ creditsAmount, isAiFocused })}
                </Text>
              </div>
              {isHighlighted ? (
                <RaisedButton
                  color="premium"
                  fullWidth
                  label={<Trans>Purchase</Trans>}
                  onClick={() =>
                    setPurchasingCreditsPackageListingData(
                      creditsPackageListingData
                    )
                  }
                />
              ) : (
                <FlatButton
                  primary
                  fullWidth
                  label={<Trans>Purchase</Trans>}
                  onClick={() =>
                    setPurchasingCreditsPackageListingData(
                      creditsPackageListingData
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={null}
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
          <div className={classes.container}>
            <div className={classes.header}>
              <span className={classes.headerBadge}>
                <MultipleCoins fontSize="inherit" />
              </span>
              <div className={classes.headerTexts}>
                <span className={classes.overline}>
                  <Trans>GDevelop credits</Trans>
                </span>
                <Text noMargin size="section-title">
                  {isAiFocused ? (
                    <Trans>Keep building with the AI</Trans>
                  ) : (
                    <Trans>Get more credits</Trans>
                  )}
                </Text>
              </div>
              {availableCredits !== null && (
                <span className={classes.balanceChip}>
                  <Coin fontSize="inherit" />
                  <Text noMargin size="body-small" color="inherit">
                    <Trans>{i18n.number(availableCredits)} credits</Trans>
                  </Text>
                </span>
              )}
            </div>

            {!!missingCredits ? (
              <Text noMargin color="secondary">
                <Trans>
                  You're {missingCredits} credits short - top up your account to
                  purchase this item.
                </Trans>
              </Text>
            ) : (
              <Text noMargin color="secondary">
                {isAiFocused ? (
                  <Trans>
                    Credits are spent only when you use them, never expire, and
                    work everywhere in GDevelop.
                  </Trans>
                ) : (
                  <Trans>
                    One balance for everything: the asset store, the AI and
                    publishing your games. Credits never expire.
                  </Trans>
                )}
              </Text>
            )}

            {shouldShowCreditsUsages && (
              <div className={classes.usages}>
                {getCreditsUsages(isAiFocused).map(usage => (
                  <div key={usage.key} className={classes.usage}>
                    <span className={classes.usageIcon}>{usage.icon}</span>
                    <div className={classes.usageTexts}>
                      <Text noMargin size="body-small">
                        <b>{usage.title}</b>
                      </Text>
                      <Text noMargin size="body-small" color="secondary">
                        {usage.description}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {renderPackages(i18n)}

            <Text noMargin size="body-small" color="secondary">
              {showCalloutTip ? (
                <Trans>
                  Not sure how many credits you need? Check{' '}
                  <Link
                    href={CREDITS_GUIDE_URL}
                    onClick={() => Window.openExternalURL(CREDITS_GUIDE_URL)}
                  >
                    this guide
                  </Link>
                  . Follow GDevelop on socials and check your profile to get
                  free credits!
                </Trans>
              ) : (
                <Trans>
                  Not sure how many credits you need? Check{' '}
                  <Link
                    href={CREDITS_GUIDE_URL}
                    onClick={() => Window.openExternalURL(CREDITS_GUIDE_URL)}
                  >
                    this guide
                  </Link>
                  .
                </Trans>
              )}
            </Text>
          </div>
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
