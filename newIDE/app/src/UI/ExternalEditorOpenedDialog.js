import { Trans } from '@lingui/macro';
import optionalRequire from '../Utils/OptionalRequire';
import Dialog from './Dialog';
import Text from './Text';

const electron = optionalRequire('electron');

export const ExternalEditorOpenedDialog = () => {
  if (!!electron) return null;

  return (
    <Dialog
      title={<Trans>An external editor is opened.</Trans>}
      cannotBeDismissed
      noMobileFullScreen
      open
      maxWidth="sm"
      id="external-editor-opened-dialog"
    >
      <Text>
        <Trans>
          Save your changes or close the external editor to continue.
        </Trans>
      </Text>
    </Dialog>
  );
};
