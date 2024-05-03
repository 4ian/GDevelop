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

export const Default = () => {
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

export const Opening = () => {
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

export const WithTutorialAlreadyStarted = () => {
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
export const WithTutorialCompleted = () => {
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
