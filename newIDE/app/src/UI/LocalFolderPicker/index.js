// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import TextField from '../TextField';
import optionalRequire from '../../Utils/OptionalRequire';
import FlatButton from '../FlatButton';
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
  type: 'export' | 'create-game' | 'default-workspace',
  value: string,
  onChange: string => void,
  defaultPath?: string,
  fullWidth?: boolean,
|};

type TitleAndMessage = {|
  title: string,
  message: string,
|};

const LocalFolderPicker = ({
  type,
  value,
  onChange,
  defaultPath,
  fullWidth,
}: Props) => {
  // Use an internal state to avoid validating the value when the user
  // is typing in the text field. This allows typing a "/" without the
  // formatting kicking in.
  const [textValue, setTextValue] = React.useState(value);
  const onChooseFolder = async ({ title, message }: TitleAndMessage) => {
    if (!dialog || !electron) return;

    const browserWindow = remote.getCurrentWindow();
    const { filePaths } = await dialog.showOpenDialog(browserWindow, {
      title,
      properties: ['openDirectory', 'createDirectory'],
      message,
      defaultPath: defaultPath,
    });

    if (!filePaths || !filePaths.length) return;

    const filePath = filePaths[0];
    onChange(filePath);
    setTextValue(filePath);
  };

  const onBlur = () => {
    onChange(textValue);
  };

  const getTitleAndMessage = (i18n: I18nType): TitleAndMessage => {
    if (type === 'export') {
      return {
        title: i18n._(t`Choose an export folder`),
        message: i18n._(t`Choose where to export the game`),
      };
    }
    if (type === 'default-workspace') {
      return {
        title: i18n._(t`Choose a workspace folder`),
        message: i18n._(t`Choose where to create your projects`),
      };
    }
    return {
      title: i18n._(t`Choose a folder for the new game`),
      message: i18n._(t`Choose where to create the game`),
    };
  };

  return (
    <I18n>
      {({ i18n }) => {
        const titleAndMessage = getTitleAndMessage(i18n);
        return (
          <div
            style={{
              ...styles.container,
              width: fullWidth ? '100%' : undefined,
            }}
          >
            <TextField
              margin="dense"
              style={styles.textField}
              type="text"
              hintText={titleAndMessage.title}
              value={textValue}
              onChange={(event, value) => setTextValue(value)}
              onBlur={onBlur}
            />
            <FlatButton
              label={<Trans>Choose folder</Trans>}
              style={styles.button}
              onClick={() => onChooseFolder(titleAndMessage)}
            />
          </div>
        );
      }}
    </I18n>
  );
};

export default LocalFolderPicker;
