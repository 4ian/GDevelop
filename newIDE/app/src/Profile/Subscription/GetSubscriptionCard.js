// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { type SubscriptionDialogDisplayReason } from '../../Utils/Analytics/EventSender';
import { SubscriptionSuggestionContext } from './SubscriptionSuggestionContext';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import Coin from '../../Credits/Icons/Coin';
import classes from './GetSubscriptionCard.module.css';
import Paper from '../../UI/Paper';
import CrownShining from '../../UI/CustomSvgIcons/CrownShining';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import { hasValidSubscriptionPlan } from '../../Utils/GDevelopServices/Usage';

const styles = {
  paper: {
    zIndex: 2, // Make sure the paper is above the background for the border effect.
    flex: 1,
  },
  diamondIcon: {
    width: 70,
    height: 70,
  },
  coinIcon: {
    width: 12,
    height: 12,
    // Prevent cumulative layout shift by enforcing the ratio.
    aspectRatio: '1',
  },
};

type Props = {|
  children: React.Node,
  subscriptionDialogOpeningReason: SubscriptionDialogDisplayReason,
  label?: React.Node,
  hideButton?: boolean,
  payWithCreditsOptions?: {|
    label: React.Node,
    onPayWithCredits: () => void,
  |},
  onUpgrade?: () => void,
  forceColumnLayout?: boolean,
  filter?: 'individual' | 'team' | 'education',
  recommendedPlanIdIfNoSubscription?:
    | 'gdevelop_silver'
    | 'gdevelop_gold'
    | 'gdevelop_startup'
    | 'gdevelop_education',
|};

const GetSubscriptionCard = ({
  children,
  subscriptionDialogOpeningReason,
  label,
  hideButton,
  payWithCreditsOptions,
  onUpgrade,
  forceColumnLayout,
  filter,
  recommendedPlanIdIfNoSubscription,
}: Props) => {
  const { subscription } = React.useContext(AuthenticatedUserContext);
  const actualPlanIdToRecommend = hasValidSubscriptionPlan(subscription)
    ? // If the user already has a subscription, show the original subscription dialog.
      undefined
    : recommendedPlanIdIfNoSubscription;
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const { isMobile } = useResponsiveWindowSize();
  const columnLayout = forceColumnLayout || isMobile;
  return (
    <div className={classes.premiumContainer}>
      <Paper style={styles.paper} background="medium">
        <Line expand alignItems="center" noMargin={!columnLayout}>
          <img src="res/diamond.svg" style={styles.diamondIcon} alt="diamond" />
          <Column expand justifyContent="center">
            <ResponsiveLineStackLayout
              alignItems="center"
              noColumnMargin
              noMargin
              forceMobileLayout={columnLayout}
            >
              <Column noMargin expand>
                {children}
              </Column>
              {payWithCreditsOptions && (
                <FlatButton
                  leftIcon={<Coin style={styles.coinIcon} />}
                  label={payWithCreditsOptions.label}
                  primary
                  onClick={payWithCreditsOptions.onPayWithCredits}
                />
              )}
              {!hideButton && (
                <RaisedButton
                  label={label || <Trans>Upgrade</Trans>}
                  primary
                  onClick={() => {
                    if (onUpgrade) {
                      onUpgrade();
                    }
                    openSubscriptionDialog({
                      analyticsMetadata: {
                        reason: subscriptionDialogOpeningReason,
                        recommendedPlanId: actualPlanIdToRecommend,
                      },
                      filter,
                    });
                  }}
                  icon={<CrownShining fontSize="small" />}
                />
              )}
            </ResponsiveLineStackLayout>
          </Column>
        </Line>
      </Paper>
    </div>
  );
};

export default GetSubscriptionCard;
