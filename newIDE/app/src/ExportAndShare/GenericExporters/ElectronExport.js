// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Check from '../../UI/CustomSvgIcons/Check';
import FlatButton from '../../UI/FlatButton';
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import RaisedButton from '../../UI/RaisedButton';
import { type ExportFlowProps } from '../ExportPipeline.flow';

export const ExplanationHeader = () => (
  <Text align="center">
    <Trans>
      This will export your game so that you can package it for Windows, macOS
      or Linux. You will need to install third-party tools (Node.js, Electron
      Builder) to package your game.
    </Trans>
  </Text>
);

type ElectronExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

export const ExportFlow = ({
  disabled,
  launchExport,
  isExporting,
  exportStep,
  exportPipelineName,
}: ElectronExportFlowProps) =>
  exportStep !== 'done' ? (
    <Line justifyContent="center">
      <RaisedButton
        label={
          !isExporting ? (
            <Trans>Package game files</Trans>
          ) : (
            <Trans>Packaging...</Trans>
          )
        }
        primary
        id={`launch-export-${exportPipelineName}-button`}
        onClick={launchExport}
        disabled={disabled || isExporting}
      />
    </Line>
  ) : null;

export const DoneFooter = ({
  renderGameButton,
}: {|
  renderGameButton: () => React.Node,
|}) => {
  const openLearnMore = () => {
    Window.openExternalURL(
      getHelpLink('/publishing/windows-macos-linux-with-electron')
    );
  };

  return (
    <Column noMargin alignItems="center">
      <LineStackLayout noMargin justifyContent="center" alignItems="center">
        <Check fontSize="small" />
        <Text>
          <Trans>Done!</Trans>
        </Text>
      </LineStackLayout>
      <Text>
        <Trans>
          The game was properly exported. You can now use Electron Builder (you
          need Node.js installed and to use the command-line on your computer to
          run it) to create an executable.
        </Trans>
      </Text>
      <ColumnStackLayout justifyContent="center">
        <Line justifyContent="center">{renderGameButton()}</Line>
        <FlatButton
          label={<Trans>Learn more about manual builds</Trans>}
          primary
          onClick={openLearnMore}
          leftIcon={<Help />}
        />
      </ColumnStackLayout>
    </Column>
  );
};

export const electronExporter = {
  key: 'electronexport',
  tabName: <Trans>Desktop</Trans>,
  name: <Trans>Windows/macOS/Linux (manual)</Trans>,
  helpPage: '/publishing/windows-macos-linux-with-electron',
};
