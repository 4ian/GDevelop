import { Trans } from '@lingui/macro';
import optionalRequire from '../Utils/OptionalRequire';
import Dialog from './Dialog';
import Text from './Text';
import FlatButton from './FlatButton';

const electron = optionalRequire('electron');

export const ExternalEditorOpenedDialog = ({
  onClose,
}: {|
  onClose?: () => Promise<void>,
|}) => {
  if (!!electron) return null;

  return (
    <Dialog
      title={<Trans>An external editor is opened.</Trans>}
      cannotBeDismissed
      noMobileFullScreen
      open
      maxWidth="sm"
      id="external-editor-opened-dialog"
      actions={
        onClose
          ? [
              <FlatButton
                label={<Trans>Cancel</Trans>}
                onClick={onClose}
                key="close"
              />,
            ]
          : null
      }
    >
      <Text>
        <Trans>
          Save your changes or close the external editor to continue.
        </Trans>
      </Text>
    </Dialog>
  );
};
