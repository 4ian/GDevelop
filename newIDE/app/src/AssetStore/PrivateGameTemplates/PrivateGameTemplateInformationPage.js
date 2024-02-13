// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import {
  buyProductWithCredits,
  type PrivateGameTemplateListingData,
} from '../../Utils/GDevelopServices/Shop';
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
import RaisedButton from '../../UI/RaisedButton';
import { sendGameTemplateBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import Window from '../../Utils/Window';
import ScrollView from '../../UI/ScrollView';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import { formatProductPrice } from '../ProductPriceTag';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import FlatButton from '../../UI/FlatButton';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import { Avatar, GridList } from '@material-ui/core';
import { PrivateGameTemplateStoreContext } from './PrivateGameTemplateStoreContext';
import {
  getBundlesContainingProductTiles,
  getOtherProductsFromSameAuthorTiles,
  getProductsIncludedInBundleTiles,
  getUserProductPurchaseUsageType,
} from '../ProductPageHelper';
import ProductLicenseOptions from '../ProductLicense/ProductLicenseOptions';
import HelpIcon from '../../UI/HelpIcon';
import SecureCheckout from '../SecureCheckout/SecureCheckout';
import { CreditsPackageStoreContext } from '../CreditsPackages/CreditsPackageStoreContext';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Coin from '../../Credits/Icons/Coin';

const cellSpacing = 8;

const getTemplateColumns = (windowWidth: WidthType) => {
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
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  privateGameTemplateListingDatasFromSameCreator?: ?Array<PrivateGameTemplateListingData>,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
  onCreateWithGameTemplate: PrivateGameTemplateListingData => void,
  simulateAppStoreProduct?: boolean,
|};

const PrivateGameTemplateInformationPage = ({
  privateGameTemplateListingData,
  privateGameTemplateListingDatasFromSameCreator,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
  onGameTemplateOpen,
  onCreateWithGameTemplate,
  simulateAppStoreProduct,
}: Props) => {
  const { id, name, sellerId } = privateGameTemplateListingData;
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const {
    receivedGameTemplates,
    authenticated,
    profile,
    limits,
    gameTemplatePurchases,
    getAuthorizationHeader,
    onOpenLoginDialog,
  } = React.useContext(AuthenticatedUserContext);
  const { openCreditsPackageDialog, openCreditsUsageDialog } = React.useContext(
    CreditsPackageStoreContext
  );
  const [gameTemplate, setGameTemplate] = React.useState<?PrivateGameTemplate>(
    null
  );
  const [selectedUsageType, setSelectedUsageType] = React.useState<string>(
    privateGameTemplateListingData.prices[0].usageType
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
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const windowWidth = useResponsiveWindowWidth();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || simulateAppStoreProduct;

  const userGameTemplatePurchaseUsageType = React.useMemo(
    () =>
      getUserProductPurchaseUsageType({
        productId: privateGameTemplateListingData
          ? privateGameTemplateListingData.id
          : null,
        receivedProducts: receivedGameTemplates,
        productPurchases: gameTemplatePurchases,
        allProductListingDatas: privateGameTemplateListingDatas,
      }),
    [
      gameTemplatePurchases,
      privateGameTemplateListingData,
      privateGameTemplateListingDatas,
      receivedGameTemplates,
    ]
  );
  const isAlreadyReceived = !!userGameTemplatePurchaseUsageType;

  const templatesIncludedInBundleTiles = React.useMemo(
    () =>
      getProductsIncludedInBundleTiles({
        product: gameTemplate,
        productListingDatas: privateGameTemplateListingDatas,
        productListingData: privateGameTemplateListingData,
        receivedProducts: receivedGameTemplates,
        onProductOpen: onGameTemplateOpen,
      }),
    [
      gameTemplate,
      privateGameTemplateListingDatas,
      receivedGameTemplates,
      onGameTemplateOpen,
      privateGameTemplateListingData,
    ]
  );

  const bundlesContainingPackTiles = React.useMemo(
    () =>
      getBundlesContainingProductTiles({
        product: gameTemplate,
        productListingDatas: privateGameTemplateListingDatas,
        receivedProducts: receivedGameTemplates,
        onProductOpen: onGameTemplateOpen,
      }),
    [
      gameTemplate,
      privateGameTemplateListingDatas,
      receivedGameTemplates,
      onGameTemplateOpen,
    ]
  );

  const otherTemplatesFromTheSameAuthorTiles = React.useMemo(
    () =>
      getOtherProductsFromSameAuthorTiles({
        otherProductListingDatasFromSameCreator: privateGameTemplateListingDatasFromSameCreator,
        currentProductListingData: privateGameTemplateListingData,
        receivedProducts: receivedGameTemplates,
        onProductOpen: onGameTemplateOpen,
      }),
    [
      privateGameTemplateListingDatasFromSameCreator,
      privateGameTemplateListingData,
      receivedGameTemplates,
      onGameTemplateOpen,
    ]
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
          const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
            error
          );
          if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
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
    [id, sellerId]
  );

  const onClickBuy = React.useCallback(
    async () => {
      if (!gameTemplate) return;
      if (isAlreadyReceived) {
        onCreateWithGameTemplate(privateGameTemplateListingData);
        return;
      }

      try {
        sendGameTemplateBuyClicked({
          gameTemplateId: gameTemplate.id,
          gameTemplateName: gameTemplate.name,
          gameTemplateTag: gameTemplate.tag,
        });

        onOpenPurchaseDialog();
      } catch (e) {
        console.warn('Unable to send event', e);
      }
    },
    [
      gameTemplate,
      onOpenPurchaseDialog,
      privateGameTemplateListingData,
      isAlreadyReceived,
      onCreateWithGameTemplate,
    ]
  );

  const onPurchaseWithCredits = React.useCallback(
    async (i18n: I18nType) => {
      if (!privateGameTemplateListingData || !gameTemplate) return;

      if (!profile || !limits) {
        // User not logged in, suggest to log in.
        onOpenLoginDialog();
        return;
      }

      if (isAlreadyReceived) {
        onCreateWithGameTemplate(privateGameTemplateListingData);
        return;
      }

      sendGameTemplateBuyClicked({
        gameTemplateId: gameTemplate.id,
        gameTemplateName: gameTemplate.name,
        gameTemplateTag: gameTemplate.tag,
      });

      const currentCreditsAmount = limits.credits.userBalance.amount;
      const gameTemplatePriceForUsageType = privateGameTemplateListingData.creditPrices.find(
        price => price.usageType === selectedUsageType
      );
      if (!gameTemplatePriceForUsageType) {
        console.error(
          'Unable to find the price for the selected usage type',
          selectedUsageType
        );
        return;
      }
      const gameTemplateCreditsAmount = gameTemplatePriceForUsageType.amount;
      if (currentCreditsAmount < gameTemplateCreditsAmount) {
        openCreditsPackageDialog({
          missingCredits: gameTemplateCreditsAmount - currentCreditsAmount,
        });
        return;
      }

      openCreditsUsageDialog({
        title: <Trans>Purchase {gameTemplate.name}</Trans>,
        message: (
          <Trans>
            You are about to use {gameTemplateCreditsAmount} credits to purchase
            the game template {gameTemplate.name}. Continue?
          </Trans>
        ),
        onConfirm: () =>
          buyProductWithCredits(getAuthorizationHeader, {
            productId: privateGameTemplateListingData.id,
            usageType: selectedUsageType,
            userId: profile.id,
          }),
        successMessage: <Trans>🎉 You can now use your template!</Trans>,
      });
    },
    [
      profile,
      limits,
      privateGameTemplateListingData,
      gameTemplate,
      onCreateWithGameTemplate,
      isAlreadyReceived,
      openCreditsPackageDialog,
      selectedUsageType,
      openCreditsUsageDialog,
      getAuthorizationHeader,
      onOpenLoginDialog,
    ]
  );

  const getBuyButtons = i18n => {
    if (errorText) return null;

    let creditPrice = privateGameTemplateListingData.creditPrices.find(
      price => price.usageType === selectedUsageType
    );
    if (!creditPrice) {
      // We're probably switching from one template to another, and the usage type is not available.
      // Let's reset it.
      setSelectedUsageType(privateGameTemplateListingData.prices[0].usageType);
      creditPrice = privateGameTemplateListingData.creditPrices.find(
        price =>
          price.usageType === privateGameTemplateListingData.prices[0].usageType
      );
      if (!creditPrice) {
        console.error('Unable to find the price for the game template');
        return null;
      }
    }

    return (
      <LineStackLayout>
        <FlatButton
          primary
          label={<Trans>Buy for {creditPrice.amount} credits</Trans>}
          onClick={onPurchaseWithCredits}
          id="buy-game-template-with-credits"
          leftIcon={<Coin fontSize="small" />}
        />
        <RaisedButton
          primary
          label={
            <Trans>
              Buy for{' '}
              {formatProductPrice({
                i18n,
                usageType: selectedUsageType,
                productListingData: privateGameTemplateListingData,
              })}
            </Trans>
          }
          onClick={onClickBuy}
          id="buy-game-template"
        />
        {shouldUseOrSimulateAppStoreProduct &&
          !isAlreadyReceived &&
          !authenticated && (
            <Text size="body-small">
              <Link onClick={onClickBuy} href="">
                <Trans>Restore a previous purchase</Trans>
              </Link>
            </Text>
          )}
      </LineStackLayout>
    );
  };

  const getOpenButton = i18n => {
    if (privateGameTemplateListingData.includedListableProductIds) {
      // Template is a bundle and is owned, no button to display.
      return null;
    }

    return (
      <Column noMargin alignItems="flex-end">
        <RaisedButton
          primary
          label={<Trans>Open template</Trans>}
          onClick={() =>
            onCreateWithGameTemplate(privateGameTemplateListingData)
          }
          id="open-game-template"
        />
      </Column>
    );
  };

  const mediaItems = gameTemplate
    ? [
        {
          kind: 'image',
          url:
            (shouldUseOrSimulateAppStoreProduct &&
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
                <ResponsiveLineStackLayout
                  noColumnMargin
                  noMargin
                  // Force the columns to wrap on tablets and small screens.
                  width={windowWidth === 'medium' ? 'small' : undefined}
                >
                  <div style={styles.leftColumnContainer}>
                    <ResponsiveMediaGallery
                      mediaItems={mediaItems}
                      altTextTemplate={`Game template ${name} preview image {mediaIndex}`}
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
                          {gameTemplate.name}
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
                        product={privateGameTemplateListingData}
                        ownedLicense={userGameTemplatePurchaseUsageType}
                      />
                      <Spacer />
                      {isAlreadyReceived ? (
                        getOpenButton(i18n)
                      ) : (
                        <>
                          <SecureCheckout />
                          {getBuyButtons(i18n)}
                        </>
                      )}
                    </ColumnStackLayout>
                  </div>
                </ResponsiveLineStackLayout>
                <Column noMargin>
                  {!isAlreadyReceived &&
                  !privateGameTemplateListingData.includedListableProductIds && ( // Bundles don't have a preview link.
                      <Line>
                        <RaisedButton
                          primary
                          label={<Trans>Try it online</Trans>}
                          onClick={() =>
                            Window.openExternalURL(gameTemplate.gamePreviewLink)
                          }
                        />
                      </Line>
                    )}
                  <Text size="body2" displayInlineAsSpan>
                    <MarkdownText
                      source={gameTemplate.longDescription}
                      allowParagraphs
                    />
                  </Text>
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
                {templatesIncludedInBundleTiles && (
                  <>
                    <Line>
                      <Text size="block-title">
                        <Trans>Included in this bundle</Trans>
                      </Text>
                    </Line>
                    <Line>
                      <GridList
                        cols={getTemplateColumns(windowWidth)}
                        cellHeight="auto"
                        spacing={cellSpacing / 2}
                        style={styles.grid}
                      >
                        {templatesIncludedInBundleTiles}
                      </GridList>
                    </Line>
                  </>
                )}
                {otherTemplatesFromTheSameAuthorTiles &&
                  otherTemplatesFromTheSameAuthorTiles.length > 0 && (
                    <>
                      <Line>
                        <Text size="block-title">
                          <Trans>From the same author</Trans>
                        </Text>
                      </Line>
                      <Line>
                        <GridList
                          cols={getTemplateColumns(windowWidth)}
                          cellHeight="auto"
                          spacing={cellSpacing / 2}
                          style={styles.grid}
                        >
                          {otherTemplatesFromTheSameAuthorTiles}
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
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default PrivateGameTemplateInformationPage;
