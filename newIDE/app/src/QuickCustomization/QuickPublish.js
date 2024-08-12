// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import ExportLauncher from '../ExportAndShare/ShareDialog/ExportLauncher';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { getGame, type Game } from '../Utils/GDevelopServices/Game';
import { type GameAvailabilityError } from '../GameDashboard/GameRegistration';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { getBuilds, type Build } from '../Utils/GDevelopServices/Build';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import { I18n } from '@lingui/react';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import Text from '../UI/Text';

const styles = {
  illustrationImage: {
    width: 100,
    aspectRatio: '117 / 162',
  },
};

type Props = {|
  project: gdProject,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  shouldAutomaticallyStartExport: boolean,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
|};

export const QuickPublish = ({
  project,
  setIsNavigationDisabled,
  shouldAutomaticallyStartExport,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    getAuthorizationHeader,
    onOpenCreateAccountDialog,
  } = authenticatedUser;
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  // TODO: factor for builds? And move in QuickCustomization.
  const [builds, setBuilds] = React.useState<?Array<Build>>(null);
  const { showAlert } = useAlertDialog();
  const refreshBuilds = React.useCallback(
    async () => {
      if (!profile) return;

      try {
        const userBuilds = await getBuilds(getAuthorizationHeader, profile.id);
        setBuilds(userBuilds);
      } catch (error) {
        console.error('Error while loading builds:', error);
        showAlert({
          title: t`Error while loading builds`,
          message: t`An error occurred while loading your builds. Verify your internet connection and try again.`,
        });
      }
    },
    [profile, getAuthorizationHeader, showAlert]
  );

  React.useEffect(
    () => {
      refreshBuilds();
    },
    [refreshBuilds]
  );

  const [game, setGame] = React.useState<?Game>(null);
  const [
    gameAvailabilityError,
    setGameAvailabilityError,
  ] = React.useState<?GameAvailabilityError>(null);

  // TODO: factor for games with ShareDialog? And move in QuickCustomization.
  const loadGame = React.useCallback(
    async () => {
      if (!profile || !project) return;

      const { id } = profile;
      try {
        setGameAvailabilityError(null);
        const game = await getGame(
          getAuthorizationHeader,
          id,
          project.getProjectUuid()
        );
        setGame(game);
      } catch (error) {
        console.error('Unable to load the game', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
          setGameAvailabilityError('not-found');
          return;
        }
        if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
          setGameAvailabilityError('not-owned');
          return;
        }
        setGameAvailabilityError('unexpected');
      }
    },
    [project, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      // Load game only once.
      if (!game) {
        loadGame();
      }
    },
    [loadGame, game]
  );

  return (
    <ColumnStackLayout noMargin expand alignItems="center">
      <img
        alt="Publish your game with GDevelop"
        src="res/quick_publish.svg"
        style={styles.illustrationImage}
      />
      {profile ? (
        <I18n>
          {({ i18n }) => (
            <ExportLauncher
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
              onRefreshGame={loadGame}
              game={game}
              gameAvailabilityError={gameAvailabilityError}
              builds={builds}
              onRefreshBuilds={refreshBuilds}
              shouldAutomaticallyStartExport={shouldAutomaticallyStartExport}
              uiMode="minimal"
            />
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
        </ColumnStackLayout>
      )}
    </ColumnStackLayout>
  );
};
