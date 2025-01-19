// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import ExportLauncher from '../ExportAndShare/ShareDialog/ExportLauncher';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import { I18n } from '@lingui/react';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import Text from '../UI/Text';
import {
  getBuildArtifactUrl,
  type Build,
} from '../Utils/GDevelopServices/Build';
import { type GameAndBuildsManager } from '../Utils/UseGameAndBuildsManager';
import FlatButton from '../UI/FlatButton';
import { Column, Spacer } from '../UI/Grid';
import classes from './QuickPublish.module.css';
import classNames from 'classnames';
import Paper from '../UI/Paper';
import Google from '../UI/CustomSvgIcons/Google';
import GitHub from '../UI/CustomSvgIcons/GitHub';
import Apple from '../UI/CustomSvgIcons/Apple';
import TextButton from '../UI/TextButton';
import Trash from '../UI/CustomSvgIcons/Trash';
import GameImage from './GameImage';
import ShareLink from '../UI/ShareDialog/ShareLink';
import { getGameUrl, updateGame } from '../Utils/GDevelopServices/Game';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from '../MainFrame/EditorContainers/HomePage/CreateSection/MaxProjectCountAlertMessage';
import ArrowLeft from '../UI/CustomSvgIcons/ArrowLeft';

type Props = {|
  project: gdProject,
  gameAndBuildsManager: GameAndBuildsManager,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  isRequiredToSaveAsNewCloudProject: () => boolean,
  onClose: () => Promise<void>,
  onContinueQuickCustomization: () => void,
  gameScreenshotUrls: Array<string>,
  onScreenshotsClaimed: () => void,
  onLaunchPreview: () => Promise<void>,
|};

export const QuickPublish = ({
  project,
  gameAndBuildsManager,
  setIsNavigationDisabled,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
  isRequiredToSaveAsNewCloudProject,
  onClose,
  onContinueQuickCustomization,
  gameScreenshotUrls,
  onScreenshotsClaimed,
  onLaunchPreview,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenCreateAccountDialog,
    cloudProjects,
    getAuthorizationHeader,
  } = authenticatedUser;
  const { game, setGame } = gameAndBuildsManager;
  const [buildOrGameUrl, setBuildOrGameUrl] = React.useState('');
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const [exportState, setExportState] = React.useState<
    '' | 'started' | 'updating-game' | 'succeeded' | 'errored'
  >('');
  const exportLauncherRef = React.useRef<?ExportLauncher>(null);

  const launchExport = React.useCallback(() => {
    if (!exportLauncherRef.current) return;

    exportLauncherRef.current.launchWholeExport({
      payWithCredits: false,
    });
  }, []);

  const isLoadingCloudProjects = !!profile && !cloudProjects;
  const isCloudProjectsMaximumReached = checkIfHasTooManyCloudProjects(
    authenticatedUser
  );
  const cantContinueBecauseCloudProjectsMaximumReached =
    isRequiredToSaveAsNewCloudProject() && isCloudProjectsMaximumReached;

  const shouldSaveAndLaunchExport =
    !!profile &&
    exportState === '' &&
    !cantContinueBecauseCloudProjectsMaximumReached &&
    !isLoadingCloudProjects;

  React.useEffect(
    () => {
      if (shouldSaveAndLaunchExport) {
        // Save project & launch export as soon as the user is authenticated (or if they already were)
        onSaveProject();
        launchExport();
      }
    },
    [launchExport, onSaveProject, shouldSaveAndLaunchExport]
  );

  const onExportSucceeded = React.useCallback(
    async ({ build }: {| build: ?Build |}) => {
      try {
        if (profile && game && build) {
          setExportState('updating-game');
          const currentGameScreenshotUrls = game.screenshotUrls || [];
          const newGameScreenshotUrls = [
            ...currentGameScreenshotUrls,
            ...gameScreenshotUrls,
          ];
          const updatedGame = await updateGame(
            getAuthorizationHeader,
            profile.id,
            game.id,
            {
              publicWebBuildId: build.id,
              screenshotUrls: newGameScreenshotUrls,
              // Here we assume the game is saved, as it just got exported properly,
              // And the same is happening in the background.
              savedStatus: 'saved',
            }
          );
          setGame(updatedGame);
          onScreenshotsClaimed();
        }

        setBuildOrGameUrl(
          game
            ? getGameUrl(game)
            : build
            ? getBuildArtifactUrl(build, 's3Key')
            : ''
        );
        setExportState('succeeded');
      } catch (err) {
        console.error('Unable to update the game', err);
        setExportState('errored');
      }
    },
    [
      setExportState,
      setGame,
      game,
      profile,
      getAuthorizationHeader,
      gameScreenshotUrls,
      onScreenshotsClaimed,
    ]
  );

  const hasNotSavedProject = !profile && exportState === '';

  return (
    <ColumnStackLayout
      noMargin
      expand
      alignItems="center"
      justifyContent="space-between"
    >
      <ColumnStackLayout alignItems="center">
        <GameImage
          project={project}
          previewScreenshotUrls={gameScreenshotUrls}
          game={game}
          onLaunchPreview={onLaunchPreview}
          // Prevent the user from launching the preview while or after exporting
          disabled={exportState !== ''}
        />
        <Spacer />
        {profile ? (
          isLoadingCloudProjects ? (
            <PlaceholderLoader />
          ) : cantContinueBecauseCloudProjectsMaximumReached ? (
            <MaxProjectCountAlertMessage />
          ) : (
            <I18n>
              {({ i18n }) => (
                <ColumnStackLayout noMargin expand alignItems="stretch">
                  <ExportLauncher
                    ref={exportLauncherRef}
                    i18n={i18n}
                    project={project}
                    onSaveProject={onSaveProject}
                    isSavingProject={isSavingProject}
                    onChangeSubscription={() => {
                      // Nothing to do.
                    }}
                    authenticatedUser={authenticatedUser}
                    eventsFunctionsExtensionsState={
                      eventsFunctionsExtensionsState
                    }
                    exportPipeline={onlineWebExporter.exportPipeline}
                    setIsNavigationDisabled={setIsNavigationDisabled}
                    gameAndBuildsManager={gameAndBuildsManager}
                    uiMode="minimal"
                    onExportLaunched={() => {
                      setExportState('started');
                    }}
                    onExportErrored={() => {
                      setExportState('errored');
                    }}
                    onExportSucceeded={onExportSucceeded}
                  />
                  {exportState === 'succeeded' ? (
                    <Paper background="medium" variant="outlined">
                      <div
                        className={classNames({
                          [classes.paperContainer]: true,
                        })}
                      >
                        <ColumnStackLayout>
                          <Text size="body" align="center">
                            <Trans>
                              Share your game with your friends or teammates.
                            </Trans>
                          </Text>
                          {buildOrGameUrl && <ShareLink url={buildOrGameUrl} />}
                        </ColumnStackLayout>
                      </div>
                    </Paper>
                  ) : exportState === 'errored' ? (
                    <ColumnStackLayout noMargin>
                      <Text size="body" align="center">
                        <Trans>
                          An error occurred while exporting your game. Verify
                          your internet connection and try again.
                        </Trans>
                      </Text>
                      <RaisedButton
                        primary
                        label={<Trans>Try again</Trans>}
                        onClick={launchExport}
                      />
                    </ColumnStackLayout>
                  ) : exportState === 'updating-game' ? (
                    <PlaceholderLoader />
                  ) : null}
                </ColumnStackLayout>
              )}
            </I18n>
          )
        ) : (
          <Column noMargin>
            <Paper background="light">
              <div
                className={classNames({
                  [classes.paperContainer]: true,
                })}
              >
                <ColumnStackLayout>
                  <Text size="body" align="center">
                    <Trans>
                      Create a GDevelop account to save your changes and keep
                      personalizing your game
                    </Trans>
                  </Text>
                  <ResponsiveLineStackLayout
                    expand
                    justifyContent="center"
                    alignItems="center"
                    noMargin
                  >
                    <RaisedButton
                      primary
                      icon={<Google />}
                      label={<Trans>Google</Trans>}
                      onClick={onOpenCreateAccountDialog}
                      fullWidth
                    />
                    <RaisedButton
                      primary
                      icon={<GitHub />}
                      label={<Trans>Github</Trans>}
                      onClick={onOpenCreateAccountDialog}
                      fullWidth
                    />
                    <RaisedButton
                      primary
                      icon={<Apple />}
                      label={<Trans>Apple</Trans>}
                      onClick={onOpenCreateAccountDialog}
                      fullWidth
                    />
                  </ResponsiveLineStackLayout>
                  <FlatButton
                    primary
                    label={<Trans>Use your email</Trans>}
                    onClick={onOpenCreateAccountDialog}
                  />
                </ColumnStackLayout>
              </div>
            </Paper>
          </Column>
        )}
      </ColumnStackLayout>

      {exportState !== 'started' &&
        exportState !== 'updating-game' &&
        !isLoadingCloudProjects && (
          <ColumnStackLayout justifyContent="center" alignItems="center">
            <TextButton
              secondary
              onClick={onClose}
              label={
                hasNotSavedProject ||
                cantContinueBecauseCloudProjectsMaximumReached ? (
                  <Trans>Leave and lose all changes</Trans>
                ) : (
                  <Trans>Finish and close</Trans>
                )
              }
              icon={
                hasNotSavedProject ||
                cantContinueBecauseCloudProjectsMaximumReached ? (
                  <Trash />
                ) : null
              }
            />
            <TextButton
              secondary
              onClick={onContinueQuickCustomization}
              label={<Trans>Rework the game</Trans>}
              icon={<ArrowLeft />}
            />
          </ColumnStackLayout>
        )}
    </ColumnStackLayout>
  );
};
