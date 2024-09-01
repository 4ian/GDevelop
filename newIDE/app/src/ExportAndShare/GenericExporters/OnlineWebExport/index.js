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

type ExplanationHeaderProps = {|
  uiMode: 'minimal' | 'full',
|};

const ExplanationHeader = ({ uiMode }: ExplanationHeaderProps) => {
  if (uiMode === 'minimal') return null;

  return (
    <Column noMargin>
      <Line alignItems="center" justifyContent="center">
        <Text align="center">
          <Trans>
            Publishing to gd.games, the GDevelop gaming platform. Games can be
            played from any device.
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
