// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';
import { useTimeout } from '../Utils/UseTimeout';

type Props = {|
  onClose: () => void,
  message: React.Node,
|};

const UserWelcomeDialog = ({ onClose, message }: Props) => {
  useTimeout(React.useCallback(onClose, [onClose]), 3000);
  return (
    <Dialog
      title={null}
      open
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      maxWidth="xs"
    >
      <Column noMargin alignItems="center">
        <Text size="block-title">{message}</Text>
      </Column>
    </Dialog>
  );
};

export default UserWelcomeDialog;
