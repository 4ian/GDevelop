// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Line } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { ColumnStackLayout } from '../../UI/Layout';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

const onboardingText = `
In 5 minutes, you will have:
  - Created a game
  - Learned the fundamentals of GDevelop

We highly recommend it!
`;

type Props = {|
  open: boolean,
  onClose: () => void,
  onStartOnboarding: () => Promise<boolean>,
|};

const OnboardingDialog = ({ open, onClose, onStartOnboarding }: Props) => {
  const { startTutorial } = React.useContext(InAppTutorialContext);

  const startOnboarding = async () => {
    const projectIsClosed = await onStartOnboarding();
    if (!projectIsClosed) {
      return;
    }
    startTutorial('onboarding');
    onClose();
  };

  const actions = [
    <FlatButton
      key="close"
      label={<Trans>No thanks, I'm good</Trans>}
      onClick={onClose}
    />,
    <DialogPrimaryButton
      key="start"
      label={<Trans>Let's go!</Trans>}
      primary
      onClick={startOnboarding}
    />,
  ];

  return (
    <Dialog
      title={<Trans>Take a quick tour?</Trans>}
      actions={actions}
      open={open}
      onRequestClose={onClose}
      onApply={startOnboarding}
      maxWidth="xs"
    >
      <ColumnStackLayout noMargin>
        <Line alignItems="center" justifyContent="center" noMargin>
          <div style={styles.imgContainer}>
            <img alt="hero" src="res/hero.png" width={48} height={48} />
          </div>
        </Line>
        <Line noMargin>
          <MarkdownText source={onboardingText} allowParagraphs />
        </Line>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default OnboardingDialog;
