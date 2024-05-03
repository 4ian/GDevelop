// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import { Column } from '../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Link from '../../UI/Link';
import { type SubscriptionDialogDisplayReason } from '../../Utils/Analytics/EventSender';
import { SubscriptionSuggestionContext } from './SubscriptionSuggestionContext';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import Coin from '../../Credits/Icons/Coin';
import { CalloutCard } from '../../UI/CalloutCard';

const styles = {
  diamondIcon: {
    width: 50,
    height: 50,
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
  makeButtonRaised?: boolean,
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
  makeButtonRaised,
  hideButton,
  payWithCreditsOptions,
}: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );

  return (
    <CalloutCard
      renderImage={style => (
        <img src="res/diamond.svg" style={styles.diamondIcon} alt="diamond" />
      )}
    >
      <Column expand justifyContent="center">
        <ResponsiveLineStackLayout alignItems="center" noColumnMargin noMargin>
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
          {!hideButton &&
            (!makeButtonRaised ? (
              <Link
                href="#"
                onClick={() => {
                  openSubscriptionDialog({
                    analyticsMetadata: {
                      reason: subscriptionDialogOpeningReason,
                    },
                  });
                }}
              >
                <Text noMargin color="inherit">
                  {label || <Trans>Upgrade</Trans>}
                </Text>
              </Link>
            ) : (
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
              />
            ))}
        </ResponsiveLineStackLayout>
      </Column>
    </CalloutCard>
  );
};

export default GetSubscriptionCard;
