import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { Column, Line } from '../UI/Grid';

export default class BrowserPreviewLinkDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  _onOpen = value => {
    const windowObjectReference = window.open(this.props.url, '_blank');
    if (!windowObjectReference) {
      showErrorBox(
        'Unable to open the preview! Be sure that popup are allowed for this website.',
        undefined
      );
    }
    this.props.onClose();
  };

  render() {
    const { url, open } = this.props;
    if (!open || !url) return null;

    const actions = [
      <FlatButton
        label="Launch the preview"
        primary
        onClick={this._onOpen}
      />,
    ];

    return (
      <Dialog actions={actions} modal open={open}>
        <Line>
          <Column>
            Your preview is ready! Click on the button to launch the preview.
          </Column>
        </Line>
        <Line>
          <Column>
            <span>
              To skip this dialog and <b>directly open the preview next time</b>
              , please allow popups to be opened for this website in your
              browser.
            </span>
          </Column>
        </Line>
      </Dialog>
    );
  }
}
