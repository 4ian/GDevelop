// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { ColumnStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import Dialog from '../../UI/Dialog';
import CreditsStatusBanner from '../../Credits/CreditsStatusBanner';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import {
  cashOutUserEarnings,
  type UserEarningsBalance,
} from '../../Utils/GDevelopServices/Usage';
import Coin from '../../Credits/Icons/Coin';

type Props = {|
  onClose: () => void,
  userEarningsBalance: UserEarningsBalance,
  onSuccess: () => Promise<void>,
  type: 'credits' | 'cash',
|};

const CashOutDialog = ({
  onClose,
  userEarningsBalance,
  onSuccess,
  type,
}: Props) => {
  const [isCashingOut, setIsCashingOut] = React.useState(false);
  const [isCashOutSuccesfull, setIsCashOutSuccessful] = React.useState(false);
  const { showAlert } = useAlertDialog();
  const { onRefreshLimits, getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const onCashOut = React.useCallback(
    async () => {
      if (!profile) {
        console.error('The user is not authenticated.');
        return;
      }

      setIsCashingOut(true);
      try {
        await cashOutUserEarnings(getAuthorizationHeader, profile.id, type);
        await Promise.all([onRefreshLimits(), onSuccess()]);

        // Show a success message to the user.
        setIsCashOutSuccessful(true);
      } catch (error) {
        console.error('An error happened while cashing out:', error);
        await showAlert({
          title:
            type === 'credits'
              ? t`Could not transfer your credits`
              : t`Could not cash out`,
          message:
            type === 'credits'
              ? t`An error happened while transferring your credits. Verify your internet connection or try again later.`
              : t`An error happened while cashing out. Verify your internet connection or try again later.`,
        });
      } finally {
        setIsCashingOut(false);
      }
    },
    [
      onRefreshLimits,
      showAlert,
      onSuccess,
      getAuthorizationHeader,
      profile,
      type,
    ]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={
            type === 'credits' ? (
              <Trans>Credit out</Trans>
            ) : (
              <Trans>Cash out</Trans>
            )
          }
          open
          maxWidth="sm"
          cannotBeDismissed // Prevent the user from continuing by clicking outside
          onRequestClose={onClose}
          actions={[
            <FlatButton
              key="close"
              label={
                !isCashOutSuccesfull ? (
                  <Trans>Cancel</Trans>
                ) : (
                  <Trans>Close</Trans>
                )
              }
              onClick={onClose}
              disabled={isCashingOut}
            />,
            !isCashOutSuccesfull && (
              <RaisedButton
                key="confirm"
                label={
                  type === 'credits' ? (
                    <Trans>Convert</Trans>
                  ) : (
                    <Trans>Continue</Trans>
                  )
                }
                primary
                onClick={onCashOut}
                disabled={isCashingOut}
              />
            ),
          ]}
        >
          <ColumnStackLayout noMargin>
            {type === 'credits' ? (
              isCashOutSuccesfull ? (
                <CreditsStatusBanner displayPurchaseAction={false} />
              ) : (
                <Text noMargin>
                  <Trans>
                    Exchange your earnings with GDevelop credits, and use them
                    on the GDevelop store
                  </Trans>
                </Text>
              )
            ) : null}
            <Line expand>
              <Column
                expand
                noMargin
                alignItems="center"
                justifyContent="center"
              >
                {isCashingOut ? (
                  <PlaceholderLoader />
                ) : isCashOutSuccesfull ? (
                  type === 'credits' ? (
                    <Text>
                      <Trans>🎉 You can now use your credits!</Trans>
                    </Text>
                  ) : (
                    <Text>
                      <Trans>
                        🎉 Your request has been saved. Lay back, we'll contact
                        you shortly.
                      </Trans>
                    </Text>
                  )
                ) : type === 'credits' ? (
                  <ColumnStackLayout
                    noMargin
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Coin />
                    <Text size="sub-title">
                      <Trans>
                        You'll convert{' '}
                        {(userEarningsBalance.amountInMilliUSDs / 1000).toFixed(
                          2
                        )}{' '}
                        USD to {userEarningsBalance.amountInCredits} credits.
                      </Trans>
                    </Text>
                    <Column>
                      <Text noMargin>
                        <Trans>This action cannot be undone.</Trans>
                      </Text>
                      <Text noMargin>
                        <Trans>Do you wish to continue?</Trans>
                      </Text>
                    </Column>
                  </ColumnStackLayout>
                ) : (
                  <ColumnStackLayout
                    noMargin
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text size="sub-title">
                      <Trans>
                        You're about to cash out{' '}
                        {(userEarningsBalance.amountInMilliUSDs / 1000).toFixed(
                          2
                        )}{' '}
                        USD.
                      </Trans>
                    </Text>
                    <Column>
                      <Text noMargin>
                        <Trans>
                          This action is not automatic yet, we will get in touch
                          to gather your bank details.
                        </Trans>
                      </Text>
                      <Text noMargin>
                        <Trans>Do you wish to continue?</Trans>
                      </Text>
                    </Column>
                  </ColumnStackLayout>
                )}
              </Column>
            </Line>
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};

export default CashOutDialog;
