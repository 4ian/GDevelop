import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';

const styles = {
  content: {
    padding: 0,
  },
  tabContent: {
    padding: 24,
  },
};

export default class ExportDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  _onChangeTab = value => {
    this.setState({
      value,
    });
  };

  render() {
    const { project, open, onClose } = this.props;
    if (!open || !project) return null;

    const actions = [
      <FlatButton label="Close" primary={false} onTouchTap={onClose} />,
    ];

    return (
      <Dialog
        title="Export project to a standalone game"
        onRequestClose={onClose}
        actions={actions}
        open={open}
        noMargin
      >
        <Tabs value={this.state.value} onChange={this._onChangeTab}>
          {this.props.tabs.map(({ ExportComponent, name }, index) => (
            <Tab label={name} value={index} key={index}>
              <div style={styles.tabContent}>
                <ExportComponent project={this.props.project} />
              </div>
            </Tab>
          ))}
        </Tabs>
      </Dialog>
    );
  }
}
