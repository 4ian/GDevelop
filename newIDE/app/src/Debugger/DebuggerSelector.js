// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import {
  type DebuggerId,
  type DebuggerStatus,
} from '../ExportAndShare/PreviewLauncher.flow';
import { type DebuggerRecordingMetadata } from './Export/DebuggerRecordingFile';

type Props = {|
  selectedId: DebuggerId,
  debuggerStatus: { [DebuggerId]: DebuggerStatus },
  /** The games still running: the others were closed, their data is kept. */
  connectedDebuggerIds: Array<DebuggerId>,
  /**
   * The recordings read from a file, named after the run they hold, not after
   * the file (which the user may have renamed).
   */
  importedRecordings: { [DebuggerId]: DebuggerRecordingMetadata },
  onChooseDebugger: DebuggerId => void,
|};

export default class DebuggerSelector extends React.Component<Props, void> {
  render(): any {
    const debuggerIds = Object.keys(this.props.debuggerStatus);
    const debuggerIdsWithoutInGameEdition = debuggerIds.filter(
      id => !this.props.debuggerStatus[id].isInGameEdition
    );
    const importedIds = Object.keys(this.props.importedRecordings);
    const hasDebuggers =
      !!debuggerIdsWithoutInGameEdition.length || !!importedIds.length;
    return (
      <I18n>
        {({ i18n }) => (
          <SelectField
            fullWidth
            value={hasDebuggers ? this.props.selectedId : 0}
            onChange={(e, i, value) => this.props.onChooseDebugger(value)}
            disabled={!hasDebuggers}
          >
            {debuggerIdsWithoutInGameEdition.map(id => {
              const status = this.props.debuggerStatus[id];
              const statusText = !this.props.connectedDebuggerIds.includes(id)
                ? t`Closed`
                : status.isPaused
                ? t`Paused`
                : t`Playing`;

              return (
                <SelectOption
                  value={id}
                  key={id}
                  label={t`Game preview "${id}" (${i18n._(statusText)})`}
                />
              );
            })}
            {importedIds.map(id => {
              const metadata = this.props.importedRecordings[id];
              const projectName = metadata.projectName || i18n._(t`Recording`);
              const date = (metadata.exportedAt || '').slice(0, 10);
              return (
                <SelectOption
                  value={id}
                  key={id}
                  label={t`${projectName} - ${date} (imported)`}
                />
              );
            })}
            {!hasDebuggers && (
              <SelectOption
                value={0}
                label={t`No preview running. Run a preview and you will be able to inspect it with the debugger`}
              />
            )}
          </SelectField>
        )}
      </I18n>
    );
  }
}
