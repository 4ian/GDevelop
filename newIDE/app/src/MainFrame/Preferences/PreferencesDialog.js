// @flow

import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../../UI/Dialog';
import { Column, Line } from '../../UI/Grid';
import { themes } from '../../UI/Theme';
import MenuItem from 'material-ui/MenuItem';

type Props = {|
  open: boolean,
  onClose: Function,
  themeName: string,
  onChangeTheme: string => void,
|};

type State = {||};

export default class PreferencesDialog extends Component<Props, State> {
  render() {
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton label="Close" primary={false} onClick={onClose} />,
    ];

    return (
      <Dialog
        actions={actions}
        onRequestClose={onClose}
        open={open}
        title="GDevelop preferences"
      >
        <Column noMargin>
          <Line noMargin>
            <SelectField
              floatingLabelText={'UI Theme'}
              value={this.props.themeName}
              onChange={(e, i, value) => this.props.onChangeTheme(value)}
            >
              {Object.keys(themes).map(themeName => (
                <MenuItem
                  value={themeName}
                  primaryText={themeName}
                  key={themeName}
                />
              ))}
            </SelectField>
          </Line>
        </Column>
      </Dialog>
    );
  }
}
