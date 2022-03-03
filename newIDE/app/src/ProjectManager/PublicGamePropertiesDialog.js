// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import PublicGameProperties from './PublicGameProperties';
import RaisedButton from '../UI/RaisedButton';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../Utils/ProjectErrorsChecker';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { type PublicGame } from '../Utils/GDevelopServices/Game';

/**
 * Public game properties that are shared with the project file ones.
 */
type PublicProjectProperties = {|
  name: string,
  categories: string[],
  description: string,
  authorIds: string[],
  playWithKeyboard: boolean,
  playWithGamepad: boolean,
  playWithMobile: boolean,
  orientation: string,
|};

function applyPublicPropertiesToProject(
  project: gdProject,
  newProperties: PublicProjectProperties
) {
  const t = str => str; //TODO
  const { name, authorIds, description, categories } = newProperties;
  project.setName(name);
  const projectCategories = project.getCategories();
  projectCategories.clear();
  categories.forEach(category => projectCategories.push_back(category));
  project.setDescription(description);
  const projectAuthorIds = project.getAuthorIds();
  projectAuthorIds.clear();
  authorIds.forEach(authorId => projectAuthorIds.push_back(authorId));
  project.setPlayableWithKeyboard(newProperties.playWithKeyboard);
  project.setPlayableWithGamepad(newProperties.playWithGamepad);
  project.setPlayableWithMobile(newProperties.playWithMobile);
  project.setOrientation(newProperties.orientation);

  return displayProjectErrorsBox(t, getProjectPropertiesErrors(t, project));
}

type Props = {|
  project: gdProject,
  publicGame: PublicGame,
  open: boolean,
  onClose: () => void,
  onApply: () => void,
|};

const PublicGamePropertiesDialog = ({
  project,
  publicGame,
  open,
  onClose,
  onApply,
}: Props) => {
  const publicGameAuthorIds = publicGame.authors
    .map(author => (author ? author.id : null))
    .filter(Boolean);
  const [name, setName] = React.useState(publicGame.gameName);
  const [categories, setCategories] = React.useState(publicGame.categories);
  const [description, setDescription] = React.useState(publicGame.description);
  const [authorIds, setAuthorIds] = React.useState<string[]>(
    publicGameAuthorIds
  );
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

  if (!open) return null;

  const onSave = () => {
    if (
      applyPublicPropertiesToProject(project, {
        name,
        categories: categories || [],
        description: description || '',
        authorIds,
        playWithKeyboard: !!playWithKeyboard,
        playWithGamepad: !!playWithGamepad,
        playWithMobile: !!playWithMobile,
        orientation: orientation || 'default',
      })
    )
      onApply();
  };

  const actions = [
    <FlatButton
      label={<Trans>Back</Trans>}
      key="back"
      primary={false}
      onClick={onClose}
    />,
    <RaisedButton
      label={<Trans>Save</Trans>}
      primary
      onClick={onSave}
      key="save"
    />,
  ];

  return (
    <Dialog
      title={<Trans>Game info</Trans>}
      onRequestClose={onClose}
      actions={actions}
      cannotBeDismissed={false}
      open={open}
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
        setPlayableWithKeyboard={setPlayableWithKeyboard}
        playWithKeyboard={playWithKeyboard}
        setPlayableWithGamepad={setPlayableWithGamepad}
        playWithGamepad={playWithGamepad}
        setPlayableWithMobile={setPlayableWithMobile}
        playWithMobile={playWithMobile}
        setOrientation={setOrientation}
        orientation={orientation}
      />
    </Dialog>
  );
};

export default PublicGamePropertiesDialog;
