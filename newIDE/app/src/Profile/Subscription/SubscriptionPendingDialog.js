// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import React from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import { type AuthenticatedUser } from '../AuthenticatedUserContext';
import { Column, Line, Spacer } from '../../UI/Grid';
import BackgroundText from '../../UI/BackgroundText';
import UserVerified from '../../UI/CustomSvgIcons/UserVerified';
import Text from '../../UI/Text';
import { useInterval } from '../../Utils/UseInterval';
import CircularProgress from '../../UI/CircularProgress';
import TextField from '../../UI/TextField';
import { discordUsernameConfig } from '../../Utils/GDevelopServices/User';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import LeftLoader from '../../UI/LeftLoader';
import { canBenefitFromDiscordRole } from '../../Utils/GDevelopServices/Usage';

type Props = {|
  onClose: Function,
  authenticatedUser: AuthenticatedUser,
|};

export default function SubscriptionPendingDialog({
  onClose,
  authenticatedUser,
}: Props) {
  const userPlanIdAtOpening = React.useRef<?string>(
    !!authenticatedUser.subscription
      ? authenticatedUser.subscription.planId
      : null
  );
  const userPlanId = !!authenticatedUser.subscription
    ? authenticatedUser.subscription.planId
    : null;
  const hasUserPlanChanged = userPlanId !== userPlanIdAtOpening.current;
  const canUserBenefitFromDiscordRole =
    !!authenticatedUser &&
    canBenefitFromDiscordRole(authenticatedUser.subscription);

  useInterval(
    () => {
      authenticatedUser.onRefreshSubscription().catch(() => {
        // Ignore any error, will be retried anyway.
      });
    },
    hasUserPlanChanged ? null : 3900
  );
  const currentDiscordUsername =
    !!authenticatedUser && !!authenticatedUser.profile
      ? authenticatedUser.profile.discordUsername
      : null;

  const [discordUsername, setDiscordUsername] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { values: preferences } = React.useContext(PreferencesContext);

  const onEdit = React.useCallback(
    async () => {
      if (!authenticatedUser || !authenticatedUser.profile) return;
      if (!discordUsername) return;
      setIsLoading(true);
      try {
        await authenticatedUser.onEditProfile(
          {
            discordUsername,
          },
          preferences,
          { throwError: false }
        );
      } catch (error) {
        console.error('Error while editing profile:', error);
        // Ignore errors, we will let the user retry in their profile.
      } finally {
        setIsLoading(false);
      }
    },
    [authenticatedUser, discordUsername, preferences]
  );

  const onFinish = React.useCallback(
    async () => {
      // If the user has edited their Discord username, send it to the server before closing.
      if (!!discordUsername) {
        await onEdit();
      }
      onClose();
    },
    [onClose, onEdit, discordUsername]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Confirming your subscription</Trans>}
          actions={[
            hasUserPlanChanged ? (
              <LeftLoader isLoading={isLoading} key="close">
                <DialogPrimaryButton
                  label={<Trans>Done!</Trans>}
                  primary
                  onClick={onFinish}
                  disabled={isLoading}
                />
              </LeftLoader>
            ) : (
              <FlatButton
                label={<Trans>Cancel and close</Trans>}
                key="close"
                primary={false}
                onClick={onClose}
                disabled={isLoading}
              />
            ),
          ]}
          onRequestClose={onClose}
          maxWidth="sm"
          open
        >
          {!hasUserPlanChanged ? (
            <Column noMargin>
              <Line expand alignItems="center" justifyContent="center">
                <Text>
                  <Trans>
                    Thanks for getting a subscription and supporting GDevelop!
                  </Trans>{' '}
                  {'💜'}
                </Text>
              </Line>
              <Line expand alignItems="center" justifyContent="center" noMargin>
                <Text>
                  <b>
                    <Trans>
                      Your browser will now open to enter your payment details.
                    </Trans>
                  </b>
                </Text>
              </Line>
              <Line justifyContent="center" alignItems="center">
                <CircularProgress size={20} />
                <Spacer />
                <Text>
                  <Trans>Waiting for the subscription confirmation...</Trans>
                </Text>
              </Line>
              <Spacer />
              <Line justifyContent="center">
                <BackgroundText>
                  <Trans>
                    Once you're done, come back to GDevelop and your account
                    will be upgraded automatically, unlocking the extra exports
                    and online services.
                  </Trans>
                </BackgroundText>
              </Line>
            </Column>
          ) : (
            <Column noMargin>
              <Line expand alignItems="center" justifyContent="center">
                <Text>
                  <Trans>
                    Thanks for getting a subscription and supporting GDevelop!
                  </Trans>{' '}
                  {'💜'}
                </Text>
              </Line>
              <Line justifyContent="center" alignItems="center">
                <UserVerified />
                <Spacer />
                <Text>
                  <b>
                    <Trans>Your new plan is now activated.</Trans>
                  </b>
                </Text>
              </Line>
              <Spacer />
              <Line justifyContent="center">
                <BackgroundText>
                  <Trans>
                    Your account is upgraded, with the extra exports and online
                    services. If you wish to change later, come back to your
                    profile and choose another plan.
                  </Trans>
                </BackgroundText>
              </Line>
              {!currentDiscordUsername && canUserBenefitFromDiscordRole && (
                <Line>
                  <TextField
                    value={discordUsername}
                    fullWidth
                    translatableHintText={t`Enter your Discord username`}
                    onChange={(e, value) => {
                      setDiscordUsername(value);
                    }}
                    disabled={isLoading}
                    maxLength={discordUsernameConfig.maxLength}
                    helperMarkdownText={i18n._(
                      t`Add your Discord username to get access to a dedicated channel! Join the [GDevelop Discord](https://discord.gg/gdevelop).`
                    )}
                  />
                </Line>
              )}
            </Column>
          )}
        </Dialog>
      )}
    </I18n>
  );
}
