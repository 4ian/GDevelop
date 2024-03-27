// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import InAppTutorialStepDisplayer from '../../../InAppTutorial/InAppTutorialStepDisplayer';

export default {
  title: 'In-app tutorial/InAppTutorialStepDisplayer',
  component: InAppTutorialStepDisplayer,
  decorators: [paperDecorator],
};

export const WrongEditorInfo = () => {
  return (
    <>
      <div id="step-text">Test text</div>
      <InAppTutorialStepDisplayer
        progress={28}
        step={{ elementToHighlightId: '#step-text' }}
        expectedEditor={{ editor: 'Scene' }}
        goToFallbackStep={() => {}}
        endTutorial={() => action('end tutorial')()}
        goToNextStep={() => action('go to next step')()}
      />
    </>
  );
};

export const WrongEditorInfoWithSceneName = () => {
  return (
    <>
      <div id="step-text">Test text</div>
      <InAppTutorialStepDisplayer
        progress={28}
        step={{ elementToHighlightId: '#step-text' }}
        expectedEditor={{ editor: 'Scene', scene: 'Homescreen' }}
        goToFallbackStep={() => {}}
        endTutorial={() => action('end tutorial')()}
        goToNextStep={() => action('go to next step')()}
      />
    </>
  );
};

export const StandaloneTooltip = () => {
  return (
    <>
      <div id="step-text">Test text</div>
      <InAppTutorialStepDisplayer
        step={{
          tooltip: {
            standalone: true,
            description:
              'This is a standalone tooltip description with an image (data url)',
            image: {
              dataUrl:
                'data:image/png;base64,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',
              width: '50%',
            },
          },
        }}
        progress={28}
        expectedEditor={null}
        goToFallbackStep={() => {}}
        endTutorial={() => action('end tutorial')()}
        goToNextStep={() => action('go to next step')()}
      />
    </>
  );
};
