// @flow
import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { Column } from '../UI/Grid';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onClose: () => void,
  open: boolean,
|};
type State = {||};

export default class OptionsEditorDialog extends React.Component<Props, State> {
  render() {
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        keyboardFocused={true}
        onClick={() => this.props.onClose()}
      />,
    ];

    const { eventsFunctionsExtension } = this.props;

    return (
      <Dialog
        secondaryActions={<HelpButton helpPagePath="/events/functions" />}
        actions={actions}
        open={this.props.open}
        title="Edit Extension Options"
        onRequestClose={this.props.onClose}
        autoScrollBodyContent={true}
      >
        <Column>
          <TextField
            floatingLabelText="Name"
            value={eventsFunctionsExtension.getName()}
            disabled
            fullWidth
          />
          <TextField
            floatingLabelText="Name displayed in editor"
            value={eventsFunctionsExtension.getFullName()}
            onChange={(e, text) => {
              eventsFunctionsExtension.setFullName(text);
              this.forceUpdate();
            }}
            fullWidth
          />
          <TextField
            floatingLabelText="Description"
            value={eventsFunctionsExtension.getDescription()}
            onChange={(e, text) => {
              eventsFunctionsExtension.setDescription(text);
              this.forceUpdate();
            }}
            multiLine
            fullWidth
          />
          <TextField
            floatingLabelText="Version"
            value={eventsFunctionsExtension.getVersion()}
            onChange={(e, text) => {
              eventsFunctionsExtension.setVersion(text);
              this.forceUpdate();
            }}
            fullWidth
          />
        </Column>
      </Dialog>
    );
  }
}
