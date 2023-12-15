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
|};

const GetSubscriptionCard = (props: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const subscriptionContainerStyle = {
    ...styles.subscriptionContainer,
    border: `1px solid ${gdevelopTheme.palette.primary}`,
  };

  return (
    <div style={subscriptionContainerStyle}>
      <img src="res/diamond.svg" style={styles.diamondIcon} alt="diamond" />
      <LineStackLayout alignItems="center" expand>
        <Column noMargin expand>
          {props.children}
        </Column>
        <Column>
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
              <Trans>Upgrade</Trans>
            </Text>
          </Link>
        </Column>
      </LineStackLayout>
    </div>
  );
};

export default GetSubscriptionCard;
