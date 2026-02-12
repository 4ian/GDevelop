// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type TeamGroup } from '../../../../Utils/GDevelopServices/User';
import { Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import IconButton from '../../../../UI/IconButton';
import EditIcon from '../../../../UI/CustomSvgIcons/Edit';
import TrashIcon from '../../../../UI/CustomSvgIcons/Trash';
import CircularProgress from '../../../../UI/CircularProgress';
import AsyncSemiControlledTextField from '../../../../UI/AsyncSemiControlledTextField';
import { LineStackLayout } from '../../../../UI/Layout';

type Props = {|
  group: TeamGroup,
  onFinishEditingGroupName: (
    group: TeamGroup,
    newName: string
  ) => Promise<void>,
  allowDelete: boolean,
  onDeleteGroup: (group: TeamGroup) => Promise<void>,
|};

const TeamGroupNameField = ({
  group,
  onFinishEditingGroupName,
  allowDelete,
  onDeleteGroup,
}: Props) => {
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isEditingName, setIsEditingName] = React.useState<boolean>(false);

  const onStartEditingGroupName = React.useCallback(() => {
    setIsEditingName(true);
  }, []);

  const onClickDeleteGroup = React.useCallback(
    async () => {
      setIsDeleting(true);
      try {
        await onDeleteGroup(group);
        // No need to set back isDeleting flag to false since the component should
        // be unmounted by the time the API call is done.
      } catch (error) {
        console.error(
          `An error occurred when deleting the group ${group.id}`,
          error
        );
        setIsDeleting(false);
      }
    },
    [group, onDeleteGroup]
  );

  return (
    <Line noMargin>
      {isEditingName ? (
        <AsyncSemiControlledTextField
          margin="dense"
          maxLength={50}
          autoFocus="desktopAndMobileDevices"
          value={group.name}
          callback={async newGroupName => {
            await onFinishEditingGroupName(group, newGroupName);
            setIsEditingName(false);
          }}
          callbackErrorText={
            <Trans>
              An error occurred while renaming the group name. Please try again
              later.
            </Trans>
          }
          onCancel={() => setIsEditingName(false)}
          emptyErrorText={<Trans>Group name cannot be empty.</Trans>}
        />
      ) : (
        <LineStackLayout noMargin alignItems="center">
          <Text size="block-title">{group.name}</Text>
          <IconButton onClick={onStartEditingGroupName} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          {allowDelete && (
            <IconButton onClick={onClickDeleteGroup} size="small">
              {isDeleting ? (
                <CircularProgress size={10} />
              ) : (
                <TrashIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </LineStackLayout>
      )}
    </Line>
  );
};

export default TeamGroupNameField;
