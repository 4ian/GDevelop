// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  buyProductWithCredits,
  redeemPrivateAssetPack,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type BundleListingData,
  getCalloutToGetSubscriptionOrClaimAssetPack,
} from '../../Utils/GDevelopServices/Shop';
import type { MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import {
  getPrivateAssetPack,
  type PrivateAssetPack,
  type PrivateAssetPackAssetType,
} from '../../Utils/GDevelopServices/Asset';
import Text from '../../UI/Text';
import { t, Trans } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import {
  ResponsiveLineStackLayout,
  LineStackLayout,
  ColumnStackLayout,
} from '../../UI/Layout';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../../Utils/GDevelopServices/User';
import Link from '../../UI/Link';
import ResponsiveMediaGallery from '../../UI/ResponsiveMediaGallery';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { sendAssetPackBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import ScrollView from '../../UI/ScrollView';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { AssetStoreContext } from '../AssetStoreContext';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import {
  getBundlesContainingProductTiles,
  getOtherProductsFromSameAuthorTiles,
  getProductMediaItems,
  getProductsIncludedInBundleTiles,
  getUserProductPurchaseUsageType,
  OpenProductButton,
  PurchaseProductButtons,
} from '../ProductPageHelper';
import { CreditsPackageStoreContext } from '../CreditsPackages/CreditsPackageStoreContext';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import SecureCheckout from '../SecureCheckout/SecureCheckout';
import ProductLicenseOptions from '../ProductLicense/ProductLicenseOptions';
import HelpIcon from '../../UI/HelpIcon';
import Avatar from '@material-ui/core/Avatar';
import { SubscriptionSuggestionContext } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import PasswordPromptDialog from '../PasswordPromptDialog';
import Window from '../../Utils/Window';
import RaisedButton from '../../UI/RaisedButton';
import PrivateAssetPackPurchaseDialog from './PrivateAssetPackPurchaseDialog';
import PublicProfileContext from '../../Profile/PublicProfileContext';
import { LARGE_WIDGET_SIZE } from '../../MainFrame/EditorContainers/HomePage/CardWidget';
import { BundleStoreContext } from '../Bundles/BundleStoreContext';

const cellSpacing = 10;

const getPackColumns = (windowSize: WindowSizeType, isLandscape: boolean) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};

const sortedContentType: PrivateAssetPackAssetType[] = [
  'sprite',
  '9patch',
  'tiled',
  'Scene3D::Model3DObject',
  'TileMap::SimpleTileMap',
  'ParticleSystem::ParticleEmitter',
  'font',
  'bitmapFont',
  'audio',
];

const contentTypeToMessageDescriptor: {
  [PrivateAssetPackAssetType]: MessageDescriptor,
} = {
  sprite: t`sprites`,
  '9patch': t`panel sprites`,
  tiled: t`tiled sprites`,
  'Scene3D::Model3DObject': t`3D models`,
  'TileMap::SimpleTileMap': t`tile maps`,
  'ParticleSystem::ParticleEmitter': t`particle emitters`,
  font: t`fonts`,
  bitmapFont: t`bitmap fonts`,
  audio: t`audios`,
};

const MAX_COLUMNS = getPackColumns('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const styles = {
  disabledText: { opacity: 0.6 },
  scrollview: { overflowX: 'hidden' },
  grid: {
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
    width: `calc(100% + ${cellSpacing}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
  },
  leftColumnContainer: {
    flex: 3,
    minWidth: 0, // This is needed for the container to take the right size.
  },
  rightColumnContainer: {
    flex: 2,
  },
  leftColumnContainerMobile: {
    flex: 1,
    minWidth: 0, // This is needed for the container to take the right size.
  },
  rightColumnContainerMobile: {
    flex: 1,
  },
  avatar: {
    width: 20,
    height: 20,
  },
  ownedTag: {
    padding: '4px 8px',
    borderRadius: 4,
    color: 'black',
  },
  redeemConditionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#FF8569',
    color: '#1D1D26',
  },
  redeemDiamondIcon: { height: 24 },
};

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  privateAssetPackListingDatasFromSameCreator?: ?Array<PrivateAssetPackListingData>,
  onAssetPackOpen: (
    privateAssetPackListingData: PrivateAssetPackListingData,
    options?: {|
      forceProductPage?: boolean,
    |}
  ) => void,
  onGameTemplateOpen: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onBundleOpen: (bundleListingData: BundleListingData) => void,
  simulateAppStoreProduct?: boolean,
|};

const PrivateAssetPackInformationPage = ({
  privateAssetPackListingData,
  privateAssetPackListingDatasFromSameCreator,
  onAssetPackOpen,
  onGameTemplateOpen,
  onBundleOpen,
  simulateAppStoreProduct,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const { id, name, sellerId } = privateAssetPackListingData;
  const { privateAssetPackListingDatas } = React.useContext(AssetStoreContext);
  const { bundleListingDatas } = React.useContext(BundleStoreContext);
  const { showAlert } = useAlertDialog();
  const {
    receivedAssetPacks,
    receivedBundles,
    profile,
    limits,
    assetPackPurchases,
    bundlePurchases,
    getAuthorizationHeader,
    onOpenLoginDialog,
    subscription,
    onPurchaseSuccessful,
    onRefreshAssetPackPurchases,
  } = React.useContext(AuthenticatedUserContext);
  const { openCreditsPackageDialog, openCreditsUsageDialog } = React.useContext(
    CreditsPackageStoreContext
  );
  const [selectedUsageType, setSelectedUsageType] = React.useState<string>(
    privateAssetPackListingData.prices[0].usageType
  );
  const [
    purchasingPrivateAssetPackListingData,
    setPurchasingPrivateAssetPackListingData,
  ] = React.useState<?PrivateAssetPackListingData>(null);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const [assetPack, setAssetPack] = React.useState<?PrivateAssetPack>(null);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [isRedeemingProduct, setIsRedeemingProduct] = React.useState<boolean>(
    false
  );
  const { openUserPublicProfile } = React.useContext(PublicProfileContext);
  const [
    sellerPublicProfile,
    setSellerPublicProfile,
  ] = React.useState<?UserPublicProfile>(null);
  const [displayPasswordPrompt, setDisplayPasswordPrompt] = React.useState<
    'redeem' | 'credits' | null
  >(null);
  const [password, setPassword] = React.useState<string>('');
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const { isLandscape, isMediumScreen, windowSize } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || simulateAppStoreProduct;

  const userAssetPackPurchaseUsageType = React.useMemo(
    () =>
      getUserProductPurchaseUsageType({
        productId: privateAssetPackListingData
          ? privateAssetPackListingData.id
          : null,
        receivedProducts: [
          ...(receivedAssetPacks || []),
          ...(receivedBundles || []),
        ],
        productPurchases: [
          ...(assetPackPurchases || []),
          ...(bundlePurchases || []),
        ],
        allProductListingDatas: [
          ...(privateAssetPackListingDatas || []),
          ...(bundleListingDatas || []),
        ],
      }),
    [
      assetPackPurchases,
      bundlePurchases,
      privateAssetPackListingData,
      privateAssetPackListingDatas,
      bundleListingDatas,
      receivedAssetPacks,
      receivedBundles,
    ]
  );
  const isAlreadyReceived = !!userAssetPackPurchaseUsageType;

  const packsIncludedInBundleTiles = React.useMemo(
    () =>
      getProductsIncludedInBundleTiles({
        product: assetPack,
        productListingDatas: [...(privateAssetPackListingDatas || [])],
        productListingData: privateAssetPackListingData,
        receivedProducts: [...(receivedAssetPacks || [])],
        onPrivateAssetPackOpen: product =>
          onAssetPackOpen(product, { forceProductPage: true }),
        onPrivateGameTemplateOpen: onGameTemplateOpen,
        onBundleOpen,
      }),
    [
      assetPack,
      privateAssetPackListingDatas,
      receivedAssetPacks,
      onAssetPackOpen,
      onGameTemplateOpen,
      onBundleOpen,
      privateAssetPackListingData,
    ]
  );

  const bundlesContainingPackTiles = React.useMemo(
    () =>
      getBundlesContainingProductTiles({
        product: assetPack,
        productListingData: privateAssetPackListingData,
        productListingDatas: [
          ...(privateAssetPackListingDatas || []),
          ...(bundleListingDatas || []),
        ],
        receivedProducts: [
          ...(receivedAssetPacks || []),
          ...(receivedBundles || []),
        ],
        onPrivateAssetPackOpen: product =>
          onAssetPackOpen(product, { forceProductPage: true }),
        onPrivateGameTemplateOpen: onGameTemplateOpen,
        onBundleOpen,
      }),
    [
      assetPack,
      privateAssetPackListingData,
      privateAssetPackListingDatas,
      bundleListingDatas,
      receivedAssetPacks,
      receivedBundles,
      onAssetPackOpen,
      onGameTemplateOpen,
      onBundleOpen,
    ]
  );

  const otherPacksFromTheSameAuthorTiles = React.useMemo(
    () =>
      getOtherProductsFromSameAuthorTiles({
        otherProductListingDatasFromSameCreator: privateAssetPackListingDatasFromSameCreator,
        currentProductListingData: privateAssetPackListingData,
        receivedProducts: receivedAssetPacks,
        onProductOpen: product =>
          onAssetPackOpen(product, { forceProductPage: true }),
      }),
    [
      privateAssetPackListingData,
      privateAssetPackListingDatasFromSameCreator,
      onAssetPackOpen,
      receivedAssetPacks,
    ]
  );

  const onWillRedeemAssetPack = () => {
    // Password is required in dev environment only so that one cannot freely claim asset packs.
    if (Window.isDev()) setDisplayPasswordPrompt('redeem');
    else onRedeemAssetPack();
  };

  const onWillBuyWithCredits = () => {
    // Password is required in dev environment only so that one cannot freely claim asset packs.
    if (Window.isDev()) setDisplayPasswordPrompt('credits');
    else onClickBuyWithCredits();
  };

  const onRedeemAssetPack = React.useCallback(
    async () => {
      if (!profile || isRedeemingProduct) return;
      setIsRedeemingProduct(true);
      try {
        await redeemPrivateAssetPack({
          privateAssetPackListingData,
          getAuthorizationHeader,
          userId: profile.id,
          password,
        });
        await Promise.all([
          onRefreshAssetPackPurchases(),
          onPurchaseSuccessful(),
        ]);
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 402 &&
          extractedStatusAndCode.code ===
            'product-redemption/old-redeemed-subscription'
        ) {
          await showAlert({
            title: t`Error when claiming asset pack`,
            message: t`The monthly free asset pack perk was not part of your plan at the time you got your subscription to GDevelop. To enjoy this perk, please purchase a new subscription.`,
          });
        } else {
          console.error(
            'An error occurred when claiming the asset pack:',
            extractedStatusAndCode
          );
          await showAlert({
            title: t`Error when claiming asset pack`,
            message: t`Something wrong happened when claiming the asset pack. Please check your internet connection or try again later.`,
          });
        }
      } finally {
        setIsRedeemingProduct(false);
      }
    },
    [
      privateAssetPackListingData,
      getAuthorizationHeader,
      profile,
      showAlert,
      password,
      onPurchaseSuccessful,
      isRedeemingProduct,
      onRefreshAssetPackPurchases,
    ]
  );

  React.useEffect(
    () => {
      (async () => {
        setIsFetching(true);
        try {
          const [assetPack, profile] = await Promise.all([
            getPrivateAssetPack(id),
            getUserPublicProfile(sellerId),
          ]);

          setAssetPack(assetPack);
          setSellerPublicProfile(profile);
        } catch (error) {
          const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
            error
          );
          if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
            setErrorText(
              <Trans>
                Asset pack not found - An error occurred, please try again
                later.
              </Trans>
            );
          } else {
            setErrorText(
              <Trans>An error occurred, please try again later.</Trans>
            );
          }
        } finally {
          setIsFetching(false);
        }
      })();
    },
    [id, sellerId]
  );

  const onClickBuy = React.useCallback(
    async () => {
      if (!assetPack) return;
      if (isAlreadyReceived) {
        onAssetPackOpen(privateAssetPackListingData);
        return;
      }

      try {
        const price = privateAssetPackListingData.prices.find(
          price => price.usageType === selectedUsageType
        );
        sendAssetPackBuyClicked({
          assetPackId: assetPack.id,
          assetPackName: assetPack.name,
          assetPackTag: assetPack.tag,
          assetPackKind: 'private',
          usageType: selectedUsageType,
          currency: price ? price.currency : undefined,
        });

        setPurchasingPrivateAssetPackListingData(privateAssetPackListingData);
      } catch (e) {
        console.warn('Unable to send event', e);
      }
    },
    [
      assetPack,
      privateAssetPackListingData,
      isAlreadyReceived,
      onAssetPackOpen,
      selectedUsageType,
    ]
  );

  const onClickBuyWithCredits = React.useCallback(
    async () => {
      if (!privateAssetPackListingData || !assetPack) return;

      if (!profile || !limits) {
        // User not logged in, suggest to log in.
        onOpenLoginDialog();
        return;
      }

      if (isAlreadyReceived) {
        onAssetPackOpen(privateAssetPackListingData);
        return;
      }

      sendAssetPackBuyClicked({
        assetPackId: assetPack.id,
        assetPackName: assetPack.name,
        assetPackTag: assetPack.tag,
        assetPackKind: 'private',
        currency: 'CREDITS',
        usageType: selectedUsageType,
      });

      const currentCreditsAmount = limits.credits.userBalance.amount;
      const assetPackPriceForUsageType = privateAssetPackListingData.creditPrices.find(
        price => price.usageType === selectedUsageType
      );
      if (!assetPackPriceForUsageType) {
        console.error(
          'Unable to find the price for the selected usage type',
          selectedUsageType
        );
        return;
      }
      const assetPackCreditsAmount = assetPackPriceForUsageType.amount;
      if (currentCreditsAmount < assetPackCreditsAmount) {
        openCreditsPackageDialog({
          missingCredits: assetPackCreditsAmount - currentCreditsAmount,
        });
        return;
      }

      openCreditsUsageDialog({
        title: <Trans>Purchase {assetPack.name}</Trans>,
        message: (
          <Trans>
            You are about to use {assetPackCreditsAmount} credits to purchase
            the asset pack {assetPack.name}. Continue?
          </Trans>
        ),
        onConfirm: () =>
          buyProductWithCredits(getAuthorizationHeader, {
            productId: privateAssetPackListingData.id,
            usageType: selectedUsageType,
            userId: profile.id,
            password,
          }),
        successMessage: <Trans>🎉 You can now use your assets!</Trans>,
      });
    },
    [
      profile,
      limits,
      privateAssetPackListingData,
      assetPack,
      onAssetPackOpen,
      isAlreadyReceived,
      openCreditsPackageDialog,
      selectedUsageType,
      openCreditsUsageDialog,
      getAuthorizationHeader,
      onOpenLoginDialog,
      password,
    ]
  );

  const mediaItems = React.useMemo(
    () =>
      getProductMediaItems({
        product: assetPack,
        productListingData: privateAssetPackListingData,
        shouldSimulateAppStoreProduct: simulateAppStoreProduct,
      }),
    [assetPack, privateAssetPackListingData, simulateAppStoreProduct]
  );

  const calloutToGetSubscriptionOrClaimAssetPack = getCalloutToGetSubscriptionOrClaimAssetPack(
    { subscription, privateAssetPackListingData, isAlreadyReceived }
  );

  const smartObjectsCount = React.useMemo(
    () => {
      if (!assetPack) {
        return 0;
      }
      let smartObjectsCount = 0;
      for (const type in assetPack.content) {
        const assetCount = assetPack.content[type];
        if (!sortedContentType.includes(type)) {
          smartObjectsCount += assetCount;
        }
      }
      return smartObjectsCount;
    },
    [assetPack]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          {errorText ? (
            <Line alignItems="center" justifyContent="center" expand>
              <AlertMessage kind="error">{errorText}</AlertMessage>
            </Line>
          ) : isFetching ? (
            <Column expand>
              <PlaceholderLoader />
            </Column>
          ) : assetPack && sellerPublicProfile ? (
            <Column noOverflowParent expand noMargin>
              <ScrollView autoHideScrollbar style={styles.scrollview}>
                <ResponsiveLineStackLayout
                  noColumnMargin
                  noMargin
                  // Force the columns to wrap on tablets and small screens.
                  forceMobileLayout={isMediumScreen}
                  // Prevent it to wrap when in landscape mode on small screens.
                  noResponsiveLandscape
                >
                  <div
                    style={
                      isMobile
                        ? styles.leftColumnContainerMobile
                        : styles.leftColumnContainer
                    }
                  >
                    <ResponsiveMediaGallery
                      mediaItems={mediaItems}
                      altTextTemplate={`Asset pack ${name} preview image or sound {mediaIndex}`}
                      horizontalOuterMarginToEatOnMobile={8}
                    />
                  </div>
                  <div
                    style={
                      isMobile
                        ? styles.rightColumnContainerMobile
                        : styles.rightColumnContainer
                    }
                  >
                    <ColumnStackLayout>
                      <LineStackLayout
                        noMargin
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text noMargin size="title">
                          {assetPack.name}
                        </Text>
                        {isAlreadyReceived && (
                          <div
                            style={{
                              ...styles.ownedTag,
                              backgroundColor:
                                gdevelopTheme.statusIndicator.success,
                            }}
                          >
                            <Text color="inherit" noMargin>
                              <Trans>OWNED</Trans>
                            </Text>
                          </div>
                        )}
                      </LineStackLayout>
                      <LineStackLayout noMargin alignItems="center">
                        <Avatar
                          src={sellerPublicProfile.iconUrl}
                          style={styles.avatar}
                        />
                        <Text displayInlineAsSpan size="sub-title">
                          <Link
                            onClick={() =>
                              openUserPublicProfile({
                                userId: sellerPublicProfile.id,
                                callbacks: {
                                  onAssetPackOpen,
                                  onGameTemplateOpen,
                                },
                              })
                            }
                            href="#"
                          >
                            {sellerPublicProfile.username || ''}
                          </Link>
                        </Text>
                      </LineStackLayout>
                      {calloutToGetSubscriptionOrClaimAssetPack && (
                        <div style={styles.redeemConditionsContainer}>
                          <Line noMargin alignItems="center">
                            <img
                              src="res/small-diamond.svg"
                              style={styles.redeemDiamondIcon}
                              alt="diamond"
                            />
                            <Text color="inherit" noMargin>
                              {calloutToGetSubscriptionOrClaimAssetPack.message}
                            </Text>
                          </Line>
                          <Spacer />
                          {calloutToGetSubscriptionOrClaimAssetPack.actionLabel && (
                            <div style={{ flexShrink: 0 }}>
                              <RaisedButton
                                primary
                                label={
                                  isRedeemingProduct ? (
                                    <Trans>Please wait</Trans>
                                  ) : (
                                    calloutToGetSubscriptionOrClaimAssetPack.actionLabel
                                  )
                                }
                                disabled={isRedeemingProduct}
                                onClick={
                                  calloutToGetSubscriptionOrClaimAssetPack.canRedeemAssetPack
                                    ? onWillRedeemAssetPack
                                    : () =>
                                        openSubscriptionDialog({
                                          analyticsMetadata: {
                                            reason: 'Claim asset pack',
                                            recommendedPlanId: 'gdevelop_gold',
                                            placementId: 'claim-asset-pack',
                                          },
                                          filter: 'individual',
                                        })
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <Line noMargin>
                        <Text size="sub-title">
                          <Trans>Licensing</Trans>
                        </Text>
                        <HelpIcon
                          size="small"
                          helpPagePath="https://gdevelop.io/page/asset-store-license-agreement"
                        />
                      </Line>
                      <ProductLicenseOptions
                        value={selectedUsageType}
                        onChange={setSelectedUsageType}
                        product={privateAssetPackListingData}
                        ownedLicense={userAssetPackPurchaseUsageType}
                      />
                      <Spacer />
                      {isAlreadyReceived ? (
                        <OpenProductButton
                          productListingData={privateAssetPackListingData}
                          onClick={() =>
                            onAssetPackOpen(privateAssetPackListingData)
                          }
                          label={<Trans>Browse assets</Trans>}
                        />
                      ) : (
                        <>
                          {!shouldUseOrSimulateAppStoreProduct && (
                            <SecureCheckout />
                          )}
                          {!errorText && (
                            <PurchaseProductButtons
                              i18n={i18n}
                              productListingData={privateAssetPackListingData}
                              selectedUsageType={selectedUsageType}
                              onUsageTypeChange={setSelectedUsageType}
                              simulateAppStoreProduct={simulateAppStoreProduct}
                              isAlreadyReceived={isAlreadyReceived}
                              onClickBuy={onClickBuy}
                              onClickBuyWithCredits={onWillBuyWithCredits}
                            />
                          )}
                        </>
                      )}
                    </ColumnStackLayout>
                  </div>
                </ResponsiveLineStackLayout>
                <Column noMargin>
                  <Text size="body2" displayInlineAsSpan>
                    <MarkdownText
                      source={assetPack.longDescription}
                      allowParagraphs
                    />
                  </Text>
                  <Text size="sub-title">
                    <Trans>Content</Trans>
                  </Text>
                  {sortedContentType.map(type => {
                    if (assetPack.content[type]) {
                      return (
                        <li key={type}>
                          <Text displayInlineAsSpan noMargin>
                            {assetPack.content[type]}{' '}
                            {i18n._(contentTypeToMessageDescriptor[type])}
                          </Text>
                        </li>
                      );
                    }
                    return null;
                  })}
                  {smartObjectsCount > 0 ? (
                    <li>
                      <Text displayInlineAsSpan noMargin>
                        <Trans>{smartObjectsCount} smart objects</Trans>
                      </Text>
                    </li>
                  ) : null}
                </Column>
                {bundlesContainingPackTiles &&
                bundlesContainingPackTiles.length ? (
                  <>
                    <ColumnStackLayout noMargin>
                      <LargeSpacer />
                      {bundlesContainingPackTiles}
                      <LargeSpacer />
                    </ColumnStackLayout>
                  </>
                ) : null}
                {packsIncludedInBundleTiles && (
                  <>
                    <Line>
                      <Text size="block-title">
                        <Trans>Included in this bundle</Trans>
                      </Text>
                    </Line>
                    <Line>
                      <GridList
                        cols={getPackColumns(windowSize, isLandscape)}
                        cellHeight="auto"
                        spacing={cellSpacing}
                        style={styles.grid}
                      >
                        {packsIncludedInBundleTiles}
                      </GridList>
                    </Line>
                  </>
                )}
                {otherPacksFromTheSameAuthorTiles &&
                  otherPacksFromTheSameAuthorTiles.length > 0 && (
                    <>
                      <Line>
                        <Text size="block-title">
                          <Trans>From the same author</Trans>
                        </Text>
                      </Line>
                      <Line>
                        <GridList
                          cols={getPackColumns(windowSize, isLandscape)}
                          cellHeight="auto"
                          spacing={cellSpacing}
                          style={styles.grid}
                        >
                          {otherPacksFromTheSameAuthorTiles}
                        </GridList>
                      </Line>
                    </>
                  )}
              </ScrollView>
            </Column>
          ) : null}
          {displayPasswordPrompt && (
            <PasswordPromptDialog
              onApply={
                displayPasswordPrompt === 'redeem'
                  ? onWillRedeemAssetPack
                  : onClickBuyWithCredits
              }
              onClose={() => setDisplayPasswordPrompt(null)}
              passwordValue={password}
              setPasswordValue={setPassword}
            />
          )}
          {!!purchasingPrivateAssetPackListingData && (
            <PrivateAssetPackPurchaseDialog
              privateAssetPackListingData={
                purchasingPrivateAssetPackListingData
              }
              usageType={selectedUsageType}
              onClose={() => setPurchasingPrivateAssetPackListingData(null)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default PrivateAssetPackInformationPage;
