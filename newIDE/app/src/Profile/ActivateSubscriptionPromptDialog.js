// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import {
  getPlanInferredNameFromId,
  getPlanIcon,
} from './Subscription/PlanSmallCard';
import { type BundleListingData } from '../Utils/GDevelopServices/Shop';

type Props = {|
  bundleListingData: BundleListingData,
  onActivateNow: () => void,
  onClose: () => void,
|};

const ActivateSubscriptionPromptDialog = ({
  bundleListingData,
  onActivateNow,
  onClose,
}: Props) => {
  // Get the subscription plan info from the first redemption code
  const planId =
    bundleListingData.includedRedemptionCodes &&
    bundleListingData.includedRedemptionCodes.length > 0
      ? bundleListingData.includedRedemptionCodes[0].givenSubscriptionPlanId
      : null;

  if (!planId) {
    // Safety check - should not happen but handle gracefully
    onClose();
    return null;
  }

  const planName = getPlanInferredNameFromId(planId);
  const planIcon = getPlanIcon({ planId, logoSize: 60 });

  return (
    <Dialog
      title={<Trans>Activate your subscription code</Trans>}
      maxWidth="sm"
      open
      onRequestClose={onClose}
      actions={[
        <FlatButton
          key="later"
          label={<Trans>Activate Later</Trans>}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          key="now"
          primary
          label={<Trans>Activate Now</Trans>}
          onClick={onActivateNow}
        />,
      ]}
      flexColumnBody
    >
      <ColumnStackLayout noMargin alignItems="center">
        {planIcon}
        <LineStackLayout noMargin justifyContent="center">
          <Text size="sub-title" align="center">
            <Trans>
              This bundle contains a subscription for {planName}. Do you want to
              activate your subscription right away?
            </Trans>
          </Text>
        </LineStackLayout>
        <Text align="center">
          <Trans>
            You can always do it later by redeeming a code on your profile.
          </Trans>
        </Text>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default ActivateSubscriptionPromptDialog;
