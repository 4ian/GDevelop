// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import {
  type TargetName,
  type BuildSigningOptions,
} from '../../Utils/GDevelopServices/Build';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import HelpButton from '../../UI/HelpButton';
import { type HeaderProps, type ExportFlowProps } from '../ExportPipeline.flow';
import BuildStepsProgress from '../Builds/BuildStepsProgress';
import RaisedButton from '../../UI/RaisedButton';
import { ColumnStackLayout } from '../../UI/Layout';
import { AndroidSigningCredentialsSelector } from '../SigningCredentials/AndroidSigningCredentialsSelector';
import TextField from '../../UI/TextField';
import { t } from '@lingui/macro';
import AlertMessage from '../../UI/AlertMessage';

export type ExportState = {|
  targets: Array<TargetName>,
  keystore: 'old' | 'new' | 'custom',
  buildSigningOptions: BuildSigningOptions | null,
  signingDialogOpen: boolean,
|};

export const SetupExportHeader = ({
  exportState,
  updateExportState,
  isExporting,
  build,
  authenticatedUser,
}: HeaderProps<ExportState>): null | React.Node => {
  // Build is finished, hide options.
  if (!!build && build.status === 'complete') return null;

  return (
    <Column noMargin expand>
      <Line>
        <Text align="center">
          <Trans>
            Packaging your game for Android will create an APK file that can be
            installed on Android phones or an Android App Bundle that can be
            published to Google Play.
          </Trans>
        </Text>
      </Line>
      <Column>
        <RadioGroup
          value={exportState.targets[0] || 'androidApk'}
          onChange={event => {
            const targetName = event.target.value;
            updateExportState(prevExportState => ({
              ...prevExportState,
              targets: [targetName],
            }));
          }}
        >
          <FormControlLabel
            value={'androidApk'}
            control={<Radio color="secondary" disabled={isExporting} />}
            label={
              <Trans>
                APK (for testing on device or sharing outside Google Play)
              </Trans>
            }
          />
          <FormControlLabel
            value={'androidAppBundle'}
            control={<Radio color="secondary" disabled={isExporting} />}
            label={
              <Trans>
                Android App Bundle (.AAB file, for publishing on Google Play)
              </Trans>
            }
          />
        </RadioGroup>
        <Line noMargin justifyContent="flex-end">
          <FlatButton
            label={<Trans>Signing options</Trans>}
            onClick={() => {
              updateExportState(prevExportState => ({
                ...prevExportState,
                signingDialogOpen: true,
              }));
            }}
            disabled={
              (exportState.targets[0] === 'androidApk' &&
                exportState.keystore !== 'custom') ||
              isExporting
            }
          />
        </Line>
      </Column>
      {exportState.signingDialogOpen && (
        <Dialog
          title={<Trans>Signing options</Trans>}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary
              keyboardFocused
              onClick={() => {
                updateExportState(prevExportState => ({
                  ...prevExportState,
                  signingDialogOpen: false,
                }));
              }}
            />,
          ]}
          secondaryActions={[
            <HelpButton
              helpPagePath="/publishing/android/play-store/upgrading-from-apk-to-aab"
              key="help"
            />,
          ]}
          open
          onRequestClose={() => {
            updateExportState(prevExportState => ({
              ...prevExportState,
              signingDialogOpen: false,
            }));
          }}
          maxWidth="sm"
        >
          <Text>
            <Trans>
              Choose the upload key to use to identify your Android App Bundle.
              In most cases you don't need to change this. Use the "Old upload
              key" if you used to publish your game as an APK and you activated
              Play App Signing before switching to Android App Bundle.
            </Trans>
          </Text>
          <RadioGroup
            name="signing-keystore"
            value={exportState.keystore}
            onChange={event => {
              const keystore = event.target.value;
              updateExportState(prevExportState => ({
                ...prevExportState,
                keystore,
              }));
            }}
          >
            <FormControlLabel
              value={'new'}
              control={<Radio color="primary" />}
              label={<Trans>Default upload key (recommended)</Trans>}
            />
            <FormControlLabel
              value={'old'}
              control={<Radio color="primary" />}
              label={
                <Trans>
                  Old, legacy upload key (only if you used to publish your game
                  as an APK and already activated Play App Signing)
                </Trans>
              }
            />
            <FormControlLabel
              value={'custom'}
              control={<Radio color="primary" />}
              label={<Trans>Custom upload key</Trans>}
            />
          </RadioGroup>
          {exportState.keystore === 'custom' && (
            <ColumnStackLayout noMargin>
              <AndroidSigningCredentialsSelector
                authenticatedUser={authenticatedUser}
                buildSigningOptions={exportState.buildSigningOptions}
                onSelectBuildSigningOptions={buildSigningOptions => {
                  updateExportState(prevExportState => ({
                    ...prevExportState,
                    buildSigningOptions,
                  }));
                }}
                disabled={isExporting}
              />
              {exportState.targets[0] === 'androidApk' && (
                <ColumnStackLayout noMargin>
                  <AlertMessage kind="info">
                    <Trans>
                      If Google Play asks you to prove package name ownership,
                      paste the content of your{' '}
                      <b>adi-registration.properties</b> file from Google Play
                      Console here.
                    </Trans>
                  </AlertMessage>
                  <TextField
                    floatingLabelText={
                      <Trans>Package name verification token (optional)</Trans>
                    }
                    hintText={t`Paste the content of adi-registration.properties`}
                    value={
                      exportState.buildSigningOptions &&
                      exportState.buildSigningOptions.verificationTokenAsBase64
                        ? atob(
                            exportState.buildSigningOptions
                              .verificationTokenAsBase64
                          )
                        : ''
                    }
                    onChange={(e, value) => {
                      updateExportState(prevExportState => ({
                        ...prevExportState,
                        buildSigningOptions: {
                          ...prevExportState.buildSigningOptions,
                          verificationTokenAsBase64: value
                            ? btoa(value)
                            : undefined,
                        },
                      }));
                    }}
                    multiline
                    rows={4}
                    fullWidth
                  />
                </ColumnStackLayout>
              )}
            </ColumnStackLayout>
          )}
        </Dialog>
      )}
    </Column>
  );
};

type OnlineCordovaExportFlowProps = {|
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
}: OnlineCordovaExportFlowProps): React.Node => {
  const isExportingOrbuildRunningOrFinished =
    isExporting || (!!build && build.status !== 'error');

  return (
    <ColumnStackLayout noMargin>
      {!isExportingOrbuildRunningOrFinished && (
        <Line justifyContent="center">
          <RaisedButton
            label={<Trans>Create package for Android</Trans>}
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

export const onlineCordovaExporter = {
  key: 'onlinecordovaexport',
  tabName: (<Trans>Mobile</Trans>: React.Node),
  name: (<Trans>Android</Trans>: React.Node),
  helpPage: '/publishing/android',
};
