// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { type RenderIconProps } from '../ExportDialog';
import Cordova from '../../UI/CustomSvgIcons/Cordova';

export const ExplanationHeader = () => (
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
|}) => (
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

export const cordovaExporter = {
  name: <Trans>iOS &amp; Android (manual)</Trans>,
  renderIcon: (props: RenderIconProps) => <Cordova {...props} />,
  helpPage: '/publishing/android_and_ios_with_cordova',
  description: (
    <Trans>
      Build the game locally as a Cordova project, and export it manually to iOS
      or Android with Cordova developers tools.
    </Trans>
  ),
  advanced: true,
};
