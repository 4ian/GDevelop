// @flow
import React from 'react';
import { type OnboardingFlowStep } from './OnboardingContext';
import OnboardingElementHighlighter from './OnboardingElementHighlighter';

type Props = {|
  step: OnboardingFlowStep,
|};

const ELEMENT_QUERY_FREQUENCY = 500;

function OnboardingStepDisplayer({ step }: Props) {
  const [elementQueryCounter, setElementQueryCounter] = React.useState<number>(
    0
  );

  React.useEffect(
    () => {
      const timeout = setTimeout(
        () => setElementQueryCounter(elementQueryCounter + 1),
        ELEMENT_QUERY_FREQUENCY
      );
      return () => clearTimeout(timeout);
    },
    [elementQueryCounter]
  );
  let elementToHighlight;
  if (step.elementToHighlightId) {
    elementToHighlight = document.querySelector(step.elementToHighlightId);
  }

  return (
    <>
      {elementToHighlight && (
        <OnboardingElementHighlighter element={elementToHighlight} />
      )}
    </>
  );
}

export default OnboardingStepDisplayer;
