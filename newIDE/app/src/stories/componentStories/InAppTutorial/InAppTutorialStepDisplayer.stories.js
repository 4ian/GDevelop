// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import muiDecorator from '../../ThemeDecorator';
import InAppTutorialStepDisplayer from '../../../InAppTutorial/InAppTutorialStepDisplayer';

export default {
  title: 'In-app tutorial/InAppTutorialStepDisplayer',
  component: InAppTutorialStepDisplayer,
  decorators: [paperDecorator, muiDecorator],
};

export const WrongEditorInfo = () => {
  return (
    <>
      <div id="step-text">Test text</div>
      <InAppTutorialStepDisplayer
        step={{ elementToHighlightId: '#step-text' }}
        expectedEditor="Scene"
        goToFallbackStep={() => {}}
        endTutorial={() => action('end tutorial')()}
      />
    </>
  );
};
