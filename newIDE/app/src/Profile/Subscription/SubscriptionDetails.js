// @flow
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column, Line } from '../../UI/Grid';
import {
  getFormerSubscriptionPlans,
  getSubscriptionPlans,
  type Subscription,
  type PlanDetails,
} from '../../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import LeftLoader from '../../UI/LeftLoader';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
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
      const possiblePlans: Array<PlanDetails> = getSubscriptionPlans().concat(
        getFormerSubscriptionPlans()
      );
      return possiblePlans.find(plan => plan.planId === subscription.planId);
    },
    [subscription]
  );

  return subscription ? (
    <Column noMargin>
      <Line alignItems="center">
        <Text size="block-title">My online services subscription</Text>
      </Line>
      {userPlan && userPlan.planId ? (
        <ColumnStackLayout noMargin>
          <PlanCard
            plan={userPlan}
            hidePrice={!!subscription.redemptionCodeValidUntil}
            actions={[
              <LeftLoader
                key="manage-online"
                isLoading={isManageSubscriptionLoading}
              >
                <FlatButton
                  label={<Trans>Manage online</Trans>}
                  primary
                  onClick={onManageSubscription}
                  disabled={isManageSubscriptionLoading}
                />
              </LeftLoader>,
              <RaisedButton
                key="manage"
                label={<Trans>Manage subscription</Trans>}
                primary
                onClick={() =>
                  openSubscriptionDialog({ reason: 'Consult profile' })
                }
                disabled={isManageSubscriptionLoading}
              />,
            ]}
            isHighlighted={false}
            background="medium"
          />
          {!!subscription.redemptionCodeValidUntil && (
            <I18n>
              {({ i18n }) => (
                <Paper background="dark" variant="outlined">
                  <LineStackLayout alignItems="center">
                    <img
                      src="res/diamond.svg"
                      style={styles.diamondIcon}
                      alt=""
                    />
                    <Column>
                      <Text>
                        <Trans>
                          Thanks to the redemption code you've used, you have
                          this subscription enabled until{' '}
                          {i18n.date(subscription.redemptionCodeValidUntil)}.
                        </Trans>
                      </Text>
                    </Column>
                  </LineStackLayout>
                </Paper>
              )}
            </I18n>
          )}
        </ColumnStackLayout>
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
