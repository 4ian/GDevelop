// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import React, { PureComponent } from 'react';
import TextField from '../TextField';
import RaisedButton from '../RaisedButton';
import optionalRequire from '../../Utils/OptionalRequire';
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
  type: 'export' | 'create-game',
  value: string,
  onChange: string => void,
  defaultPath?: string,
  fullWidth?: boolean,
|};

type TitleAndMessage = {|
  title: string,
  message: string,
|};

export default class LocalFolderPicker extends PureComponent<Props, {||}> {
  _onChooseFolder = ({ title, message }: TitleAndMessage) => {
    if (!dialog || !electron) return;

    const browserWindow = remote.getCurrentWindow();
    dialog
      .showOpenDialog(browserWindow, {
        title,
        properties: ['openDirectory', 'createDirectory'],
        message,
        defaultPath: this.props.defaultPath,
      })
      .then(({ filePaths }) => {
        if (!filePaths || !filePaths.length) return;
        this.props.onChange(filePaths[0]);
      });
  };

  _getTitleAndMessage = (i18n: I18nType): TitleAndMessage => {
    const { type } = this.props;
    if (type === 'export') {
      return {
        title: i18n._(t`Choose an export folder`),
        message: i18n._(t`Choose where to export the game`),
      };
    }
    return {
      title: i18n._(t`Choose a folder for the new game`),
      message: i18n._(t`Choose where to create the game`),
    };
  };

  render() {
    return (
      <I18n>
        {({ i18n }) => {
          const titleAndMessage = this._getTitleAndMessage(i18n);
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
                hintText={titleAndMessage.title}
                value={this.props.value}
                onChange={(event, value) => this.props.onChange(value)}
              />
              <RaisedButton
                label={<Trans>Choose folder</Trans>}
                primary={false}
                style={styles.button}
                onClick={() => this._onChooseFolder(titleAndMessage)}
              />
            </div>
          );
        }}
      </I18n>
    );
  }
}
