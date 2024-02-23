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
import { type HeaderProps } from '../ExportPipeline.flow';
import { ColumnStackLayout } from '../../UI/Layout';
import { IosSigningCredentialsSelector } from '../SigningCredentials/IosSigningCredentialsSelector';

export type ExportState = {|
  targets: Array<TargetName>,
  signing: BuildSigningOptions | null,
|};

export const SetupExportHeader = ({
  exportState,
  authenticatedUser,
  updateExportState,
}: HeaderProps<ExportState>) => {
  return (
    <ColumnStackLayout noMargin expand>
      <Line>
        <Text>
          <Trans>
            Package the game for iOS, using your Apple Developer account.
          </Trans>
        </Text>
      </Line>
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
          control={<Radio color="secondary" />}
          label={
            <Trans>
              Development (debugging & testing on a registered iPhone/iPad)
            </Trans>
          }
        />
        <FormControlLabel
          value={'iosAppStore'}
          control={<Radio color="secondary" />}
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
      />
    </ColumnStackLayout>
  );
};

export const onlineCordovaIosExporter = {
  key: 'onlinecordovaiosexport',
  tabName: <Trans>iOS</Trans>,
  name: <Trans>iOS</Trans>,
  helpPage: '/publishing/android_and_ios',
};
