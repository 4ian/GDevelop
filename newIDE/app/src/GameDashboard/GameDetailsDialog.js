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

type Props = {|
  game: Game,
  project: ?gdProject,
  onClose: () => void,
  onGameUpdated: (updatedGame: Game) => void,
  onGameDeleted: () => void,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
|};

export const GameDetailsDialog = ({
  game,
  project,
  onClose,
  onGameUpdated,
  onGameDeleted,
  analyticsSource,
}: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [currentTab, setCurrentTab] = React.useState<GameDetailsTab>('details');

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>{game.gameName} Dashboard</Trans>}
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
        </Dialog>
      )}
    </I18n>
  );
};
