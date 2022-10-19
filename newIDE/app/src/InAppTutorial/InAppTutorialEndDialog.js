// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { MarkdownText } from '../UI/MarkdownText';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { type InAppTutorialEndDialog as InAppTutorialEndDialogType } from './InAppTutorialContext';
import Window from '../Utils/Window';
import Link from '../UI/Link';
import { ColumnStackLayout } from '../UI/Layout';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';

type Props = {|
  endDialog: InAppTutorialEndDialogType,
  onClose: () => void,
|};

const styles = { imageLink: { cursor: 'pointer', maxWidth: 350 } };

function InAppTutorialEndDialog({ endDialog, onClose }: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          onApply={onClose}
          open
          actions={[
            <DialogPrimaryButton
              key="ok"
              onClick={onClose}
              label={<Trans>Close</Trans>}
            />,
          ]}
          maxWidth="sm"
          flexColumnBody
          flexBody
          fullHeight
          cannotBeDismissed
        >
          <ColumnStackLayout>
            {endDialog.content.map(item => {
              if (item.messageDescriptor) {
                return (
                  <MarkdownText
                    // $FlowFixMe - Message descriptor are usually and object with a `id` key containing the translation key.
                    key={item.messageDescriptor.id || item.messageDescriptor}
                    translatableSource={item.messageDescriptor}
                  />
                );
              } else if (item.messageByLocale) {
                return (
                  <MarkdownText
                    // $FlowFixMe - We suppose the message by locale has at least one key (one language) and we use the translation key.
                    key={Object.values(item.messageByLocale)[0]}
                    source={selectMessageByLocale(i18n, item.messageByLocale)}
                  />
                );
              }
              if (item.cta) {
                return (
                  <Link
                    key={item.cta.linkHref}
                    href={item.cta.linkHref}
                    onClick={() => Window.openExternalURL(item.cta.linkHref)}
                  >
                    <CorsAwareImage
                      style={styles.imageLink}
                      src={item.cta.imageSource}
                      alt="End of dialog suggestion"
                    />
                  </Link>
                );
              }
              return null;
            })}
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
}

export default InAppTutorialEndDialog;
