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
import { Tab, Tabs } from '../../UI/Tabs';
import ExportHome from './ExportHome';

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
  content: { padding: 8 },
};

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
  experimental?: boolean,
  key: ExporterKey,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
|};

export type ExportDialogWithoutExportsProps = {|
  project: ?gdProject,
  onClose: () => void,
  onChangeSubscription: () => void,
|};

type Props = {|
  ...ExportDialogWithoutExportsProps,
  automatedExporters: Array<Exporter>,
  manualExporters: Array<Exporter>,
  onlineWebExporter: Exporter,
  allExportersRequireOnline?: boolean,
|};

const ExportDialog = ({
  project,
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
  const [chosenExporterKey, setChosenExporterKey] = React.useState<ExporterKey>(
    'onlinewebexport'
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const onlineStatus = useOnlineStatus();
  const cantExportBecauseOffline = !!allExportersRequireOnline && !onlineStatus;

  if (!project) return null;
  const exporters = [
    ...automatedExporters,
    ...manualExporters,
    onlineWebExporter,
  ];

  const exporter = exporters.find(
    exporter => exporter.key === chosenExporterKey
  );

  if (!exporter || !exporter.exportPipeline) return null;

  return (
    <Dialog
      title={
        chosenExporterSection === 'automated' ? (
          <Trans>Publish your game</Trans>
        ) : chosenExporterSection === 'manual' ? (
          <Trans>Build manually</Trans>
        ) : null
      }
      onRequestClose={onClose}
      cannotBeDismissed={false}
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
          />
        ),
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={exporter.helpPage} />,
        exporter.key !== 'onlinewebexport' && (
          <FlatButton
            key="builds"
            label={<Trans>See all my builds</Trans>}
            onClick={() => setBuildsDialogOpen(true)}
          />
        ),
      ]}
      open
      noMargin
    >
      {cantExportBecauseOffline && (
        <AlertMessage kind="error">
          <Trans>
            You must be online and have a proper internet connection to export
            your game.
          </Trans>
        </AlertMessage>
      )}
      {chosenExporterSection === 'home' && (
        <ExportHome
          cantExportBecauseOffline={cantExportBecauseOffline}
          onlineWebExporter={onlineWebExporter}
          setChosenExporterKey={setChosenExporterKey}
          setChosenExporterSection={setChosenExporterSection}
          project={project}
          onChangeSubscription={onChangeSubscription}
          authenticatedUser={authenticatedUser}
        />
      )}
      {chosenExporterSection === 'automated' && (
        <Tabs value={chosenExporterKey} onChange={setChosenExporterKey}>
          {automatedExporters.map(exporter => (
            <Tab
              label={exporter.tabName}
              value={exporter.key}
              key={exporter.key}
            />
          ))}
        </Tabs>
      )}
      {chosenExporterSection === 'manual' && (
        <Tabs value={chosenExporterKey} onChange={setChosenExporterKey}>
          {manualExporters.map(exporter => (
            <Tab
              label={exporter.tabName}
              value={exporter.key}
              key={exporter.key}
            />
          ))}
        </Tabs>
      )}
      {chosenExporterSection !== 'home' && (
        <div style={styles.content}>
          <ExportLauncher
            exportPipeline={exporter.exportPipeline}
            project={project}
            onChangeSubscription={onChangeSubscription}
            authenticatedUser={authenticatedUser}
            key={chosenExporterKey}
          />
        </div>
      )}
      <BuildsDialog
        open={buildsDialogOpen}
        onClose={() => setBuildsDialogOpen(false)}
        authenticatedUser={authenticatedUser}
      />
    </Dialog>
  );
};

export default ExportDialog;
