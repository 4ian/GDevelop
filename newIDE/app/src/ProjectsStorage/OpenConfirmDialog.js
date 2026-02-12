// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import BackgroundText from '../UI/BackgroundText';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { type StorageProviderOperations } from '.';

type OpenConfirmDialogProps = {|
  onClose: () => void,
  onConfirm: () => void,
|};

export const OpenConfirmDialog = ({
  onClose,
  onConfirm,
}: OpenConfirmDialogProps) => {
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
        <DialogPrimaryButton
          label={<Trans>Open the project</Trans>}
          key="open-project"
          primary
          onClick={onConfirm}
        />,
      ]}
      onRequestClose={onClose}
      onApply={onConfirm}
      open
      maxWidth="sm"
    >
      <Line>
        <Column noMargin>
          <Text>
            <Trans>
              You're about to open (or re-open) a project. Click on "Open the
              Project" to continue.
            </Trans>
          </Text>
        </Column>
      </Line>
      <Line>
        <Column noMargin>
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

export const useOpenConfirmDialog = () => {
  const interactionMade = React.useRef(false);
  const pendingConfirmationPromiseResolve = React.useRef<?(boolean) => void>(
    null
  );
  const [openConfirmDialogOpen, openOpenConfirmDialog] = React.useState(false);

  return {
    /**
     * Ensure that the user does an interaction (i.e: click on a button), before
     * resolving the promise, if the specified storage provider needs an interaction.
     * This is for example the case when opening directly the web-app with a file
     * to open from the URL (like a Google Drive file).
     */
    ensureInteractionHappened: (
      storageProviderOperations: StorageProviderOperations
    ): Promise<boolean> => {
      return new Promise(resolve => {
        if (
          interactionMade.current ||
          !storageProviderOperations.doesInitialOpenRequireUserInteraction
        ) {
          // No need for any interaction, just proceed.
          resolve(true);
          return;
        }

        // We need an interaction first, display a confirmation dialog
        console.info(
          'Displaying confirmation dialog to ensure an interaction is made before continuing.'
        );
        pendingConfirmationPromiseResolve.current = resolve;
        openOpenConfirmDialog(true);
      });
    },
    /**
     * Render, if needed, the dialog that will ask the user to confirm the opening.
     */
    renderOpenConfirmDialog: () => {
      if (!openConfirmDialogOpen) return null;

      const closeAndResolveWith = (proceed: boolean) => {
        interactionMade.current = true;
        openOpenConfirmDialog(false);
        const resolve = pendingConfirmationPromiseResolve.current;
        if (resolve) {
          resolve(proceed);
          pendingConfirmationPromiseResolve.current = null;
        }
      };

      return (
        <OpenConfirmDialog
          onClose={() => closeAndResolveWith(false)}
          onConfirm={() => closeAndResolveWith(true)}
        />
      );
    },
  };
};
