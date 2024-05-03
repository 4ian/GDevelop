// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../UI/Text';
import { Column } from '../../UI/Grid';
import { LineStackLayout } from '../../UI/Layout';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';

const LeaderboardPlaygroundCard = () => {
  return (
    <LineStackLayout
      expand
      noMargin
      alignItems="center"
      justifyContent="space-around"
    >
      <Column>
        <Text>
          <Trans>
            Experiment with the leaderboard colors using the playground
          </Trans>
        </Text>
      </Column>
      <Column>
        <Link
          href="https://gd.games/playground/test-leaderboard"
          onClick={() =>
            Window.openExternalURL(
              'https://gd.games/playground/test-leaderboard'
            )
          }
        >
          <Text noMargin color="inherit">
            <Trans>Playground</Trans>
          </Text>
        </Link>
      </Column>
    </LineStackLayout>
  );
};

export default LeaderboardPlaygroundCard;
