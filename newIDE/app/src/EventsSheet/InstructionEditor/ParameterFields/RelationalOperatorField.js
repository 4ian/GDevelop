import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class RelationalOperatorField extends Component {
  focus() {}

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
        <MenuItem value="=" primaryText="= (equal to)" />
        <MenuItem value="<" primaryText="< (less than)" />
        <MenuItem value=">" primaryText="> (greater than)" />
        <MenuItem value="<=" primaryText="<= (less or equal to)" />
        <MenuItem value=">=" primaryText=">= (greater or equal to)" />
        <MenuItem value="!=" primaryText="!= (different than)" />
      </SelectField>
    );
  }
}
