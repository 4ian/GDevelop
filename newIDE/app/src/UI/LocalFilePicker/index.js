// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

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

const LocalFilePicker = ({
  value,
  onChange,
  title,
  message,
  defaultPath,
  fullWidth,
  filters,
}: Props) => {
  const onChooseFolder = async () => {
    if (!dialog || !electron) return;

    const browserWindow = remote.getCurrentWindow();
    const { filePath } = await dialog.showSaveDialog(browserWindow, {
      title: title,
      filters: filters,
      message: message,
      defaultPath: defaultPath,
    });
    onChange(filePath || '');
  };

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
        translatableHintText={t`Choose a file`}
        value={value}
        onChange={(event, value) => onChange(value)}
      />
      <FlatButton
        label={<Trans>Choose</Trans>}
        style={styles.button}
        onClick={onChooseFolder}
      />
    </div>
  );
};

export default LocalFilePicker;
