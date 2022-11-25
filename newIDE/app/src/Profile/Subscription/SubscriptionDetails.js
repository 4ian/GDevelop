// @flow
import * as React from 'react';
import { Column, Line } from '../../UI/Grid';
import { type Subscription } from '../../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import LeftLoader from '../../UI/LeftLoader';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import { SubscriptionSuggestionContext } from './SubscriptionSuggestionContext';

type Props = {
  subscription: ?Subscription,
  onManageSubscription: () => void | Promise<void>,
  isManageSubscriptionLoading: boolean,
};

const SubscriptionDetails = ({
  subscription,
  isManageSubscriptionLoading,
  onManageSubscription,
}: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  return subscription ? (
    <Column>
      <Line alignItems="center">
        <Text size="block-title">My online services subscriptions</Text>
      </Line>
      {subscription.planId ? (
        <>
          <Line>
            <Text>
              <Trans>
                You are subscribed to <b>{subscription.planId}</b>.
                Congratulations! You have access to more cloud projects,
                leaderboards, player feedbacks, cloud builds.
              </Trans>
            </Text>
          </Line>
          <ResponsiveLineStackLayout justifyContent="flex-end">
            <LeftLoader isLoading={isManageSubscriptionLoading}>
              <FlatButton
                label={<Trans>Manage online</Trans>}
                primary
                onClick={onManageSubscription}
              />
            </LeftLoader>
            <RaisedButton
              label={<Trans>Upgrade or cancel</Trans>}
              primary
              onClick={() => openSubscriptionDialog({ reason: 'Consult profile' })}
            />
          </ResponsiveLineStackLayout>
        </>
      ) : (
        <>
          <Line>
            <Text>
              <Trans>
                Get a subscription to unlock more cloud projects, more
                leaderboards and more player feedbacks. You'll also have more
                cloud builds to publish your game to Android and on desktop.
              </Trans>
            </Text>
          </Line>
          <Line justifyContent="flex-end">
            <RaisedButton
              label={<Trans>Choose a subscription</Trans>}
              primary
              onClick={() => openSubscriptionDialog({ reason: 'Consult profile' })}
            />
          </Line>
        </>
      )}
    </Column>
  ) : (
    <PlaceholderLoader />
  );
};

export default SubscriptionDetails;
