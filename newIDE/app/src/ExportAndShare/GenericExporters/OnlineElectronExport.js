// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import Checkbox from '../../UI/Checkbox';
import { Column, Line } from '../../UI/Grid';
import { type TargetName } from '../../Utils/GDevelopServices/Build';
import { type HeaderProps } from '../ExportPipeline.flow';

export type ExportState = {|
  targets: Array<TargetName>,
|};

export const SetupExportHeader = ({
  exportState,
  updateExportState,
}: HeaderProps<ExportState>) => {
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
          <Text>
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
        />
        <Checkbox
          label={<Trans>Windows (auto-installer file)</Trans>}
          checked={exportState.targets.indexOf('winExe') !== -1}
          onCheck={(e, checked) => setTarget('winExe', checked)}
        />
        <Checkbox
          label={<Trans>macOS (zip file)</Trans>}
          checked={exportState.targets.indexOf('macZip') !== -1}
          onCheck={(e, checked) => setTarget('macZip', checked)}
        />
        <Checkbox
          label={<Trans>Linux (AppImage)</Trans>}
          checked={exportState.targets.indexOf('linuxAppImage') !== -1}
          onCheck={(e, checked) => setTarget('linuxAppImage', checked)}
        />
      </Column>
    </React.Fragment>
  );
};

export const onlineElectronExporter = {
  key: 'onlineelectronexport',
  tabName: <Trans>Desktop</Trans>,
  name: <Trans>Windows, macOS &amp; Linux</Trans>,
  helpPage: '/publishing/windows-macos-linux',
};
