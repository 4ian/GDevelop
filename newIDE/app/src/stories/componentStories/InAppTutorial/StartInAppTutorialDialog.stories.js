// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import StartInAppTutorialDialog from '../../../MainFrame/EditorContainers/HomePage/InAppTutorials/StartInAppTutorialDialog';
import inAppTutorialDecorator from '../../InAppTutorialDecorator';

export default {
  title: 'In-app tutorial/StartInAppTutorialDialog',
  component: StartInAppTutorialDialog,
  decorators: [inAppTutorialDecorator, paperDecorator],
};

export const MultichapterTutorial = (): renders any => {
  return (
    <StartInAppTutorialDialog
      open
      tutorialId="flingGame"
      tutorialCompletionStatus={'notStarted'}
      startTutorial={action('Start tutorial')}
      onClose={() => action('On close dialog')()}
      isProjectOpening={false}
    />
  );
};

export const Default = (): renders any => {
  return (
    <StartInAppTutorialDialog
      open
      tutorialId="joystick"
      tutorialCompletionStatus={'notStarted'}
      startTutorial={action('Start tutorial')}
      onClose={() => action('On close dialog')()}
      isProjectOpening={false}
    />
  );
};

export const Opening = (): renders any => {
  return (
    <StartInAppTutorialDialog
      open
      tutorialId="flingGame"
      tutorialCompletionStatus={'notStarted'}
      startTutorial={action('Start tutorial')}
      onClose={() => action('On close dialog')()}
      isProjectOpening
    />
  );
};

export const WithTutorialAlreadyStarted = (): renders any => {
  return (
    <StartInAppTutorialDialog
      open
      tutorialId="flingGame"
      tutorialCompletionStatus={'started'}
      startTutorial={action('Start tutorial')}
      onClose={() => action('On close dialog')()}
      isProjectOpening={false}
    />
  );
};
export const WithTutorialCompleted = (): renders any => {
  return (
    <StartInAppTutorialDialog
      open
      tutorialId="flingGame"
      tutorialCompletionStatus={'complete'}
      startTutorial={action('Start tutorial')}
      onClose={() => action('On close dialog')()}
      isProjectOpening={false}
    />
  );
};
