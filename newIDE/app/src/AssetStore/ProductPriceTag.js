// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import PriceTag from '../UI/PriceTag';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import {
  shouldUseAppStoreProduct,
  getAppStoreProduct,
} from '../Utils/AppStorePurchases';

type FormatProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData,
  i18n: I18nType,
|};

export const formatProductPrice = ({
  i18n,
  productListingData,
}: FormatProps): string => {
  const appStoreProduct = shouldUseAppStoreProduct()
    ? getAppStoreProduct(productListingData.appStoreProductId)
    : null;
  if (appStoreProduct) return appStoreProduct.price;

  const stripePrice = productListingData.prices[0];
  if (!stripePrice) return '';

  return `€ ${i18n
    .number(stripePrice.value / 100, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\D00$/, '')}`;
};

type ProductPriceOrOwnedProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData,
  i18n: I18nType,
  owned?: boolean,
|};

export const getProductPriceOrOwnedLabel = ({
  i18n,
  productListingData,
  owned,
}: ProductPriceOrOwnedProps): string => {
  return owned
    ? i18n._(t`✅ Owned`)
    : formatProductPrice({ i18n, productListingData });
};

type ProductPriceTagProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData,
  /**
   * To be used when the component is over an element for which
   * we don't control the background (e.g. an image).
   */
  withOverlay?: boolean,
  owned?: boolean,
|};

const ProductPriceTag = ({
  productListingData,
  withOverlay,
  owned,
}: ProductPriceTagProps) => {
  return (
    <I18n>
      {({ i18n }) => {
        const label = getProductPriceOrOwnedLabel({
          i18n,
          productListingData,
          owned,
        });

        return <PriceTag withOverlay={withOverlay} label={label} />;
      }}
    </I18n>
  );
};

export default ProductPriceTag;
