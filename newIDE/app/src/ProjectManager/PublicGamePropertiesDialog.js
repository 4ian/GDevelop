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
  description: string,
  authorIds: string[],
  playWithKeyboard: boolean,
  playWithGamepad: boolean,
  playWithMobile: boolean,
|};

function applyPublicPropertiesToProject(
  project: gdProject,
  newProperties: PublicProjectProperties
) {
  const t = str => str; //TODO
  const { name, authorIds, description } = newProperties;
  project.setName(name);
  project.setDescription(description);
  const projectAuthorIds = project.getAuthorIds();
  projectAuthorIds.clear();
  authorIds.forEach(authorId => projectAuthorIds.push_back(authorId));
  project.setPlayableWithKeyboard(newProperties.playWithKeyboard);
  project.setPlayableWithGamepad(newProperties.playWithGamepad);
  project.setPlayableWithMobile(newProperties.playWithMobile);

  return displayProjectErrorsBox(t, getProjectPropertiesErrors(t, project));
}

type Props = {|
  project: gdProject,
  game: PublicGame,
  open: boolean,
  onClose: () => void,
  onApply: () => void,
|};

const PublicGamePropertiesDialog = ({
  project,
  game,
  open,
  onClose,
  onApply,
}: Props) => {
  const publicGameAuthorIds = game.authors
    .map(author => (author ? author.id : null))
    .filter(Boolean);
  const [name, setName] = React.useState(game.gameName);
  const [description, setDescription] = React.useState(game.description);
  const [authorIds, setAuthorIds] = React.useState<string[]>(
    publicGameAuthorIds
  );
  const [playWithKeyboard, setPlayableWithKeyboard] = React.useState(
    game.playWithKeyboard
  );
  const [playWithGamepad, setPlayableWithGamepad] = React.useState(
    game.playWithGamepad
  );
  const [playWithMobile, setPlayableWithMobile] = React.useState(
    game.playWithMobile
  );

  if (!open) return null;

  const onSave = () => {
    if (
      applyPublicPropertiesToProject(project, {
        name,
        description: description || '',
        authorIds,
        playWithKeyboard: !!playWithKeyboard,
        playWithGamepad: !!playWithGamepad,
        playWithMobile: !!playWithMobile,
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
      />
    </Dialog>
  );
};

export default PublicGamePropertiesDialog;
