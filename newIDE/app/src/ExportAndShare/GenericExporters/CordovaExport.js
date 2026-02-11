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
      This will export your game as a Cordova project. Cordova is a technology
      that enables HTML5 games to be packaged for iOS and Android.
    </Trans>
  </Text>
);

type CordovaExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

export const ExportFlow = ({
  disabled,
  launchExport,
  isExporting,
  exportStep,
  exportPipelineName,
}: CordovaExportFlowProps) =>
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
      getHelpLink('/publishing/android_and_ios_with_cordova')
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
          You can now compile the game by yourself using Cordova command-line
          tool to iOS (XCode is required) or Android (Android SDK is required).
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

export const cordovaExporter = {
  key: 'cordovaexport',
  tabName: <Trans>Mobile</Trans>,
  name: <Trans>iOS &amp; Android (manual)</Trans>,
  helpPage: '/publishing/android_and_ios_with_cordova',
};
