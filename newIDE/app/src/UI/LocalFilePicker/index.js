// @flow
import { Trans } from '@lingui/macro';

import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import optionalRequire from '../../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'baseline',
  },
  button: {
    marginLeft: 10,
  },
  textField: {
    flex: 1,
  },
};

type Props = {|
  value: string,
  onChange: string => void,
  title: string,
  message: string,
  defaultPath?: string,
  fullWidth?: boolean,
  floatingLabelText?: string,
  filters: Array<{
    name: string,
    extensions: Array<string>,
  }>,
|};

export default class LocalFilePicker extends PureComponent<Props, *> {
  onChooseFolder = () => {
    if (!dialog || !electron) return;

    const browserWindow = electron.remote.getCurrentWindow();
    dialog.showSaveDialog(
      browserWindow,
      {
        title: this.props.title,
        filters: this.props.filters,
        message: this.props.message,
        defaultPath: this.props.defaultPath,
      },
      filename => {
        this.props.onChange(filename || '');
      }
    );
  };

  render() {
    return (
      <div
        style={{
          ...styles.container,
          width: this.props.fullWidth ? '100%' : undefined,
        }}
      >
        <TextField
          style={styles.textField}
          floatingLabelText={this.props.floatingLabelText}
          floatingLabelFixed
          type="text"
          hintText={<Trans>Click to choose</Trans>}
          value={this.props.value}
          onChange={(event, value) => this.props.onChange(value)}
        />
        <FlatButton
          label={<Trans>Choose</Trans>}
          style={styles.button}
          onClick={this.onChooseFolder}
        />
      </div>
    );
  }
}
