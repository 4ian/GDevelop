// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';

export const ExplanationHeader = (): React.Node => (
  <Text>
    <Trans>
      This will export your game as a Cordova project. Cordova is a technology
      that enables HTML5 games to be packaged for iOS and Android.
    </Trans>
  </Text>
);

export const DoneFooter = ({
  renderGameButton,
}: {|
  renderGameButton: () => React.Node,
|}): React.Node => (
  <Column noMargin>
    <Text>
      <Trans>
        You can now compile the game by yourself using Cordova command-line tool
        to iOS (XCode is required) or Android (Android SDK is required).
      </Trans>
    </Text>
    <Line justifyContent="center">{renderGameButton()}</Line>
  </Column>
);
