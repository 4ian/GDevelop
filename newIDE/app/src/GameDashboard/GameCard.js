// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';

import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';

import { GameThumbnail } from './GameThumbnail';

import {
  getGameMainImageUrl,
  getGameUrl,
  type Game,
} from '../Utils/GDevelopServices/Game';
import { type GameDetailsTab } from '.';
import Card from '../UI/Card';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import DollarCoin from '../UI/CustomSvgIcons/DollarCoin';
import Cross from '../UI/CustomSvgIcons/Cross';
import Messages from '../UI/CustomSvgIcons/Messages';
import GameLinkAndShareIcons from './GameLinkAndShareIcons';

const styles = {
  iconAndText: { display: 'flex', gap: 2, alignItems: 'flex-start' },
};

type Props = {|
  game: Game,
  isCurrentGame: boolean,
  onOpenGameManager: (tab: GameDetailsTab) => void,
|};

export const GameCard = ({ game, isCurrentGame, onOpenGameManager }: Props) => {
  const isPublishedOnGdGames = !!game.publicWebBuildId;
  const gameUrl = isPublishedOnGdGames ? getGameUrl(game) : null;

  const gameThumbnailUrl = React.useMemo(() => getGameMainImageUrl(game), [
    game,
  ]);

  const { isMobile } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const renderPublicInfo = () => {
    const DiscoverabilityIcon =
      game.discoverable && gameUrl ? Visibility : VisibilityOff;
    const AdsIcon = game.displayAdsOnGamePage ? DollarCoin : Cross;
    const PlayerFeedbackIcon = game.acceptsGameComments ? Messages : Cross;
    const textProps = {
      color: 'secondary',
      size: 'body-small',
      noMargin: true,
    };
    const iconProps = {
      htmlColor: gdevelopTheme.text.color.secondary,
      fontSize: 'small',
    };
    return (
      <ResponsiveLineStackLayout alignItems="center" noColumnMargin>
        <div style={styles.iconAndText}>
          <DiscoverabilityIcon {...iconProps} />
          <Text {...textProps}>
            {game.discoverable && gameUrl ? (
              <Trans>Public on gd.games</Trans>
            ) : gameUrl ? (
              <Trans>Hidden on gd.games</Trans>
            ) : (
              <Trans>Not published</Trans>
            )}
          </Text>
        </div>
        <div style={styles.iconAndText}>
          <AdsIcon {...iconProps} />
          <Text {...textProps}>
            {game.displayAdsOnGamePage ? (
              <Trans>Ad revenue sharing on</Trans>
            ) : (
              <Trans>Ad revenue sharing off</Trans>
            )}
          </Text>
        </div>
        <div style={styles.iconAndText}>
          <PlayerFeedbackIcon {...iconProps} />
          <Text {...textProps}>
            {game.acceptsGameComments ? (
              <Trans>Player feedback on</Trans>
            ) : (
              <Trans>Player feedback off</Trans>
            )}
          </Text>
        </div>
      </ResponsiveLineStackLayout>
    );
  };

  const renderTitle = (i18n: I18nType) => (
    <ColumnStackLayout noMargin>
      <Text color="secondary" noMargin>
        <Trans>Published on {i18n.date(game.createdAt)}</Trans>
      </Text>
      <Text size="block-title" noMargin>
        {game.gameName}
      </Text>
    </ColumnStackLayout>
  );

  const renderThumbnail = () => (
    <GameThumbnail
      gameName={game.gameName}
      gameId={game.id}
      thumbnailUrl={gameThumbnailUrl}
      background="light"
    />
  );

  const renderButtons = () => (
    <LineStackLayout noMargin>
      <FlatButton
        primary
        fullWidth
        label={<Trans>Manage game</Trans>}
        onClick={() => onOpenGameManager('details')}
      />
    </LineStackLayout>
  );

  const renderShareUrl = (i18n: I18nType) =>
    gameUrl ? <GameLinkAndShareIcons url={gameUrl} display="line" /> : null;

  return (
    <I18n>
      {({ i18n }) => (
        <Card
          key={game.id}
          background={'medium'}
          isHighlighted={isCurrentGame}
          padding={isMobile ? 8 : 16}
        >
          {isMobile ? (
            <ColumnStackLayout>
              {renderTitle(i18n)}
              <LineStackLayout>
                {renderThumbnail()}
                {renderPublicInfo()}
              </LineStackLayout>
              {renderShareUrl(i18n)}
              {renderButtons()}
            </ColumnStackLayout>
          ) : (
            <LineStackLayout noMargin>
              {renderThumbnail()}
              <ColumnStackLayout
                expand
                justifyContent="space-between"
                noOverflowParent
              >
                <LineStackLayout
                  noMargin
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  {renderTitle(i18n)}
                  {renderButtons()}
                </LineStackLayout>
                {renderPublicInfo()}
                {renderShareUrl(i18n)}
              </ColumnStackLayout>
            </LineStackLayout>
          )}
        </Card>
      )}
    </I18n>
  );
};
