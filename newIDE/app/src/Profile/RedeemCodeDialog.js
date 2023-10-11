// @flow
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import { ColumnStackLayout } from '../UI/Layout';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import LeftLoader from '../UI/LeftLoader';
import { redeemCode } from '../Utils/GDevelopServices/Usage';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import AlertMessage from '../UI/AlertMessage';
import Form from '../UI/Form';

type Props = {|
  onClose: (hasJustRedeemedCode: boolean) => Promise<void>,
  authenticatedUser: AuthenticatedUser,
|};

export const getRedeemCodeErrorText = (error: ?Error) => {
  if (!error) return undefined;

  const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(error);
  if (extractedStatusAndCode) {
    if (extractedStatusAndCode.status === 404) {
      return (
        <Trans>
          This code is not valid - verify you've entered it properly.
        </Trans>
      );
    }
    if (
      extractedStatusAndCode.code ===
      'redemption-code/cannot-be-redeemed-anymore'
    )
      return (
        <Trans>
          This code was valid but can't be redeemed anymore. If this is
          unexpected, contact us or the code provider.
        </Trans>
      );
    if (
      extractedStatusAndCode.code ===
      'user-redeemed-code/already-redeemed-by-user'
    )
      return (
        <Trans>
          You already used this code - you can't reuse a code multiple times.
        </Trans>
      );
  }
  return (
    <Trans>
      There was an unknown error when trying to apply the code. Double check the
      code, try again later or contact us if this persists.
    </Trans>
  );
};

export default function RedeemCodeDialog({
  onClose,
  authenticatedUser,
}: Props) {
  const [redemptionCode, setRedemptionCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<?Error>(null);

  const onRedeemCode = async () => {
    setIsLoading(true);
    const { getAuthorizationHeader, profile } = authenticatedUser;

    try {
      if (!profile) throw new Error('User should be logged in');

      await redeemCode(
        getAuthorizationHeader,
        profile.id,
        redemptionCode.trim().toLowerCase()
      );

      // Redemption was successful, we close the dialog and let the parent know
      // that a redemption happened - so some update should be fetched.
      onClose(/*hasJustRedeemedCode=*/ true);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const canRedeem = !!redemptionCode && !isLoading;
  const { subscription } = authenticatedUser;

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Redeem a code</Trans>}
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              key="close"
              primary={false}
              disabled={isLoading}
              onClick={() => onClose(false)}
            />,
            <LeftLoader isLoading={isLoading}>
              <DialogPrimaryButton
                label={<Trans>Redeem</Trans>}
                disabled={!canRedeem}
                primary
                key="redeem"
                onClick={onRedeemCode}
              />
            </LeftLoader>,
          ]}
          cannotBeDismissed={isLoading}
          onRequestClose={() => onClose(false)}
          onApply={() => {
            if (canRedeem) onRedeemCode();
          }}
          maxWidth="sm"
          open
        >
          <Form onSubmit={onRedeemCode} name="redeemSubscriptionCoupon">
            <ColumnStackLayout noMargin>
              <SemiControlledTextField
                value={redemptionCode}
                onChange={setRedemptionCode}
                translatableHintText={t`Enter your code here`}
                floatingLabelText={<Trans>Redemption code</Trans>}
                floatingLabelFixed
                errorText={getRedeemCodeErrorText(error)}
                autoFocus="desktop"
              />
              {!subscription ||
              !subscription.planId ? null : !!subscription.redemptionCodeValidUntil ? ( // No subscription, do not show a warning.
                subscription.redemptionCodeValidUntil > Date.now() ? ( // Has valid subscription.
                  <AlertMessage kind="warning">
                    <Trans>
                      You currently have a subscription, applied thanks to a
                      redemption code, valid until{' '}
                      {i18n.date(subscription.redemptionCodeValidUntil)}. If you
                      redeem another code, your existing subscription will be
                      canceled and not redeemable anymore!
                    </Trans>
                  </AlertMessage>
                ) : null // Has expired subscription, do not show a warning.
              ) : (
                // Has a subscription, but not applied thanks to a redemption code.
                <AlertMessage kind="info">
                  <Trans>
                    You currently have a subscription. If you redeem a code, the
                    existing subscription will be cancelled and replaced by the
                    one given by the code.
                  </Trans>
                </AlertMessage>
              )}
            </ColumnStackLayout>
          </Form>
        </Dialog>
      )}
    </I18n>
  );
}
