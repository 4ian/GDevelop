// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../UI/Text';
import { Column } from '../../UI/Grid';
import { LineStackLayout } from '../../UI/Layout';
import Link from '../../UI/Link';

import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { type SubscriptionDialogDisplayReason } from '../../Utils/Analytics/EventSender';
import { SubscriptionSuggestionContext } from './SubscriptionSuggestionContext';
import RaisedButton from '../../UI/RaisedButton';

const styles = {
  subscriptionContainer: {
    display: 'flex',
    borderRadius: 10,
    alignItems: 'center',
  },
  diamondIcon: {
    width: 50,
    height: 50,
  },
};

type Props = {|
  children: React.Node,
  subscriptionDialogOpeningReason: SubscriptionDialogDisplayReason,
  label?: React.Node,
  makeButtonRaised?: boolean,
|};

const GetSubscriptionCard = (props: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const subscriptionContainerStyle = {
    ...styles.subscriptionContainer,
    border: `1px solid ${gdevelopTheme.palette.secondary}`,
  };

  return (
    <div style={subscriptionContainerStyle}>
      <img src="res/diamond.svg" style={styles.diamondIcon} alt="diamond" />
      <LineStackLayout alignItems="center" expand>
        <Column noMargin expand>
          {props.children}
        </Column>
        <Column>
          {!props.makeButtonRaised ? (
            <Link
              href="#"
              onClick={() => {
                openSubscriptionDialog({
                  analyticsMetadata: {
                    reason: props.subscriptionDialogOpeningReason,
                  },
                });
              }}
            >
              <Text noMargin color="inherit">
                {props.label || <Trans>Upgrade</Trans>}
              </Text>
            </Link>
          ) : (
            <RaisedButton
              label={props.label || <Trans>Upgrade</Trans>}
              primary
              onClick={() => {
                openSubscriptionDialog({
                  analyticsMetadata: {
                    reason: props.subscriptionDialogOpeningReason,
                  },
                });
              }}
            />
          )}
        </Column>
      </LineStackLayout>
    </div>
  );
};

export default GetSubscriptionCard;
