// @flow
import * as React from 'react';
import {
  getClaimableProductListingDatas,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { AssetStoreContext } from '../AssetStoreContext';
import { PrivateGameTemplateStoreContext } from '../PrivateGameTemplates/PrivateGameTemplateStoreContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';
import { wasChangelogDisplayedAtStartup } from '../../MainFrame/Changelog/ChangelogDialogContainer';
import { isAnyDialogOpened } from '../../UI/MaterialUISpecificUtil';
import ClaimableProductsDialog from './ClaimableProductsDialog';

const checkDialogsInterval = 3000;

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
};

type Props = {|
  isActive: boolean,
|};

/**
 * Opens the dialog of the products to claim once a month, when the user
 * can claim some, so that the creator's flow is never interrupted more than that.
 */
const ClaimableProductsDialogContainer = ({ isActive }: Props): React.Node => {
  const {
    subscription,
    receivedAssetPacks,
    receivedGameTemplates,
  } = React.useContext(AuthenticatedUserContext);
  const { privateAssetPackListingDatas } = React.useContext(AssetStoreContext);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const { values, setLastClaimableProductsDialogMonth } = React.useContext(
    PreferencesContext
  );
  const { isSubscriptionDialogOpen } = React.useContext(SubscriptionContext);
  const [
    displayedProductListingDatas,
    setDisplayedProductListingDatas,
  ] = React.useState<?Array<
    PrivateAssetPackListingData | PrivateGameTemplateListingData
  >>(null);

  const currentMonth = getCurrentMonth();
  const shouldCheck =
    isActive &&
    !isSubscriptionDialogOpen &&
    !displayedProductListingDatas &&
    values.autoDisplayClaimableProductsDialog &&
    values.lastClaimableProductsDialogMonth !== currentMonth &&
    !wasChangelogDisplayedAtStartup() &&
    // Wait for everything to be loaded, to not show products already received.
    !!receivedAssetPacks &&
    !!receivedGameTemplates &&
    !!privateAssetPackListingDatas &&
    !!privateGameTemplateListingDatas;

  React.useEffect(
    () => {
      if (!shouldCheck) return;
      const claimableProductListingDatas = getClaimableProductListingDatas({
        subscription,
        privateAssetPackListingDatas,
        privateGameTemplateListingDatas,
        receivedAssetPacks,
        receivedGameTemplates,
      });
      if (!claimableProductListingDatas.length) return;

      // Wait for other dialogs (announcements, onboarding...) to be closed.
      const showIfNoOtherDialog = () => {
        if (isAnyDialogOpened()) return false;
        setLastClaimableProductsDialogMonth(currentMonth);
        setDisplayedProductListingDatas(claimableProductListingDatas);
        return true;
      };
      if (showIfNoOtherDialog()) return;
      const intervalId: IntervalID = setInterval(() => {
        if (showIfNoOtherDialog()) clearInterval(intervalId);
      }, checkDialogsInterval);
      return () => clearInterval(intervalId);
    },
    [
      shouldCheck,
      subscription,
      privateAssetPackListingDatas,
      privateGameTemplateListingDatas,
      receivedAssetPacks,
      receivedGameTemplates,
      setLastClaimableProductsDialogMonth,
      currentMonth,
    ]
  );

  if (!displayedProductListingDatas || !displayedProductListingDatas.length)
    return null;
  return (
    <ClaimableProductsDialog
      productListingDatas={displayedProductListingDatas}
      onClose={() => setDisplayedProductListingDatas([])}
    />
  );
};

export default ClaimableProductsDialogContainer;
