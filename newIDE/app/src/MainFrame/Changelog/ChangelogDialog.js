// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import Changelog from '.';
import Text from '../../UI/Text';
import useForceUpdate from '../../Utils/UseForceUpdate';

type Props = {|
  open: boolean,
  onClose: () => void,
|};

const ChangelogDialog = ({ open, onClose }: Props) => {
  const forceUpdate = useForceUpdate();
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
    >
      <Text>
        <Trans>
          GDevelop was upgraded to a new version! Check out the changes.
        </Trans>
      </Text>
      <Changelog
        onUpdated={forceUpdate} // Force update to ensure dialog is properly positionned
      />
    </Dialog>
  );
};

export default ChangelogDialog;
