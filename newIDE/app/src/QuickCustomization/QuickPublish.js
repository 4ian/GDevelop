// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import ExportLauncher from '../ExportAndShare/ShareDialog/ExportLauncher';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import { I18n } from '@lingui/react';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import Text from '../UI/Text';
import { type GameAndBuildsManager } from '../Utils/UseGameAndBuildsManager';
import FlatButton from '../UI/FlatButton';
import { Spacer } from '../UI/Grid';
import TextButton from '../UI/TextButton';
import classes from './QuickPublish.module.css';
import classNames from 'classnames';

type Props = {|
  project: gdProject,
  gameAndBuildsManager: GameAndBuildsManager,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  shouldAutomaticallyStartExport: boolean,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  onClose: () => void,
  onContinueQuickCustomization: () => void,
  onTryAnotherGame: () => void,
|};

export const QuickPublish = ({
  project,
  gameAndBuildsManager,
  setIsNavigationDisabled,
  shouldAutomaticallyStartExport,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
  onClose,
  onContinueQuickCustomization,
  onTryAnotherGame,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, onOpenCreateAccountDialog } = authenticatedUser;
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
      if (profile && shouldAutomaticallyStartExport) {
        launchExport();
      }
    },
    [profile, shouldAutomaticallyStartExport, launchExport]
  );

  return (
    <ColumnStackLayout noMargin expand alignItems="center">
      <Spacer />
      <img
        alt="Publish your game with GDevelop"
        src="res/quick_publish.svg"
        className={classNames({
          [classes.illustrationImage]: true,
          [classes.animatedRocket]: exportState === 'started',
        })}
      />
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
                eventsFunctionsExtensionsState={eventsFunctionsExtensionsState}
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
                <ColumnStackLayout noMargin>
                  <Text size="body" align="center">
                    <Trans>Congratulations! Your game is now published.</Trans>
                  </Text>
                  <RaisedButton
                    primary
                    label={<Trans>Continue tweaking the game</Trans>}
                    onClick={onContinueQuickCustomization}
                  />
                  <FlatButton
                    label={<Trans>Edit the full game</Trans>}
                    onClick={onClose}
                  />
                  <Text size="body2" color="secondary" align="center">
                    <Trans>or</Trans>
                  </Text>
                  <FlatButton
                    label={<Trans>Try with another game</Trans>}
                    onClick={onTryAnotherGame}
                  />
                </ColumnStackLayout>
              ) : !shouldAutomaticallyStartExport && exportState === '' ? (
                <ColumnStackLayout>
                  <FlatButton
                    label={<Trans>Go back and tweak the game</Trans>}
                    onClick={onContinueQuickCustomization}
                  />
                  <Text size="body2" color="secondary" align="center">
                    <Trans>or</Trans>
                  </Text>
                  <FlatButton
                    label={<Trans>Edit the full game</Trans>}
                    onClick={onClose}
                  />
                </ColumnStackLayout>
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
                  <FlatButton
                    label={<Trans>Edit the full game</Trans>}
                    onClick={onClose}
                  />
                </ColumnStackLayout>
              ) : null}
            </ColumnStackLayout>
          )}
        </I18n>
      ) : (
        <ColumnStackLayout noMargin>
          <Text size="body" align="center">
            <Trans>
              Create a GDevelop account to share your game in a few seconds.
            </Trans>
          </Text>
          <RaisedButton
            primary
            label={<Trans>Create an account</Trans>}
            onClick={onOpenCreateAccountDialog}
            keyboardFocused
          />
          <TextButton
            label={<Trans>Skip and edit the full game</Trans>}
            onClick={onClose}
          />
        </ColumnStackLayout>
      )}
    </ColumnStackLayout>
  );
};
