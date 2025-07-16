// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import PriceTag from '../UI/PriceTag';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type CreditsPackageListingData,
  type CourseListingData,
} from '../Utils/GDevelopServices/Shop';
import {
  shouldUseAppStoreProduct,
  getAppStoreProduct,
} from '../Utils/AppStorePurchases';
import Coin from '../Credits/Icons/Coin';
import { LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { Column } from '../UI/Grid';
import CheckCircle from '../UI/CustomSvgIcons/CheckCircle';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import type { GDevelopTheme } from '../UI/Theme';

const styles = {
  icon: {
    width: 13,
    height: 13,
    position: 'relative',
    top: -1,
  },
  creditPriceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  columnOrSeparator: {
    marginTop: -3,
    marginBottom: -1,
  },
};

type FormatProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | CreditsPackageListingData
    | CourseListingData,
  i18n: I18nType,
  usageType?: string,
  plainText?: boolean,
  showBothPrices?: 'column' | 'line', // If defined, will show both the credits price and the product price.
|};

export const renderProductPrice = ({
  i18n,
  productListingData,
  usageType,
  plainText,
  showBothPrices,
}: FormatProps): React.Node => {
  // Only use the app store product if it's a credits package.
  if (
    shouldUseAppStoreProduct() &&
    productListingData.productType === 'CREDITS_PACKAGE'
  ) {
    const appStoreProduct = getAppStoreProduct(
      productListingData.appStoreProductId
    );
    return appStoreProduct ? appStoreProduct.price : '';
  }

  const creditPrices =
    productListingData.productType !== 'CREDITS_PACKAGE'
      ? productListingData.creditPrices || []
      : [];
  const creditPrice = usageType
    ? creditPrices.find(price => price.usageType === usageType)
    : creditPrices.length > 0
    ? creditPrices[0]
    : null;

  // If we're on mobile, only show credits prices for non-credits packages.
  if (
    shouldUseAppStoreProduct() &&
    productListingData.productType !== 'CREDITS_PACKAGE'
  ) {
    if (!creditPrice) return '';
    return plainText ? (
      i18n._(t`${creditPrice.amount} credits`)
    ) : (
      <LineStackLayout noMargin alignItems="center">
        <Coin style={styles.icon} />
        <Text noMargin size="sub-title" color="inherit">
          {creditPrice.amount}
        </Text>
      </LineStackLayout>
    );
  }

  const productPrices = productListingData.prices;
  const price = usageType
    ? productPrices.find(price => price.usageType === usageType)
    : // If no usage type is specified, use the first price.
    productPrices.length > 0
    ? productPrices[0]
    : null;
  if (!price) return '';

  const currencyCode = price.currency === 'USD' ? '$' : '€';
  const formattedPrice = `${currencyCode} ${i18n
    .number(price.value / 100, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\D00$/, '')}`;

  return plainText ? (
    formattedPrice
  ) : showBothPrices && creditPrice ? (
    showBothPrices === 'column' ? (
      <Column alignItems="flex-end">
        <div style={styles.creditPriceContainer}>
          <Coin style={styles.icon} />
          <Text noMargin size="sub-title" color="inherit">
            {creditPrice.amount}
          </Text>
        </div>
        <span style={styles.columnOrSeparator}>
          <Text noMargin color="inherit">
            <Trans>or</Trans>
          </Text>
        </span>
        <Text noMargin size="sub-title" color="primary">
          {formattedPrice}
        </Text>
      </Column>
    ) : (
      <LineStackLayout noMargin>
        <div style={styles.creditPriceContainer}>
          <Coin style={styles.icon} />
          <Text noMargin size="sub-title" color="inherit">
            {creditPrice.amount}
          </Text>
        </div>
        <Text noMargin color="inherit">
          <Trans>or</Trans>
        </Text>
        <Text noMargin size="sub-title" color="primary">
          {formattedPrice}
        </Text>
      </LineStackLayout>
    )
  ) : (
    <Text noMargin size="sub-title" color="inherit">
      {formattedPrice}
    </Text>
  );
};

type ProductPriceOrOwnedProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | CreditsPackageListingData
    | CourseListingData,
  i18n: I18nType,
  gdevelopTheme: GDevelopTheme,
  usageType?: string,
  owned?: boolean,
  showBothPrices?: 'column' | 'line',
|};

export const getProductPriceOrOwnedLabel = ({
  i18n,
  gdevelopTheme,
  productListingData,
  usageType,
  owned,
  showBothPrices,
}: ProductPriceOrOwnedProps): React.Node => {
  return owned ? (
    <LineStackLayout noMargin alignItems="center">
      <CheckCircle
        style={{
          color: gdevelopTheme.message.valid,
        }}
      />
      <Text noMargin size="sub-title" color="inherit">
        <Trans>Owned</Trans>
      </Text>
    </LineStackLayout>
  ) : (
    renderProductPrice({ i18n, productListingData, usageType, showBothPrices })
  );
};

type ProductPriceTagProps = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | CreditsPackageListingData
    | CourseListingData,
  usageType?: string,
  /**
   * To be used when the component is over an element for which
   * we don't control the background (e.g. an image).
   */
  withOverlay?: boolean,
  owned?: boolean,
|};

const ProductPriceTag = ({
  productListingData,
  usageType,
  withOverlay,
  owned,
}: ProductPriceTagProps) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <I18n>
      {({ i18n }) => {
        const label = getProductPriceOrOwnedLabel({
          i18n,
          gdevelopTheme,
          productListingData,
          usageType,
          owned,
        });

        return <PriceTag withOverlay={withOverlay} label={label} />;
      }}
    </I18n>
  );
};

export default ProductPriceTag;
