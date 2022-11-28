// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Line, Column } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { ColumnStackLayout } from '../../UI/Layout';

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

type Props = {|
  open: boolean,
  onClose: () => void,
  tutorialCompletionStatus: 'notStarted' | 'started' | 'complete',
  isProjectOpened?: boolean,
  startTutorial: (scenario: 'resume' | 'startOver' | 'start') => Promise<void>,
|};

const StartTutorialDialog = ({
  open,
  onClose,
  tutorialCompletionStatus,
  isProjectOpened,
  startTutorial,
}: Props) => {
  const resumeTutorial = () => startTutorial('resume');
  const startOverTutorial = () => startTutorial('startOver');
  const startTutorialForFirstTime = () => startTutorial('start');

  const dialogContentByCompletionStatus = {
    notStarted: {
      title: <Trans>Let's make a Fling Game</Trans>,
      content: t`You're about to start the first chapter of our in-app tutorial.${'\n'}${'\n'}GDevelop will save your progress so you can take a break when you need it.${'\n'}${'\n'}Are you ready to start?`,
      primaryAction: {
        label: <Trans>Yes</Trans>,
        onClick: startTutorialForFirstTime,
      },
      secondaryAction: { label: <Trans>No</Trans>, onClick: onClose },
      tertiaryAction: null,
    },
    started: {
      title: <Trans>Welcome back!</Trans>,
      content: t`Let's finish your Fling Game, shall we?`,
      primaryAction: {
        label: <Trans>Let's go</Trans>,
        onClick: resumeTutorial,
      },
      secondaryAction: {
        label: isProjectOpened ? (
          <Trans>No, close project</Trans>
        ) : (
          <Trans>No</Trans>
        ),
        onClick: onClose,
      },
      tertiaryAction: {
        label: <Trans>Restart tutorial</Trans>,
        onClick: startOverTutorial,
      },
    },
    complete: {
      title: <Trans>Restart the Tutorial</Trans>,
      content: t`You're about to restart our in-app 3-chapter tutorial.${'\n'}${'\n'}GDevelop will save your progress, so you can take a break if you need.`,
      primaryAction: { label: <Trans>Yes</Trans>, onClick: startOverTutorial },
      secondaryAction: { label: <Trans>No</Trans>, onClick: onClose },
      tertiaryAction: null,
    },
  };

  const {
    title,
    content,
    primaryAction,
    secondaryAction,
    tertiaryAction,
  } = dialogContentByCompletionStatus[tutorialCompletionStatus];

  const actions = [
    <FlatButton
      key="close"
      label={secondaryAction.label}
      onClick={secondaryAction.onClick}
    />,
    <DialogPrimaryButton
      key="start"
      label={primaryAction.label}
      primary
      onClick={primaryAction.onClick}
    />,
  ];
  const secondaryActions = tertiaryAction
    ? [
        <FlatButton
          key="other"
          label={tertiaryAction.label}
          onClick={tertiaryAction.onClick}
        />,
      ]
    : undefined;

  return (
    <Dialog
      title={title}
      actions={actions}
      secondaryActions={secondaryActions}
      open={open}
      onRequestClose={onClose}
      onApply={primaryAction.onClick}
      maxWidth="xs"
    >
      <ColumnStackLayout noMargin>
        <Line alignItems="center" justifyContent="center" noMargin>
          <div style={styles.imgContainer}>
            <img alt="hero" src="res/hero.png" width={48} height={48} />
          </div>
        </Line>
        <Column noMargin>
          <MarkdownText translatableSource={content} allowParagraphs />
        </Column>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default StartTutorialDialog;
