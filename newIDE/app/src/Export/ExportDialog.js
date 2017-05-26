import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';

const styles = {
  content: {
    padding: 0,
  },
  tabContent: {
    padding: 24,
    width: '',
  },
};

export default class LocalExportDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  handleChange = value => {
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
        actions={actions}
        modal={true}
        open={open}
        bodyStyle={styles.content}
      >
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          tabTemplateStyle={styles.tabContent}
        >
          {this.props.tabs.map(({ ExportComponent, name }, index) => (
            <Tab label={name} value={index} key={index}>
              <ExportComponent project={this.props.project} />
            </Tab>
          ))}
        </Tabs>
      </Dialog>
    );
  }
}
