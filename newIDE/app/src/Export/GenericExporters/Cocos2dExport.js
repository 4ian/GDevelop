// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import AlertMessage from '../../UI/AlertMessage';

export const ExplanationHeader = (): React.Node => (
  <Column noMargin>
    <Text>
      <Trans>
        This will export your game using Cocos2d-JS game engine. The game can be
        compiled for Android or iOS if you install Cocos2d-JS developer tools.
      </Trans>
    </Text>
    <Spacer />
    <AlertMessage kind="info">
      <Trans>
        This export is experimental and not all features are supported by
        Cocos2D-JS. It's recommended that you thoroughly test your game and be
        ready to contribute to the game engine if you need to implement missing
        features.
      </Trans>
    </AlertMessage>
  </Column>
);

export const DoneFooter = ({
  renderGameButton,
}: {|
  renderGameButton: () => React.Node,
|}): React.Node => (
  <Column noMargin>
    <Text>
      <Trans>
        You can now upload the game to a web hosting or use Cocos2d-JS command
        line tools to export it to other platforms like iOS (XCode is required)
        or Android (Android SDK is required).
      </Trans>
    </Text>
    <Line justifyContent="center">{renderGameButton()}</Line>
  </Column>
);
