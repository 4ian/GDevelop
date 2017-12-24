import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';

const styles = {
  content: {
    padding: 0,
  },
  tabContent: {
    padding: 24,
  },
};

export default class ExportDialog extends Component {
  state = {
    value: 0,
    showExperimental: false,
  };

  _onChangeTab = value => {
    this.setState({
      value,
    });
  };

  _showExperimental = (show = true) => {
    this.setState({
      showExperimental: show,
    });
  };

  render() {
    const { project, open, onClose } = this.props;
    const { showExperimental } = this.state;
    if (!open || !project) return null;

    return (
      <Dialog
        title="Export project to a standalone game"
        onRequestClose={onClose}
        actions={
          <FlatButton label="Close" primary={false} onClick={onClose} />
        }
        secondaryActions={[
          <HelpButton key="help" helpPagePath="/publishing" />,
          !showExperimental ? (
            <FlatButton
              key="toggle-experimental"
              icon={<Visibility />}
              primary={false}
              onClick={() => this._showExperimental(true)}
              label="Show experimental exports"
            />
          ) : (
            <FlatButton
              key="toggle-experimental"
              icon={<VisibilityOff />}
              primary={false}
              onClick={() => this._showExperimental(false)}
              label="Hide experimental exports"
            />
          ),
        ]}
        open={open}
        noMargin
      >
        <Tabs value={this.state.value} onChange={this._onChangeTab}>
          {this.props.tabs.map(
            ({ ExportComponent, name, advanced }, index) =>
              (!advanced || showExperimental) && (
                <Tab label={name} value={index} key={index}>
                  <div style={styles.tabContent}>
                    <ExportComponent project={this.props.project} />
                  </div>
                </Tab>
              )
          )}
        </Tabs>
      </Dialog>
    );
  }
}
