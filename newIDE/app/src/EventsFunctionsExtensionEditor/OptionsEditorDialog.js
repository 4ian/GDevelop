// @flow
import { Trans } from '@lingui/macro';

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
        label={<Trans>Close</Trans>}
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
        title={<Trans>Edit Extension Options</Trans>}
        onRequestClose={this.props.onClose}
        autoScrollBodyContent={true}
      >
        <Column>
          <TextField
            floatingLabelText={<Trans>Name</Trans>}
            value={eventsFunctionsExtension.getName()}
            disabled
            fullWidth
          />
          <TextField
            floatingLabelText={<Trans>Name displayed in editor</Trans>}
            value={eventsFunctionsExtension.getFullName()}
            onChange={(e, text) => {
              eventsFunctionsExtension.setFullName(text);
              this.forceUpdate();
            }}
            fullWidth
          />
          <TextField
            floatingLabelText={<Trans>Description</Trans>}
            value={eventsFunctionsExtension.getDescription()}
            onChange={(e, text) => {
              eventsFunctionsExtension.setDescription(text);
              this.forceUpdate();
            }}
            multiLine
            fullWidth
          />
          <TextField
            floatingLabelText={<Trans>Version</Trans>}
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
