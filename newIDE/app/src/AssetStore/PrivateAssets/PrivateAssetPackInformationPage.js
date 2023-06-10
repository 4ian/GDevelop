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
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { ResponsiveLineStackLayout, LineStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../../Utils/GDevelopServices/User';
import PublicProfileDialog from '../../Profile/PublicProfileDialog';
import Link from '../../UI/Link';
import Mark from '../../UI/CustomSvgIcons/Mark';
import Cross from '../../UI/CustomSvgIcons/Cross';
import ResponsiveMediaGallery from '../../UI/ResponsiveMediaGallery';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import RaisedButton from '../../UI/RaisedButton';
import { sendAssetPackBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import Paper from '../../UI/Paper';
import Window from '../../Utils/Window';
import ScrollView from '../../UI/ScrollView';
import { PrivateAssetPackTile } from '../AssetsHome';
import {
  purchaseAppStoreProduct,
  shouldUseAppStoreProduct,
} from '../../Utils/AppStorePurchases';
import { formatPrivateAssetPackPrice } from './PrivateAssetPackPriceTag';

const sameCreatorPackCountForSmallWindow = 2;
const sameCreatorPackCountForMediumWindow = 3;
const sameCreatorPackCount = 4;
const cellSpacing = 2;

const sortedContentType = [
  'sprite',
  '9patch',
  'tiled',
  'particleEmitter',
  'font',
  'audio',
  'partial',
];

const contentTypeToMessageDescriptor = {
  sprite: t`Sprites`,
  '9patch': t`Panel sprites`,
  tiled: t`Tiled sprites`,
  particleEmitter: t`Particle emitters`,
  font: t`Fonts`,
  audio: t`Audios`,
  partial: t`Other`,
};

const styles = {
  disabledText: { opacity: 0.6 },
  scrollview: { overflowX: 'hidden' },
};

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  privateAssetPacksFromSameCreatorListingData?: ?Array<PrivateAssetPackListingData>,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onAssetPackOpen: PrivateAssetPackListingData => void,
|};

const PrivateAssetPackInformationPage = ({
  privateAssetPackListingData,
  privateAssetPacksFromSameCreatorListingData,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
  onAssetPackOpen,
}: Props) => {
  const { id, name, sellerId } = privateAssetPackListingData;
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
  const [
    appStoreProductBeingBought,
    setAppStoreProductBeingBought,
  ] = React.useState(false);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const windowWidth = useResponsiveWindowWidth();

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
          if (error.response && error.response.status === 404) {
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

  const onClickBuy = async () => {
    if (!assetPack) return;
    try {
      sendAssetPackBuyClicked({
        assetPackId: assetPack.id,
        assetPackName: assetPack.name,
        assetPackTag: assetPack.tag,
        assetPackKind: 'private',
      });

      if (shouldUseAppStoreProduct()) {
        try {
          setAppStoreProductBeingBought(true);
          await purchaseAppStoreProduct(
            privateAssetPackListingData.appStoreProductId
          );
        } finally {
          setAppStoreProductBeingBought(false);
        }
      } else {
        onOpenPurchaseDialog();
      }
    } catch (e) {
      console.warn('Unable to send event', e);
    }
  };

  const getBuyButton = i18n => {
    if (errorText) return null;

    const label = !assetPack ? (
      <Trans>Loading...</Trans>
    ) : isPurchaseDialogOpen || appStoreProductBeingBought ? (
      <Trans>Processing...</Trans>
    ) : (
      <Trans>
        Buy for{' '}
        {formatPrivateAssetPackPrice({ i18n, privateAssetPackListingData })}
      </Trans>
    );

    const disabled =
      !assetPack || isPurchaseDialogOpen || appStoreProductBeingBought;

    return (
      <RaisedButton
        key="buy-asset-pack"
        primary
        label={label}
        onClick={onClickBuy}
        disabled={disabled}
        id="buy-asset-pack"
      />
    );
  };

  const mediaItems = assetPack
    ? assetPack.previewImageUrls
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
        )
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
                  <Column useFullHeight expand noMargin>
                    <Paper
                      variant="outlined"
                      style={{ padding: windowWidth === 'small' ? 20 : 30 }}
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
                            {formatPrivateAssetPackPrice({
                              i18n,
                              privateAssetPackListingData,
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
                  </Column>
                </ResponsiveLineStackLayout>
                {privateAssetPacksFromSameCreatorListingData &&
                // Only display packs if there are at least 2. If there is only one,
                // it means it's the same as the one currently opened.
                privateAssetPacksFromSameCreatorListingData.length >= 2 ? (
                  <>
                    <Line>
                      <Text size="block-title">
                        <Trans>From the same author</Trans>
                      </Text>
                    </Line>
                    <Line>
                      <GridList
                        cols={
                          windowWidth === 'small'
                            ? sameCreatorPackCountForSmallWindow
                            : windowWidth === 'medium'
                            ? sameCreatorPackCountForMediumWindow
                            : sameCreatorPackCount
                        }
                        cellHeight="auto"
                        spacing={cellSpacing}
                      >
                        {privateAssetPacksFromSameCreatorListingData.map(
                          pack => (
                            <PrivateAssetPackTile
                              assetPackListingData={pack}
                              key={pack.id}
                              onSelect={() => onAssetPackOpen(pack)}
                              owned={false}
                            />
                          )
                        )}
                      </GridList>
                      <Grid />
                    </Line>
                  </>
                ) : null}
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
