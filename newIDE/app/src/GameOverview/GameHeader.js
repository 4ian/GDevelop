// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type Game } from '../Utils/GDevelopServices/Game';
import { GameThumbnail } from '../GameDashboard/GameThumbnail';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import Text from '../UI/Text';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Cross from '../UI/CustomSvgIcons/Cross';
import DollarCoin from '../UI/CustomSvgIcons/DollarCoin';
import Messages from '../UI/CustomSvgIcons/Messages';
import RaisedButton from '../UI/RaisedButton';
import Edit from '../UI/CustomSvgIcons/Edit';
import GameLinkAndShareIcons from './GameLinkAndShareIcons';
import { CompactToggleField } from '../UI/CompactToggleField';

const styles = {
  iconAndText: { display: 'flex', gap: 2, alignItems: 'flex-start' },
};

type Props = {|
  game: Game,
  onEditGame: () => void,
  gameUrl: ?string,
  onPublishOnGdGames: ?() => void,
|};

const GameHeader = ({
  game,
  onEditGame,
  gameUrl,
  onPublishOnGdGames,
}: Props) => {
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
              <Trans>Advertisement on</Trans>
            ) : (
              <Trans>Advertisement off</Trans>
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
      thumbnailUrl={game.thumbnailUrl}
      background="medium"
    />
  );

  const renderButtons = () => (
    <LineStackLayout noMargin>
      <RaisedButton
        primary
        label={<Trans>Edit details</Trans>}
        onClick={onEditGame}
        icon={<Edit fontSize="small" />}
      />
    </LineStackLayout>
  );

  const renderShareUrl = (i18n: I18nType) =>
    gameUrl ? (
      <GameLinkAndShareIcons url={gameUrl} display="line" />
    ) : onPublishOnGdGames ? (
      <ColumnStackLayout noMargin expand>
        <CompactToggleField
          checked={false}
          label={i18n._(t`Publish on gd.games`)}
          onCheck={onPublishOnGdGames}
        />
        <Text color="secondary" noMargin>
          <Trans>
            Your game is not published on gd.games. Publish it and get players
            to play your game!
          </Trans>
        </Text>
      </ColumnStackLayout>
    ) : (
      <ColumnStackLayout noMargin expand>
        <Text color="secondary" noMargin>
          <Trans>
            Publish your game to gd.games and see how many players enjoy your
            game!
          </Trans>
        </Text>
      </ColumnStackLayout>
    );

  if (isMobile) {
    return (
      <I18n>
        {({ i18n }) => (
          <ColumnStackLayout noMargin>
            {renderTitle(i18n)}
            <LineStackLayout>
              {renderThumbnail()}
              {renderPublicInfo()}
            </LineStackLayout>
            {renderShareUrl(i18n)}
            {renderButtons()}
          </ColumnStackLayout>
        )}
      </I18n>
    );
  }

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout>
          {renderThumbnail()}
          <ColumnStackLayout expand>
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
    </I18n>
  );
};

export default GameHeader;