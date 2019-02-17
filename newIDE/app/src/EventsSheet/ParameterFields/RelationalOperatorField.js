import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class RelationalOperatorField extends Component {
  focus() {
    if (this._field && this._field.focus) this._field.focus();
  }

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <SelectField
        fullWidth
        floatingLabelText={description}
        value={this.props.value}
        onChange={(e, i, value) => this.props.onChange(value)}
        ref={field => (this._field = field)}
      >
        <MenuItem value="=" primaryText={<Trans>= (equal to)</Trans>} />
        <MenuItem value="<" primaryText={<Trans>&lt; (less than)</Trans>} />
        <MenuItem value=">" primaryText={<Trans>&gt; (greater than)</Trans>} />
        <MenuItem
          value="<="
          primaryText={<Trans>&lt;= (less or equal to)</Trans>}
        />
        <MenuItem
          value=">="
          primaryText={<Trans>&gt;= (greater or equal to)</Trans>}
        />
        <MenuItem value="!=" primaryText={<Trans>!= (different than)</Trans>} />
      </SelectField>
    );
  }
}
