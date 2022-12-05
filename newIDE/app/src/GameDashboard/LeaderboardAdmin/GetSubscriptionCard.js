// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { LineStackLayout } from '../../UI/Layout';
import Link from '../../UI/Link';
import { SubscriptionSuggestionContext } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';
import Window from '../../Utils/Window';

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
      <LineStackLayout alignItems="center">
        <Column noMargin>
          <Text>
            <Trans>
              Get a silver or gold subscription to unlock color customization.
            </Trans>
          </Text>
          <Line noMargin>
            <Link
              href="https://liluo.io/playground/test-leaderboard"
              onClick={() =>
                Window.openExternalURL(
                  'https://liluo.io/playground/test-leaderboard'
                )
              }
            >
              <Text noMargin color="inherit">
                <Trans>Test it out!</Trans>
              </Text>
            </Link>
          </Line>
        </Column>
        <Column>
          <Link
            href="#"
            onClick={() => {
              openSubscriptionDialog({
                reason: 'Leaderboard customization',
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
