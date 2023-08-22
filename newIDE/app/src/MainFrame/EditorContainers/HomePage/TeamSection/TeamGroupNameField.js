// @flow

import * as React from 'react';
import { type TeamGroup } from '../../../../Utils/GDevelopServices/User';
import { Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import IconButton from '../../../../UI/IconButton';
import EditIcon from '../../../../UI/CustomSvgIcons/Edit';
import CheckIcon from '../../../../UI/CustomSvgIcons/Check';
import CrossIcon from '../../../../UI/CustomSvgIcons/Cross';
import {
  shouldActivate,
  shouldCloseOrCancel,
} from '../../../../UI/KeyboardShortcuts/InteractionKeys';
import TextField from '../../../../UI/TextField';
import { Trans } from '@lingui/macro';

type Props = {|
  group: TeamGroup,
  onFinishEditingGroupName: (
    group: TeamGroup,
    newName: string
  ) => Promise<void>,
|};

const TeamGroupNameField = ({ group, onFinishEditingGroupName }: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const [isEditingName, setIsEditingName] = React.useState<boolean>(false);
  const [newGroupName, setNewGroupName] = React.useState<string>(group.name);

  const onStartEditingGroupName = React.useCallback(() => {
    setIsEditingName(true);
  }, []);

  React.useEffect(
    () => {
      if (!isEditingName) {
        setErrorText(null);
      }
    },
    [isEditingName]
  );

  const onFinishEditingName = React.useCallback(
    async () => {
      if (!newGroupName) {
        setErrorText(<Trans>Group name cannot be empty.</Trans>);
        return;
      }
      if (newGroupName === group.name) {
        setIsEditingName(false);
        return;
      }
      setIsLoading(true);
      try {
        await onFinishEditingGroupName(group, newGroupName);
        setIsEditingName(false);
      } catch (error) {
        console.error(error);
        setErrorText(
          <Trans>
            An error occurred while renaming the group name. Please try again
            later.
          </Trans>
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onFinishEditingGroupName, group, newGroupName]
  );

  const onCancelEditingName = React.useCallback(
    () => {
      setNewGroupName(group.name);
      setIsEditingName(false);
    },
    [group]
  );

  return (
    <Line noMargin>
      {isEditingName ? (
        <TextField
          type="text"
          maxLength={50}
          value={newGroupName}
          disabled={isLoading}
          margin="dense"
          onChange={(e, newName) => {
            setNewGroupName(newName);
          }}
          errorText={errorText}
          autoFocus="desktopAndMobileDevices"
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
      ) : (
        <Line noMargin alignItems="center">
          <Text size="block-title">{group.name}</Text>
          <IconButton onClick={onStartEditingGroupName}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Line>
      )}
    </Line>
  );
};

export default TeamGroupNameField;
