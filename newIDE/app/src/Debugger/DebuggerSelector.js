// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { type DebuggerId } from '../ExportAndShare/PreviewLauncher.flow';

type Props = {|
  selectedId: DebuggerId,
  debuggerIds: Array<DebuggerId>,
  onChooseDebugger: DebuggerId => void,
|};

export default class DebuggerSelector extends React.Component<Props, void> {
  render() {
    const hasDebuggers = !!this.props.debuggerIds.length;
    return (
      <SelectField
        fullWidth
        value={hasDebuggers ? this.props.selectedId : 0}
        onChange={(e, i, value) =>
          this.props.onChooseDebugger(parseInt(value, 10) || 0)
        }
        disabled={!hasDebuggers}
      >
        {this.props.debuggerIds.map(id => (
          <SelectOption value={id} key={id} label={t`Game preview #${id}`} />
        ))}
        {!hasDebuggers && (
          <SelectOption
            value={0}
            label={t`No preview running. Run a preview and you will be able to inspect it with the debugger`}
          />
        )}
      </SelectField>
    );
  }
}
