// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../UI/Text';
import { Column } from '../../UI/Grid';
import { LineStackLayout } from '../../UI/Layout';
import Link from '../../UI/Link';
import { SubscriptionSuggestionContext } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';

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

const GetSubscriptionCard = () => {
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
      <LineStackLayout noMargin alignItems="center">
        <Text>
          <Trans>
            Get a silver or gold subscription to unlock color customization.
          </Trans>
        </Text>
        <Column>
          <Link
            href="#"
            onClick={() => {
              openSubscriptionDialog({
                reason: 'Leaderboard count per game limit reached',
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
