// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type PrivateAssetPackListingData } from '../../Utils/GDevelopServices/Shop';
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
import { Column, LargeSpacer, Line } from '../../UI/Grid';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../../Utils/GDevelopServices/User';
import PublicProfileDialog from '../../Profile/PublicProfileDialog';
import Link from '../../UI/Link';
import Mark from '../../UI/CustomSvgIcons/Mark';
import Cross from '../../UI/CustomSvgIcons/Cross';
import ResponsiveMediaGallery from '../../UI/ResponsiveMediaGallery';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import RaisedButton from '../../UI/RaisedButton';
import { sendAssetPackBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import Paper from '../../UI/Paper';
import Window from '../../Utils/Window';
import ScrollView from '../../UI/ScrollView';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import { formatProductPrice } from '../ProductPriceTag';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { AssetStoreContext } from '../AssetStoreContext';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import {
  getBundlesContainingProductTiles,
  getOtherProductsFromSameAuthorTiles,
  getProductsIncludedInBundleTiles,
} from '../ProductPageHelper';

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
};

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  privateAssetPackListingDatasFromSameCreator?: ?Array<PrivateAssetPackListingData>,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onAssetPackOpen: PrivateAssetPackListingData => void,
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
  const { receivedAssetPacks, authenticated } = React.useContext(
    AuthenticatedUserContext
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
  const isMobileScreen = windowWidth === 'small';

  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || simulateAppStoreProduct;

  const isAlreadyReceived =
    !!receivedAssetPacks &&
    !!receivedAssetPacks.find(
      assetPack => assetPack.id === privateAssetPackListingData.id
    );

  const packsIncludedInBundleTiles = React.useMemo(
    () =>
      getProductsIncludedInBundleTiles({
        product: assetPack,
        productListingDatas: privateAssetPackListingDatas,
        productListingData: privateAssetPackListingData,
        receivedProducts: receivedAssetPacks,
        onProductOpen: onAssetPackOpen,
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
        onProductOpen: onAssetPackOpen,
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
        onProductOpen: onAssetPackOpen,
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
    [id, sellerId, privateAssetPackListingData.appStoreProductId]
  );

  const onClickBuy = React.useCallback(
    async () => {
      if (!assetPack) return;
      if (isAlreadyReceived) {
        onAssetPackOpen(privateAssetPackListingData);
        return;
      }

      try {
        sendAssetPackBuyClicked({
          assetPackId: assetPack.id,
          assetPackName: assetPack.name,
          assetPackTag: assetPack.tag,
          assetPackKind: 'private',
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
    ]
  );

  const getBuyButton = i18n => {
    if (errorText) return null;

    const label = !assetPack ? (
      <Trans>Loading...</Trans>
    ) : isAlreadyReceived ? (
      <Trans>Explore assets</Trans>
    ) : isPurchaseDialogOpen ? (
      <Trans>Processing...</Trans>
    ) : (
      <Trans>
        Buy for{' '}
        {formatProductPrice({
          i18n,
          productListingData: privateAssetPackListingData,
        })}
      </Trans>
    );

    const disabled = !assetPack || isPurchaseDialogOpen;

    return (
      <Column noMargin alignItems="flex-end">
        <RaisedButton
          key="buy-asset-pack"
          primary
          label={label}
          onClick={onClickBuy}
          disabled={disabled}
          id="buy-asset-pack"
        />
        {shouldUseOrSimulateAppStoreProduct &&
          !isAlreadyReceived &&
          !authenticated && (
            <Text size="body-small">
              <Link onClick={onClickBuy} disabled={disabled} href="">
                <Trans>Restore a previous purchase</Trans>
              </Link>
            </Text>
          )}
      </Column>
    );
  };

  const mediaItems = assetPack
    ? [
        {
          kind: 'image',
          url:
            (shouldUseOrSimulateAppStoreProduct &&
              privateAssetPackListingData.appStoreThumbnailUrls &&
              privateAssetPackListingData.appStoreThumbnailUrls[0]) ||
            privateAssetPackListingData.thumbnailUrls[0],
        },
        ...assetPack.previewImageUrls
          .map(url => ({
            kind: 'image',
            url,
          }))
          .concat(
            assetPack.previewSoundUrls
              ? assetPack.previewSoundUrls.map(url => ({
                  kind: 'audio',
                  url,
                }))
              : []
          ),
      ]
    : [];

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
                <Column noMargin alignItems="flex-end">
                  <Text displayInlineAsSpan size="sub-title">
                    <Trans>by</Trans>{' '}
                    <Link
                      onClick={() => setOpenSellerPublicProfileDialog(true)}
                      href="#"
                    >
                      {sellerPublicProfile.username || ''}
                    </Link>
                  </Text>
                </Column>
                <ResponsiveLineStackLayout noColumnMargin noMargin>
                  <Column useFullHeight expand noMargin noOverflowParent>
                    <ResponsiveMediaGallery
                      mediaItems={mediaItems}
                      altTextTemplate={`Asset pack ${name} preview image or sound {mediaIndex}`}
                      horizontalOuterMarginToEatOnMobile={8}
                    />
                  </Column>
                  <ColumnStackLayout useFullHeight expand noMargin>
                    {isAlreadyReceived && (
                      <Column noMargin expand>
                        <AlertMessage kind="info">
                          <Trans>
                            You already own this asset pack. Explore the assets
                            to use them in your project.
                          </Trans>
                        </AlertMessage>
                      </Column>
                    )}
                    <Paper
                      variant="outlined"
                      style={{ padding: isMobileScreen ? 20 : 30 }}
                      background="medium"
                    >
                      <Column noMargin>
                        <Line
                          noMargin
                          expand
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text noMargin size="block-title">
                            {formatProductPrice({
                              i18n,
                              productListingData: privateAssetPackListingData,
                            })}
                          </Text>
                          {getBuyButton(i18n)}
                        </Line>
                        <Text size="body2" displayInlineAsSpan>
                          <MarkdownText
                            source={assetPack.longDescription}
                            allowParagraphs
                          />
                        </Text>
                        <ResponsiveLineStackLayout noMargin noColumnMargin>
                          <Column noMargin expand>
                            <Text size="sub-title">
                              <Trans>Content</Trans>
                            </Text>
                            {sortedContentType.map(type => {
                              if (assetPack.content[type]) {
                                return (
                                  <li key={type}>
                                    <Text displayInlineAsSpan noMargin>
                                      {assetPack.content[type]}{' '}
                                      {i18n._(
                                        contentTypeToMessageDescriptor[type]
                                      )}
                                    </Text>
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </Column>
                          <Column noMargin expand>
                            <Text size="sub-title">
                              <Trans>Licensing</Trans>
                            </Text>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Personal projects</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Professional projects</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Asset modification</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Cross
                                fontSize="small"
                                style={styles.disabledText}
                              />
                              <Text
                                displayInlineAsSpan
                                noMargin
                                style={styles.disabledText}
                              >
                                <Trans>Redistribution &amp; reselling</Trans>
                              </Text>
                            </LineStackLayout>
                            <Line noMargin>
                              <Text>
                                <Link
                                  onClick={() =>
                                    Window.openExternalURL(
                                      'https://gdevelop.io/page/asset-store-license-agreement'
                                    )
                                  }
                                  href="https://gdevelop.io/page/asset-store-license-agreement"
                                >
                                  <Trans>See details here</Trans>
                                </Link>
                              </Text>
                            </Line>
                          </Column>
                        </ResponsiveLineStackLayout>
                      </Column>
                    </Paper>
                  </ColumnStackLayout>
                </ResponsiveLineStackLayout>
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
