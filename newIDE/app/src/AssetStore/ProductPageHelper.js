// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type BundleListingData,
  type CourseListingData,
  type CreditsPackageListingData,
  type Purchase,
} from '../Utils/GDevelopServices/Shop';
import {
  type PrivateAssetPack,
  type PrivateGameTemplate,
  type Bundle,
  type Course,
} from '../Utils/GDevelopServices/Asset';
import {
  PrivateAssetPackTile,
  PrivateGameTemplateTile,
  BundleTile,
  PromoBundleCard,
  CourseTile,
} from './ShopTiles';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { shouldUseAppStoreProduct } from '../Utils/AppStorePurchases';
import { LineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import Link from '../UI/Link';
import Coin from '../Credits/Icons/Coin';
import { renderProductPrice } from './ProductPriceTag';
import { Trans } from '@lingui/macro';
import FlatButton from '../UI/FlatButton';
import { Column } from '../UI/Grid';
import { type MediaItem } from '../UI/ResponsiveMediaGallery';

export const getOtherProductsFromSameAuthorTiles = <
  T:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData,
  U: PrivateAssetPack | PrivateGameTemplate | Bundle
>({
  otherProductListingDatasFromSameCreator,
  currentProductListingData,
  receivedProducts,
  onProductOpen,
}: {|
  otherProductListingDatasFromSameCreator: ?Array<T>,
  currentProductListingData: T,
  receivedProducts: ?Array<U>,
  onProductOpen: (product: T) => void,
|}): ?Array<React.Node> => {
  if (
    !otherProductListingDatasFromSameCreator ||
    // Only display products if there are at least 2. If there is only one,
    // it means it's the same as the one currently opened.
    otherProductListingDatasFromSameCreator.length < 2
  ) {
    return null;
  }

  return otherProductListingDatasFromSameCreator
    .filter(
      // Filter out the current product.
      product => product.id !== currentProductListingData.id
    )
    .map(productListingDataFromSameCreator => {
      const isProductOwned =
        !!receivedProducts &&
        !!receivedProducts.find(
          product => product.id === productListingDataFromSameCreator.id
        );

      if (productListingDataFromSameCreator.productType === 'GAME_TEMPLATE') {
        return (
          <PrivateGameTemplateTile
            privateGameTemplateListingData={productListingDataFromSameCreator}
            key={productListingDataFromSameCreator.id}
            onSelect={() => onProductOpen(productListingDataFromSameCreator)}
            owned={isProductOwned}
          />
        );
      }
      if (productListingDataFromSameCreator.productType === 'ASSET_PACK') {
        return (
          <PrivateAssetPackTile
            assetPackListingData={productListingDataFromSameCreator}
            key={productListingDataFromSameCreator.id}
            onSelect={() => onProductOpen(productListingDataFromSameCreator)}
            owned={isProductOwned}
          />
        );
      }
      if (productListingDataFromSameCreator.productType === 'BUNDLE') {
        return (
          <BundleTile
            bundleListingData={productListingDataFromSameCreator}
            key={productListingDataFromSameCreator.id}
            onSelect={() => onProductOpen(productListingDataFromSameCreator)}
            owned={isProductOwned}
          />
        );
      }

      console.error(
        'Unexpected product type:',
        productListingDataFromSameCreator.productType
      );
      return null;
    })
    .filter(Boolean);
};

export const getBundlesContainingProduct = <
  T:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CourseListingData,
  U: PrivateAssetPack | PrivateGameTemplate | Bundle | Course
>({
  product,
  productListingDatas,
}: {|
  product: U,
  productListingDatas: Array<T>,
|}): T[] => {
  // A bundle can either be:
  // - an ASSET_PACK or GAME_TEMPLATE that includes other product ids
  // - a BUNDLE that includes other products
  const bundlesContainingProduct = productListingDatas
    .filter(
      productListingData =>
        (productListingData.includedListableProductIds &&
          productListingData.includedListableProductIds.includes(product.id)) ||
        (productListingData.productType === 'BUNDLE' &&
          productListingData.includedListableProducts &&
          productListingData.includedListableProducts.some(
            includedProduct => includedProduct.productId === product.id
          ))
    )
    // Show types 'BUNDLE' first.
    .sort((a, b) => {
      if (a.productType === 'BUNDLE' && b.productType !== 'BUNDLE') {
        return -1;
      }
      if (a.productType !== 'BUNDLE' && b.productType === 'BUNDLE') {
        return 1;
      }
      return 0;
    });

  return bundlesContainingProduct;
};

export const getBundlesContainingProductTiles = <
  T:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData,
  U: PrivateAssetPack | PrivateGameTemplate | Bundle
>({
  product,
  productListingData,
  productListingDatas,
  receivedProducts,
  onPrivateAssetPackOpen,
  onPrivateGameTemplateOpen,
  onBundleOpen,
}: {|
  product: ?U,
  productListingData: T,
  productListingDatas: ?Array<T>,
  receivedProducts: ?Array<U>,
  onPrivateAssetPackOpen?: (
    assetPackListingData: PrivateAssetPackListingData
  ) => void,
  onPrivateGameTemplateOpen?: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onBundleOpen?: (bundleListingData: BundleListingData) => void,
|}): ?Array<React.Node> => {
  if (!product || !productListingDatas) return null;

  const bundlesContainingProduct = getBundlesContainingProduct({
    product,
    productListingDatas,
  });

  if (!bundlesContainingProduct.length) return null;

  const ownedBundlesContainingProduct = bundlesContainingProduct.filter(
    bundleContainingProduct =>
      !!receivedProducts &&
      !!receivedProducts.find(
        Product => Product.id === bundleContainingProduct.id
      )
  );
  const notOwnedBundlesContainingProduct = bundlesContainingProduct.filter(
    bundleContainingProduct =>
      !ownedBundlesContainingProduct.find(
        ownedBundleContainingProduct =>
          ownedBundleContainingProduct.id === bundleContainingProduct.id
      )
  );

  const allProductsWithOwnedStatus = [
    ...ownedBundlesContainingProduct.map(bundleContainingProduct => ({
      product: bundleContainingProduct,
      owned: true,
    })),
    ...notOwnedBundlesContainingProduct.map(bundleContainingProduct => ({
      product: bundleContainingProduct,
      owned: false,
    })),
  ];

  return allProductsWithOwnedStatus.map(
    ({ product: bundleContainingProduct, owned }) => {
      if (bundleContainingProduct.productType === 'ASSET_PACK') {
        if (!onPrivateAssetPackOpen) {
          console.error(
            'Trying to render a promo ASSET_PACK tile without onPrivateAssetPackOpen handler.'
          );
          return null;
        }
        return (
          <PromoBundleCard
            bundleProductListingData={bundleContainingProduct}
            includedProductListingData={productListingData}
            onSelect={() => onPrivateAssetPackOpen(bundleContainingProduct)}
            owned={owned}
            key={bundleContainingProduct.id}
          />
        );
      }

      if (bundleContainingProduct.productType === 'GAME_TEMPLATE') {
        if (!onPrivateGameTemplateOpen) {
          console.error(
            'Trying to render a promo GAME_TEMPLATE tile without onPrivateGameTemplateOpen handler.'
          );
          return null;
        }
        return (
          <PromoBundleCard
            bundleProductListingData={bundleContainingProduct}
            includedProductListingData={productListingData}
            onSelect={() => onPrivateGameTemplateOpen(bundleContainingProduct)}
            owned={owned}
            key={bundleContainingProduct.id}
          />
        );
      }

      if (bundleContainingProduct.productType === 'BUNDLE') {
        if (!onBundleOpen) {
          console.error(
            'Trying to render a promo BUNDLE tile without onBundleOpen handler.'
          );
          return null;
        }
        return (
          <PromoBundleCard
            bundleProductListingData={bundleContainingProduct}
            includedProductListingData={productListingData}
            onSelect={() => onBundleOpen(bundleContainingProduct)}
            owned={owned}
            key={bundleContainingProduct.id}
          />
        );
      }

      console.error(
        'Unexpected product type for Promo Tile:',
        bundleContainingProduct.productType
      );
      return null;
    }
  );
};

export const getProductsIncludedInBundle = <
  T:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CourseListingData
    | CreditsPackageListingData
>({
  productListingData,
  productListingDatas,
}: {|
  productListingDatas: Array<T>,
  productListingData: T,
|}): ?(T[]) => {
  const includedProductIds =
    productListingData.includedListableProductIds ||
    (productListingData.productType === 'BUNDLE' &&
      productListingData.includedListableProducts &&
      productListingData.includedListableProducts.map(
        includedProduct => includedProduct.productId
      ));
  if (!includedProductIds) return null;

  return productListingDatas.filter(productListingData =>
    includedProductIds.includes(productListingData.id)
  );
};

export const getProductsIncludedInBundleTiles = ({
  product,
  productListingDatas,
  productListingData,
  receivedProducts,
  onPrivateAssetPackOpen,
  onPrivateGameTemplateOpen,
  onBundleOpen,
  onCourseOpen,
}: {|
  product: ?PrivateAssetPack | PrivateGameTemplate | Bundle | Course,
  productListingDatas: ?Array<
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CourseListingData
  >,
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CourseListingData,
  receivedProducts: ?Array<
    PrivateAssetPack | PrivateGameTemplate | Bundle | Course
  >,
  onPrivateAssetPackOpen?: (
    assetPackListingData: PrivateAssetPackListingData
  ) => void,
  onPrivateGameTemplateOpen?: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onBundleOpen?: (bundleListingData: BundleListingData) => void,
  onCourseOpen?: (courseListingData: CourseListingData) => void,
|}): ?Array<React.Node> => {
  if (!product || !productListingDatas) return null;

  const productsIncludedInBundle = getProductsIncludedInBundle({
    productListingData,
    productListingDatas,
  });

  if (!productsIncludedInBundle || !productsIncludedInBundle.length) {
    return null;
  }

  return productsIncludedInBundle
    .map(includedProductListingData => {
      const isProductOwned =
        !!receivedProducts &&
        !!receivedProducts.find(
          product => product.id === includedProductListingData.id
        );

      if (includedProductListingData.productType === 'GAME_TEMPLATE') {
        if (!onPrivateGameTemplateOpen) {
          console.error(
            'Trying to render a GAME_TEMPLATE tile without onPrivateGameTemplateOpen handler.'
          );
          return null;
        }
        return (
          <PrivateGameTemplateTile
            privateGameTemplateListingData={includedProductListingData}
            key={includedProductListingData.id}
            onSelect={() =>
              onPrivateGameTemplateOpen(includedProductListingData)
            }
            owned={isProductOwned}
          />
        );
      }

      if (includedProductListingData.productType === 'ASSET_PACK') {
        if (!onPrivateAssetPackOpen) {
          console.error(
            'Trying to render an ASSET_PACK tile without onPrivateAssetPackOpen handler.'
          );
          return null;
        }
        return (
          <PrivateAssetPackTile
            assetPackListingData={includedProductListingData}
            key={includedProductListingData.id}
            onSelect={() => onPrivateAssetPackOpen(includedProductListingData)}
            owned={isProductOwned}
          />
        );
      }

      if (includedProductListingData.productType === 'BUNDLE') {
        if (!onBundleOpen) {
          console.error(
            'Trying to render a BUNDLE tile without onBundleOpen handler.'
          );
          return null;
        }
        return (
          <BundleTile
            bundleListingData={includedProductListingData}
            key={includedProductListingData.id}
            onSelect={() => onBundleOpen(includedProductListingData)}
            owned={isProductOwned}
          />
        );
      }

      if (includedProductListingData.productType === 'COURSE') {
        if (!onCourseOpen) {
          console.error(
            'Trying to render a COURSE tile without onCourseOpen handler.'
          );
          return null;
        }
        return (
          <CourseTile
            courseListingData={includedProductListingData}
            key={includedProductListingData.id}
            onSelect={() => onCourseOpen(includedProductListingData)}
            owned={isProductOwned}
          />
        );
      }

      console.error(
        'Unexpected product type:',
        includedProductListingData.productType
      );
      return null;
    })
    .filter(Boolean);
};

// A product can be purchased directly or as part of a bundle.
// We consider both the same way for the moment and use either
// the product purchase usage type or the bundle purchase usage type.
// In case the user has both, we consider the product purchase as the
// most important one.
export const getUserProductPurchaseUsageType = <
  T:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData,
  U: PrivateAssetPack | PrivateGameTemplate | Bundle
>({
  productId,
  receivedProducts,
  productPurchases,
  allProductListingDatas,
}: {|
  productId: ?string,
  receivedProducts: ?Array<U>,
  productPurchases: ?Array<Purchase>,
  allProductListingDatas: ?Array<T>,
|}): ?string => {
  // User is not authenticated or still loading.
  if (!receivedProducts || !productPurchases || !allProductListingDatas)
    return null;

  const currentReceivedProduct = receivedProducts.find(
    receivedProduct => receivedProduct.id === productId
  );
  // User does not own the product.
  if (!currentReceivedProduct) return null;

  const productPurchase = productPurchases.find(
    productPurchase => productPurchase.productId === currentReceivedProduct.id
  );
  if (!productPurchase) {
    // It is possible the user has the product as part of a bundle.
    const bundlesIncludingProduct = getBundlesContainingProduct({
      product: currentReceivedProduct,
      productListingDatas: allProductListingDatas,
    });
    if (!bundlesIncludingProduct.length) return null;

    // We look at all the purchases of the bundles that include the product.
    const receivedProductBundlePurchases = productPurchases.filter(
      productPurchase =>
        bundlesIncludingProduct.some(
          bundleListingData =>
            bundleListingData.id === productPurchase.productId
        )
    );

    if (!receivedProductBundlePurchases.length) {
      return null;
    }

    // We don't really know which usage type to return, so we look at the first purchase.
    if (bundlesIncludingProduct[0].productType === 'BUNDLE') {
      // In a bundle, we look for the usage type of the included product.
      const includedProduct = (
        bundlesIncludingProduct[0].includedListableProducts || []
      ).find(includedProduct => includedProduct.productId === productId);
      return includedProduct ? includedProduct.usageType : null;
    }

    // Otherwise, we return the usage type of the purchase. (when included in an ASSET_PACK or GAME_TEMPLATE)
    return receivedProductBundlePurchases[0].usageType;
  }

  return productPurchase.usageType;
};

export const PurchaseProductButtons = <
  T:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | CourseListingData
    | BundleListingData
>({
  productListingData,
  selectedUsageType,
  onUsageTypeChange,
  simulateAppStoreProduct,
  i18n,
  isAlreadyReceived,
  onClickBuy,
  onClickBuyWithCredits,
}: {|
  productListingData: T,
  selectedUsageType: string,
  onUsageTypeChange: (usageType: string) => void,
  simulateAppStoreProduct?: boolean,
  i18n: I18nType,
  isAlreadyReceived: boolean,
  onClickBuy: () => void | Promise<void>,
  onClickBuyWithCredits?: () => void | Promise<void>,
|}) => {
  const { authenticated } = React.useContext(AuthenticatedUserContext);
  const shouldUseOrSimulateAppStoreProduct =
    simulateAppStoreProduct || shouldUseAppStoreProduct();
  const productType = productListingData.productType.toLowerCase();

  let creditPrice =
    productListingData.productType !== 'BUNDLE'
      ? productListingData.creditPrices.find(
          price => price.usageType === selectedUsageType
        )
      : null;
  if (!creditPrice && productListingData.productType !== 'BUNDLE') {
    // We're probably switching from one product to another, and the usage type is not available.
    // Let's reset it.
    onUsageTypeChange(productListingData.prices[0].usageType);
    creditPrice = productListingData.creditPrices.find(
      price => price.usageType === productListingData.prices[0].usageType
    );
    if (!creditPrice) {
      console.error(
        `Unable to find a credit price for product ${
          productListingData.id
        }, usage type ${productListingData.prices[0].usageType}`
      );
      return null;
    }
  }

  const formattedProductPriceText = renderProductPrice({
    i18n,
    usageType: selectedUsageType,
    productListingData: productListingData,
    plainText: true,
  });

  return shouldUseOrSimulateAppStoreProduct && creditPrice ? (
    <LineStackLayout>
      <RaisedButton
        primary
        label={<Trans>Buy for {formattedProductPriceText}</Trans>}
        onClick={onClickBuyWithCredits}
        id={`buy-${productType}-with-credits`}
        icon={<Coin fontSize="small" />}
      />
      {!isAlreadyReceived && !authenticated && (
        <Text size="body-small">
          <Link onClick={onClickBuy} href="">
            <Trans>Restore a previous purchase</Trans>
          </Link>
        </Text>
      )}
    </LineStackLayout>
  ) : (
    <LineStackLayout>
      {creditPrice && (
        <FlatButton
          primary
          label={<Trans>Buy for {creditPrice.amount} credits</Trans>}
          onClick={onClickBuyWithCredits}
          id={`buy-${productType}-with-credits`}
          leftIcon={<Coin fontSize="small" />}
        />
      )}
      <RaisedButton
        primary
        label={<Trans>Buy for {formattedProductPriceText}</Trans>}
        onClick={onClickBuy}
        id={`buy-${productType}`}
      />
    </LineStackLayout>
  );
};

export const OpenProductButton = <
  T: PrivateAssetPackListingData | PrivateGameTemplateListingData
>({
  productListingData,
  onClick,
  label,
}: {|
  productListingData: T,
  onClick: () => void,
  label: React.Node,
|}) => {
  if (
    productListingData.productType === 'GAME_TEMPLATE' &&
    productListingData.includedListableProductIds
  ) {
    // Template is a bundle and is owned, no button to display.
    return null;
  }
  const productType = productListingData.productType.toLowerCase();

  return (
    <Column noMargin alignItems="flex-end">
      <RaisedButton
        primary
        label={label}
        onClick={onClick}
        id={`open-${productType}`}
      />
    </Column>
  );
};

export const getProductMediaItems = <
  T:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData,
  U: PrivateAssetPack | PrivateGameTemplate | Bundle
>({
  productListingData,
  product,
  additionalThumbnails,
  shouldSimulateAppStoreProduct,
}: {|
  productListingData: T,
  product: ?U,
  additionalThumbnails?: string[],
  shouldSimulateAppStoreProduct?: boolean,
|}): MediaItem[] => {
  if (!product) return [];

  const shouldUseOrSimulateAppStoreProduct =
    shouldSimulateAppStoreProduct || shouldUseAppStoreProduct();

  // Deduplicate in case we have the same image in the thumbnailUrls and previewImageUrls.
  const uniqueImageUrls: string[] = [
    ...new Set([
      (shouldUseOrSimulateAppStoreProduct &&
        productListingData.appStoreThumbnailUrls &&
        productListingData.appStoreThumbnailUrls[0]) ||
        productListingData.thumbnailUrls[0],
      ...product.previewImageUrls,
      ...(additionalThumbnails || []),
    ]),
  ];
  const uniqueMediaItems: MediaItem[] = uniqueImageUrls.map((url: string) => ({
    kind: 'image',
    url,
  }));

  if (product.previewSoundUrls) {
    uniqueMediaItems.push(
      ...product.previewSoundUrls.map(url => ({
        kind: 'audio',
        url,
      }))
    );
  }

  return uniqueMediaItems;
};
