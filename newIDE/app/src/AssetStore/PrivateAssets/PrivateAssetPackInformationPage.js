// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  buyProductWithCredits,
  redeemPrivateAssetPack,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  getCalloutToGetSubscriptionOrClaimAssetPack,
} from '../../Utils/GDevelopServices/Shop';
import {
  getPrivateAssetPack,
  type PrivateAssetPack,
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
import PublicProfileDialog from '../../Profile/PublicProfileDialog';
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

const cellSpacing = 8;

const getPackColumns = (windowSize: WindowSizeType, isLandscape: boolean) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 5;
    default:
      return 3;
  }
};

const sortedContentType = [
  'sprite',
  '9patch',
  'tiled',
  'particleEmitter',
  'font',
  'audio',
  'Scene3D::Model3DObject',
  'partial',
];

const contentTypeToMessageDescriptor = {
  sprite: t`Sprites`,
  '9patch': t`Panel sprites`,
  tiled: t`Tiled sprites`,
  'Scene3D::Model3DObject': t`3D model`,
  particleEmitter: t`Particle emitters`,
  font: t`Fonts`,
  audio: t`Audios`,
  partial: t`Other`,
};

const styles = {
  disabledText: { opacity: 0.6 },
  scrollview: { overflowX: 'hidden' },
  grid: {
    margin: '0 2px', // Remove the default margin of the grid but keep the horizontal padding for focus outline.
  },
  leftColumnContainer: {
    flex: 3,
    minWidth: 0, // This is needed for the container to take the right size.
  },
  rightColumnContainer: {
    flex: 2,
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
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    options?: {|
      forceProductPage?: boolean,
    |}
  ) => void,
  simulateAppStoreProduct?: boolean,
|};

const PrivateAssetPackInformationPage = ({
  privateAssetPackListingData,
  privateAssetPackListingDatasFromSameCreator,
  onAssetPackOpen,
  onGameTemplateOpen,
  simulateAppStoreProduct,
}: Props) => {
  const { id, name, sellerId } = privateAssetPackListingData;
  const { privateAssetPackListingDatas } = React.useContext(AssetStoreContext);
  const { showAlert } = useAlertDialog();
  const {
    receivedAssetPacks,
    profile,
    limits,
    assetPackPurchases,
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
  const [
    openSellerPublicProfileDialog,
    setOpenSellerPublicProfileDialog,
  ] = React.useState<boolean>(false);
  const [
    sellerPublicProfile,
    setSellerPublicProfile,
  ] = React.useState<?UserPublicProfile>(null);
  const [
    displayPasswordPrompt,
    setDisplayPasswordPrompt,
  ] = React.useState<boolean>(false);
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
        receivedProducts: receivedAssetPacks,
        productPurchases: assetPackPurchases,
        allProductListingDatas: privateAssetPackListingDatas,
      }),
    [
      assetPackPurchases,
      privateAssetPackListingData,
      privateAssetPackListingDatas,
      receivedAssetPacks,
    ]
  );
  const isAlreadyReceived = !!userAssetPackPurchaseUsageType;

  const packsIncludedInBundleTiles = React.useMemo(
    () =>
      getProductsIncludedInBundleTiles({
        product: assetPack,
        productListingDatas: privateAssetPackListingDatas,
        productListingData: privateAssetPackListingData,
        receivedProducts: receivedAssetPacks,
        onProductOpen: product =>
          onAssetPackOpen(product, { forceProductPage: true }),
      }),
    [
      assetPack,
      privateAssetPackListingDatas,
      receivedAssetPacks,
      onAssetPackOpen,
      privateAssetPackListingData,
    ]
  );

  const bundlesContainingPackTiles = React.useMemo(
    () =>
      getBundlesContainingProductTiles({
        product: assetPack,
        productListingDatas: privateAssetPackListingDatas,
        receivedProducts: receivedAssetPacks,
        onProductOpen: product =>
          onAssetPackOpen(product, { forceProductPage: true }),
      }),
    [
      assetPack,
      privateAssetPackListingDatas,
      receivedAssetPacks,
      onAssetPackOpen,
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
    if (Window.isDev()) setDisplayPasswordPrompt(true);
    else onRedeemAssetPack();
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
                  <div style={styles.leftColumnContainer}>
                    <ResponsiveMediaGallery
                      mediaItems={mediaItems}
                      altTextTemplate={`Asset pack ${name} preview image or sound {mediaIndex}`}
                      horizontalOuterMarginToEatOnMobile={8}
                    />
                  </div>
                  <div style={styles.rightColumnContainer}>
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
                              setOpenSellerPublicProfileDialog(true)
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
                              onClickBuyWithCredits={onClickBuyWithCredits}
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
                        spacing={cellSpacing / 2}
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
                          spacing={cellSpacing / 2}
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
          {openSellerPublicProfileDialog && (
            <PublicProfileDialog
              userId={sellerId}
              onClose={() => setOpenSellerPublicProfileDialog(false)}
              onAssetPackOpen={assetPackListingData => {
                onAssetPackOpen(assetPackListingData);
                setOpenSellerPublicProfileDialog(false);
              }}
              onGameTemplateOpen={gameTemplateListingData => {
                onGameTemplateOpen(gameTemplateListingData);
                setOpenSellerPublicProfileDialog(false);
              }}
            />
          )}
          {displayPasswordPrompt && (
            <PasswordPromptDialog
              onApply={onRedeemAssetPack}
              onClose={() => setDisplayPasswordPrompt(false)}
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
