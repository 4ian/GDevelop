// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import Changelog from '.';
import Text from '../../UI/Text';

type Props = {|
  open: boolean,
  onClose: () => void,
|};

type State = {||};

export default class ChangelogDialog extends React.Component<Props, State> {
  render(): null | React.Node {
    const { open, onClose } = this.props;
    if (!open) {
      // Don't render anything, to avoid in particular sending useless requests.
      return null;
    }

    const actions = [
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={true}
        onClick={onClose}
      />,
    ];

    return (
      <Dialog
        title={<Trans>What's new in GDevelop?</Trans>}
        actions={actions}
        open={open}
        onRequestClose={onClose}
        cannotBeDismissed={false}
      >
        <Text>
          <Trans>
            GDevelop was upgraded to a new version! Check out the changes.
          </Trans>
        </Text>
        <Changelog
          onUpdated={() => {
            this.forceUpdate(); /*Force update to ensure dialog is properly positionned*/
          }}
        />
      </Dialog>
    );
  }
}
