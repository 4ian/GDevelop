// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import BuildsDialog from './Builds/BuildsDialog';
import { Line } from '../UI/Grid';
import UserProfileContext, {
  type UserProfile,
} from '../Profile/UserProfileContext';
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

type State = {|
  chosenExporterKey: string,
  showExperimental: boolean,
  buildsDialogOpen: boolean,
|};

type ExportButtonProps = {|
  showExperimental: boolean,
  onClick: (value: boolean) => void,
  disabled: boolean,
|};

const ExportButton = (props: ExportButtonProps) => {
  const { showExperimental, onClick, disabled } = props;
  return (
    <>
      {!disabled && !showExperimental && (
        <FlatButton
          key="toggle-experimental"
          icon={<Visibility />}
          primary={false}
          onClick={() => onClick(true)}
          label={<Trans>Show experimental exports</Trans>}
        />
      )}
      {!disabled && showExperimental && (
        <FlatButton
          key="toggle-experimental"
          icon={<VisibilityOff />}
          primary={false}
          onClick={() => onClick(false)}
          label={<Trans>Hide experimental exports</Trans>}
        />
      )}
    </>
  );
};

export default class ExportDialog extends React.Component<Props, State> {
  state = {
    chosenExporterKey: '',
    showExperimental: false,
    buildsDialogOpen: false,
  };

  chooseExporter = (key: string) => {
    this.setState({
      chosenExporterKey: key,
    });
  };

  _showExperimental = (show: boolean = true) => {
    this.setState({
      showExperimental: show,
    });
  };

  _openBuildsDialog = (open: boolean = true) => {
    this.setState({
      buildsDialogOpen: open,
    });
  };

  _renderExporterListItem = (
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
        onClick={() => this.chooseExporter(exporter.key)}
      />
    );
  };

  render() {
    const {
      project,
      onClose,
      allExportersRequireOnline,
      onChangeSubscription,
      exporters,
    } = this.props;
    const { showExperimental, chosenExporterKey } = this.state;
    if (!project) return null;

    const exporter = exporters.find(
      exporter => exporter.key === chosenExporterKey
    );

    return (
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
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
                        onClick={() => this.chooseExporter('')}
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
                    <FlatButton
                      key="builds"
                      label={<Trans>See all my builds</Trans>}
                      onClick={() => this._openBuildsDialog(true)}
                    />,
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
                            this._renderExporterListItem(
                              exporter,
                              index,
                              cantExportBecauseOffline
                            )
                          )}

                        <Subheader>Advanced</Subheader>
                        {exporters
                          .filter(exporter => exporter.advanced)
                          .map((exporter, index) =>
                            this._renderExporterListItem(
                              exporter,
                              index,
                              cantExportBecauseOffline
                            )
                          )}

                        {showExperimental && (
                          <Subheader>Experimental</Subheader>
                        )}
                        {showExperimental &&
                          exporters
                            .filter(exporter => exporter.experimental)
                            .map((exporter, index) =>
                              this._renderExporterListItem(
                                exporter,
                                index,
                                cantExportBecauseOffline
                              )
                            )}
                      </List>
                      <Line justifyContent="center" alignItems="center">
                        <ExportButton
                          showExperimental={showExperimental}
                          onClick={value => this._showExperimental(value)}
                          disabled
                        />
                      </Line>
                    </React.Fragment>
                  )}
                  {exporter && exporter.exportPipeline && (
                    <div style={styles.content}>
                      <ExportLauncher
                        exportPipeline={exporter.exportPipeline}
                        project={project}
                        onChangeSubscription={onChangeSubscription}
                        userProfile={userProfile}
                      />
                    </div>
                  )}
                  <BuildsDialog
                    open={this.state.buildsDialogOpen}
                    onClose={() => this._openBuildsDialog(false)}
                    userProfile={userProfile}
                  />
                </Dialog>
              );
            }}
          </OnlineStatus>
        )}
      </UserProfileContext.Consumer>
    );
  }
}
