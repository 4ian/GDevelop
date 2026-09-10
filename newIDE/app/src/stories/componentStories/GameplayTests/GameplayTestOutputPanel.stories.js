// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import paperDecorator from '../../PaperDecorator';
import { GameplayTestOutputPanel } from '../../../GameplayTests/GameplayTestOutputPanel';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';

export default {
  title: 'GameplayTests/GameplayTestOutputPanel',
  component: GameplayTestOutputPanel,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <FixedWidthFlexContainer width={290}>
    <ColumnStackLayout>
      <Text noMargin size="sub-title">
        Errors
      </Text>
      <GameplayTestOutputPanel
        canCopy
        lines={[
          { level: 'error', message: 'Assertion failed: Score is 1' },
          { level: 'error', message: '    at gameplay test source (line 12)' },
        ]}
        placeholder={<Trans>No error.</Trans>}
      />
      <Text noMargin size="sub-title">
        Console logs of the game
      </Text>
      <GameplayTestOutputPanel
        canCopy
        lines={[
          { level: 'log', message: 'Player spawned', prefix: 'frame 1' },
          {
            level: 'info',
            message: 'Coin collected at 320;480',
            prefix: 'frame 128',
          },
          {
            level: 'warn',
            message: 'Coin has no "Collectible" behavior',
            prefix: 'frame 128',
          },
          {
            level: 'error',
            message:
              'Uncaught TypeError: Cannot read property "value" of null, in a very long message that has to be wrapped on several lines to be fully readable.',
            prefix: 'frame 130',
          },
        ]}
        placeholder={<Trans>The game did not log anything.</Trans>}
      />
      <Text noMargin size="sub-title">
        Empty
      </Text>
      <GameplayTestOutputPanel
        lines={[]}
        placeholder={
          <Trans>
            Everything logged by the game with `console.log` while the test runs
            will be shown here.
          </Trans>
        }
      />
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);
