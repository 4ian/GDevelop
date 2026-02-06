// @flow
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import { ColumnStackLayout } from '../UI/Layout';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import LeftLoader from '../UI/LeftLoader';
import { redeemCode } from '../Utils/GDevelopServices/Usage';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import AlertMessage from '../UI/AlertMessage';
import Form from '../UI/Form';
import { SubscriptionContext } from './Subscription/SubscriptionContext';
import RedemptionCodesDialog from '../RedemptionCode/RedemptionCodesDialog';

type Props = {|
  onClose: (hasJustRedeemedCode: boolean) => Promise<void>,
  codeToPrefill?: string,
  autoSubmit?: boolean,
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
    if (extractedStatusAndCode.code === 'redemption-code/code-is-a-coupon') {
      return (
        <Trans>
          This code is a coupon code and can't be redeemed here. Start a
          purchase and enter it there to get a discount.
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
  codeToPrefill,
  autoSubmit,
}: Props) {
  const [redemptionCode, setRedemptionCode] = React.useState(
    codeToPrefill || ''
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<?Error>(null);
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const hasAutoSubmitted = React.useRef(false);
  const [
    redemptionCodesDialogOpen,
    setRedemptionCodesDialogOpen,
  ] = React.useState(false);

  const onRedeemCode = React.useCallback(
    async () => {
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
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.code === 'redemption-code/code-is-a-coupon'
        ) {
          // This is a coupon code, not a redemption code.
          // Open the subscription dialog with this coupon code.
          openSubscriptionDialog({
            analyticsMetadata: {
              reason: 'Coupon code entered',
              placementId: 'redeem-code',
            },
            couponCode: redemptionCode.trim().toUpperCase(),
          });
          // Close this dialog
          onClose(/*hasJustRedeemedCode=*/ false);
        } else {
          setError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [authenticatedUser, redemptionCode, onClose, openSubscriptionDialog]
  );

  const canRedeem = !!redemptionCode && !isLoading;
  const { subscription } = authenticatedUser;

  const hasAValidSubscriptionFromRedemptionCode =
    !!subscription &&
    subscription.planId &&
    !!subscription.redemptionCodeValidUntil &&
    subscription.redemptionCodeValidUntil > Date.now();
  const hasAValidSubscriptionNotFromRedemptionCode =
    !!subscription &&
    subscription.planId &&
    !subscription.redemptionCodeValidUntil;

  // Auto-submit if autoSubmit and codeToPrefill are provided,
  // and if there isn't an existing subscription as it would replace it.
  React.useEffect(
    () => {
      if (
        autoSubmit &&
        codeToPrefill &&
        !hasAValidSubscriptionFromRedemptionCode &&
        !hasAValidSubscriptionNotFromRedemptionCode &&
        redemptionCode &&
        !hasAutoSubmitted.current &&
        !isLoading
      ) {
        hasAutoSubmitted.current = true;
        onRedeemCode();
      }
    },
    [
      autoSubmit,
      codeToPrefill,
      redemptionCode,
      isLoading,
      onRedeemCode,
      hasAValidSubscriptionFromRedemptionCode,
      hasAValidSubscriptionNotFromRedemptionCode,
    ]
  );

  return (
    <>
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
              <LeftLoader isLoading={isLoading} key="redeem">
                <DialogPrimaryButton
                  label={<Trans>Redeem</Trans>}
                  disabled={!canRedeem}
                  primary
                  onClick={onRedeemCode}
                />
              </LeftLoader>,
            ]}
            secondaryActions={[
              <FlatButton
                label={<Trans>See my codes</Trans>}
                key="see-codes"
                disabled={isLoading}
                onClick={() => {
                  setRedemptionCodesDialogOpen(true);
                }}
              />,
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
                  floatingLabelText={<Trans>Redemption or coupon code</Trans>}
                  floatingLabelFixed
                  errorText={getRedeemCodeErrorText(error)}
                  autoFocus="desktop"
                  disabled={isLoading}
                />
                {hasAValidSubscriptionFromRedemptionCode ? (
                  <AlertMessage kind="warning">
                    <Trans>
                      You currently have a subscription, applied thanks to a
                      redemption code, valid until{' '}
                      {!!subscription &&
                        i18n.date(subscription.redemptionCodeValidUntil)}
                      . If you redeem another code, your existing subscription
                      will be canceled and not redeemable anymore!
                    </Trans>
                  </AlertMessage>
                ) : hasAValidSubscriptionNotFromRedemptionCode ? (
                  // Has a subscription, but not applied thanks to a redemption code.
                  <AlertMessage kind="warning">
                    <Trans>
                      You currently have a subscription. If you redeem a code,
                      the existing subscription will be cancelled and replaced
                      by the one given by the code.
                    </Trans>
                  </AlertMessage>
                ) : null}
              </ColumnStackLayout>
            </Form>
          </Dialog>
        )}
      </I18n>
      {redemptionCodesDialogOpen && (
        <RedemptionCodesDialog
          onClose={() => setRedemptionCodesDialogOpen(false)}
          onSelectCode={code => {
            setRedemptionCode(code);
            setRedemptionCodesDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
