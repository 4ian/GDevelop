// @flow
import * as React from 'react';
import SelectField from '../UI/SelectField';
import MenuItem from '../UI/MenuItem';
import { Column } from '../UI/Grid';
import { type DebuggerId } from '.';

type Props = {|
  selectedId: DebuggerId,
  debuggerIds: Array<DebuggerId>,
  onChooseDebugger: DebuggerId => void,
|};

export default class DebuggerSelector extends React.Component<Props, void> {
  render() {
    const hasDebuggers = !!this.props.debuggerIds.length;
    return (
      <Column>
        <SelectField
          fullWidth
          value={hasDebuggers ? this.props.selectedId : 0}
          onChange={(e, i, value) => this.props.onChooseDebugger(value)}
          disabled={!hasDebuggers}
        >
          {this.props.debuggerIds.map(id => (
            <MenuItem value={id} key={id} primaryText={'Game preview #' + id} />
          ))}
          {!hasDebuggers && (
            <MenuItem
              value={0}
              primaryText={
                'No preview running. Run a preview and you will be able to inspect it with the debugger'
              }
            />
          )}
        </SelectField>
      </Column>
    );
  }
}
