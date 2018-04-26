import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class ConfirmCloseDialog extends React.PureComponent {
  state = {
    open: false,
  };

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
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
    if (this.onHandleAnswer) this.onHandleAnswer(true);
  };

  render() {
    const actions = [
      <FlatButton label="Cancel" onClick={this.handleCancel} />,
      <FlatButton
        label="Close project"
        primary={true}
        onClick={this.handleClose}
      />,
    ];

    return (
      <Dialog
        title="Close project"
        onRequestClose={this.handleCancel}
        actions={actions}
        open={this.state.open}
      >
        Any changes that has not been saved will be lost.
      </Dialog>
    );
  }
}
