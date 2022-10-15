// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import TextField from '../../UI/TextField';
import { type GoogleDriveFileOrFolder } from '.';

type Props = {|
  floatingLabelText: React.Node,
  value: ?GoogleDriveFileOrFolder,
  onOpenPicker: () => void,
|};

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'baseline',
    width: '100%',
  },
  button: {
    marginLeft: 10,
  },
  textField: {
    flex: 1,
  },
};

const GoogleDriveFileOrFolderPicker = (props: Props) => {
  return (
    <div
      style={{
        ...styles.container,
      }}
    >
      <TextField
        style={styles.textField}
        floatingLabelText={props.floatingLabelText}
        floatingLabelFixed
        type="text"
        translatableHintText={t`Choose a file or folder`}
        value={props.value ? props.value.name : ''}
        onChange={() => {}}
      />
      <RaisedButton
        label={<Trans>Choose...</Trans>}
        primary
        style={styles.button}
        onClick={props.onOpenPicker}
      />
    </div>
  );
};

export default GoogleDriveFileOrFolderPicker;
