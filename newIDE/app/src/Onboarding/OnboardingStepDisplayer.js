// @flow
import React from 'react';
import { type OnboardingFlowStep } from './OnboardingContext';
import OnboardingElementHighlighter from './OnboardingElementHighlighter';

type Props = {|
  step: OnboardingFlowStep,
|};

function OnboardingStepDisplayer({ step }: Props) {
  return (
    <>
      {step.elementToHighlightId && (
        <OnboardingElementHighlighter elementId={step.elementToHighlightId} />
      )}
    </>
  );
}

export default OnboardingStepDisplayer;
