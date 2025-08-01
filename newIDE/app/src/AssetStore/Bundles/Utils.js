// @flow
import { type I18n as I18nType } from '@lingui/core';
import {
  type BundleListingData,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type CourseListingData,
  type CreditsPackageListingData,
  type IncludedRedemptionCode,
} from '../../Utils/GDevelopServices/Shop';

export const renderEstimatedTotalPriceFormatted = ({
  i18n,
  bundleListingData,
  productListingDatasIncludedInBundle,
  redemptionCodesIncludedInBundle,
}: {
  i18n: I18nType,
  bundleListingData: ?BundleListingData,
  productListingDatasIncludedInBundle: ?Array<
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CourseListingData
    | CreditsPackageListingData
  >,
  redemptionCodesIncludedInBundle: ?Array<IncludedRedemptionCode>,
}): ?string => {
  let totalPrice = 0;
  if (
    !bundleListingData ||
    !productListingDatasIncludedInBundle ||
    !redemptionCodesIncludedInBundle
  )
    return null;

  const productPrices = bundleListingData.prices;
  const bundlePrice = productPrices.find(
    price => price.usageType === 'default'
  );
  const currencyCode = bundlePrice ? bundlePrice.currency : 'USD';
  const currencySymbol = currencyCode === 'USD' ? '$' : '€';

  for (const product of bundleListingData.includedListableProducts || []) {
    if (product.productType === 'ASSET_PACK') {
      const listedAssetPack =
        productListingDatasIncludedInBundle.find(
          assetPack => assetPack.id === product.productId
        ) || null;
      if (listedAssetPack) {
        const price = listedAssetPack.prices.find(
          price => price.usageType === product.usageType
        );
        totalPrice += price ? price.value : 0;
      }
    } else if (product.productType === 'GAME_TEMPLATE') {
      const listedGameTemplate =
        productListingDatasIncludedInBundle.find(
          gameTemplate => gameTemplate.id === product.productId
        ) || null;
      if (listedGameTemplate) {
        const price = listedGameTemplate.prices.find(
          price => price.usageType === product.usageType
        );
        totalPrice += price ? price.value : 0;
      }
    } else if (product.productType === 'COURSE') {
      const listedCourse = productListingDatasIncludedInBundle.find(
        course => course.id === product.productId
      );
      if (listedCourse) {
        const price = listedCourse.prices.find(
          price => price.usageType === product.usageType
        );
        totalPrice += price ? price.value : 0;
      }
    } else if (product.productType === 'BUNDLE') {
      const listedBundle = productListingDatasIncludedInBundle.find(
        bundle => bundle.id === product.productId
      );
      if (listedBundle) {
        const price = listedBundle.prices.find(
          price => price.usageType === product.usageType
        );
        totalPrice += price ? price.value : 0;
      }
    } else if (product.productType === 'CREDITS_PACKAGE') {
      const listedCreditsPackage =
        productListingDatasIncludedInBundle.find(
          creditsPackage => creditsPackage.id === product.productId
        ) || null;
      if (listedCreditsPackage) {
        const price = listedCreditsPackage.prices.find(
          price => price.usageType === product.usageType
        );
        totalPrice += price ? price.value : 0;
      }
    }
  }

  if (redemptionCodesIncludedInBundle.length > 0) {
    for (const redemptionCode of redemptionCodesIncludedInBundle) {
      const planId = redemptionCode.givenSubscriptionPlanId;
      if (planId) {
        let estimatedAmountInCents = null;
        if (redemptionCode.estimatedPrices) {
          const estimatedPrice = redemptionCode.estimatedPrices.find(
            price => price.currency === currencyCode
          );
          if (estimatedPrice) {
            estimatedAmountInCents = estimatedPrice.value;
          }
        }

        // If no estimated price is provided, guess a mostly correct value
        // for backward compatibility.
        if (estimatedAmountInCents === null) {
          const monthlyEstimatedAmountInCents =
            planId === 'gdevelop_silver'
              ? 599
              : planId === 'gdevelop_gold'
              ? 1099
              : planId === 'gdevelop_startup'
              ? 3499
              : 0;
          estimatedAmountInCents =
            monthlyEstimatedAmountInCents *
            Math.max(1, Math.round(redemptionCode.durationInDays / 30));
        }

        totalPrice += estimatedAmountInCents || 0;
      }
    }
  }

  return `${currencySymbol} ${i18n
    .number(totalPrice / 100, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\D00$/, '')}`;
};
