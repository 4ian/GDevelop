// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { type TargetName } from '../../Utils/GDevelopServices/Build';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import HelpButton from '../../UI/HelpButton';

export type ExportState = {|
  targets: Array<TargetName>,
  keystore: 'old' | 'new',
  signingDialogOpen: boolean,
|};

type HeaderProps = {|
  project: gdProject,
  exportState: ExportState,
  updateExportState: (
    updater: (prevExportState: ExportState) => ExportState
  ) => void,
|};

export const SetupExportHeader = ({
  exportState,
  updateExportState,
}: HeaderProps) => {
  return (
    <Column noMargin>
      <Line>
        <Text>
          <Trans>
            Packaging your game for Android will create an APK file that can be
            installed on Android phones or an Android App Bundle that can be
            published to Google Play.
          </Trans>
        </Text>
      </Line>
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
          control={<Radio color="primary" />}
          label={
            <Trans>
              APK (for testing on device or sharing outside Google Play)
            </Trans>
          }
        />
        <FormControlLabel
          value={'androidAppBundle'}
          control={<Radio color="primary" />}
          label={
            <Trans>Android App Bundle (for publishing on Google Play)</Trans>
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
          disabled={exportState.targets[0] !== 'androidAppBundle'}
        />
      </Line>
      {exportState.signingDialogOpen && (
        <Dialog
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
              helpPagePath="/publishing/android_and_ios/play-store/upgrading-from-apk-to-aab"
              key="help"
            />,
          ]}
          open
          title={<Trans>Signing options</Trans>}
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
              label={<Trans>New upload key (recommended)</Trans>}
            />
            <FormControlLabel
              value={'old'}
              control={<Radio color="primary" />}
              label={
                <Trans>
                  Old upload key (only if you used to publish your game as an
                  APK and already activated Play App Signing)
                </Trans>
              }
            />
            <FormControlLabel
              value={'custom'}
              control={<Radio color="primary" />}
              label={<Trans>Custom upload key (not available yet)</Trans>}
              disabled
            />
          </RadioGroup>
        </Dialog>
      )}
    </Column>
  );
};
