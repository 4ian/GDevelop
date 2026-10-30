// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  getCalloutToGetSubscriptionOrClaimProduct,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { SubscriptionContext } from '../Profile/Subscription/SubscriptionContext';
import { Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import useRedeemProduct from './UseRedeemProduct';

const styles = {
  redeemConditionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#FF8569',
    color: '#1D1D26',
  },
  redeemDiamondIcon: { height: 24 },
};

type Props = {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData,
  isAlreadyReceived: boolean,
|};

/**
 * Lets subscribers claim the product given away this month,
 * or invites others to get a subscription.
 */
const ClaimProductCallout = ({
  productListingData,
  isAlreadyReceived,
}: Props): React.Node => {
  const { subscription } = React.useContext(AuthenticatedUserContext);
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);
  const {
    onWillRedeemProduct,
    redeemingProductId,
    passwordPromptDialog,
  } = useRedeemProduct();

  const callout = getCalloutToGetSubscriptionOrClaimProduct({
    subscription,
    productListingData,
    isAlreadyReceived,
  });
  if (!callout) return null;

  return (
    <div style={styles.redeemConditionsContainer}>
      <Line noMargin alignItems="center">
        <img
          src="res/small-diamond.svg"
          style={styles.redeemDiamondIcon}
          alt="diamond"
        />
        <Text color="inherit" noMargin>
          {callout.message}
        </Text>
      </Line>
      <Spacer />
      {callout.actionLabel && (
        <div style={{ flexShrink: 0 }}>
          <RaisedButton
            primary
            label={
              redeemingProductId ? (
                <Trans>Please wait</Trans>
              ) : (
                callout.actionLabel
              )
            }
            disabled={!!redeemingProductId}
            onClick={
              callout.canRedeemProduct
                ? () => onWillRedeemProduct(productListingData)
                : () =>
                    openSubscriptionDialog({
                      analyticsMetadata: {
                        reason: 'Claim asset pack',
                        recommendedPlanId: 'gdevelop_gold',
                        placementId: 'claim-asset-pack',
                      },
                    })
            }
          />
        </div>
      )}
      {passwordPromptDialog}
    </div>
  );
};

export default ClaimProductCallout;
