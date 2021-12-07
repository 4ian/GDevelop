// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import BuildsDialog from './Builds/BuildsDialog';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../Profile/AuthenticatedUserContext';
import ExportLauncher from './ExportLauncher';
import { type ExportPipeline } from './ExportPipeline.flow';
import { OnlineStatus } from '../Utils/OnlineStatus';
import AlertMessage from '../UI/AlertMessage';

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
  content: { padding: 8 },
};

export type Exporter = {|
  name: React.Node,
  renderIcon: (props: {|
    style: {| width: number, height: number |},
  |}) => React.Node,
  helpPage: string,
  description: React.Node,
  disabled?: boolean,
  advanced?: boolean,
  experimental?: boolean,
  key: string,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
|};

export type ExportDialogWithoutExportsProps = {|
  project: ?gdProject,
  onClose: () => void,
  onChangeSubscription: () => void,
|};

type Props = {|
  ...ExportDialogWithoutExportsProps,
  exporters: Array<Exporter>,
  allExportersRequireOnline?: boolean,
|};

const ExportDialog = ({
  project,
  onClose,
  allExportersRequireOnline,
  onChangeSubscription,
  exporters,
}: Props) => {
  const [chosenExporterKey, setChosenExporterKey] = React.useState<string>('');
  const [buildsDialogOpen, setBuildsDialogOpen] = React.useState<boolean>(
    false
  );

  if (!project) return null;

  const renderExporterListItem = (
    exporter: Exporter,
    index: number,
    forceDisable: boolean
  ) => {
    return (
      <ListItem
        key={exporter.key}
        disabled={forceDisable || exporter.disabled}
        style={
          forceDisable || exporter.disabled ? styles.disabledItem : undefined
        }
        leftIcon={exporter.renderIcon({ style: styles.icon })}
        primaryText={exporter.name}
        secondaryText={exporter.description}
        secondaryTextLines={2}
        onClick={() => setChosenExporterKey(exporter.key)}
      />
    );
  };

  const exporter = exporters.find(
    exporter => exporter.key === chosenExporterKey
  );

  return (
    <AuthenticatedUserContext.Consumer>
      {(authenticatedUser: AuthenticatedUser) => (
        <OnlineStatus>
          {onlineStatus => {
            const cantExportBecauseOffline =
              !!allExportersRequireOnline && !onlineStatus;
            return (
              <Dialog
                title={<Trans>Export project to a standalone game</Trans>}
                onRequestClose={onClose}
                cannotBeDismissed={false}
                actions={[
                  chosenExporterKey && (
                    <FlatButton
                      label={<Trans>Back</Trans>}
                      key="back"
                      primary={false}
                      onClick={() => setChosenExporterKey('')}
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
                  <HelpButton
                    key="help"
                    helpPagePath={
                      (exporter && exporter.helpPage) || '/publishing'
                    }
                  />,
                  exporter && (
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
                {!exporter && (
                  <React.Fragment>
                    <List>
                      {exporters
                        .filter(
                          exporter =>
                            !exporter.advanced && !exporter.experimental
                        )
                        .map((exporter, index) =>
                          renderExporterListItem(
                            exporter,
                            index,
                            cantExportBecauseOffline
                          )
                        )}

                      <Subheader>Advanced</Subheader>
                      {exporters
                        .filter(exporter => exporter.advanced)
                        .map((exporter, index) =>
                          renderExporterListItem(
                            exporter,
                            index,
                            cantExportBecauseOffline
                          )
                        )}
                    </List>
                  </React.Fragment>
                )}
                {exporter && exporter.exportPipeline && (
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
