// @flow
import * as React from 'react';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import {
  type PrivateAssetPack,
  type PrivateGameTemplate,
} from '../Utils/GDevelopServices/Asset';
import {
  PrivateAssetPackTile,
  PrivateGameTemplateTile,
  PromoBundleCard,
} from './ShopTiles';

export const getOtherProductsFromSameAuthorTiles = <
  T: PrivateAssetPackListingData | PrivateGameTemplateListingData,
  U: PrivateAssetPack | PrivateGameTemplate
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

      console.error(
        'Unexpected product type:',
        productListingDataFromSameCreator.productType
      );
      return null;
    })
    .filter(Boolean);
};

export const getBundlesContainingProductTiles = <
  T: PrivateAssetPackListingData | PrivateGameTemplateListingData,
  U: PrivateAssetPack | PrivateGameTemplate
>({
  product,
  productListingDatas,
  receivedProducts,
  onProductOpen,
}: {|
  product: ?U,
  productListingDatas: ?Array<T>,
  receivedProducts: ?Array<U>,
  onProductOpen: (product: T) => void,
|}): ?Array<React.Node> => {
  if (!product || !productListingDatas) return null;

  const bundlesContainingProduct = productListingDatas.filter(
    productListingData =>
      productListingData.includedListableProductIds &&
      productListingData.includedListableProductIds.includes(product.id)
  );

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

  const allTiles = ownedBundlesContainingProduct
    .map(bundleContainingProduct => {
      return (
        <PromoBundleCard
          productListingData={bundleContainingProduct}
          onSelect={() => onProductOpen(bundleContainingProduct)}
          owned
          key={bundleContainingProduct.id}
        />
      );
    })
    .concat(
      notOwnedBundlesContainingProduct.map(bundleContainingProduct => {
        return (
          <PromoBundleCard
            productListingData={bundleContainingProduct}
            onSelect={() => onProductOpen(bundleContainingProduct)}
            owned={false}
            key={bundleContainingProduct.id}
          />
        );
      })
    );

  return allTiles;
};

export const getProductsIncludedInBundleTiles = <
  T: PrivateAssetPackListingData | PrivateGameTemplateListingData,
  U: PrivateAssetPack | PrivateGameTemplate
>({
  product,
  productListingDatas,
  productListingData,
  receivedProducts,
  onProductOpen,
}: {|
  product: ?U,
  productListingDatas: ?Array<T>,
  productListingData: T,
  receivedProducts: ?Array<U>,
  onProductOpen: (product: T) => void,
|}): ?Array<React.Node> => {
  if (!product || !productListingDatas) return null;

  const includedProductIds = productListingData.includedListableProductIds;
  if (!includedProductIds) return null;

  return includedProductIds
    .map(includedProductId => {
      const includedProductListingData = productListingDatas.find(
        privateProductListingData =>
          privateProductListingData.id === includedProductId
      );
      if (!includedProductListingData) {
        console.warn(`Included product ${includedProductId} not found`);
        return null;
      }

      const isProductOwned =
        !!receivedProducts &&
        !!receivedProducts.find(
          product => product.id === includedProductListingData.id
        );

      if (includedProductListingData.productType === 'GAME_TEMPLATE') {
        return (
          <PrivateGameTemplateTile
            privateGameTemplateListingData={includedProductListingData}
            key={includedProductListingData.id}
            onSelect={() => onProductOpen(includedProductListingData)}
            owned={isProductOwned}
          />
        );
      }

      if (includedProductListingData.productType === 'ASSET_PACK') {
        return (
          <PrivateAssetPackTile
            assetPackListingData={includedProductListingData}
            key={includedProductListingData.id}
            onSelect={() => onProductOpen(includedProductListingData)}
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
