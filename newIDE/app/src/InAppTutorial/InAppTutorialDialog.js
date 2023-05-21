// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { MarkdownText } from '../UI/MarkdownText';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { type InAppTutorialDialog as InAppTutorialDialogType } from '../Utils/GDevelopServices/InAppTutorial';
import Window from '../Utils/Window';
import Link from '../UI/Link';
import { ColumnStackLayout } from '../UI/Layout';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import FlatButton from '../UI/FlatButton';
import { Line } from '../UI/Grid';

type Props = {|
  dialogContent: InAppTutorialDialogType,
  endTutorial: () => void,
  goToNextStep?: () => void,
  isLastStep?: boolean,
|};

const styles = {
  image: { maxWidth: 350 },
  imageLink: { cursor: 'pointer', maxWidth: 350 },
};

function InAppTutorialDialog({
  dialogContent,
  endTutorial,
  goToNextStep,
  isLastStep,
}: Props) {
  const onApply = () => {
    if (isLastStep) {
      endTutorial();
    } else if (goToNextStep) {
      goToNextStep();
    }
  };

  const actions = isLastStep
    ? [
        <DialogPrimaryButton
          key="close"
          onClick={onApply}
          label={<Trans>Close</Trans>}
        />,
      ]
    : [
        <FlatButton
          key="leave"
          label={<Trans>Leave the tutorial</Trans>}
          onClick={endTutorial}
        />,
        <DialogPrimaryButton
          primary
          key="next"
          onClick={onApply}
          label={<Trans>Start next chapter</Trans>}
        />,
      ];

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={null} // Specific end dialog where the title is handled by the content.
          onApply={onApply}
          open
          actions={actions}
          maxWidth="sm"
          flexColumnBody
          cannotBeDismissed
        >
          <ColumnStackLayout noMargin>
            {dialogContent.content.map((item, index) => {
              if (item.messageDescriptor) {
                return (
                  <MarkdownText
                    // $FlowFixMe - Message descriptor are usually an object with a `id` key containing the translation key.
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
              if (item.image) {
                const { linkHref, imageSource } = item.image;
                if (linkHref) {
                  return (
                    <Line justifyContent="center" key={`image-${index}`}>
                      <Link
                        href={linkHref}
                        onClick={() => Window.openExternalURL(linkHref)}
                      >
                        <CorsAwareImage
                          style={styles.imageLink}
                          src={imageSource}
                          alt="End of tutorial dialog image"
                        />
                      </Link>
                    </Line>
                  );
                } else {
                  return (
                    <Line justifyContent="center" key={`image-${index}`}>
                      <CorsAwareImage
                        style={styles.image}
                        src={imageSource}
                        alt="End of tutorial dialog image"
                      />
                    </Line>
                  );
                }
              }
              return null;
            })}
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
}

export default InAppTutorialDialog;
