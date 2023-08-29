// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import {
  getPrivateGameTemplate,
  type PrivateGameTemplate,
} from '../../Utils/GDevelopServices/Asset';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import {
  ResponsiveLineStackLayout,
  LineStackLayout,
  ColumnStackLayout,
} from '../../UI/Layout';
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
import { sendGameTemplateBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import Paper from '../../UI/Paper';
import Window from '../../Utils/Window';
import ScrollView from '../../UI/ScrollView';
import {
  purchaseAppStoreProduct,
  shouldUseAppStoreProduct,
} from '../../Utils/AppStorePurchases';
import { formatProductPrice } from '../ProductPriceTag';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';

const styles = {
  disabledText: { opacity: 0.6 },
  scrollview: { overflowX: 'hidden' },
  grid: {
    margin: '0 2px', // Remove the default margin of the grid but keep the horizontal padding for focus outline.
  },
};

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
|};

const PrivateGameTemplateInformationPage = ({
  privateGameTemplateListingData,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
  onGameTemplateOpen,
}: Props) => {
  const { id, name, sellerId } = privateGameTemplateListingData;
  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const [gameTemplate, setGameTemplate] = React.useState<?PrivateGameTemplate>(
    null
  );
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
  const isMobileScreen = windowWidth === 'small';

  const isAlreadyReceived =
    !!receivedGameTemplates &&
    !!receivedGameTemplates.find(
      gameTemplate => gameTemplate.id === privateGameTemplateListingData.id
    );

  React.useEffect(
    () => {
      (async () => {
        setIsFetching(true);
        try {
          const [gameTemplate, profile] = await Promise.all([
            getPrivateGameTemplate(id),
            getUserPublicProfile(sellerId),
          ]);

          setGameTemplate(gameTemplate);
          setSellerPublicProfile(profile);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setErrorText(
              <Trans>
                Game template not found - An error occurred, please try again
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
    [id, sellerId, privateGameTemplateListingData.appStoreProductId]
  );

  const onClickBuy = React.useCallback(
    async () => {
      if (!gameTemplate) return;
      if (isAlreadyReceived) {
        onGameTemplateOpen(privateGameTemplateListingData);
        return;
      }

      try {
        sendGameTemplateBuyClicked({
          gameTemplateId: gameTemplate.id,
          gameTemplateName: gameTemplate.name,
          gameTemplateTag: gameTemplate.tag,
        });

        if (shouldUseAppStoreProduct()) {
          try {
            setAppStoreProductBeingBought(true);
            await purchaseAppStoreProduct(
              privateGameTemplateListingData.appStoreProductId
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
    },
    [
      gameTemplate,
      onOpenPurchaseDialog,
      privateGameTemplateListingData,
      isAlreadyReceived,
      onGameTemplateOpen,
    ]
  );

  const getBuyButton = i18n => {
    if (errorText) return null;

    const label = !gameTemplate ? (
      <Trans>Loading...</Trans>
    ) : isAlreadyReceived ? (
      <Trans>Open template</Trans>
    ) : isPurchaseDialogOpen || appStoreProductBeingBought ? (
      <Trans>Processing...</Trans>
    ) : (
      <Trans>
        Buy for{' '}
        {formatProductPrice({
          i18n,
          productListingData: privateGameTemplateListingData,
        })}
      </Trans>
    );

    const disabled =
      !gameTemplate || isPurchaseDialogOpen || appStoreProductBeingBought;

    return (
      <RaisedButton
        key="buy-game-template"
        primary
        label={label}
        onClick={onClickBuy}
        disabled={disabled}
        id="buy-game-template"
      />
    );
  };

  const mediaItems = gameTemplate
    ? [
        {
          kind: 'image',
          url:
            (shouldUseAppStoreProduct() &&
              privateGameTemplateListingData.appStoreThumbnailUrls &&
              privateGameTemplateListingData.appStoreThumbnailUrls[0]) ||
            privateGameTemplateListingData.thumbnailUrls[0],
        },
        ...gameTemplate.previewImageUrls.map(url => ({
          kind: 'image',
          url,
        })),
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
          ) : gameTemplate && sellerPublicProfile ? (
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
                      altTextTemplate={`Game template ${name} preview image {mediaIndex}`}
                      horizontalOuterMarginToEatOnMobile={8}
                    />
                  </Column>
                  <ColumnStackLayout useFullHeight expand noMargin>
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
                          {!isAlreadyReceived ? (
                            <Text noMargin size="block-title">
                              {formatProductPrice({
                                i18n,
                                productListingData: privateGameTemplateListingData,
                              })}
                            </Text>
                          ) : (
                            <div /> // To align the buy button on the right.
                          )}
                          {getBuyButton(i18n)}
                        </Line>
                        <Text size="body2" displayInlineAsSpan>
                          <MarkdownText
                            source={gameTemplate.longDescription}
                            allowParagraphs
                          />
                        </Text>
                        <ResponsiveLineStackLayout noMargin noColumnMargin>
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
              </ScrollView>
            </Column>
          ) : null}
          {openSellerPublicProfileDialog && (
            <PublicProfileDialog
              userId={sellerId}
              onClose={() => setOpenSellerPublicProfileDialog(false)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default PrivateGameTemplateInformationPage;
