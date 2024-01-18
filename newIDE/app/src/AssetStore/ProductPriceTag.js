// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import PriceTag from '../UI/PriceTag';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type CreditsPackageListingData,
} from '../Utils/GDevelopServices/Shop';
import {
  shouldUseAppStoreProduct,
  getAppStoreProduct,
} from '../Utils/AppStorePurchases';

type FormatProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | CreditsPackageListingData,
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

  const price = productListingData.prices[0];
  if (!price) return '';

  const currencyCode = price.currency === 'USD' ? '$' : '€';

  return `${currencyCode} ${i18n
    .number(price.value / 100, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\D00$/, '')}`;
};

type ProductPriceOrOwnedProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | CreditsPackageListingData,
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
    | PrivateGameTemplateListingData
    | CreditsPackageListingData,
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
