// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../ProjectsStorage';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { GameThumbnail } from './GameThumbnail';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  getGameMainImageUrl,
  getGameUrl,
  type Game,
} from '../Utils/GDevelopServices/Game';
import Card from '../UI/Card';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import DollarCoin from '../UI/CustomSvgIcons/DollarCoin';
import Cross from '../UI/CustomSvgIcons/Cross';
import Messages from '../UI/CustomSvgIcons/Messages';
import GameLinkAndShareIcons from './GameLinkAndShareIcons';
import {
  getStorageProviderByInternalName,
  useProjectsListFor,
} from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import FlatButtonWithSplitMenu from '../UI/FlatButtonWithSplitMenu';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';

const styles = {
  buttonsContainer: { display: 'flex', flexShrink: 0 },
  iconAndText: { display: 'flex', gap: 2, alignItems: 'flex-start' },
};

type Props = {|
  game: Game,
  isCurrentProjectOpened: boolean,
  onOpenGameManager: () => void,
  storageProviders: Array<StorageProvider>,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onUnregisterGame: () => Promise<void>,
  askToCloseProject: () => Promise<boolean>,
  onSaveProject: () => Promise<void>,
  disabled: boolean,
  canSaveProject: boolean,
|};

export const GameCard = ({
  game,
  isCurrentProjectOpened,
  onOpenGameManager,
  storageProviders,
  onOpenProject,
  onUnregisterGame,
  askToCloseProject,
  onSaveProject,
  disabled,
  canSaveProject,
}: Props) => {
  useOnResize(useForceUpdate());
  const projectsList = useProjectsListFor(game);
  const isPublishedOnGdGames = !!game.publicWebBuildId;
  const gameUrl = isPublishedOnGdGames ? getGameUrl(game) : null;

  const gameThumbnailUrl = React.useMemo(() => getGameMainImageUrl(game), [
    game,
  ]);

  const { isMobile, windowSize } = useResponsiveWindowSize();
  const isWidthConstrained = windowSize === 'small' || windowSize === 'medium';
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
      <LineStackLayout noMargin>
        <Text color="secondary" noMargin>
          <Trans>Last edited:</Trans>
        </Text>
        <Text color="secondary" noMargin>
          {i18n.date(game.updatedAt * 1000)}
        </Text>
      </LineStackLayout>
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
      width={
        isMobile
          ? undefined
          : // On medium/large screens, adapt the size to the width of the window.
            Math.min(272, Math.max(130, window.innerWidth / 5))
      }
    />
  );

  const buildContextMenu = (
    i18n: I18nType,
    projectsList: FileMetadataAndStorageProviderName[]
  ): Array<MenuItemTemplate> => {
    const actions =
      projectsList.length > 1
        ? [
            ...projectsList.map(fileMetadataAndStorageProviderName => {
              const name =
                fileMetadataAndStorageProviderName.fileMetadata.name || '-';
              const storageProvider = getStorageProviderByInternalName(
                storageProviders,
                fileMetadataAndStorageProviderName.storageProviderName
              );
              return {
                label: i18n._(
                  t`${name} (${
                    storageProvider ? i18n._(storageProvider.name) : '-'
                  })`
                ),
                click: () => onOpenProject(fileMetadataAndStorageProviderName),
              };
            }),
            { type: 'separator' },
            {
              label: i18n._(t`See all in the game dashboard`),
              click: onOpenGameManager,
            },
          ]
        : [];

    if (isCurrentProjectOpened) {
      if (actions.length > 0) {
        actions.push({ type: 'separator' });
      }
      actions.push({
        label: i18n._(t`Close project`),
        click: async () => {
          await askToCloseProject();
        },
      });
    } else {
      if (actions.length > 0) {
        actions.push({ type: 'separator' });
      }
      actions.push({
        label: i18n._(t`Unregister game`),
        click: async () => {
          await onUnregisterGame();
        },
      });
    }

    return actions;
  };

  const renderButtons = ({ fullWidth }: { fullWidth: boolean }) => {
    return (
      <div styles={styles.buttonsContainer}>
        <LineStackLayout noMargin>
          <FlatButton
            primary
            fullWidth={fullWidth}
            label={
              isWidthConstrained ? (
                <Trans>Manage</Trans>
              ) : (
                <Trans>Manage game</Trans>
              )
            }
            onClick={onOpenGameManager}
            disabled={disabled}
          />
          {projectsList.length === 0 ? (
            isCurrentProjectOpened ? (
              <FlatButtonWithSplitMenu
                primary
                fullWidth={fullWidth}
                label={
                  isWidthConstrained ? (
                    <Trans>Save</Trans>
                  ) : (
                    <Trans>Save project</Trans>
                  )
                }
                onClick={onSaveProject}
                buildMenuTemplate={i18n => buildContextMenu(i18n, projectsList)}
                disabled={disabled || !canSaveProject}
              />
            ) : null
          ) : (
            <FlatButtonWithSplitMenu
              primary
              fullWidth={fullWidth}
              label={
                isCurrentProjectOpened ? (
                  <Trans>Opened</Trans>
                ) : isWidthConstrained ? (
                  <Trans>Open</Trans>
                ) : (
                  <Trans>Open project</Trans>
                )
              }
              onClick={
                isCurrentProjectOpened
                  ? undefined
                  : () => onOpenProject(projectsList[0])
              }
              buildMenuTemplate={i18n => buildContextMenu(i18n, projectsList)}
              disabled={disabled}
            />
          )}
        </LineStackLayout>
      </div>
    );
  };

  const renderShareUrl = (i18n: I18nType) =>
    gameUrl ? <GameLinkAndShareIcons url={gameUrl} display="line" /> : null;

  return (
    <I18n>
      {({ i18n }) => (
        <Card
          key={game.id}
          background={'medium'}
          isHighlighted={isCurrentProjectOpened}
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
              {renderButtons({ fullWidth: true })}
            </ColumnStackLayout>
          ) : (
            <LineStackLayout noMargin>
              {renderThumbnail()}
              <ColumnStackLayout
                expand
                justifyContent="space-between"
                noOverflowParent
              >
                <ColumnStackLayout noMargin>
                  <LineStackLayout
                    noMargin
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    {renderTitle(i18n)}
                    {renderButtons({ fullWidth: false })}
                  </LineStackLayout>
                  {renderPublicInfo()}
                </ColumnStackLayout>
                {renderShareUrl(i18n)}
              </ColumnStackLayout>
            </LineStackLayout>
          )}
        </Card>
      )}
    </I18n>
  );
};
