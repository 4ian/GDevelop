// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  buyProductWithCredits,
  type PrivateAssetPackListingData,
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
  useResponsiveWindowWidth,
  type WidthType,
} from '../../UI/Reponsive/ResponsiveWindowMeasurer';
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

const cellSpacing = 8;

const getPackColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 2;
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
};

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  privateAssetPackListingDatasFromSameCreator?: ?Array<PrivateAssetPackListingData>,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onAssetPackOpen: (
    privateAssetPackListingData: PrivateAssetPackListingData,
    options?: {|
      forceProductPage?: boolean,
    |}
  ) => void,
  simulateAppStoreProduct?: boolean,
|};

const PrivateAssetPackInformationPage = ({
  privateAssetPackListingData,
  privateAssetPackListingDatasFromSameCreator,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
  onAssetPackOpen,
  simulateAppStoreProduct,
}: Props) => {
  const { id, name, sellerId } = privateAssetPackListingData;
  const { privateAssetPackListingDatas } = React.useContext(AssetStoreContext);
  const {
    receivedAssetPacks,
    profile,
    limits,
    assetPackPurchases,
    getAuthorizationHeader,
    onOpenLoginDialog,
  } = React.useContext(AuthenticatedUserContext);
  const { openCreditsPackageDialog, openCreditsUsageDialog } = React.useContext(
    CreditsPackageStoreContext
  );
  const [selectedUsageType, setSelectedUsageType] = React.useState<string>(
    privateAssetPackListingData.prices[0].usageType
  );
  const [assetPack, setAssetPack] = React.useState<?PrivateAssetPack>(null);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [
    openSellerPublicProfileDialog,
    setOpenSellerPublicProfileDialog,
  ] = React.useState<boolean>(false);
  const [
    sellerPublicProfile,
    setSellerPublicProfile,
  ] = React.useState<?UserPublicProfile>(null);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const windowWidth = useResponsiveWindowWidth();
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

        onOpenPurchaseDialog();
      } catch (e) {
        console.warn('Unable to send event', e);
      }
    },
    [
      assetPack,
      onOpenPurchaseDialog,
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
                  width={windowWidth === 'medium' ? 'small' : undefined}
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
                        cols={getPackColumns(windowWidth)}
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
                          cols={getPackColumns(windowWidth)}
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
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default PrivateAssetPackInformationPage;
