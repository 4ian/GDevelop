// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { type TargetName } from '../../Utils/GDevelopServices/Build';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

export type ExportState = {|
  targets: Array<TargetName>,
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
    </Column>
  );
};
