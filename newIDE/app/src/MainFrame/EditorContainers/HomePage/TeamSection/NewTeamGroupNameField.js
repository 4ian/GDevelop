// @flow

import * as React from 'react';
import { Line } from '../../../../UI/Grid';
import IconButton from '../../../../UI/IconButton';
import CheckIcon from '../../../../UI/CustomSvgIcons/Check';
import CrossIcon from '../../../../UI/CustomSvgIcons/Cross';
import {
  shouldActivate,
  shouldCloseOrCancel,
} from '../../../../UI/KeyboardShortcuts/InteractionKeys';
import TextField from '../../../../UI/TextField';
import { Trans, t } from '@lingui/macro';

type Props = {|
  onValidateGroupName: ({| name: string |}) => Promise<void>,
|};

const NewTeamGroupNameField = ({ onValidateGroupName }: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const [groupName, setGroupName] = React.useState<string>('');

  const onFinishEditingName = React.useCallback(
    async () => {
      if (!groupName) {
        setErrorText(<Trans>Group name cannot be empty.</Trans>);
        return;
      }
      setIsLoading(true);
      try {
        await onValidateGroupName({ name: groupName });
        setGroupName('');
      } catch (error) {
        console.error(error);
        setErrorText(
          <Trans>
            An error occurred while creating the group. Please try again later.
          </Trans>
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onValidateGroupName, groupName]
  );

  const onCancelEditingName = React.useCallback(() => {
    setGroupName('');
  }, []);

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
        translatableHintText={t`New group name`}
        errorText={errorText}
        onKeyUp={event => {
          if (shouldActivate(event)) {
            onFinishEditingName();
          } else if (shouldCloseOrCancel(event)) {
            event.stopPropagation();
            event.preventDefault();
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
