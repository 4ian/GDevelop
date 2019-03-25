import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import BuildsDialog from './Builds/BuildsDialog';
import { Line } from '../UI/Grid';

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
  content: { padding: 24 },
};

export default class ExportDialog extends Component {
  state = {
    chosenExporterKey: '',
    showExperimental: false,
    buildsDialogOpen: false,
  };

  chooseExporter = key => {
    this.setState({
      chosenExporterKey: key,
    });
  };

  _showExperimental = (show = true) => {
    this.setState({
      showExperimental: show,
    });
  };

  _openBuildsDialog = (open = true) => {
    this.setState({
      buildsDialogOpen: open,
    });
  };

  _renderExporterListItem = (exporter, index) => {
    return (
      <ListItem
        key={exporter.key}
        disabled={exporter.disabled}
        style={exporter.disabled ? styles.disabledItem : undefined}
        leftAvatar={exporter.renderIcon({ style: styles.icon })}
        primaryText={exporter.name}
        secondaryText={<p>{exporter.description}</p>}
        secondaryTextLines={2}
        onClick={() => this.chooseExporter(exporter.key)}
      />
    );
  };

  render() {
    const {
      project,
      open,
      onClose,
      authentification, //Still exist?
      onChangeSubscription,
      exporters,
    } = this.props;
    const { showExperimental, chosenExporterKey } = this.state;
    if (!open || !project) return null;

    const exporter = exporters.find(
      exporter => exporter.key === chosenExporterKey
    );

    return (
      <Dialog
        title={<Trans>Export project to a standalone game</Trans>}
        onRequestClose={onClose}
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
            helpPagePath={(exporter && exporter.helpPage) || '/publishing'}
          />,
          <FlatButton
            key="builds"
            label={<Trans>See all my builds</Trans>}
            onClick={() => this._openBuildsDialog(true)}
          />,
        ]}
        open={open}
        noMargin
        autoScrollBodyContent
      >
        {!exporter && (
          <React.Fragment>
            <List>
              {exporters
                .filter(
                  exporter => !exporter.advanced && !exporter.experimental
                )
                .map((exporter, index) =>
                  this._renderExporterListItem(exporter, index)
                )}

              <Subheader>Advanced</Subheader>
              {exporters
                .filter(exporter => exporter.advanced)
                .map((exporter, index) =>
                  this._renderExporterListItem(exporter, index)
                )}

              {showExperimental && <Subheader>Experimental</Subheader>}
              {showExperimental &&
                exporters
                  .filter(exporter => exporter.experimental)
                  .map((exporter, index) =>
                    this._renderExporterListItem(exporter, index)
                  )}
            </List>
            <Line justifyContent="center" alignItems="center">
              {!showExperimental ? (
                <FlatButton
                  key="toggle-experimental"
                  icon={<Visibility />}
                  primary={false}
                  onClick={() => this._showExperimental(true)}
                  label={<Trans>Show experimental exports</Trans>}
                />
              ) : (
                <FlatButton
                  key="toggle-experimental"
                  icon={<VisibilityOff />}
                  primary={false}
                  onClick={() => this._showExperimental(false)}
                  label={<Trans>Hide experimental exports</Trans>}
                />
              )}
            </Line>
          </React.Fragment>
        )}
        {exporter && (
          <div style={styles.content}>
            <exporter.ExportComponent
              project={project}
              authentification={authentification} //Still exist?
              onChangeSubscription={onChangeSubscription}
              onOpenBuildsDialog={this._openBuildsDialog}
            />
          </div>
        )}
        <BuildsDialog
          open={this.state.buildsDialogOpen}
          onClose={() => this._openBuildsDialog(false)}
        />
      </Dialog>
    );
  }
}
