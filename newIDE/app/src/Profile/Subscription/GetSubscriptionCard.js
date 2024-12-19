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
|};

const GetSubscriptionCard = ({
  children,
  subscriptionDialogOpeningReason,
  label,
  hideButton,
  payWithCreditsOptions,
}: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const { isMobile } = useResponsiveWindowSize();
  return (
    <div className={classes.premiumContainer}>
      <Paper style={styles.paper} background="medium">
        <Line expand alignItems="center" noMargin={!isMobile}>
          <img src="res/diamond.svg" style={styles.diamondIcon} alt="diamond" />
          <Column expand justifyContent="center">
            <ResponsiveLineStackLayout
              alignItems="center"
              noColumnMargin
              noMargin
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
                    openSubscriptionDialog({
                      analyticsMetadata: {
                        reason: subscriptionDialogOpeningReason,
                      },
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
