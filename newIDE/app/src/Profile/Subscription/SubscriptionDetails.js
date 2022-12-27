// @flow
import * as React from 'react';
import { Column, Line } from '../../UI/Grid';
import { type Subscription } from '../../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import LeftLoader from '../../UI/LeftLoader';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import { SubscriptionSuggestionContext } from './SubscriptionSuggestionContext';
import Paper from '../../UI/Paper';

const styles = {
  diamondIcon: {
    width: 90,
    height: 90,
    flexShrink: 0,
    objectFit: 'contain',
  },
};

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
        <Text size="block-title">My online services subscription</Text>
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
              onClick={() =>
                openSubscriptionDialog({ reason: 'Consult profile' })
              }
            />
          </ResponsiveLineStackLayout>
        </>
      ) : (
        <>
          <Paper background="medium" variant="outlined">
            <LineStackLayout alignItems="center">
              <img src="res/diamond.svg" style={styles.diamondIcon} alt="" />
              <Column>
                <Line>
                  <Column noMargin>
                    <Text noMargin>
                      <Trans>
                        Unlock more one-click exports and other exclusive
                        features.
                      </Trans>
                    </Text>
                    <Text noMargin>
                      <Trans>
                        With a subscription, you’re also supporting the
                        improvement of GDevelop.
                      </Trans>
                    </Text>
                  </Column>
                </Line>
                <Line justifyContent="flex-start">
                  <RaisedButton
                    label={<Trans>Choose a subscription</Trans>}
                    primary
                    onClick={() =>
                      openSubscriptionDialog({ reason: 'Consult profile' })
                    }
                  />
                </Line>
              </Column>
            </LineStackLayout>
          </Paper>
        </>
      )}
    </Column>
  ) : (
    <PlaceholderLoader />
  );
};

export default SubscriptionDetails;
