// @flow

import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import LeftLoader from '../UI/LeftLoader';
import Text from '../UI/Text';

type Props = {|
  onSaveProject: () => Promise<void>,
  canEndTutorial: boolean,
  endTutorial: () => void,
  onClose: () => void,
  isSavingProject: boolean,
|};

const QuitInAppTutorialDialog = ({
  onSaveProject,
  canEndTutorial,
  endTutorial,
  onClose,
  isSavingProject,
}: Props) => {
  const [hasUserInteracted, setHasUserInteracted] = React.useState<boolean>(
    false
  );
  const [title, setTitle] = React.useState<React.Node>(
    <Trans>Leave the tutorial</Trans>
  );

  React.useEffect(
    () => {
      if (hasUserInteracted) {
        if (isSavingProject) {
          setTitle(<Trans>Saving project</Trans>);
        } else if (canEndTutorial) {
          setTitle(<Trans>Project saved</Trans>);
        }
      }
    },
    [isSavingProject, canEndTutorial, hasUserInteracted]
  );

  const quitTutorial = () => {
    endTutorial();
    onClose();
  };

  const saveOrExitTutorial = () => {
    setHasUserInteracted(true);
    if (canEndTutorial) {
      quitTutorial();
    } else {
      onSaveProject();
    }
  };

  const primaryActionLabel = isSavingProject ? (
    <Trans>Saving...</Trans>
  ) : canEndTutorial ? (
    <Trans>Close Project</Trans>
  ) : (
    <Trans>Save Project</Trans>
  );

  return (
    <Dialog
      open
      maxWidth="sm"
      title={title}
      onRequestClose={() => {
        if (!isSavingProject) onClose();
      }}
      onApply={saveOrExitTutorial}
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
          onClick={onClose}
          label={<Trans>Cancel</Trans>}
        />,
        <LeftLoader isLoading={isSavingProject} key="save-and-exit">
          <DialogPrimaryButton
            primary
            label={primaryActionLabel}
            disabled={isSavingProject}
            onClick={saveOrExitTutorial}
          />
        </LeftLoader>,
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
    </Dialog>
  );
};

export default QuitInAppTutorialDialog;
