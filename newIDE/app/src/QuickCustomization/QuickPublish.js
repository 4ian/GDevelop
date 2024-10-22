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
import { type Limits } from '../Utils/GDevelopServices/Usage';
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
import { getGameUrl } from '../Utils/GDevelopServices/Game';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { MaxProjectCountAlertMessage } from '../MainFrame/EditorContainers/HomePage/BuildSection/MaxProjectCountAlertMessage';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import ArrowLeft from '../UI/CustomSvgIcons/ArrowLeft';

const styles = { imageContainer: { maxWidth: 400 } };

type Props = {|
  project: gdProject,
  gameAndBuildsManager: GameAndBuildsManager,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  onClose: () => Promise<void>,
  onContinueQuickCustomization: () => void,
  onTryAnotherGame: () => void,
|};

export const QuickPublish = ({
  project,
  gameAndBuildsManager,
  setIsNavigationDisabled,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
  onClose,
  onContinueQuickCustomization,
  onTryAnotherGame,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const {
    profile,
    onOpenCreateAccountDialog,
    limits,
    cloudProjects,
  } = authenticatedUser;
  const { game } = gameAndBuildsManager;
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const [
    numberOfCloudProjectsBeforeSavingCustomizedGame,
    setNumberOfCloudProjectsBeforeSavingCustomizedGame,
  ] = React.useState<number | null>(null);
  const [exportState, setExportState] = React.useState<
    '' | 'started' | 'succeeded' | 'errored'
  >('');
  const exportLauncherRef = React.useRef<?ExportLauncher>(null);

  const launchExport = React.useCallback(() => {
    if (!exportLauncherRef.current) return;

    exportLauncherRef.current.launchWholeExport({
      payWithCredits: false,
    });
  }, []);

  const renderCallout = (limits: Limits) => (
    <MaxProjectCountAlertMessage
      limits={limits}
      onUpgrade={() =>
        openSubscriptionDialog({
          analyticsMetadata: {
            reason: 'Cloud Project limit reached',
          },
        })
      }
    />
  );

  React.useEffect(
    () => {
      if (!cloudProjects) {
        setNumberOfCloudProjectsBeforeSavingCustomizedGame(null);
      } else if (numberOfCloudProjectsBeforeSavingCustomizedGame === null) {
        setNumberOfCloudProjectsBeforeSavingCustomizedGame(
          cloudProjects.filter(cloudProject => !cloudProject.deletedAt).length
        );
      }
    },
    // Store the number of cloud projects **before** the user saved this quick-customized
    // game. Otherwise, they might reach the max number saving it, and the callout would
    // be displayed instead of the game link.
    [cloudProjects, numberOfCloudProjectsBeforeSavingCustomizedGame]
  );

  const isLoadingCloudProjects = !!profile && !cloudProjects;
  const isCloudProjectsMaximumReached =
    !!limits &&
    !!cloudProjects &&
    limits.capabilities.cloudProjects.maximumCount > 0 &&
    numberOfCloudProjectsBeforeSavingCustomizedGame !== null &&
    numberOfCloudProjectsBeforeSavingCustomizedGame >=
      limits.capabilities.cloudProjects.maximumCount;
  const shouldSaveAndLaunchExport =
    !!profile &&
    exportState === '' &&
    !isCloudProjectsMaximumReached &&
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

  const gameUrl = game ? getGameUrl(game) : '';
  const hasNotSavedProject = !profile && exportState === '';

  return (
    <ColumnStackLayout
      noMargin
      expand
      alignItems="center"
      justifyContent="space-between"
    >
      <ColumnStackLayout alignItems="center">
        <div style={styles.imageContainer}>
          <GameImage project={project} />
        </div>
        <Spacer />
        {profile ? (
          isLoadingCloudProjects ? (
            <PlaceholderLoader />
          ) : isCloudProjectsMaximumReached && limits ? (
            renderCallout(limits)
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
                    onExportSucceeded={() => {
                      setExportState('succeeded');
                    }}
                  />
                  {exportState === 'succeeded' ? (
                    <Paper background="light">
                      <div
                        className={classNames({
                          [classes.paperContainer]: true,
                        })}
                      >
                        <ColumnStackLayout>
                          <Text size="body" align="center">
                            <Trans>Share your game with your friends!</Trans>
                          </Text>
                          {gameUrl && <ShareLink url={gameUrl} />}
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

      {exportState !== 'started' && !isLoadingCloudProjects && (
        <ColumnStackLayout justifyContent="center" alignItems="center">
          <TextButton
            secondary
            onClick={onClose}
            label={
              hasNotSavedProject || isCloudProjectsMaximumReached ? (
                <Trans>Leave and lose all changes</Trans>
              ) : (
                <Trans>Finish and close</Trans>
              )
            }
            icon={
              hasNotSavedProject || isCloudProjectsMaximumReached ? (
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
