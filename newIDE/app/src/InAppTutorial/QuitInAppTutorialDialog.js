// @flow

import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';

type Props = {|
  onSaveProject: () => Promise<void>,
  endTutorial: () => void,
  onClose: () => void,
|};

const QuitInAppTutorialDialog = (props: Props) => {
  const saveAndQuitTutorial = async () => {
    await props.onSaveProject();
    props.endTutorial();
    props.onClose();
  };

  const quitTutorial = () => {
    props.endTutorial();
    props.onClose();
  };

  return (
    <Dialog
      open
      maxWidth="sm"
      title="Quit tutorial"
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
          label={<Trans>Save and Exit</Trans>}
          key="save-and-exit"
          onClick={saveAndQuitTutorial}
        />,
      ]}
      flexColumnBody
    >
      <Text>
        <Trans>You are about to quit the tutorial.</Trans>
      </Text>
      <Text>
        <Trans>
          Save your project and resume the tutorial with that very project
          later!
        </Trans>
      </Text>
    </Dialog>
  );
};

export default QuitInAppTutorialDialog;
