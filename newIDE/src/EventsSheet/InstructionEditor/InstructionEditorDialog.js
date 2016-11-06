import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import InstructionEditor from './index.js';

export default class InstructionEditorDialog extends React.Component {
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onTouchTap={this.props.onCancel}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.props.onSubmit}
      />,
    ];

    return (
      <Dialog
        title="Add/Edit the instruction"
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.onCancel}
        autoScrollBodyContent={true}
      >
        <InstructionEditor {...this.props} />
      </Dialog>
    );
  }
}
