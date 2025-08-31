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

const renderPriceFormatted = (
  priceInCents: number,
  currencyCode: 'USD' | 'EUR',
  i18n: I18nType
): string => {
  const currencySymbol = currencyCode === 'USD' ? '$' : '€';
  return `${currencySymbol} ${i18n
    .number(priceInCents / 100, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\D00$/, '')}`;
};

const getEstimatedRedemptionCodePrice = (
  redemptionCode: IncludedRedemptionCode,
  currencyCode: 'USD' | 'EUR'
): number => {
  const planId = redemptionCode.givenSubscriptionPlanId;
  if (!planId) {
    return 0;
  }
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

  return estimatedAmountInCents;
};

export const renderEstimatedRedemptionCodePriceFormatted = (
  bundleListingData: BundleListingData,
  redemptionCode: IncludedRedemptionCode,
  i18n: I18nType
): string => {
  const bundlePrice = bundleListingData.prices.find(
    price => price.usageType === 'default'
  );
  const currencyCode = bundlePrice ? bundlePrice.currency : 'USD';
  const estimatedPrice = getEstimatedRedemptionCodePrice(
    redemptionCode,
    currencyCode
  );
  return renderPriceFormatted(estimatedPrice, currencyCode, i18n);
};

const getEstimatedTotalPriceAndCurrencyCode = ({
  bundleListingData,
  productListingDatasIncludedInBundle,
  redemptionCodesIncludedInBundle,
  filter,
}: {
  bundleListingData: ?BundleListingData,
  productListingDatasIncludedInBundle: ?Array<
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CourseListingData
    | CreditsPackageListingData
  >,
  redemptionCodesIncludedInBundle: ?Array<IncludedRedemptionCode>,
  filter?:
    | 'ASSET_PACK'
    | 'GAME_TEMPLATE'
    | 'COURSE'
    | 'BUNDLE'
    | 'CREDITS_PACKAGE'
    | 'REDEMPTION_CODE',
}): ?{
  totalPrice: number,
  bundlePrice: number,
  currencyCode: 'USD' | 'EUR',
} => {
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
  const bundlePriceValue = bundlePrice ? bundlePrice.value : 0;

  for (const product of bundleListingData.includedListableProducts || []) {
    if (
      product.productType === 'ASSET_PACK' &&
      (!filter || filter === 'ASSET_PACK')
    ) {
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
    } else if (
      product.productType === 'GAME_TEMPLATE' &&
      (!filter || filter === 'GAME_TEMPLATE')
    ) {
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
    } else if (
      product.productType === 'COURSE' &&
      (!filter || filter === 'COURSE')
    ) {
      const listedCourse = productListingDatasIncludedInBundle.find(
        course => course.id === product.productId
      );
      if (listedCourse) {
        const price = listedCourse.prices.find(
          price => price.usageType === product.usageType
        );
        totalPrice += price ? price.value : 0;
      }
    } else if (
      product.productType === 'BUNDLE' &&
      (!filter || filter === 'BUNDLE')
    ) {
      const listedBundle = productListingDatasIncludedInBundle.find(
        bundle => bundle.id === product.productId
      );
      if (listedBundle) {
        const price = listedBundle.prices.find(
          price => price.usageType === product.usageType
        );
        totalPrice += price ? price.value : 0;
      }
    } else if (
      product.productType === 'CREDITS_PACKAGE' &&
      (!filter || filter === 'CREDITS_PACKAGE')
    ) {
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

  if (
    redemptionCodesIncludedInBundle.length > 0 &&
    (!filter || filter === 'REDEMPTION_CODE')
  ) {
    for (const redemptionCode of redemptionCodesIncludedInBundle) {
      const estimatedAmountInCents = getEstimatedRedemptionCodePrice(
        redemptionCode,
        currencyCode
      );
      totalPrice += estimatedAmountInCents || 0;
    }
  }

  return { totalPrice, bundlePrice: bundlePriceValue, currencyCode };
};

export const renderEstimatedTotalPriceFormatted = ({
  i18n,
  bundleListingData,
  productListingDatasIncludedInBundle,
  redemptionCodesIncludedInBundle,
  filter,
}: {|
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
  filter?:
    | 'ASSET_PACK'
    | 'GAME_TEMPLATE'
    | 'COURSE'
    | 'BUNDLE'
    | 'CREDITS_PACKAGE'
    | 'REDEMPTION_CODE',
|}): ?string => {
  const estimatedPriceAndCode = getEstimatedTotalPriceAndCurrencyCode({
    bundleListingData,
    productListingDatasIncludedInBundle,
    redemptionCodesIncludedInBundle,
    filter,
  });
  if (!estimatedPriceAndCode || !bundleListingData) return null;

  return renderPriceFormatted(
    estimatedPriceAndCode.totalPrice,
    estimatedPriceAndCode.currencyCode,
    i18n
  );
};

export const getEstimatedSavingsFormatted = ({
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
}): ?{ savingsPriceFormatted: string, savingsPercentageFormatted: string } => {
  const estimatedTotalPriceAndCode = getEstimatedTotalPriceAndCurrencyCode({
    bundleListingData,
    productListingDatasIncludedInBundle,
    redemptionCodesIncludedInBundle,
  });
  if (!estimatedTotalPriceAndCode || !bundleListingData) return null;

  const savings =
    estimatedTotalPriceAndCode.totalPrice -
    estimatedTotalPriceAndCode.bundlePrice;

  return {
    savingsPriceFormatted: renderPriceFormatted(
      savings,
      estimatedTotalPriceAndCode.currencyCode,
      i18n
    ),
    savingsPercentageFormatted: `${Math.round(
      (savings / estimatedTotalPriceAndCode.totalPrice) * 100
    )}%`,
  };
};
