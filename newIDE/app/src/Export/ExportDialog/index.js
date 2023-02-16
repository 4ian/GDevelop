// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from '../../UI/FlatButton';
import BuildsDialog from '../Builds/BuildsDialog';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import ExportLauncher from './ExportLauncher';
import { type ExportPipeline } from '../ExportPipeline.flow';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import AlertMessage from '../../UI/AlertMessage';
import { Tabs } from '../../UI/Tabs';
import ExportHome from './ExportHome';
import { getGame, type Game } from '../../Utils/GDevelopServices/Game';
import { showWarningBox } from '../../UI/Messages/MessageBox';
import TutorialButton from '../../UI/TutorialButton';

export type ExporterSection = 'automated' | 'manual' | 'home';
export type ExporterKey =
  | 'onlinewebexport'
  | 'onlineelectronexport'
  | 'onlinecordovaexport'
  | 'webexport'
  | 'facebookinstantgamesexport'
  | 'electronexport'
  | 'cordovaexport';

export type Exporter = {|
  name: React.Node,
  tabName: React.Node,
  helpPage: string,
  disabled?: boolean,
  key: ExporterKey,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
|};

export type ExportDialogWithoutExportsProps = {|
  project: ?gdProject,
  onSaveProject: () => Promise<void>,
  onClose: () => void,
  onChangeSubscription: () => void,
|};

type Props = {|
  ...ExportDialogWithoutExportsProps,
  /**
   * Use `null` to hide automated exporters.
   * It should be used with manualExporters set to `null` as well.
   */
  automatedExporters: ?Array<Exporter>,
  /**
   * Use `null` to hide manual exporters.
   * It should be used with automatedExporters set to `null` as well.
   */
  manualExporters: ?Array<Exporter>,
  onlineWebExporter: Exporter,
  allExportersRequireOnline?: boolean,
|};

const ExportDialog = ({
  project,
  onSaveProject,
  onClose,
  allExportersRequireOnline,
  onChangeSubscription,
  automatedExporters,
  manualExporters,
  onlineWebExporter,
}: Props) => {
  const [
    chosenExporterSection,
    setChosenExporterSection,
  ] = React.useState<ExporterSection>('home');
  const [buildsDialogOpen, setBuildsDialogOpen] = React.useState<boolean>(
    false
  );
  const [
    isNavigationDisabled,
    setIsNavigationDisabled,
  ] = React.useState<boolean>(false);
  const [chosenExporterKey, setChosenExporterKey] = React.useState<ExporterKey>(
    'onlinewebexport'
  );
  const [game, setGame] = React.useState<?Game>(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const onlineStatus = useOnlineStatus();
  const cantExportBecauseOffline = !!allExportersRequireOnline && !onlineStatus;

  const openBuildDialog = () => {
    if (!game) {
      showWarningBox(
        "Either this game is not registered or you are not its owner, so you can't see the builds or publish a build to the game page on gd.games."
      );
      return;
    }
    setBuildsDialogOpen(true);
  };

  const loadGame = React.useCallback(
    async () => {
      if (!profile || !project) return;

      const { id } = profile;
      try {
        const game = await getGame(
          getAuthorizationHeader,
          id,
          project.getProjectUuid()
        );
        setGame(game);
      } catch (err) {
        console.error('Unable to load the game', err);
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

  if (!project) return null;
  const exporters = [
    ...(automatedExporters || []),
    ...(manualExporters || []),
    onlineWebExporter,
  ];

  const exporter = exporters.find(
    exporter => exporter.key === chosenExporterKey
  );

  if (!exporter || !exporter.exportPipeline) return null;

  const shouldShowOnlineWebExporterOnly =
    !manualExporters && !automatedExporters;

  return (
    <Dialog
      id="export-dialog"
      maxWidth={shouldShowOnlineWebExporterOnly ? 'sm' : 'md'}
      title={
        chosenExporterSection === 'automated' ? (
          <Trans>Publish your game</Trans>
        ) : chosenExporterSection === 'manual' ? (
          <Trans>Build manually</Trans>
        ) : null
      }
      actions={[
        chosenExporterSection !== 'home' && (
          <FlatButton
            label={<Trans>Back</Trans>}
            key="back"
            primary={false}
            onClick={() => {
              setChosenExporterSection('home');
              setChosenExporterKey('onlinewebexport');
            }}
            disabled={isNavigationDisabled}
          />
        ),
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
          disabled={isNavigationDisabled}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={exporter.helpPage} />,
        exporter.exportPipeline.name === 'local-html5' ||
        exporter.exportPipeline.name === 'browser-html5' ? (
          <TutorialButton
            key="tutorial"
            tutorialId="export-to-itch"
            label={<Trans>How to export to Itch.io"</Trans>}
          />
        ) : null,
        <FlatButton
          key="builds"
          label={<Trans>See this game builds</Trans>}
          onClick={openBuildDialog}
          disabled={isNavigationDisabled}
        />,
      ]}
      onRequestClose={onClose}
      open
      fixedContent={
        automatedExporters && manualExporters ? (
          chosenExporterSection === 'automated' ? (
            <Tabs
              value={chosenExporterKey}
              onChange={setChosenExporterKey}
              options={automatedExporters.map(exporter => ({
                value: exporter.key,
                label: exporter.tabName,
                disabled: isNavigationDisabled,
              }))}
            />
          ) : chosenExporterSection === 'manual' ? (
            <Tabs
              value={chosenExporterKey}
              onChange={setChosenExporterKey}
              options={manualExporters.map(exporter => ({
                value: exporter.key,
                label: exporter.tabName,
                disabled: isNavigationDisabled,
              }))}
            />
          ) : null
        ) : null
      }
    >
      {cantExportBecauseOffline ? (
        <AlertMessage kind="error">
          <Trans>
            You must be online and have a proper internet connection to export
            your game.
          </Trans>
        </AlertMessage>
      ) : chosenExporterSection === 'home' ? (
        <ExportHome
          onlineWebExporter={onlineWebExporter}
          setChosenExporterKey={setChosenExporterKey}
          setChosenExporterSection={setChosenExporterSection}
          project={project}
          onSaveProject={onSaveProject}
          onChangeSubscription={onChangeSubscription}
          authenticatedUser={authenticatedUser}
          isNavigationDisabled={isNavigationDisabled}
          setIsNavigationDisabled={setIsNavigationDisabled}
          onGameUpdated={setGame}
          showOnlineWebExporterOnly={shouldShowOnlineWebExporterOnly}
        />
      ) : (
        <ExportLauncher
          exportPipeline={exporter.exportPipeline}
          project={project}
          onSaveProject={onSaveProject}
          onChangeSubscription={onChangeSubscription}
          authenticatedUser={authenticatedUser}
          key={chosenExporterKey}
          setIsNavigationDisabled={setIsNavigationDisabled}
          onGameUpdated={setGame}
        />
      )}
      {game && (
        <BuildsDialog
          open={buildsDialogOpen}
          onClose={() => setBuildsDialogOpen(false)}
          authenticatedUser={authenticatedUser}
          game={game}
          onGameUpdated={setGame}
        />
      )}
    </Dialog>
  );
};

export default ExportDialog;
