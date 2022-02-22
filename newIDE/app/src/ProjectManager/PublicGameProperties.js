// @flow
import React from 'react';
import { Trans } from '@lingui/macro';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { UsersAutocomplete } from '../Utils/UsersAutocomplete';
import { ColumnStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';

type Props = {|
  project: gdProject,
  setName: string => void,
  name: string,
  setDescription: string => void,
  description: ?string,
  setAuthorIds: (string[]) => void,
  authorIds: string[],
  setPlayableWithKeyboard?: boolean => void,
  playWithKeyboard?: boolean,
  setPlayableWithGamepad?: boolean => void,
  playWithGamepad?: boolean,
  setPlayableWithMobile?: boolean => void,
  playWithMobile?: boolean,
|};

function PublicGameProperties({
  project,
  setName,
  name,
  setDescription,
  description,
  setAuthorIds,
  authorIds,
  setPlayableWithKeyboard,
  playWithKeyboard,
  setPlayableWithGamepad,
  playWithGamepad,
  setPlayableWithMobile,
  playWithMobile,
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
      <SemiControlledTextField
        floatingLabelText={<Trans>Game description</Trans>}
        fullWidth
        type="text"
        value={description || ''}
        onChange={setDescription}
        autoFocus
        multiline
        rows={5}
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
      {setPlayableWithKeyboard &&
        setPlayableWithGamepad &&
        setPlayableWithMobile && (
          <React.Fragment>
            <Checkbox
              label={<Trans>Playable with keyboards</Trans>}
              checked={playWithKeyboard}
              onCheck={(e, checked) => setPlayableWithKeyboard(checked)}
            />
            <Checkbox
              label={<Trans>Playable with gamepads</Trans>}
              checked={playWithGamepad}
              onCheck={(e, checked) => setPlayableWithGamepad(checked)}
            />
            <Checkbox
              label={<Trans>Playable on mobile</Trans>}
              checked={playWithMobile}
              onCheck={(e, checked) => setPlayableWithMobile(checked)}
            />
          </React.Fragment>
        )}
    </ColumnStackLayout>
  );
}

export default PublicGameProperties;
