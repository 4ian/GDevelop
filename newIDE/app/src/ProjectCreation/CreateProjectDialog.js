import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import Tutorials from './Tutorials';

const styles = {
  content: {
    padding: 0,
  },
  tabContent: {
    padding: 24,
  },
};

export default class CreateProjectDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'examples',
    };
  }

  _onChangeTab = newTab => {
    this.setState({
      currentTab: newTab,
    });
  };

  render() {
    const { open, onClose, onOpen, onCreate } = this.props;
    if (!open) return null;

    const actions = [
      <FlatButton label="Close" primary={false} onTouchTap={onClose} />,
    ];

    const ExamplesComponent = this.props.examplesComponent;

    return (
      <Dialog
        title="Create a new game"
        actions={actions}
        modal={true}
        open={open}
        bodyStyle={styles.content}
        autoScrollBodyContent
      >
        <Tabs value={this.state.value} onChange={this._onChangeTab}>
          <Tab label="Examples" value="examples">
            <ExamplesComponent onOpen={onOpen} onCreate={onCreate} />
          </Tab>
          <Tab label="Tutorials" value="tutorials">
            <Tutorials />
          </Tab>
        </Tabs>
      </Dialog>
    );
  }
}
