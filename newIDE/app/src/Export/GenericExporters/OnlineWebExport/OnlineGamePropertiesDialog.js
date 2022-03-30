// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { type Game } from '../../../Utils/GDevelopServices/Game';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import Dialog from '../../../UI/Dialog';
import PublicGameProperties from '../../../GameDashboard/PublicGameProperties';
import {
  applyPublicPropertiesToProject,
  type PartialGameChange,
} from '../../../GameDashboard/PublicGamePropertiesDialog';
import { getWebBuildThumbnailUrl } from '../../../Utils/GDevelopServices/Build';

type Props = {|
  project: gdProject,
  buildId: string,
  game: Game,
  open: boolean,
  onClose: () => void,
  onApply: PartialGameChange => Promise<void>,
  isLoading: boolean,
|};

export const OnlineGamePropertiesDialog = ({
  project,
  buildId,
  game,
  open,
  onClose,
  onApply,
  isLoading,
}: Props) => {
  const [name, setName] = React.useState<string>(project.getName());
  const [categories, setCategories] = React.useState<string[]>(
    project.getCategories().toJSArray()
  );
  const [description, setDescription] = React.useState<string>(
    project.getDescription()
  );
  const [authorIds, setAuthorIds] = React.useState<string[]>(
    project.getAuthorIds().toJSArray()
  );
  const [playWithKeyboard, setPlayableWithKeyboard] = React.useState<boolean>(
    project.isPlayableWithKeyboard()
  );
  const [playWithGamepad, setPlayableWithGamepad] = React.useState<boolean>(
    project.isPlayableWithGamepad()
  );
  const [playWithMobile, setPlayableWithMobile] = React.useState<boolean>(
    project.isPlayableWithMobile()
  );
  const [orientation, setOrientation] = React.useState<string>(
    project.getOrientation()
  );
  const [discoverable, setDiscoverable] = React.useState<boolean>(
    !!game.discoverable
  );
  const thumbnailUrl = getWebBuildThumbnailUrl(project, buildId);

  if (!open) return null;

  const onPublish = async () => {
    // Update the project with the new properties before updating the game.
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
    ) {
      await onApply({ discoverable });
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
    <RaisedButton
      label={<Trans>Publish</Trans>}
      key="publish"
      primary
      onClick={onPublish}
      disabled={isLoading}
    />,
  ];

  return (
    <Dialog
      title={<Trans>Verify your game info before publishing</Trans>}
      onRequestClose={onClose}
      actions={actions}
      cannotBeDismissed={isLoading}
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
        discoverable={discoverable}
        setDiscoverable={setDiscoverable}
        displayThumbnail
        thumbnailUrl={thumbnailUrl}
      />
    </Dialog>
  );
};

export default OnlineGamePropertiesDialog;
