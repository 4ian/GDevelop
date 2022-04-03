// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../../UI/Text';
import { Column, Line } from '../../../UI/Grid';
import OnlineGameLink from './OnlineGameLink';

const ExplanationHeader = () => (
  <Column noMargin alignItems="center" justifyContent="center">
    <Line>
      <Text align="center">
        <Trans>
          Generate a unique link, playable from any computer or mobile phone's
          browser.
        </Trans>
      </Text>
    </Line>
  </Column>
);

const onlineWebExporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: <Trans>Web</Trans>,
  helpPage: '/publishing/web',
};

export { onlineWebExporter, ExplanationHeader, OnlineGameLink };
