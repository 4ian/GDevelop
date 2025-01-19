// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import FlatButton from '../../UI/FlatButton';
import Dialog from '../../UI/Dialog';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import { Column } from '../../UI/Grid';
import {
  sendSubscriptionCheckDialogShown,
  sendSubscriptionCheckDismiss,
} from '../../Utils/Analytics/EventSender';
import Text from '../../UI/Text';
import { hasValidSubscriptionPlan } from '../../Utils/GDevelopServices/Usage';
import { isNativeMobileApp } from '../../Utils/Platform';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';
import GetSubscriptionCard from './GetSubscriptionCard';
import { ColumnStackLayout } from '../../UI/Layout';

export type SubscriptionCheckerInterface = {|
  checkUserHasSubscription: () => boolean,
  hasUserSubscription: () => boolean,
|};

type Props = {|
  title: React.Node,
  id:
    | 'Disable GDevelop splash at startup'
    | 'Debugger'
    | 'Hot reloading'
    | 'Preview over wifi',
  onChangeSubscription?: () => Promise<void> | void,
  mode: 'try' | 'mandatory',
  isNotShownDuringInAppTutorial?: boolean,
|};

const SubscriptionChecker = React.forwardRef<
  Props,
  SubscriptionCheckerInterface
>(
  (
    { mode, id, title, onChangeSubscription, isNotShownDuringInAppTutorial },
    ref
  ) => {
    const authenticatedUser = React.useContext(AuthenticatedUserContext);
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

    const closeDialog = () => {
      sendSubscriptionCheckDismiss();
      setDialogOpen(false);
    };

    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );

    const checkUserHasSubscription = () => {
      if (
        hasValidSubscriptionPlan(authenticatedUser.subscription) ||
        (isNotShownDuringInAppTutorial && currentlyRunningInAppTutorial)
      ) {
        setDialogOpen(false);
        return true;
      }

      if (isNativeMobileApp()) {
        // Would present App Store screen.
      } else {
        setDialogOpen(true);
        sendSubscriptionCheckDialogShown({ mode, id });
      }

      return false;
    };

    const hasUserSubscription = () => {
      return hasValidSubscriptionPlan(authenticatedUser.subscription);
    };

    React.useImperativeHandle(ref, () => ({
      checkUserHasSubscription,
      hasUserSubscription,
    }));

    return (
      <Dialog
        open={dialogOpen}
        title={title}
        actions={[
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
        maxWidth="sm"
      >
        <ColumnStackLayout noMargin>
          <Text size="sub-title">
            ❤️ <Trans>Support What You Love</Trans>
          </Text>
          <Text color="secondary">
            <Trans>
              Your membership helps the GDevelop company maintain servers, build
              new features and keep the open-source project thriving. Our goal:
              make game development fast, fun and accessible to all.
            </Trans>
          </Text>
          <GetSubscriptionCard
            subscriptionDialogOpeningReason={id}
            label={<Trans>Get Premium</Trans>}
            onUpgrade={() => {
              if (onChangeSubscription) onChangeSubscription();
              setDialogOpen(false);
            }}
            recommendedPlanIdIfNoSubscription="gdevelop_silver"
          >
            <Column noMargin expand>
              <Text>
                <Trans>
                  Upgrade to get more cloud projects, publishing, multiplayer,
                  courses and credits every month with GDevelop Premium.
                </Trans>
              </Text>
            </Column>
          </GetSubscriptionCard>
        </ColumnStackLayout>
      </Dialog>
    );
  }
);

export default SubscriptionChecker;
