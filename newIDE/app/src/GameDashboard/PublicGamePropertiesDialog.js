// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import React from 'react';
import { PublicGameProperties, cleanUpGameSlug } from './PublicGameProperties';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../Utils/ProjectErrorsChecker';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { type PublicGame } from '../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

/**
 * Changes that are not stored in the Project.
 */
export type PartialGameChange = {|
  ownerIds?: Array<string>,
  userSlug?: string,
  gameSlug?: string,
  discoverable?: boolean,
|};

/**
 * Public game properties that are shared with the project file ones.
 */
type PublicProjectProperties = {|
  name: string,
  categories: string[],
  description: string,
  authorIds: string[],
  authorUsernames: string[],
  playWithKeyboard: boolean,
  playWithGamepad: boolean,
  playWithMobile: boolean,
  orientation: string,
|};

export const applyPublicPropertiesToProject = (
  project: gdProject,
  i18n: I18nType,
  newProperties: PublicProjectProperties
) => {
  const {
    name,
    authorIds,
    authorUsernames,
    description,
    categories,
  } = newProperties;
  project.setName(name);
  const projectCategories = project.getCategories();
  projectCategories.clear();
  categories.forEach(category => projectCategories.push_back(category));
  project.setDescription(description);
  const projectAuthorIds = project.getAuthorIds();
  projectAuthorIds.clear();
  authorIds.forEach(authorId => projectAuthorIds.push_back(authorId));
  const projectAuthorUsernames = project.getAuthorUsernames();
  projectAuthorUsernames.clear();
  authorUsernames.forEach(authorUsername =>
    projectAuthorUsernames.push_back(authorUsername)
  );
  project.setPlayableWithKeyboard(newProperties.playWithKeyboard);
  project.setPlayableWithGamepad(newProperties.playWithGamepad);
  project.setPlayableWithMobile(newProperties.playWithMobile);
  project.setOrientation(newProperties.orientation);

  return displayProjectErrorsBox(
    i18n,
    getProjectPropertiesErrors(i18n, project)
  );
};

type Props = {|
  project: gdProject,
  publicGame: PublicGame,
  onClose: () => void,
  onApply: (partialGameChange: PartialGameChange) => Promise<void>,
  isLoading: boolean,
  i18n: I18nType,
|};

export const PublicGamePropertiesDialog = ({
  project,
  publicGame,
  onClose,
  onApply,
  isLoading,
  i18n,
}: Props) => {
  const { profile } = React.useContext(AuthenticatedUserContext);

  const publicGameAuthorIds = publicGame.authors.map(author => author.id);
  const publicGameAuthorUsernames = publicGame.authors
    .map(author => author.username)
    .filter(Boolean);
  const publicGameOwnerIds = publicGame.owners.map(owner => owner.id);
  const [name, setName] = React.useState(publicGame.gameName);
  const [categories, setCategories] = React.useState(publicGame.categories);
  const [description, setDescription] = React.useState(publicGame.description);
  const [authorIds, setAuthorIds] = React.useState<string[]>(
    publicGameAuthorIds
  );
  const [authorUsernames, setAuthorUsernames] = React.useState<string[]>(
    publicGameAuthorUsernames
  );
  const [ownerIds, setOwnerIds] = React.useState<string[]>(publicGameOwnerIds);
  const [playWithKeyboard, setPlayableWithKeyboard] = React.useState(
    publicGame.playWithKeyboard
  );
  const [playWithGamepad, setPlayableWithGamepad] = React.useState(
    publicGame.playWithGamepad
  );
  const [playWithMobile, setPlayableWithMobile] = React.useState(
    publicGame.playWithMobile
  );
  const [orientation, setOrientation] = React.useState(publicGame.orientation);
  const [userSlug, setUserSlug] = React.useState(
    publicGame.userSlug || (profile && profile.username) || ''
  );
  const [gameSlug, setGameSlug] = React.useState(
    publicGame.gameSlug || cleanUpGameSlug(publicGame.gameName)
  );
  const [discoverable, setDiscoverable] = React.useState(
    publicGame.discoverable
  );

  const onSave = async () => {
    if (
      applyPublicPropertiesToProject(project, i18n, {
        name,
        categories: categories || [],
        description: description || '',
        authorIds,
        authorUsernames,
        playWithKeyboard: !!playWithKeyboard,
        playWithGamepad: !!playWithGamepad,
        playWithMobile: !!playWithMobile,
        orientation: orientation || 'default',
      })
    ) {
      await onApply({ ownerIds, userSlug, gameSlug, discoverable });
    }
  };

  const actions = [
    <FlatButton
      label={<Trans>Back</Trans>}
      key="back"
      primary={false}
      onClick={onClose}
      disabled={isLoading}
    />,
    <DialogPrimaryButton
      label={<Trans>Save</Trans>}
      primary
      onClick={onSave}
      key="save"
      disabled={isLoading}
    />,
  ];

  return (
    <Dialog
      title={publicGame.gameName}
      actions={actions}
      cannotBeDismissed={isLoading}
      onRequestClose={onClose}
      onApply={onSave}
      open
    >
      <PublicGameProperties
        name={name}
        setName={setName}
        categories={categories}
        setCategories={setCategories}
        description={description}
        setDescription={setDescription}
        project={project}
        authorIds={authorIds}
        setAuthorIds={setAuthorIds}
        setAuthorUsernames={setAuthorUsernames}
        ownerIds={ownerIds}
        setOwnerIds={setOwnerIds}
        setPlayableWithKeyboard={setPlayableWithKeyboard}
        playWithKeyboard={playWithKeyboard}
        setPlayableWithGamepad={setPlayableWithGamepad}
        playWithGamepad={playWithGamepad}
        setPlayableWithMobile={setPlayableWithMobile}
        playWithMobile={playWithMobile}
        setOrientation={setOrientation}
        orientation={orientation}
        setUserSlug={setUserSlug}
        userSlug={userSlug}
        setGameSlug={setGameSlug}
        gameSlug={gameSlug}
        setDiscoverable={setDiscoverable}
        discoverable={discoverable}
        displayThumbnail
        thumbnailUrl={publicGame.thumbnailUrl}
      />
    </Dialog>
  );
};

export default PublicGamePropertiesDialog;
