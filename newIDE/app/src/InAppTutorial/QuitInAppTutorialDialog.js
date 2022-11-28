// @flow

import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';

type Props = {|
  onSaveProject: () => Promise<void>,
  canEndTutorial: boolean,
  endTutorial: () => void,
  onClose: () => void,
|};

const QuitInAppTutorialDialog = (props: Props) => {
  const quitTutorial = () => {
    props.endTutorial();
    props.onClose();
  };

  return (
    <Dialog
      open
      maxWidth="sm"
      title={<Trans>Quit tutorial</Trans>}
      onRequestClose={props.onClose}
      onApply={() => {
        if (props.canEndTutorial) {
          props.endTutorial();
        }
      }}
      secondaryActions={[
        <FlatButton
          key="exit"
          onClick={quitTutorial}
          label={<Trans>Exit without saving</Trans>}
        />,
      ]}
      actions={[
        <FlatButton
          key="cancel"
          onClick={props.onClose}
          label={<Trans>Cancel</Trans>}
        />,
        <DialogPrimaryButton
          primary
          disabled={!props.canEndTutorial}
          label={<Trans>Exit</Trans>}
          key="save-and-exit"
          onClick={quitTutorial}
        />,
      ]}
      flexColumnBody
    >
      <Text>
        <Trans>You are about to quit the tutorial.</Trans>
      </Text>
      <Text>
        <Trans>
          You can save your project to come back to it later. What do you want
          to do?
        </Trans>
      </Text>
      <Line justifyContent="center">
        <RaisedButton
          primary
          label={<Trans>Save project</Trans>}
          disabled={props.canEndTutorial}
          onClick={props.onSaveProject}
        />
      </Line>
    </Dialog>
  );
};

export default QuitInAppTutorialDialog;
