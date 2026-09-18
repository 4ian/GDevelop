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

type Props = {|
  selectedId: DebuggerId,
  debuggerStatus: { [DebuggerId]: DebuggerStatus },
  /** The games still running: the others were closed, their data is kept. */
  connectedDebuggerIds: Array<DebuggerId>,
  /** The recordings read from a file, named after the run they hold. */
  importedRecordingLabels: { [DebuggerId]: string },
  onChooseDebugger: DebuggerId => void,
|};

export default class DebuggerSelector extends React.Component<Props, void> {
  render(): any {
    const debuggerIds = Object.keys(this.props.debuggerStatus);
    const debuggerIdsWithoutInGameEdition = debuggerIds.filter(
      id => !this.props.debuggerStatus[id].isInGameEdition
    );
    const importedIds = Object.keys(this.props.importedRecordingLabels);
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
            {importedIds.map(id => (
              <SelectOption
                value={id}
                key={id}
                label={this.props.importedRecordingLabels[id]}
                shouldNotTranslate
              />
            ))}
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
