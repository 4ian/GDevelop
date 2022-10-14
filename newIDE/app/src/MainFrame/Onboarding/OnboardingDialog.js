// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Line } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { ColumnStackLayout } from '../../UI/Layout';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';

export let isUserflowRunning = false;

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

const onboardingText = `
In 5 minutes, you will have:
  - Created a game
  - Learned the fundamentals of GDevelop

(The tour is only available in 4 languages: 🇬🇧/🇺🇸 English, 🇫🇷 French, 🇪🇸 Spanish, 🇵🇹 Portuguese)

We highly recommend it!
`;

type Props = {|
  open: boolean,
  onClose: () => void,
  onUserflowRunningUpdate: () => void,
|};

const OnboardingDialog = ({
  open,
  onClose,
  onUserflowRunningUpdate,
}: Props) => {
  const { startTutorial } = React.useContext(InAppTutorialContext);

  const startOnboarding = () => {
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
