// @flow

import * as React from 'react';
import { Line } from '../../../../UI/Grid';
import IconButton from '../../../../UI/IconButton';
import CheckIcon from '../../../../UI/CustomSvgIcons/Check';
import CrossIcon from '../../../../UI/CustomSvgIcons/Cross';
import {
  shouldValidate,
  shouldCloseOrCancel,
} from '../../../../UI/KeyboardShortcuts/InteractionKeys';
import TextField from '../../../../UI/TextField';
import { Trans, t } from '@lingui/macro';

type Props = {|
  onValidateGroupName: ({| name: string |}) => Promise<void>,
  onDismiss: () => void,
|};

const NewTeamGroupNameField = ({ onValidateGroupName, onDismiss }: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const [groupName, setGroupName] = React.useState<string>('');

  const onFinishEditingName = React.useCallback(
    async () => {
      const cleanedGroupName = groupName.trim();
      if (!cleanedGroupName) {
        setErrorText(<Trans>Group name cannot be empty.</Trans>);
        return;
      }
      setIsLoading(true);
      try {
        await onValidateGroupName({ name: cleanedGroupName });
        setGroupName('');
        setErrorText(null);
        onDismiss();
      } catch (error) {
        console.error('An error occurred when renaming the group:', error);
        setErrorText(
          <Trans>
            An error occurred while creating the group. Please try again later.
          </Trans>
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onValidateGroupName, groupName, onDismiss]
  );

  const onCancelEditingName = React.useCallback(
    () => {
      setGroupName('');
      setErrorText(null);
      onDismiss();
    },
    [onDismiss]
  );

  return (
    <Line noMargin>
      <TextField
        type="text"
        maxLength={50}
        value={groupName}
        disabled={isLoading}
        margin="dense"
        onChange={(e, newName) => {
          setGroupName(newName);
        }}
        autoFocus="desktopAndMobileDevices"
        translatableHintText={t`New group name`}
        errorText={errorText}
        onKeyUp={event => {
          if (shouldValidate(event)) {
            onFinishEditingName();
          } else if (shouldCloseOrCancel(event)) {
            event.stopPropagation();
            onCancelEditingName();
          }
        }}
        endAdornment={
          <>
            <IconButton
              edge="end"
              onClick={onCancelEditingName}
              disabled={isLoading}
            >
              <CrossIcon />
            </IconButton>
            <IconButton
              edge="end"
              onClick={onFinishEditingName}
              disabled={isLoading}
            >
              <CheckIcon />
            </IconButton>
          </>
        }
      />
    </Line>
  );
};

export default NewTeamGroupNameField;
