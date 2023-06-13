// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import PriceTag from '../../UI/PriceTag';
import { type PrivateAssetPackListingData } from '../../Utils/GDevelopServices/Shop';
import {
  shouldUseAppStoreProduct,
  getAppStoreProduct,
} from '../../Utils/AppStorePurchases';

type FormatProps = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  i18n: I18nType,
|};

export const formatPrivateAssetPackPrice = ({
  i18n,
  privateAssetPackListingData,
}: FormatProps): string => {
  const appStoreProduct = shouldUseAppStoreProduct()
    ? getAppStoreProduct(privateAssetPackListingData.appStoreProductId)
    : null;
  if (appStoreProduct) return appStoreProduct.price;

  const stripePrice = privateAssetPackListingData.prices[0];
  if (!stripePrice) return '';

  return `€ ${i18n
    .number(stripePrice.value / 100, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\D00$/, '')}`;
};

type PrivateAssetPackPriceTagProps = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  /**
   * To be used when the component is over an element for which
   * we don't control the background (e.g. an image).
   */
  withOverlay?: boolean,
  owned?: boolean,
|};

export const PrivateAssetPackPriceTag = ({
  privateAssetPackListingData,
  withOverlay,
  owned,
}: PrivateAssetPackPriceTagProps) => {
  return (
    <I18n>
      {({ i18n }) => {
        const label = owned ? (
          <Trans>✅ Owned</Trans>
        ) : (
          formatPrivateAssetPackPrice({ i18n, privateAssetPackListingData })
        );

        return <PriceTag withOverlay={withOverlay} label={label} />;
      }}
    </I18n>
  );
};
