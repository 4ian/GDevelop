// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import muiDecorator from '../../ThemeDecorator';
import StartTutorialDialog from '../../../MainFrame/InAppTutorial/StartTutorialDialog';

export default {
  title: 'In-app tutorial/StartTutorialDialog',
  component: StartTutorialDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  return (
    <StartTutorialDialog
      open
      isTutorialAlreadyStarted={false}
      startTutorial={action('Start tutorial')}
      onClose={() => action('On close dialog')()}
    />
  );
};

export const WithTutorialAlreadyStarted = () => {
  return (
    <StartTutorialDialog
      open
      isTutorialAlreadyStarted={true}
      startTutorial={action('Start tutorial')}
      onClose={() => action('On close dialog')()}
    />
  );
};
