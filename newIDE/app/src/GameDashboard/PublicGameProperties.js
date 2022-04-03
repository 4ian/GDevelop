// @flow
import React from 'react';
import { Trans } from '@lingui/macro';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { UsersAutocomplete } from '../Utils/UsersAutocomplete';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { t } from '@lingui/macro';
import SemiControlledMultiAutoComplete from '../UI/SemiControlledMultiAutoComplete';
import {
  allGameCategories,
  getCategoryName,
} from '../Utils/GDevelopServices/Game';
import { I18n } from '@lingui/react';
import { Column, Line, Spacer } from '../UI/Grid';
import BackgroundText from '../UI/BackgroundText';
import { GameThumbnail } from './GameThumbnail';

type Props = {|
  project: gdProject,
  // Properties visible in the project properties and game dialogs.
  setName: string => void,
  name: string,
  setDescription: string => void,
  description: ?string,
  setAuthorIds: (string[]) => void,
  authorIds: string[],
  setOrientation: string => void,
  orientation: string,
  // Properties only visible in the game dialog.
  setCategories?: (string[]) => void,
  categories?: string[],
  setOwnerIds?: (string[]) => void,
  ownerIds?: string[],
  setPlayableWithKeyboard?: boolean => void,
  playWithKeyboard?: boolean,
  setPlayableWithGamepad?: boolean => void,
  playWithGamepad?: boolean,
  setPlayableWithMobile?: boolean => void,
  playWithMobile?: boolean,
  setDiscoverable?: boolean => void,
  discoverable?: boolean,
  displayThumbnail?: boolean,
  thumbnailUrl?: string,
|};

function PublicGameProperties({
  project,
  setName,
  name,
  categories,
  setCategories,
  setDescription,
  description,
  setAuthorIds,
  authorIds,
  setOwnerIds,
  ownerIds,
  setPlayableWithKeyboard,
  playWithKeyboard,
  setPlayableWithGamepad,
  playWithGamepad,
  setPlayableWithMobile,
  playWithMobile,
  setOrientation,
  orientation,
  setDiscoverable,
  discoverable,
  displayThumbnail,
  thumbnailUrl,
}: Props) {
  const [categoryInput, setCategoryInput] = React.useState('');

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <ResponsiveLineStackLayout noMargin>
            {displayThumbnail && (
              <>
                <Column noMargin>
                  <GameThumbnail
                    gameName={project.getName()}
                    thumbnailUrl={thumbnailUrl}
                  />
                </Column>
                <Spacer />
              </>
            )}
            <ColumnStackLayout noMargin expand>
              <SemiControlledTextField
                floatingLabelText={<Trans>Game name</Trans>}
                fullWidth
                type="text"
                value={name}
                onChange={setName}
                autoFocus
              />
              {setCategories && (
                <SemiControlledMultiAutoComplete
                  hintText={t`Select a genre`}
                  floatingLabelText={<Trans>Genres</Trans>}
                  helperText={
                    <Trans>
                      Select up to 4 genres for the game to be visible on
                      Liluo.io's categories pages!
                    </Trans>
                  }
                  value={
                    categories
                      ? categories.map(category => ({
                          value: category,
                          text: getCategoryName(category, i18n),
                        }))
                      : []
                  }
                  onChange={(event, values) => {
                    setCategories(
                      values ? values.map(category => category.value) : []
                    );
                  }}
                  inputValue={categoryInput}
                  onInputChange={(event, value) => {
                    setCategoryInput(value);
                  }}
                  dataSource={allGameCategories.map(category => ({
                    value: category,
                    text: getCategoryName(category, i18n),
                  }))}
                  fullWidth
                  optionsLimit={4}
                />
              )}
              {setDiscoverable && (
                <Checkbox
                  label={<Trans>Make your game discoverable on Liluo.io</Trans>}
                  checked={!!discoverable}
                  onCheck={(e, checked) => setDiscoverable(checked)}
                />
              )}
            </ColumnStackLayout>
          </ResponsiveLineStackLayout>
          {displayThumbnail && (
            <Line noMargin>
              <BackgroundText>
                <Trans>
                  To update your thumbnail, go into your Game Settings > Icons
                  and thumbnail, then create and publish a new build.
                </Trans>
              </BackgroundText>
            </Line>
          )}
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
                Select the usernames of the authors of this project. They will
                be displayed in the selected order, if you publish this game as
                an example or in the community.
              </Trans>
            }
          />
          {setOwnerIds && (
            <UsersAutocomplete
              userIds={ownerIds || []}
              onChange={setOwnerIds}
              floatingLabelText={<Trans>Owners</Trans>}
              helperText={
                <Trans>
                  Select the usernames of the owners of this project to let them
                  manage this game builds. Be aware that owners can revoke your
                  ownership.
                </Trans>
              }
            />
          )}
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Device orientation (for mobile)</Trans>}
            value={orientation}
            onChange={(e, i, value: string) => setOrientation(value)}
          >
            <SelectOption value="default" primaryText={t`Platform default`} />
            <SelectOption value="landscape" primaryText={t`Landscape`} />
            <SelectOption value="portrait" primaryText={t`Portrait`} />
          </SelectField>
          {setPlayableWithKeyboard &&
            setPlayableWithGamepad &&
            setPlayableWithMobile && (
              <React.Fragment>
                <Checkbox
                  label={<Trans>Playable with a keyboard</Trans>}
                  checked={!!playWithKeyboard}
                  onCheck={(e, checked) => setPlayableWithKeyboard(checked)}
                />
                <Checkbox
                  label={<Trans>Playable with a gamepad</Trans>}
                  checked={!!playWithGamepad}
                  onCheck={(e, checked) => setPlayableWithGamepad(checked)}
                />
                <Checkbox
                  label={<Trans>Playable on mobile</Trans>}
                  checked={!!playWithMobile}
                  onCheck={(e, checked) => setPlayableWithMobile(checked)}
                />
              </React.Fragment>
            )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
}

export default PublicGameProperties;
