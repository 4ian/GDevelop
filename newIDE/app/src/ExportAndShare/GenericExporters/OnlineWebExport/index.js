// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../../UI/Text';
import { Column, Line } from '../../../UI/Grid';
import OnlineGameLink from './OnlineGameLink';
import GdGames from '../../../UI/CustomSvgIcons/GdGames';

const styles = {
  icon: {
    height: 48,
    width: 48,
    margin: 10,
  },
};

const ExplanationHeader = () => {
  return (
    <Column noMargin>
      <Line alignItems="center" justifyContent="center">
        <Text align="center">
          <Trans>
            Generate a unique link, playable from any computer or mobile phone's
            browser.
          </Trans>
        </Text>
      </Line>
      <Line justifyContent="center">
        <GdGames color="secondary" style={styles.icon} />
      </Line>
    </Column>
  );
};

const onlineWebExporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: <Trans>gd.games</Trans>,
  helpPage: '/publishing/web',
};

export { onlineWebExporter, ExplanationHeader, OnlineGameLink };
