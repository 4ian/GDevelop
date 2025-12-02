// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import Dialog from '../UI/Dialog';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import ErrorBoundary from '../UI/ErrorBoundary';
import RouterContext from './RouterContext';
import { BundleStoreContext } from '../AssetStore/Bundles/BundleStoreContext';
import { type BundleListingData } from '../Utils/GDevelopServices/Shop';
import { getBundleListingDataFromCategory } from '../AssetStore/AssetStoreUtils';
import { sendBundleInformationOpened } from '../Utils/Analytics/EventSender';
import BundleInformationPage from '../AssetStore/Bundles/BundleInformationPage';
import useCourses from './EditorContainers/HomePage/UseCourses';

type Props = {|
  // This dialog is not meant to be closed, but in case of an error, we provide a way to close it.
  onClose: () => void,
|};

const StandaloneDialog = ({ onClose }: Props) => {
  const {
    routeArguments,
    removeRouteArguments,
    navigateToRoute,
  } = React.useContext(RouterContext);
  const [
    selectedBundleListingData,
    setSelectedBundleListingData,
  ] = React.useState<?BundleListingData>(null);
  const { courses, getCourseCompletion } = useCourses();
  const { bundleListingDatas } = React.useContext(BundleStoreContext);
  React.useEffect(
    () => {
      if (selectedBundleListingData) return; // We're already on a bundle page.

      const bundleCategory = routeArguments['bundle-category'];
      if (!bundleCategory || !bundleListingDatas) {
        return;
      }

      let bundleListingData: ?BundleListingData = null;
      // Open the information page of a the bundle.
      if (bundleCategory) {
        bundleListingData = getBundleListingDataFromCategory({
          bundleListingDatas,
          category: bundleCategory,
        });
      }

      if (!bundleListingData) {
        onClose();
        return;
      }

      const priceForUsageType = bundleListingData.prices.find(
        price => price.usageType === 'default'
      );
      sendBundleInformationOpened({
        bundleName: bundleListingData.name,
        bundleId: bundleListingData.id,
        source: 'web-link',
        priceValue: priceForUsageType && priceForUsageType.value,
        priceCurrency: priceForUsageType && priceForUsageType.currency,
      });
      setSelectedBundleListingData(bundleListingData);
      // Don't remove the route argument so that the user can come back to this page
      // if they come back from a checkout flow.
      // We do it in the onClose callback instead.
    },
    [
      selectedBundleListingData,
      bundleListingDatas,
      routeArguments,
      onClose,
      removeRouteArguments,
    ]
  );

  return (
    <Dialog
      title={null} // Let the content decide.
      open
      fullscreen="always-even-on-desktop"
      noPadding
      cannotBeDismissed
      flexColumnBody
    >
      {!selectedBundleListingData ? (
        <PlaceholderLoader />
      ) : (
        <BundleInformationPage
          bundleListingData={selectedBundleListingData}
          onAssetPackOpen={() => {}}
          onGameTemplateOpen={() => {}}
          onBundleOpen={() => {}}
          onCourseOpen={() => {}}
          courses={courses}
          getCourseCompletion={getCourseCompletion}
          noActions
          fastCheckout
          onCloseAfterPurchaseDone={() => {
            removeRouteArguments(['bundle-category']);
            navigateToRoute('learn', {
              bundle: selectedBundleListingData.id,
            });
            onClose();
          }}
        />
      )}
    </Dialog>
  );
};

const StandaloneDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Standalone dialog</Trans>}
    scope="standalone"
  >
    <StandaloneDialog {...props} />
  </ErrorBoundary>
);

export default StandaloneDialogWithErrorBoundary;
