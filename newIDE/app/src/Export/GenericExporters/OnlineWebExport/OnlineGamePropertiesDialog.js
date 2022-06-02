// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import { type Game, type GameSlug } from '../../../Utils/GDevelopServices/Game';
import FlatButton from '../../../UI/FlatButton';
import Dialog from '../../../UI/Dialog';
import {
  cleanUpGameSlug,
  PublicGameProperties,
} from '../../../GameDashboard/PublicGameProperties';
import {
  applyPublicPropertiesToProject,
  type PartialGameChange,
} from '../../../GameDashboard/PublicGamePropertiesDialog';
import { getWebBuildThumbnailUrl } from '../../../Utils/GDevelopServices/Build';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

type Props = {|
  project: gdProject,
  onSaveProject: () => Promise<void>,
  buildId: string,
  game: Game,
  slug: ?GameSlug,
  onClose: () => void,
  onApply: PartialGameChange => Promise<void>,
  isLoading: boolean,
|};

export const OnlineGamePropertiesDialog = ({
  project,
  onSaveProject,
  buildId,
  game,
  slug,
  onClose,
  onApply,
  isLoading,
}: Props) => {
  const { profile } = React.useContext(AuthenticatedUserContext);

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
  const [userSlug, setUserSlug] = React.useState<string>(
    (slug && slug.username) || (profile && profile.username) || ''
  );
  const [gameSlug, setGameSlug] = React.useState<string>(
    (slug && slug.gameSlug) || cleanUpGameSlug(project.getName())
  );
  const [orientation, setOrientation] = React.useState<string>(
    project.getOrientation()
  );
  const [discoverable, setDiscoverable] = React.useState<boolean>(
    !!game.discoverable
  );
  const thumbnailUrl = getWebBuildThumbnailUrl(project, buildId);

  const onPublish = async ({ saveProject }: { saveProject: boolean }) => {
    // First update the project with the new properties.
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
      // If the project has been modified, then save it.
      if (saveProject) {
        await onSaveProject();
      }
      // Then, call the top function with the partial game updates.
      await onApply({ discoverable, userSlug, gameSlug });
    }
  };

  return (
    <Dialog
      title={<Trans>Verify your game info before publishing</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Back</Trans>}
          key="back"
          primary={false}
          onClick={onClose}
          disabled={isLoading}
        />,
        <RaisedButtonWithSplitMenu
          label={<Trans>Save project and publish</Trans>}
          key="publish"
          primary
          onClick={() => {
            onPublish({ saveProject: true });
          }}
          disabled={isLoading}
          buildMenuTemplate={i18n => [
            {
              label: i18n._(t`Publish without saving project`),
              click: () => onPublish({ saveProject: false }),
            },
          ]}
        />,
      ]}
      cannotBeDismissed={isLoading}
      onRequestClose={onClose}
      onApply={() => {
        onPublish({ saveProject: true });
      }}
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
        setPlayableWithKeyboard={setPlayableWithKeyboard}
        playWithKeyboard={playWithKeyboard}
        setPlayableWithGamepad={setPlayableWithGamepad}
        playWithGamepad={playWithGamepad}
        setPlayableWithMobile={setPlayableWithMobile}
        playWithMobile={playWithMobile}
        setOrientation={setOrientation}
        orientation={orientation}
        userSlug={userSlug}
        setUserSlug={setUserSlug}
        gameSlug={gameSlug}
        setGameSlug={setGameSlug}
        discoverable={discoverable}
        setDiscoverable={setDiscoverable}
        displayThumbnail
        thumbnailUrl={thumbnailUrl}
        disabled={isLoading}
      />
    </Dialog>
  );
};

export default OnlineGamePropertiesDialog;
