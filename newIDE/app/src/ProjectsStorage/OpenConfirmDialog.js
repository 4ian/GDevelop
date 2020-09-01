// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import BackgroundText from '../UI/BackgroundText';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';

type Props = {|
  onClose: () => void,
  onConfirm: () => void,
|};

export default ({ onClose, onConfirm }: Props) => {
  return (
    <Dialog
      title={<Trans>Confirm the opening</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
        <RaisedButton
          label={<Trans>Open the project</Trans>}
          key="open-project"
          primary
          onClick={onConfirm}
        />,
      ]}
      cannotBeDismissed={false}
      open
      maxWidth="sm"
    >
      <Line>
        <Column>
          <Text>
            <Trans>
              You're about to open a project. Click on "Open the Project" to
              continue.
            </Trans>
          </Text>
        </Column>
      </Line>
      <Line>
        <Column>
          <BackgroundText>
            <Trans>
              If you have a popup blocker interrupting the opening, allow the
              popups and try a second time to open the project.
            </Trans>
          </BackgroundText>
        </Column>
      </Line>
    </Dialog>
  );
};
