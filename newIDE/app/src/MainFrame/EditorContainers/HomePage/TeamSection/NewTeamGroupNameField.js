// @flow

import * as React from 'react';
import { Line } from '../../../../UI/Grid';
import { Trans, t } from '@lingui/macro';
import AsyncSemiControlledTextField from '../../../../UI/AsyncSemiControlledTextField';

type Props = {|
  onValidateGroupName: ({| name: string |}) => Promise<void>,
  onDismiss: () => void,
|};

const NewTeamGroupNameField = ({ onValidateGroupName, onDismiss }: Props) => {
  return (
    <Line noMargin>
      <AsyncSemiControlledTextField
        margin="dense"
        maxLength={50}
        autoFocus="desktopAndMobileDevices"
        translatableHintText={t`New group name`}
        value={''}
        callback={async newName => {
          await onValidateGroupName({ name: newName });
          onDismiss();
        }}
        callbackErrorText={
          <Trans>
            An error occurred while creating the group. Please try again later.
          </Trans>
        }
        onCancel={onDismiss}
        emptyErrorText={<Trans>Group name cannot be empty.</Trans>}
      />
    </Line>
  );
};

export default NewTeamGroupNameField;
