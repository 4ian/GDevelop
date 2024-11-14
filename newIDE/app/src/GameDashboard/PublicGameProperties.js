// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import Divider from '@material-ui/core/Divider';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { UsersAutocomplete } from '../Profile/UsersAutocomplete';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import SemiControlledMultiAutoComplete from '../UI/SemiControlledMultiAutoComplete';
import {
  getCategoryName,
  getGameCategories,
  type GameCategory,
  type Game,
} from '../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { I18n } from '@lingui/react';
import { Column, Line, Spacer } from '../UI/Grid';
import AlertMessage from '../UI/AlertMessage';
import { GameThumbnail } from './GameThumbnail';
import Text from '../UI/Text';
import Toggle from '../UI/Toggle';

const GAME_SLUG_MAX_LENGTH = 30;
const GAME_SLUG_MIN_LENGTH = 6;

const isCyrillic = (text: string) =>
  /[БГДЖЗИЙЛПФЦЧШЩЫЭЮЯбвгджзийклмнптфцчшщыэюя]/.test(text);
const cyrillicToLatinMapping = require('./CyrillicToLatin.json');

export const cleanUpGameSlug = (gameSlug: string) => {
  let latinGameSlug = gameSlug;
  if (isCyrillic(gameSlug)) {
    latinGameSlug = gameSlug
      .split('')
      .map(function(char) {
        const latin = cyrillicToLatinMapping[char];
        return latin === undefined ? char : latin;
      })
      .join('');
  }
  let slug = latinGameSlug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .slice(0, GAME_SLUG_MAX_LENGTH);
  if (slug.length < GAME_SLUG_MIN_LENGTH) {
    slug = slug.concat(
      new Array(GAME_SLUG_MIN_LENGTH - slug.length).fill('-').join('')
    );
  }
  return slug;
};

type Props = {|
  gameId: string,
  disabled?: boolean,
  onGameUpdated?: (game: Game) => void,
  onUpdatingGame?: (isUpdatingGame: boolean) => void,
  // Properties visible in the project properties and game dialogs.
  setName: string => void,
  name: string,
  setDescription: string => void,
  description: ?string,
  setAuthorIds: (string[]) => void,
  setAuthorUsernames: (string[]) => void,
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
  userSlug?: string,
  setUserSlug?: string => void,
  gameSlug?: string,
  setGameSlug?: string => void,
  setDiscoverable?: boolean => void,
  isPublishedOnGdGames?: boolean,
  setIsPublishedOnGdGames?: boolean => void,
  acceptsAdvertisementsOnGdGames?: boolean,
  setAcceptsAdvertisementsOnGdGames?: boolean => void,
  acceptsGameComments?: boolean,
  setAcceptsGameComments?: boolean => void,
  discoverable?: boolean,
  displayThumbnail?: boolean,
  thumbnailUrl?: ?string,
  canBePublishedOnGdGames?: boolean,
|};

export function PublicGameProperties({
  gameId,
  disabled,
  setName,
  name,
  categories,
  setCategories,
  setDescription,
  description,
  setAuthorIds,
  setAuthorUsernames,
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
  userSlug,
  setUserSlug,
  gameSlug,
  setGameSlug,
  setDiscoverable,
  discoverable,
  displayThumbnail,
  isPublishedOnGdGames,
  setIsPublishedOnGdGames,
  acceptsAdvertisementsOnGdGames,
  setAcceptsAdvertisementsOnGdGames,
  acceptsGameComments,
  setAcceptsGameComments,
  thumbnailUrl,
  onGameUpdated,
  onUpdatingGame,
  canBePublishedOnGdGames,
}: Props) {
  const [categoryInput, setCategoryInput] = React.useState('');
  const { profile } = React.useContext(AuthenticatedUserContext);

  const hasGameSlug =
    userSlug && !!userSlug.length && profile && profile.username;

  const hasValidGameSlug =
    hasGameSlug && (profile && userSlug !== profile.username);

  const [allGameCategories, setAllGameCategories] = React.useState<
    GameCategory[]
  >([]);

  const fetchGameCategories = React.useCallback(async () => {
    try {
      const categories = await getGameCategories();
      setAllGameCategories(categories);
    } catch (error) {
      console.error('An error occurred while fetching game categories.', error);
    }
  }, []);

  React.useEffect(
    () => {
      fetchGameCategories();
    },
    [fetchGameCategories]
  );

  const disablePublicationProperties = !isPublishedOnGdGames;

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <ResponsiveLineStackLayout noMargin>
            {displayThumbnail && (
              <>
                <Column noMargin alignItems="stretch">
                  <GameThumbnail
                    gameName={name}
                    thumbnailUrl={thumbnailUrl}
                    gameId={gameId}
                    canUpdateThumbnail
                    disabled={disabled}
                    onGameUpdated={onGameUpdated}
                    onUpdatingGame={onUpdatingGame}
                    fullWidthOnMobile
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
                autoFocus="desktop"
                disabled={disabled}
              />
              <SemiControlledTextField
                floatingLabelText={<Trans>Game description</Trans>}
                fullWidth
                type="text"
                value={description || ''}
                onChange={setDescription}
                multiline
                rows={5}
                disabled={disabled}
              />
            </ColumnStackLayout>
          </ResponsiveLineStackLayout>
          <UsersAutocomplete
            userIds={authorIds}
            onChange={userIdAndUsernames => {
              setAuthorIds(
                userIdAndUsernames.map(
                  userIdAndUsername => userIdAndUsername.userId
                )
              );
              setAuthorUsernames(
                userIdAndUsernames.map(
                  userIdAndUsername => userIdAndUsername.username
                )
              );
            }}
            floatingLabelText={<Trans>Authors</Trans>}
            helperText={
              <Trans>
                Select the usernames of the authors of this project. They will
                be displayed in the selected order, if you publish this game as
                an example or in the community.
              </Trans>
            }
            disabled={disabled}
          />
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Device orientation (for mobile)</Trans>}
            value={orientation}
            onChange={(e, i, value: string) => setOrientation(value)}
            disabled={disabled}
          >
            <SelectOption value="default" label={t`Platform default`} />
            <SelectOption value="landscape" label={t`Landscape`} />
            <SelectOption value="portrait" label={t`Portrait`} />
          </SelectField>
          {setPlayableWithKeyboard &&
            setPlayableWithGamepad &&
            setPlayableWithMobile && (
              <Column noMargin>
                <Text color="secondary" size="body-small">
                  <Trans>Select the controls that apply:</Trans>
                </Text>
                <ResponsiveLineStackLayout noMargin noColumnMargin>
                  <Checkbox
                    label={<Trans>Keyboard</Trans>}
                    checked={!!playWithKeyboard}
                    onCheck={(e, checked) => setPlayableWithKeyboard(checked)}
                    disabled={disabled}
                  />
                  <Checkbox
                    label={<Trans>Gamepad</Trans>}
                    checked={!!playWithGamepad}
                    onCheck={(e, checked) => setPlayableWithGamepad(checked)}
                    disabled={disabled}
                  />
                  <Checkbox
                    label={<Trans>Touch (mobile)</Trans>}
                    checked={!!playWithMobile}
                    onCheck={(e, checked) => setPlayableWithMobile(checked)}
                    disabled={disabled}
                  />
                </ResponsiveLineStackLayout>
              </Column>
            )}
          {canBePublishedOnGdGames !== undefined && !canBePublishedOnGdGames && (
            <AlertMessage kind="info">
              <Trans>
                You can configure the following properties and they will be
                applied as soon as you share your game with an export to
                gd.games.
              </Trans>
            </AlertMessage>
          )}
          {setIsPublishedOnGdGames && (
            <>
              <Spacer />
              <Line noMargin>
                <Column>
                  <Toggle
                    labelPosition="right"
                    toggled={!!isPublishedOnGdGames}
                    onToggle={(e, newValue) =>
                      setIsPublishedOnGdGames(newValue)
                    }
                    label={i18n._(t`Publish game on gd.games`)}
                    disabled={!canBePublishedOnGdGames}
                  />
                </Column>
              </Line>
            </>
          )}
          {(setOwnerIds ||
            (setUserSlug && setGameSlug) ||
            setAcceptsAdvertisementsOnGdGames ||
            setDiscoverable ||
            setCategories) && (
            <>
              <Divider orientation="horizontal" />
              <Line>
                <Text size="block-title">
                  <Trans>Publishing on gd.games</Trans>
                </Text>
              </Line>
            </>
          )}
          {setOwnerIds && (
            <UsersAutocomplete
              userIds={ownerIds || []}
              onChange={userData =>
                setOwnerIds(userData.map(data => data.userId))
              }
              floatingLabelText={<Trans>Owners</Trans>}
              helperText={
                <Trans>
                  Select the usernames of the owners of this project to let them
                  manage this game builds. Be aware that owners can revoke your
                  ownership.
                </Trans>
              }
              disabled={disabled}
            />
          )}
          {setUserSlug && setGameSlug && (
            <>
              <Line>
                <SelectField
                  fullWidth
                  floatingLabelText={<Trans>User name in the game URL</Trans>}
                  value={userSlug || ''}
                  onChange={(e, i, value: string) => setUserSlug(value)}
                  // It's disabled if one of the condition of SelectOption is false.
                  disabled={
                    !hasValidGameSlug ||
                    disabled ||
                    disablePublicationProperties
                  }
                >
                  {profile && profile.username && (
                    <SelectOption
                      value={profile.username}
                      label={profile.username}
                      shouldNotTranslate
                    />
                  )}
                  {userSlug && (!profile || userSlug !== profile.username) && (
                    <SelectOption
                      value={userSlug}
                      label={userSlug}
                      shouldNotTranslate
                    />
                  )}
                </SelectField>
                <Spacer />
                <SemiControlledTextField
                  disabled={
                    !hasGameSlug || disabled || disablePublicationProperties
                  }
                  floatingLabelText={<Trans>Game name in the game URL</Trans>}
                  fullWidth
                  maxLength={GAME_SLUG_MAX_LENGTH}
                  type="text"
                  value={hasGameSlug ? gameSlug || '' : ''}
                  onChange={gameSlug => setGameSlug(cleanUpGameSlug(gameSlug))}
                />
              </Line>
              {!hasGameSlug && (
                <AlertMessage kind="info">
                  <Trans>
                    Usernames are required to choose a custom game URL.
                  </Trans>
                </AlertMessage>
              )}
            </>
          )}
          {setCategories && (
            <SemiControlledMultiAutoComplete
              hintText={t`Select a genre`}
              floatingLabelText={<Trans>Genres</Trans>}
              helperText={
                <Trans>
                  Select up to 3 genres for the game to be visible on gd.games's
                  categories pages!
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
                setCategoryInput('');
              }}
              inputValue={categoryInput}
              onInputChange={(event, value, reason) => {
                // It seems that the input is triggered with a "reset" reason,
                // after each input change. (https://github.com/mui/material-ui/issues/20939)
                // We handle this manually to avoid the input to be reseted.
                if (reason === 'input') {
                  setCategoryInput(value);
                }
              }}
              dataSource={allGameCategories.map(category => ({
                value: category.name,
                text: getCategoryName(category.name, i18n),
                disabled: category.type === 'admin-only',
              }))}
              fullWidth
              optionsLimit={3}
              disabled={disabled || disablePublicationProperties}
              loading={allGameCategories.length === 0}
            />
          )}
          {setDiscoverable && (
            <SelectField
              fullWidth
              floatingLabelText={<Trans>Visibility</Trans>}
              value={discoverable ? 'visible' : 'hidden'}
              onChange={(e, i, value: string) =>
                setDiscoverable(value === 'visible')
              }
              disabled={disabled || disablePublicationProperties}
            >
              <SelectOption
                value="visible"
                label={t`Visible in the search and your profile`}
              />
              <SelectOption value="hidden" label={t`Hidden`} />
            </SelectField>
          )}
          {setAcceptsAdvertisementsOnGdGames && (
            <Line noMargin>
              <Column>
                <Toggle
                  disabled={disablePublicationProperties}
                  labelPosition="right"
                  toggled={!!acceptsAdvertisementsOnGdGames}
                  onToggle={(e, newValue) =>
                    setAcceptsAdvertisementsOnGdGames(newValue)
                  }
                  label={i18n._(
                    t`Enable ads and revenue sharing on the game page`
                  )}
                />
              </Column>
            </Line>
          )}
          {setAcceptsGameComments && (
            <Line noMargin>
              <Column>
                <Toggle
                  disabled={disablePublicationProperties}
                  labelPosition="right"
                  toggled={!!acceptsGameComments}
                  onToggle={(e, newValue) => setAcceptsGameComments(newValue)}
                  label={i18n._(t`Collect feedback from players`)}
                />
              </Column>
            </Line>
          )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
}

export default PublicGameProperties;
