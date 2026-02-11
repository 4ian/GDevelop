// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import Checkbox from '../../UI/Checkbox';
import { Column, Line } from '../../UI/Grid';
import { type TargetName } from '../../Utils/GDevelopServices/Build';
import { type HeaderProps, type ExportFlowProps } from '../ExportPipeline.flow';
import BuildStepsProgress from '../Builds/BuildStepsProgress';
import RaisedButton from '../../UI/RaisedButton';
import { ColumnStackLayout } from '../../UI/Layout';

export type ExportState = {|
  targets: Array<TargetName>,
|};

export const SetupExportHeader = ({
  exportState,
  updateExportState,
  isExporting,
  build,
}: HeaderProps<ExportState>) => {
  // Build is finished, hide options.
  if (!!build && build.status === 'complete') return null;

  const setTarget = (targetName: TargetName, enable: boolean) => {
    updateExportState(prevExportState => {
      if (enable && prevExportState.targets.indexOf(targetName) === -1) {
        return {
          ...prevExportState,
          targets: [...prevExportState.targets, targetName],
        };
      } else if (
        !enable &&
        prevExportState.targets.indexOf(targetName) !== -1
      ) {
        return {
          ...prevExportState,
          targets: prevExportState.targets.filter(name => name !== targetName),
        };
      }

      return prevExportState;
    });
  };

  return (
    <React.Fragment>
      <Column noMargin expand>
        <Line>
          <Text align="center">
            <Trans>
              Your game will be exported and packaged online as a stand-alone
              game for Windows, Linux and/or macOS.
            </Trans>
          </Text>
        </Line>
        <Checkbox
          label={<Trans>Windows (zip file)</Trans>}
          checked={exportState.targets.indexOf('winZip') !== -1}
          onCheck={(e, checked) => setTarget('winZip', checked)}
          disabled={isExporting}
        />
        <Checkbox
          label={<Trans>Windows (auto-installer file)</Trans>}
          checked={exportState.targets.indexOf('winExe') !== -1}
          onCheck={(e, checked) => setTarget('winExe', checked)}
          disabled={isExporting}
        />
        <Checkbox
          label={<Trans>macOS (zip file)</Trans>}
          checked={exportState.targets.indexOf('macZip') !== -1}
          onCheck={(e, checked) => setTarget('macZip', checked)}
          disabled={isExporting}
        />
        <Checkbox
          label={<Trans>Linux (AppImage)</Trans>}
          checked={exportState.targets.indexOf('linuxAppImage') !== -1}
          onCheck={(e, checked) => setTarget('linuxAppImage', checked)}
          disabled={isExporting}
        />
      </Column>
    </React.Fragment>
  );
};

type OnlineElectronExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

export const ExportFlow = ({
  disabled,
  launchExport,
  isExporting,
  exportPipelineName,
  exportStep,
  build,
  stepMaxProgress,
  stepCurrentProgress,
  errored,
}: OnlineElectronExportFlowProps) => {
  const isExportingOrbuildRunningOrFinished =
    isExporting || (!!build && build.status !== 'error');

  return (
    <ColumnStackLayout noMargin>
      {!isExportingOrbuildRunningOrFinished && (
        <Line justifyContent="center">
          <RaisedButton
            label={<Trans>Create installation file</Trans>}
            primary
            id={`launch-export-${exportPipelineName}-button`}
            onClick={launchExport}
            disabled={disabled}
          />
        </Line>
      )}
      {isExportingOrbuildRunningOrFinished && (
        <Line expand>
          <BuildStepsProgress
            exportStep={exportStep}
            hasBuildStep={true}
            build={build}
            stepMaxProgress={stepMaxProgress}
            stepCurrentProgress={stepCurrentProgress}
            errored={errored}
          />
        </Line>
      )}
    </ColumnStackLayout>
  );
};

export const onlineElectronExporter = {
  key: 'onlineelectronexport',
  tabName: <Trans>Desktop</Trans>,
  name: <Trans>Windows, macOS &amp; Linux</Trans>,
  helpPage: '/publishing/windows-macos-linux',
};
