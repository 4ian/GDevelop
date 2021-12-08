// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from '../../UI/FlatButton';
import BuildsDialog from '../Builds/BuildsDialog';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../Profile/AuthenticatedUserContext';
import ExportLauncher from './ExportLauncher';
import { type ExportPipeline } from '../ExportPipeline.flow';
import { OnlineStatus } from '../../Utils/OnlineStatus';
import AlertMessage from '../../UI/AlertMessage';
import { Tab, Tabs } from '../../UI/Tabs';
import ExportHome from './ExportHome';

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
  content: { padding: 8 },
};

export type ExporterSection = 'assisted' | 'manual' | '';
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
  description: React.Node,
  disabled?: boolean,
  advanced?: boolean,
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
  assistedExporters: Array<Exporter>,
  manualExporters: Array<Exporter>,
  onlineWebExporter: Exporter,
  allExportersRequireOnline?: boolean,
|};

const ExportDialog = ({
  project,
  onClose,
  allExportersRequireOnline,
  onChangeSubscription,
  assistedExporters,
  manualExporters,
  onlineWebExporter,
}: Props) => {
  const [
    chosenExporterSection,
    setChosenExporterSection,
  ] = React.useState<ExporterSection>('');
  const [buildsDialogOpen, setBuildsDialogOpen] = React.useState<boolean>(
    false
  );
  const [chosenExporterKey, setChosenExporterKey] = React.useState<ExporterKey>(
    'onlinewebexport'
  );

  console.log(project);

  if (!project) return null;
  const exporters = [
    ...assistedExporters,
    ...manualExporters,
    onlineWebExporter,
  ];

  const exporter = exporters.find(
    exporter => exporter.key === chosenExporterKey
  );

  console.log(exporter);
  if (!exporter || !exporter.exportPipeline) return null;

  console.log(chosenExporterSection);

  return (
    <AuthenticatedUserContext.Consumer>
      {(authenticatedUser: AuthenticatedUser) => (
        <OnlineStatus>
          {onlineStatus => {
            const cantExportBecauseOffline =
              !!allExportersRequireOnline && !onlineStatus;
            return (
              <Dialog
                title={
                  chosenExporterSection === 'assisted' ? (
                    <Trans>Publish your game</Trans>
                  ) : chosenExporterSection === 'manual' ? (
                    <Trans>Build manually</Trans>
                  ) : null
                }
                onRequestClose={onClose}
                cannotBeDismissed={false}
                actions={[
                  chosenExporterSection && (
                    <FlatButton
                      label={<Trans>Back</Trans>}
                      key="back"
                      primary={false}
                      onClick={() => {
                        setChosenExporterSection('');
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
                      You must be online and have a proper internet connection
                      to export your game.
                    </Trans>
                  </AlertMessage>
                )}
                {chosenExporterSection === '' && (
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
                {chosenExporterSection === 'assisted' && (
                  <Tabs
                    value={chosenExporterKey}
                    onChange={setChosenExporterKey}
                  >
                    {assistedExporters.map(exporter => (
                      <Tab
                        label={exporter.tabName}
                        value={exporter.key}
                        key={exporter.key}
                      />
                    ))}
                  </Tabs>
                )}
                {chosenExporterSection === 'manual' && (
                  <Tabs
                    value={chosenExporterKey}
                    onChange={setChosenExporterKey}
                  >
                    {manualExporters.map(exporter => (
                      <Tab
                        label={exporter.tabName}
                        value={exporter.key}
                        key={exporter.key}
                      />
                    ))}
                  </Tabs>
                )}
                {chosenExporterSection !== '' && (
                  <div style={styles.content}>
                    <ExportLauncher
                      exportPipeline={exporter.exportPipeline}
                      project={project}
                      onChangeSubscription={onChangeSubscription}
                      authenticatedUser={authenticatedUser}
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
          }}
        </OnlineStatus>
      )}
    </AuthenticatedUserContext.Consumer>
  );
};

export default ExportDialog;
