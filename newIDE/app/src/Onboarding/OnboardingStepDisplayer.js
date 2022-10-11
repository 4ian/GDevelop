// @flow
import React from 'react';
import { useInterval } from '../Utils/UseInterval';
import { type OnboardingFlowStep } from './OnboardingContext';
import OnboardingElementHighlighter from './OnboardingElementHighlighter';
import OnboardingTooltipDisplayer from './OnboardingTooltipDisplayer';

type Props = {|
  step: OnboardingFlowStep,
|};

const ELEMENT_QUERY_FREQUENCY = 500;

function OnboardingStepDisplayer({ step }: Props) {
  const [
    elementToHighlight,
    setElementToHighlight,
  ] = React.useState<?HTMLElement>(null);

  const { elementToHighlightId, tooltip } = step;

  // The element could disappear if the user closes a dialog for instance.
  // So we need to periodically query it.
  const queryElement = React.useCallback(
    () => {
      if (!elementToHighlightId) return;
      setElementToHighlight(document.querySelector(elementToHighlightId));
    },
    [elementToHighlightId]
  );
  useInterval(queryElement, ELEMENT_QUERY_FREQUENCY);

  React.useEffect(
    () => {
      setElementToHighlight(null);
    },
    [elementToHighlightId]
  );

  if (!elementToHighlight) return null;
  return (
    <>
      <OnboardingElementHighlighter element={elementToHighlight} />
      {tooltip && (
        <OnboardingTooltipDisplayer
          anchorElement={elementToHighlight}
          tooltip={tooltip}
        />
      )}
    </>
  );
}

export default OnboardingStepDisplayer;
