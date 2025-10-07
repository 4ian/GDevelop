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
import useSubscriptionPlans from '../Utils/UseSubscriptionPlans';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  // This dialog is not meant to be closed, but in case of an error, we provide a way to close it.
  onClose: () => void,
|};

const StandaloneDialog = ({ onClose }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    routeArguments,
    removeRouteArguments,
    navigateToRoute,
  } = React.useContext(RouterContext);
  const { getSubscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    authenticatedUser,
    includeLegacy: false,
  });
  const [
    selectedBundleListingData,
    setSelectedBundleListingData,
  ] = React.useState<?BundleListingData>(null);
  const { courses, getCourseCompletion } = useCourses();
  const { bundleListingDatas } = React.useContext(BundleStoreContext);
  React.useEffect(
    () => {
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
      removeRouteArguments(['bundle-category']);
    },
    [bundleListingDatas, routeArguments, onClose, removeRouteArguments]
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
          getSubscriptionPlansWithPricingSystems={
            getSubscriptionPlansWithPricingSystems
          }
          onAssetPackOpen={() => {}}
          onGameTemplateOpen={() => {}}
          onBundleOpen={() => {}}
          onCourseOpen={() => {}}
          courses={courses}
          getCourseCompletion={getCourseCompletion}
          noActions
          fastCheckout
          onCloseAfterPurchaseDone={() => {
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
