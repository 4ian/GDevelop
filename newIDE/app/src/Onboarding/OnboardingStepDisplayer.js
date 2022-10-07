// @flow
import React from 'react';
import { type OnboardingFlowStep } from './OnboardingContext';
import OnboardingElementHighlighter from './OnboardingElementHighlighter';

type Props = {|
  step: OnboardingFlowStep,
|};

function OnboardingStepDisplayer({ step }: Props) {
  const elementToHighlight = document.querySelector(step.elementToHighlightId);

  return (
    <>
      {elementToHighlight && (
        <OnboardingElementHighlighter element={elementToHighlight} />
      )}
    </>
  );
}

export default OnboardingStepDisplayer;
