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
        ref={field => (this._field = field)}
        onChange={(e, i, value) => this.props.onChange(value)}
      >
        <MenuItem value="Left" primaryText="Left" />
        <MenuItem value="Right" primaryText="Right" />
        <MenuItem value="Middle" primaryText="Middle" />
        {/* TODO: Add support for these buttons in the game engine
         <MenuItem
          value="XButton1"
          primaryText="Special button #1"
        />
        <MenuItem
          value="XButton2"
          primaryText="Special button #2"
        /> */}
      </SelectField>
    );
  }
}
