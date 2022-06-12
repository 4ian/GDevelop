// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import React, { PureComponent } from 'react';
import TextField from '../TextField';
import optionalRequire from '../../Utils/OptionalRequire';
import RaisedButton from '../RaisedButton';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

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
  filters: Array<{
    name: string,
    extensions: Array<string>,
  }>,
|};

export default class LocalFilePicker extends PureComponent<Props, *> {
  onChooseFolder = () => {
    if (!dialog || !electron) return;

    const browserWindow = remote.getCurrentWindow();
    return dialog
      .showSaveDialog(browserWindow, {
        title: this.props.title,
        filters: this.props.filters,
        message: this.props.message,
        defaultPath: this.props.defaultPath,
      })
      .then(({ filePath }) => {
        this.props.onChange(filePath || '');
      });
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
          margin="dense"
          style={styles.textField}
          type="text"
          hintText={t`Choose a file`}
          value={this.props.value}
          onChange={(event, value) => this.props.onChange(value)}
        />
        <RaisedButton
          label={<Trans>Choose</Trans>}
          style={styles.button}
          onClick={this.onChooseFolder}
        />
      </div>
    );
  }
}
