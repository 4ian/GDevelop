// @flow
import React from 'react';
import { Trans } from '@lingui/macro';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { UsersAutocomplete } from '../Utils/UsersAutocomplete';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  project: gdProject,
  setName: string => void,
  name: string,
  setAuthorIds: (string[]) => void,
  authorIds: string[],
|};

function PublicGameProperties({
  project,
  setName,
  name,
  setAuthorIds,
  authorIds,
}: Props) {
  return (
    <ColumnStackLayout noMargin>
      <SemiControlledTextField
        floatingLabelText={<Trans>Game name</Trans>}
        fullWidth
        type="text"
        value={name}
        onChange={setName}
        autoFocus
      />
      <UsersAutocomplete
        userIds={authorIds}
        onChange={setAuthorIds}
        floatingLabelText={<Trans>Authors</Trans>}
        helperText={
          <Trans>
            Select the usernames of the authors of this project. They will be
            displayed in the selected order, if you publish this game as an
            example or in the community.
          </Trans>
        }
      />
    </ColumnStackLayout>
  );
}

export default PublicGameProperties;
