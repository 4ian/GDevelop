// @flow
import * as React from 'react';
import Dialog from './Dialog';
import Text from './Text';
import FlatButton from './FlatButton';
import { Trans } from '@lingui/macro';

type Props = {|
  onRequestClose: () => void,
  onCancel: () => void,
  open: boolean,
|};

export default class UnsavedChangesDialog extends React.Component<Props, *> {
  render() {
    const { onCancel, onRequestClose } = this.props;
    const actions = [
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        primary={false}
        onClick={onRequestClose}
      />,
      <FlatButton
        key="ok"
        label={<Trans>Yes</Trans>}
        primary={true}
        keyboardFocused={false}
        onClick={onCancel}
      />,
    ];
    return (
      <Dialog
        title={<Trans>Confirm Quit</Trans>}
        onRequestClose={onRequestClose}
        maxWidth="xs"
        actions={actions}
        open
      >
        <Text>
          <Trans>Are you sure want to quit?</Trans>
        </Text>
        <Text style={{ marginTop: -10 }}>
          <Trans>Any unsaved changes will be lost...</Trans>
        </Text>
      </Dialog>
    );
  }
}
