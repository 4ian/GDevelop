// @flow
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import CompactTextField from '../CompactTextField';
import IconButton from '../IconButton';
import Folder from '../CustomSvgIcons/Folder';
import { LineStackLayout } from '../Layout';
import optionalRequire from '../../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

const styles = {
  icon: {
    fontSize: 18,
  },
};

type Props = {|
  type: 'export' | 'create-game' | 'default-workspace',
  value: string,
  onChange: string => void,
  defaultPath?: string,
  id?: string,
  disabled?: boolean,
|};

type TitleAndMessage = {|
  title: string,
  message: string,
|};

const getTitleAndMessage = (
  i18n: I18nType,
  type: 'export' | 'create-game' | 'default-workspace'
): TitleAndMessage => {
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

/**
 * A compact variant of `LocalFolderPicker`, to be used alongside other
 * compact fields (`CompactTextField`, `CompactSelectField`...).
 */
const CompactLocalFolderPicker = ({
  type,
  value,
  onChange,
  defaultPath,
  id,
  disabled,
}: Props): React.Node => {
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

  return (
    <I18n>
      {({ i18n }) => {
        const titleAndMessage = getTitleAndMessage(i18n, type);
        return (
          <LineStackLayout noMargin expand alignItems="center">
            <CompactTextField
              id={id}
              type="text"
              value={textValue}
              onChange={newValue => setTextValue(newValue)}
              onBlur={() => onChange(textValue)}
              placeholder={titleAndMessage.title}
              disabled={disabled}
            />
            <IconButton
              size="small"
              disabled={disabled}
              tooltip={t`Choose folder`}
              onClick={() => onChooseFolder(titleAndMessage)}
            >
              <Folder style={styles.icon} />
            </IconButton>
          </LineStackLayout>
        );
      }}
    </I18n>
  );
};

export default CompactLocalFolderPicker;
