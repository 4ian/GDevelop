// @flow
import * as React from 'react';
import { Column, Line } from '../../UI/Grid';
import {
  getSubscriptionPlans,
  type Subscription,
} from '../../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import LeftLoader from '../../UI/LeftLoader';
import { LineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import { SubscriptionSuggestionContext } from './SubscriptionSuggestionContext';
import Paper from '../../UI/Paper';
import PlanCard from './PlanCard';

const styles = {
  diamondIcon: {
    width: 90,
    height: 90,
    flexShrink: 0,
    objectFit: 'contain',
  },
  paper: {
    paddingRight: 6,
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

  const userPlan = React.useMemo(
    () => {
      if (!subscription) return null;
      return getSubscriptionPlans().find(
        plan => plan.planId === subscription.planId
      );
    },
    [subscription]
  );

  return subscription ? (
    <Column noMargin>
      <Line alignItems="center">
        <Text size="block-title">My online services subscription</Text>
      </Line>
      {userPlan && userPlan.planId ? (
        <>
          <PlanCard
            plan={userPlan}
            actions={[
              <LeftLoader
                key="manage-online"
                isLoading={isManageSubscriptionLoading}
              >
                <FlatButton
                  label={<Trans>Manage online</Trans>}
                  primary
                  onClick={onManageSubscription}
                />
              </LeftLoader>,
              <RaisedButton
                key="manage"
                label={<Trans>Manage subscription</Trans>}
                primary
                onClick={() =>
                  openSubscriptionDialog({ reason: 'Consult profile' })
                }
              />,
            ]}
            isHighlighted={false}
          />
        </>
      ) : (
        <>
          <Paper background="medium" variant="outlined" style={styles.paper}>
            <LineStackLayout alignItems="center">
              <img src="res/diamond.svg" style={styles.diamondIcon} alt="" />
              <Column expand>
                <Line>
                  <Column noMargin>
                    <Text noMargin>
                      <Trans>
                        Unlock more one-click exports, cloud projects,
                        leaderboards and remove the GDevelop splashscreen.
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
                <Line justifyContent="flex-end">
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
