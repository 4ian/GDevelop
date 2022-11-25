// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import Star from '@material-ui/icons/Star';
import Favorite from '@material-ui/icons/Favorite';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import { Column, LargeSpacer, Line } from '../UI/Grid';
import {
  sendSubscriptionCheckDialogShown,
  sendSubscriptionCheckDismiss,
} from '../Utils/Analytics/EventSender';
import Text from '../UI/Text';

export type SubscriptionCheckerInterface = {|
  checkHasSubscription: () => boolean,
|};

type Props = {|
  title: React.Node,
  id: string,
  onChangeSubscription?: () => void,
  mode: 'try' | 'mandatory',
|};

const styles = {
  icon: { width: 40, height: 40, marginRight: 20 },
  iconText: { flex: 1 },
};

const SubscriptionChecker = React.forwardRef<
  Props,
  SubscriptionCheckerInterface
>(({ mode, id, title, onChangeSubscription }, ref) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const closeDialog = () => {
    sendSubscriptionCheckDismiss();
    setDialogOpen(false);
  };

  const checkHasSubscription = () => {
    if (authenticatedUser.subscription) {
      const hasPlan = !!authenticatedUser.subscription.planId;
      if (hasPlan) {
        setDialogOpen(false);
        return true;
      }
    }

    setDialogOpen(true);
    sendSubscriptionCheckDialogShown({ mode, id });

    return false;
  };

  React.useImperativeHandle(ref, () => ({ checkHasSubscription }));

  return (
    <Dialog
      open={dialogOpen}
      title={mode === 'try' ? <Trans>We need your support!</Trans> : title}
      actions={[
        onChangeSubscription && (
          <DialogPrimaryButton
            label={<Trans>Get a subscription or login</Trans>}
            key="subscribe"
            primary
            onClick={() => {
              setDialogOpen(false);
              onChangeSubscription();
            }}
          />
        ),
      ]}
      secondaryActions={[
        <FlatButton
          label={
            mode === 'try' ? (
              <Trans>Continue anyway</Trans>
            ) : (
              <Trans>Not now, thanks!</Trans>
            )
          }
          key="close"
          primary={false}
          onClick={closeDialog}
        />,
      ]}
      onRequestClose={closeDialog}
    >
      <Column noMargin>
        <Line noMargin alignItems="center">
          {mode === 'try' ? (
            <Text>
              <Trans>Please get a subscription to keep GDevelop running.</Trans>
            </Text>
          ) : (
            <Text>
              <Trans>
                To use this feature, we ask you to get a subscription to
                GDevelop.
              </Trans>
            </Text>
          )}
        </Line>
        <Line noMargin alignItems="center">
          <Star style={styles.icon} />
          <Text style={styles.iconText}>
            <Trans>
              Get a subscription to gain more one-click exports, remove the
              GDevelop splashscreen and this message asking you to get a
              subscription.
            </Trans>
          </Text>
        </Line>
        <Line noMargin alignItems="center">
          <Favorite style={styles.icon} />
          <Text style={styles.iconText}>
            <Trans>
              You're also supporting the development of GDevelop, an open-source
              software! In the future, more online services will be available
              for users with a subscription.
            </Trans>
          </Text>
        </Line>
        <LargeSpacer />
        <Text align="right">
          <b>
            <Trans>Thanks!</Trans>
          </b>
        </Text>
      </Column>
    </Dialog>
  );
});

export default SubscriptionChecker;
