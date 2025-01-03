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
  onChooseDebugger: DebuggerId => void,
|};

export default class DebuggerSelector extends React.Component<Props, void> {
  render() {
    const debuggerIds = Object.keys(this.props.debuggerStatus);
    const hasDebuggers = !!debuggerIds.length;
    return (
      <I18n>
        {({ i18n }) => (
          <SelectField
            fullWidth
            value={hasDebuggers ? this.props.selectedId : 0}
            onChange={(e, i, value) =>
              this.props.onChooseDebugger(parseInt(value, 10) || 0)
            }
            disabled={!hasDebuggers}
          >
            {debuggerIds.map(id => {
              const status = this.props.debuggerStatus[+id];
              const statusText = status.isPaused
                ? status.isInGameEdition
                  ? t`Editing`
                  : t`Paused`
                : status.isInGameEdition
                ? t`Playing (in-game edition)`
                : t`Playing`;

              return (
                <SelectOption
                  value={+id}
                  key={id}
                  label={t`Game preview #${id} (${i18n._(statusText)})`}
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
