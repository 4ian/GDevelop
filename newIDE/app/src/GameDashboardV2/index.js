// @flow

import * as React from 'react';
import { type Game } from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout } from '../UI/Layout';
import GameHeader from './GameHeader';

type Props = {|
  game: Game,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
|};

const GameDashboardV2 = ({ game }: Props) => {
  return (
    <ColumnStackLayout noMargin>
      <GameHeader game={game} />
    </ColumnStackLayout>
  );
};

export default GameDashboardV2;
