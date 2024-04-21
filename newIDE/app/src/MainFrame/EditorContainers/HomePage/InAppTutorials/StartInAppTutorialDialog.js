// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../../../UI/Dialog';
import FlatButton from '../../../../UI/FlatButton';
import { Line } from '../../../../UI/Grid';
import { ColumnStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import {
  FLING_GAME_IN_APP_TUTORIAL_ID,
  PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
  TIMER_IN_APP_TUTORIAL_ID,
  CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
  HEALTH_BAR_IN_APP_TUTORIAL_ID,
  JOYSTICK_IN_APP_TUTORIAL_ID,
  OBJECT_3D_IN_APP_TUTORIAL_ID,
  isMiniTutorial,
} from '../../../../Utils/GDevelopServices/InAppTutorial';

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

const getGuidedLessonContent = ({
  learningKeys,
}: {
  learningKeys: React.Node[],
}) => (
  <>
    <Text>
      <Trans>You're about to start this guided lesson.</Trans>
    </Text>
    <Text>
      <Trans>In this tutorial you will learn:</Trans>
    </Text>
    {learningKeys.map((learningKey, index) => (
      <Text displayAsListItem noMargin key={index}>
        {learningKey}
      </Text>
    ))}
  </>
);

const titleAndContentByKey = {
  [FLING_GAME_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's make a Fling Game</Trans>,
    content: (
      <>
        <Text>
          <Trans>
            You're about to start the first chapter of this guided lesson.
          </Trans>
        </Text>
        <Text>
          <Trans>
            GDevelop will save your progress so you can take a break when you
            need it.
          </Trans>
        </Text>
      </>
    ),
  },
  [PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's improve a scoring system</Trans>,
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Making objects disappear or appear when colliding</Trans>,
        <Trans>Creating, modifying and accessing a scene variable</Trans>,
        <Trans>Updating a score accordingly</Trans>,
      ],
    }),
  },
  [TIMER_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's use time to measure a score</Trans>,
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Create and modify a text</Trans>,
        <Trans>Start a timer</Trans>,
        <Trans>Use the timer to display a score</Trans>,
      ],
    }),
  },
  [CAMERA_PARALLAX_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's improve the camera and the background</Trans>,
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Add a background with parallax effect</Trans>,
        <Trans>Add an extension</Trans>,
        <Trans>Use basic camera movements to follow the player</Trans>,
      ],
    }),
  },
  [HEALTH_BAR_IN_APP_TUTORIAL_ID]: {
    title: (
      <Trans>Let's communicate to the player the remaining health points</Trans>
    ),
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Use a prefab for a health bar</Trans>,
        <Trans>Update the health bar based on the player's health</Trans>,
      ],
    }),
  },
  [JOYSTICK_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's add mobile controls to our game</Trans>,
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Add a joystick prefab</Trans>,
        <Trans>Add a behavior</Trans>,
      ],
    }),
  },
  [OBJECT_3D_IN_APP_TUTORIAL_ID]: {
    title: <Trans>Let's add a 3D object to our game</Trans>,
    content: getGuidedLessonContent({
      learningKeys: [
        <Trans>Add a 3D Box</Trans>,
        <Trans>Add a behavior</Trans>,
      ],
    }),
  },
};

type Props = {|
  open: boolean,
  tutorialId: string,
  onClose: () => void,
  tutorialCompletionStatus: 'notStarted' | 'started' | 'complete',
  isProjectOpened?: boolean,
  isProjectOpening: boolean,
  startTutorial: (scenario: 'resume' | 'startOver' | 'start') => Promise<void>,
|};

const StartInAppTutorialDialog = ({
  open,
  tutorialId,
  onClose,
  tutorialCompletionStatus,
  isProjectOpened,
  startTutorial,
  isProjectOpening,
}: Props) => {
  const resumeTutorial = () => startTutorial('resume');
  const startOverTutorial = () => startTutorial('startOver');
  const startTutorialForFirstTime = () => startTutorial('start');

  const dialogContentByCompletionStatus = {
    notStarted: {
      title: titleAndContentByKey[tutorialId].title,
      content: titleAndContentByKey[tutorialId].content,
      primaryAction: {
        label: <Trans>Yes</Trans>,
        onClick: startTutorialForFirstTime,
      },
      secondaryAction: { label: <Trans>No</Trans>, onClick: onClose },
      tertiaryAction: null,
    },
    started: {
      title: <Trans>Welcome back!</Trans>,
      content: (
        <Text>
          <Trans>Let's finish your Fling Game, shall we?</Trans>
        </Text>
      ),
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
      content: (
        <>
          <Text>
            <Trans>You're about to restart this 3-chapter guided lesson.</Trans>
          </Text>
          <Text>
            <Trans>
              GDevelop will save your progress, so you can take a break if you
              need.
            </Trans>
          </Text>
        </>
      ),
      primaryAction: { label: <Trans>Yes</Trans>, onClick: startOverTutorial },
      secondaryAction: { label: <Trans>No</Trans>, onClick: onClose },
      tertiaryAction: null,
    },
  };

  const dialogContent =
    dialogContentByCompletionStatus[
      // Always show the "not started" dialog for the mini tutorials.
      isMiniTutorial(tutorialId) ? 'notStarted' : tutorialCompletionStatus
    ];
  const {
    title,
    content,
    primaryAction,
    secondaryAction,
    tertiaryAction,
  } = dialogContent;

  const actions = [
    <FlatButton
      key="close"
      label={secondaryAction.label}
      onClick={secondaryAction.onClick}
      disabled={isProjectOpening}
    />,
    <DialogPrimaryButton
      key="start"
      label={primaryAction.label}
      primary
      onClick={primaryAction.onClick}
      disabled={isProjectOpening}
    />,
  ];
  const secondaryActions = tertiaryAction
    ? [
        <FlatButton
          key="other"
          label={tertiaryAction.label}
          onClick={tertiaryAction.onClick}
          disabled={isProjectOpening}
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
      cannotBeDismissed
    >
      <ColumnStackLayout noMargin>
        <Line alignItems="center" justifyContent="center" noMargin>
          <div style={styles.imgContainer}>
            <img alt="hero" src="res/hero.png" width={48} height={48} />
          </div>
        </Line>
        {content}
        <Text>
          <Trans>Are you ready?</Trans>
        </Text>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default StartInAppTutorialDialog;
