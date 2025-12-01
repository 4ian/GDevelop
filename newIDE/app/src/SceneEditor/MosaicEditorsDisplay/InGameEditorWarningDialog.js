// @flow
import { Trans, t } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';

import * as React from 'react';
import { MarkdownText } from '../../UI/MarkdownText';

type Props = {
  onClose: () => void,
};

export const InGameEditorWarningDialog = ({ onClose }: Props) => {
  return (
    <Dialog
      open
      title={<Trans>New 3D editor</Trans>}
      flexColumnBody
      maxWidth="sm"
      fullscreen="never-even-on-mobile"
      actions={[
        <DialogPrimaryButton
          key="close"
          label={<Trans>Ok, don't show me this again</Trans>}
          onClick={onClose}
          primary
        />,
      ]}
    >
      <MarkdownText
        allowParagraphs
        isStandaloneText
        translatableSource={t`The 3D editor is new and may still have rough edges. It will continue to be improved in the near future.

Read more about it on the [GDevelop blog](https://gdevelop.io/blog/3d-editor).`}
      />
    </Dialog>
  );
};
