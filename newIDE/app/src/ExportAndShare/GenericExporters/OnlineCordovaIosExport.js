// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Line } from '../../UI/Grid';
import {
  type TargetName,
  type BuildSigningOptions,
} from '../../Utils/GDevelopServices/Build';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { type HeaderProps, type ExportFlowProps } from '../ExportPipeline.flow';
import { ColumnStackLayout } from '../../UI/Layout';
import { IosSigningCredentialsSelector } from '../SigningCredentials/IosSigningCredentialsSelector';
import BuildStepsProgress from '../Builds/BuildStepsProgress';
import RaisedButton from '../../UI/RaisedButton';

export type ExportState = {|
  targets: Array<TargetName>,
  signing: BuildSigningOptions | null,
|};

export const SetupExportHeader = ({
  exportState,
  authenticatedUser,
  updateExportState,
  isExporting,
  build,
  quota,
}: HeaderProps<ExportState>) => {
  // Build is finished, hide options.
  if (!!build && build.status === 'complete') return null;

  const isFeatureLocked = quota && quota.max === 0;

  return (
    <ColumnStackLayout noMargin expand>
      <Line alignItems="center" justifyContent="center">
        <Text align="center">
          <Trans>
            Package the game for iOS, using your Apple Developer account.
          </Trans>
        </Text>
      </Line>
      {!isFeatureLocked && (
        <ColumnStackLayout noMargin>
          <RadioGroup
            value={exportState.targets[0] || 'iosAppStore'}
            onChange={event => {
              const targetName = event.target.value;
              updateExportState(prevExportState => ({
                ...prevExportState,
                targets: [targetName],
              }));
            }}
          >
            <FormControlLabel
              value={'iosDevelopment'}
              control={<Radio color="secondary" disabled={isExporting} />}
              label={
                <Trans>
                  Development (debugging & testing on a registered iPhone/iPad)
                </Trans>
              }
            />
            <FormControlLabel
              value={'iosAppStore'}
              control={<Radio color="secondary" disabled={isExporting} />}
              label={<Trans>Apple App Store</Trans>}
            />
          </RadioGroup>
          <IosSigningCredentialsSelector
            targets={exportState.targets}
            buildSigningOptions={exportState.signing}
            onSelectBuildSigningOptions={signing => {
              updateExportState(prevExportState => ({
                ...prevExportState,
                signing,
              }));
            }}
            authenticatedUser={authenticatedUser}
            disabled={isExporting}
          />
        </ColumnStackLayout>
      )}
    </ColumnStackLayout>
  );
};

type OnlineCordovaIosExportFlowProps = {|
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
}: OnlineCordovaIosExportFlowProps) => {
  const isExportingOrbuildRunningOrFinished =
    isExporting || (!!build && build.status !== 'error');

  return (
    <ColumnStackLayout noMargin>
      {!isExportingOrbuildRunningOrFinished && (
        <Line justifyContent="center">
          <RaisedButton
            label={<Trans>Create package for iOS</Trans>}
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

export const onlineCordovaIosExporter = {
  key: 'onlinecordovaiosexport',
  tabName: <Trans>iOS</Trans>,
  name: <Trans>iOS</Trans>,
  helpPage: '/publishing/android_and_ios',
};
