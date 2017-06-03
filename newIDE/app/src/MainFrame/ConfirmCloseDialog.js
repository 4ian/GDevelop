import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class ConfirmCloseDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  show(onHandleAnswer) {
    this.onHandleAnswer = onHandleAnswer;
    this.setState({
      open: true,
    });
  }

  handleCancel = () => {
    this.setState({
      open: false,
    });
    if (this.onHandleAnswer) this.onHandleAnswer(false);
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
    if (this.onHandleAnswer) this.onHandleAnswer(true);
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCancel}
      />,
      <FlatButton
        label="Close project"
        primary={true}
        onTouchTap={this.handleClose}
      />,
    ];

    return (
      <Dialog
        title="Close project"
        actions={actions}
        modal={true}
        open={this.state.open}
      >
        Any changes that has not been saved will be lost.
      </Dialog>
    );
  }
}
