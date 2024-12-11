// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  buyProductWithCredits,
  type PrivateGameTemplateListingData,
  type PrivateAssetPackListingData,
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
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { sendGameTemplateBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import Window from '../../Utils/Window';
import ScrollView from '../../UI/ScrollView';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import Avatar from '@material-ui/core/Avatar';
import GridList from '@material-ui/core/GridList';
import { PrivateGameTemplateStoreContext } from './PrivateGameTemplateStoreContext';
import {
  getBundlesContainingProductTiles,
  getOtherProductsFromSameAuthorTiles,
  getProductMediaItems,
  getProductsIncludedInBundleTiles,
  getUserProductPurchaseUsageType,
  OpenProductButton,
  PurchaseProductButtons,
} from '../ProductPageHelper';
import ProductLicenseOptions from '../ProductLicense/ProductLicenseOptions';
import HelpIcon from '../../UI/HelpIcon';
import SecureCheckout from '../SecureCheckout/SecureCheckout';
import { CreditsPackageStoreContext } from '../CreditsPackages/CreditsPackageStoreContext';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import RaisedButton from '../../UI/RaisedButton';
import Play from '../../UI/CustomSvgIcons/Play';
import PrivateGameTemplatePurchaseDialog from './PrivateGameTemplatePurchaseDialog';
import PasswordPromptDialog from '../PasswordPromptDialog';

const cellSpacing = 8;

const getTemplateColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
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
  playIcon: {
    width: 20,
    height: 20,
  },
};

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  privateGameTemplateListingDatasFromSameCreator?: ?Array<PrivateGameTemplateListingData>,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
  onAssetPackOpen?: PrivateAssetPackListingData => void,
  onCreateWithGameTemplate?: PrivateGameTemplateListingData => void,
  simulateAppStoreProduct?: boolean,
|};

const PrivateGameTemplateInformationPage = ({
  privateGameTemplateListingData,
  privateGameTemplateListingDatasFromSameCreator,
  onGameTemplateOpen,
  onAssetPackOpen,
  onCreateWithGameTemplate,
  simulateAppStoreProduct,
}: Props) => {
  const { id, name, sellerId } = privateGameTemplateListingData;
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const {
    receivedGameTemplates,
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
  const [
    purchasingPrivateGameTemplateListingData,
    setPurchasingPrivateGameTemplateListingData,
  ] = React.useState<?PrivateGameTemplateListingData>(null);
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
    displayPasswordPrompt,
    setDisplayPasswordPrompt,
  ] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const {
    windowSize,
    isLandscape,
    isMediumScreen,
    isMobile,
  } = useResponsiveWindowSize();
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
      if (isAlreadyReceived && onCreateWithGameTemplate) {
        onCreateWithGameTemplate(privateGameTemplateListingData);
        return;
      }

      try {
        const price = privateGameTemplateListingData.prices.find(
          price => price.usageType === selectedUsageType
        );

        sendGameTemplateBuyClicked({
          gameTemplateId: gameTemplate.id,
          gameTemplateName: gameTemplate.name,
          gameTemplateTag: gameTemplate.tag,
          currency: price ? price.currency : undefined,
          usageType: selectedUsageType,
        });

        setPurchasingPrivateGameTemplateListingData(
          privateGameTemplateListingData
        );
      } catch (e) {
        console.warn('Unable to send event', e);
      }
    },
    [
      gameTemplate,
      privateGameTemplateListingData,
      isAlreadyReceived,
      onCreateWithGameTemplate,
      selectedUsageType,
    ]
  );

  const onClickBuyWithCredits = React.useCallback(
    async () => {
      if (!privateGameTemplateListingData || !gameTemplate) return;

      setDisplayPasswordPrompt(false);

      if (!profile || !limits) {
        // User not logged in, suggest to log in.
        onOpenLoginDialog();
        return;
      }

      if (isAlreadyReceived && onCreateWithGameTemplate) {
        onCreateWithGameTemplate(privateGameTemplateListingData);
        return;
      }

      sendGameTemplateBuyClicked({
        gameTemplateId: gameTemplate.id,
        gameTemplateName: gameTemplate.name,
        gameTemplateTag: gameTemplate.tag,
        usageType: selectedUsageType,
        currency: 'CREDITS',
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
            password,
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
      password,
    ]
  );

  const onWillBuyWithCredits = () => {
    // Password is required in dev environment only so that one cannot freely claim asset packs.
    if (Window.isDev()) setDisplayPasswordPrompt(true);
    else onClickBuyWithCredits();
  };

  const mediaItems = React.useMemo(
    () =>
      getProductMediaItems({
        product: gameTemplate,
        productListingData: privateGameTemplateListingData,
        shouldSimulateAppStoreProduct: simulateAppStoreProduct,
      }),
    [gameTemplate, privateGameTemplateListingData, simulateAppStoreProduct]
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
            <Column expand alignItems="center" justifyContent="center">
              <PlaceholderLoader />
            </Column>
          ) : gameTemplate && sellerPublicProfile ? (
            <Column noOverflowParent expand noMargin>
              <ScrollView autoHideScrollbar style={styles.scrollview}>
                <ResponsiveLineStackLayout
                  noColumnMargin
                  noMargin
                  // Force the columns to wrap on tablets and small screens.
                  forceMobileLayout={isMediumScreen}
                  // Prevent it to wrap when in landscape mode on small screens.
                  noResponsiveLandscape
                  useLargeSpacer
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
                      altTextTemplate={`Game template ${name} preview image {mediaIndex}`}
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
                    <ColumnStackLayout noMargin>
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
                      <LineStackLayout
                        noMargin
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Line noMargin>
                          <Text size="sub-title">
                            <Trans>Licensing</Trans>
                          </Text>
                          <HelpIcon
                            size="small"
                            helpPagePath="https://gdevelop.io/page/asset-store-license-agreement"
                          />
                        </Line>
                        {!isAlreadyReceived &&
                        !privateGameTemplateListingData.includedListableProductIds && ( // Bundles don't have a preview link.
                            <Column noMargin>
                              <RaisedButton
                                primary
                                label={<Trans>Try it online</Trans>}
                                onClick={() =>
                                  Window.openExternalURL(
                                    gameTemplate.gamePreviewLink
                                  )
                                }
                                icon={<Play style={styles.playIcon} />}
                              />
                            </Column>
                          )}
                      </LineStackLayout>
                      <ProductLicenseOptions
                        value={selectedUsageType}
                        onChange={setSelectedUsageType}
                        product={privateGameTemplateListingData}
                        ownedLicense={userGameTemplatePurchaseUsageType}
                      />
                      <Spacer />
                      {!isAlreadyReceived ? (
                        <>
                          {!shouldUseOrSimulateAppStoreProduct && (
                            <SecureCheckout />
                          )}
                          {!errorText && (
                            <PurchaseProductButtons
                              i18n={i18n}
                              productListingData={
                                privateGameTemplateListingData
                              }
                              selectedUsageType={selectedUsageType}
                              onUsageTypeChange={setSelectedUsageType}
                              simulateAppStoreProduct={simulateAppStoreProduct}
                              isAlreadyReceived={isAlreadyReceived}
                              onClickBuy={onClickBuy}
                              onClickBuyWithCredits={onClickBuyWithCredits}
                            />
                          )}
                        </>
                      ) : onCreateWithGameTemplate ? (
                        <OpenProductButton
                          productListingData={privateGameTemplateListingData}
                          onClick={() =>
                            onCreateWithGameTemplate(
                              privateGameTemplateListingData
                            )
                          }
                          label={<Trans>Open template</Trans>}
                        />
                      ) : null}
                    </ColumnStackLayout>
                  </div>
                </ResponsiveLineStackLayout>
                <Column noMargin>
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
                        cols={getTemplateColumns(windowSize, isLandscape)}
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
                          cols={getTemplateColumns(windowSize, isLandscape)}
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
              onGameTemplateOpen={
                onGameTemplateOpen
                  ? (gameTemplate: PrivateGameTemplateListingData) => {
                      setOpenSellerPublicProfileDialog(false);
                      onGameTemplateOpen(gameTemplate);
                    }
                  : undefined
              }
              onAssetPackOpen={
                onAssetPackOpen
                  ? (assetPack: PrivateAssetPackListingData) => {
                      setOpenSellerPublicProfileDialog(false);
                      onAssetPackOpen(assetPack);
                    }
                  : undefined
              }
            />
          )}
          {displayPasswordPrompt && (
            <PasswordPromptDialog
              onApply={onWillBuyWithCredits}
              onClose={() => setDisplayPasswordPrompt(false)}
              passwordValue={password}
              setPasswordValue={setPassword}
            />
          )}
          {!!purchasingPrivateGameTemplateListingData && (
            <PrivateGameTemplatePurchaseDialog
              privateGameTemplateListingData={
                purchasingPrivateGameTemplateListingData
              }
              usageType={selectedUsageType}
              onClose={() => setPurchasingPrivateGameTemplateListingData(null)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default PrivateGameTemplateInformationPage;
