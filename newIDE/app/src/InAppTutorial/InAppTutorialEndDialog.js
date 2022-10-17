// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import Dialog from '../UI/Dialog';
import { MarkdownText } from '../UI/MarkdownText';
import RaisedButton from '../UI/RaisedButton';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { type InAppTutorialEndDialog as InAppTutorialEndDialogType } from './InAppTutorialContext';
import Window from '../Utils/Window';
import Link from '../UI/Link';

type Props = {|
  endDialog: InAppTutorialEndDialogType,
  onClose: () => void,
|};

const styles = { imageLink: { cursor: 'pointer', maxWidth: 350 } };

function InAppTutorialEndDialog({ endDialog, onClose }: Props) {
  return (
    <Dialog
      onApply={onClose}
      open
      actions={[
        <RaisedButton
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
      {endDialog.content.map(item => {
        if (item.text) {
          return (
            <MarkdownText
              key={item.text.substring(0, 10)}
              allowParagraphs
              source={item.text}
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
    </Dialog>
  );
}

export default InAppTutorialEndDialog;
