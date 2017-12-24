import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import Tutorials from './Tutorials';

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
      <FlatButton label="Close" primary={false} onClick={onClose} />,
    ];

    const ExamplesComponent = this.props.examplesComponent;
    if (!ExamplesComponent)
      throw new Error('examplesComponent is missing for CreateProjectDialog');

    return (
      <Dialog
        title="Create a new game"
        actions={actions}
        onRequestClose={onClose}
        open={open}
        noMargin
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
