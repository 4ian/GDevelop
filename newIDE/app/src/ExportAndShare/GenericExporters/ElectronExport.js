// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import Checkbox from '../../UI/Checkbox';
import { Column, Line } from '../../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Check from '../../UI/CustomSvgIcons/Check';
import FlatButton from '../../UI/FlatButton';
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import RaisedButton from '../../UI/RaisedButton';
import { type ExportFlowProps } from '../ExportPipeline.flow';

export type ElectronWindowOptions = {|
  transparentWindow: boolean,
  framelessWindow: boolean,
  transparentRuntimeBackground: boolean,
  disableWindowShadow: boolean,
  disableHardwareAcceleration: boolean,
|};

export const getDefaultElectronWindowOptions = (): ElectronWindowOptions => ({
  transparentWindow: false,
  framelessWindow: false,
  transparentRuntimeBackground: false,
  disableWindowShadow: false,
  disableHardwareAcceleration: false,
});

export const applyElectronWindowOptionsToExportOptions = (
  exportOptions: gdExportOptions,
  electronWindowOptions: ElectronWindowOptions
) => {
  exportOptions
    .setElectronTransparentWindow(electronWindowOptions.transparentWindow)
    .setElectronFramelessWindow(electronWindowOptions.framelessWindow)
    .setElectronTransparentRuntimeBackground(
      electronWindowOptions.transparentRuntimeBackground
    )
    .setElectronDisableWindowShadow(electronWindowOptions.disableWindowShadow)
    .setElectronDisableHardwareAcceleration(
      electronWindowOptions.disableHardwareAcceleration
    );
};

export const ElectronWindowOptionsEditor = ({
  electronWindowOptions,
  onChange,
  disabled,
}: {|
  electronWindowOptions: ElectronWindowOptions,
  onChange: (electronWindowOptions: ElectronWindowOptions) => void,
  disabled: boolean,
|}): React.Node => {
  const setOption = (
    optionName: $Keys<ElectronWindowOptions>,
    checked: boolean
  ) => {
    const nextElectronWindowOptions = {
      ...electronWindowOptions,
      [optionName]: checked,
    };

    if (optionName === 'transparentWindow' && checked) {
      nextElectronWindowOptions.transparentRuntimeBackground = true;
    }

    onChange(nextElectronWindowOptions);
  };

  return (
    <Column noMargin>
      <Line>
        <Text>
          <Trans>Desktop window options</Trans>
        </Text>
      </Line>
      <Checkbox
        label={<Trans>Transparent native window</Trans>}
        checked={electronWindowOptions.transparentWindow}
        onCheck={(e, checked) => setOption('transparentWindow', checked)}
        disabled={disabled}
        tooltipOrHelperText={
          <Trans>
            Creates the Electron window with native transparency enabled.
          </Trans>
        }
      />
      <Checkbox
        label={<Trans>Frameless window</Trans>}
        checked={electronWindowOptions.framelessWindow}
        onCheck={(e, checked) => setOption('framelessWindow', checked)}
        disabled={disabled}
      />
      <Checkbox
        label={<Trans>Transparent game background</Trans>}
        checked={electronWindowOptions.transparentRuntimeBackground}
        onCheck={(e, checked) =>
          setOption('transparentRuntimeBackground', checked)
        }
        disabled={disabled}
      />
      <Checkbox
        label={<Trans>Disable window shadow</Trans>}
        checked={electronWindowOptions.disableWindowShadow}
        onCheck={(e, checked) => setOption('disableWindowShadow', checked)}
        disabled={disabled}
      />
      <Checkbox
        label={<Trans>Disable hardware acceleration</Trans>}
        checked={electronWindowOptions.disableHardwareAcceleration}
        onCheck={(e, checked) =>
          setOption('disableHardwareAcceleration', checked)
        }
        disabled={disabled}
        tooltipOrHelperText={
          <Trans>
            Use only as a compatibility option for transparent windows.
          </Trans>
        }
      />
    </Column>
  );
};

export const ExplanationHeader = (): React.Node => (
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
}: ElectronExportFlowProps): React.Node | null =>
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
|}): React.Node => {
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
  tabName: (<Trans>Desktop</Trans>: React.Node),
  name: (<Trans>Windows/macOS/Linux (manual)</Trans>: React.Node),
  helpPage: '/publishing/windows-macos-linux-with-electron',
};
