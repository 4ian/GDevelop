// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import { type Game } from '../Utils/GDevelopServices/Game';
import Dialog from '../UI/Dialog';
import { Tabs } from '../UI/Tabs';
import HelpButton from '../UI/HelpButton';
import GameDetails, {
  gameDetailsTabs,
  type GameDetailsTab,
} from './GameDetails';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import { Column } from '../UI/Grid';
import Publish from '../UI/CustomSvgIcons/Publish';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  game: ?Game,
  project: ?gdProject,
  onClose: () => void,
  onGameUpdated: () => Promise<void>,
  onGameDeleted: () => void,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
  onShareProject?: () => void,
|};

export const GameDetailsDialog = ({
  game,
  project,
  onClose,
  onGameUpdated,
  onGameDeleted,
  analyticsSource,
  onShareProject,
}: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [currentTab, setCurrentTab] = React.useState<GameDetailsTab>('details');

  const { profile, onOpenLoginDialog } = React.useContext(
    AuthenticatedUserContext
  );
  const onClickShare = React.useCallback(
    () => {
      if (!profile) {
        onOpenLoginDialog();
        return;
      }
      if (onShareProject) {
        onShareProject();
      }
    },
    [profile, onShareProject, onOpenLoginDialog]
  );

  const gameName = game ? game.gameName : project ? project.getName() : '';
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>{gameName} Dashboard</Trans>}
          open
          flexColumnBody
          fullHeight
          maxWidth="lg"
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              disabled={isLoading}
              onClick={onClose}
              key="close"
            />,
          ]}
          secondaryActions={[
            <HelpButton
              key="help"
              helpPagePath={
                currentTab === 'leaderboards'
                  ? '/interface/games-dashboard/leaderboard-administration'
                  : '/interface/games-dashboard'
              }
            />,
          ]}
          onRequestClose={onClose}
          cannotBeDismissed={isLoading}
          fixedContent={
            <Tabs
              value={currentTab}
              onChange={setCurrentTab}
              options={gameDetailsTabs}
            />
          }
        >
          {game ? (
            <GameDetails
              game={game}
              project={project}
              onGameUpdated={onGameUpdated}
              onGameDeleted={onGameDeleted}
              onLoading={setIsLoading}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              analyticsSource={analyticsSource}
            />
          ) : (
            <Column noMargin expand justifyContent="center">
              <EmptyPlaceholder
                title={<Trans>Share your project online</Trans>}
                description={
                  <Trans>
                    Share your project online to unlock player engagement
                    analytics, player feedback and other functionalities.
                  </Trans>
                }
                helpPagePath="/publishing"
                actionButtonId="game-detail-share-button"
                actionIcon={<Publish />}
                actionLabel={<Trans>Share</Trans>}
                onAction={onClickShare}
              />
            </Column>
          )}
        </Dialog>
      )}
    </I18n>
  );
};
