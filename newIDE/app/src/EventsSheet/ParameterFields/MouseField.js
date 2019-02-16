import { Trans } from '@lingui/macro';
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
        <MenuItem value="Left" primaryText={<Trans>Left (primary)</Trans>} />
        <MenuItem
          value="Right"
          primaryText={<Trans>Right (secondary)</Trans>}
        />
        <MenuItem
          value="Middle"
          primaryText={
            <Trans>Middle (Auxiliary button, usually the wheel button)</Trans>
          }
        />
        {/* TODO: Add support for these buttons in the game engine
         <MenuItem
          value="XButton1"
          primaryText={<Trans>Special button #1</Trans>}
        />
        <MenuItem
          value="XButton2"
          primaryText={<Trans>Special button #2</Trans>}
        /> */}
      </SelectField>
    );
  }
}
