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
import { type GameAndBuildsManager } from '../Utils/UseGameAndBuildsManager';
import FlatButton from '../UI/FlatButton';
import { Column, Line, Spacer } from '../UI/Grid';
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
  const { profile, onOpenCreateAccountDialog } = authenticatedUser;
  const { game } = gameAndBuildsManager;
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
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

  React.useEffect(
    () => {
      if (profile && exportState === '') {
        // Save project & launch export as soon as the user is authenticated (or if they already were)
        onSaveProject();
        launchExport();
      }
    },
    [profile, launchExport, onSaveProject, exportState]
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
      <ColumnStackLayout>
        <GameImage project={project} />
        <Spacer />
        {profile ? (
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
                        An error occurred while exporting your game. Verify your
                        internet connection and try again.
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

      {exportState !== 'started' && (
        <Line justifyContent="center" alignItems="center">
          <TextButton
            secondary
            onClick={onClose}
            label={
              hasNotSavedProject ? (
                <Trans>Leave and lose all changes</Trans>
              ) : (
                <Trans>Finish and close</Trans>
              )
            }
            icon={hasNotSavedProject ? <Trash /> : null}
          />
        </Line>
      )}
    </ColumnStackLayout>
  );
};
