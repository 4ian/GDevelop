// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';

export const ExplanationHeader = () => (
  <Text>
    <Trans>
      This will export your game so that you can package it for Windows, macOS
      or Linux. You will need to install third-party tools (Node.js, Electron
      Builder) to package your game.
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
        The game was properly exported. You can now use Electron Builder (you
        need Node.js installed and to use the command-line on your computer to
        run it) to create an executable.
      </Trans>
    </Text>
    <Line justifyContent="center">{renderGameButton()}</Line>
  </Column>
);

export const electronExporter = {
  key: 'electronexport',
  tabName: <Trans>Desktop</Trans>,
  name: <Trans>Windows/macOS/Linux (manual)</Trans>,
  helpPage: '/publishing/windows-macos-linux-with-electron',
};
