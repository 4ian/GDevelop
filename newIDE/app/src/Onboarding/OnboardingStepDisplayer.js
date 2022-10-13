// @flow
import React from 'react';
import { useInterval } from '../Utils/UseInterval';
import { getElementAncestry } from './HTMLUtils';
import { type OnboardingFlowStep } from './OnboardingContext';
import OnboardingElementHighlighter from './OnboardingElementHighlighter';
import OnboardingTooltipDisplayer from './OnboardingTooltipDisplayer';

type Props = {|
  step: OnboardingFlowStep,
|};

const ELEMENT_QUERY_FREQUENCY = 500;
const HIDE_QUERY_FREQUENCY = 1000;

const isElementADialog = (element: Element) =>
  element.tagName === 'DIV' && element.getAttribute('role') === 'presentation';

const getElementToHighlightRootDialog = (
  element: HTMLElement
): Element | null => {
  const elementAncestry = getElementAncestry(element, []);
  // Ancestry is starting from direct parent to furthest parent.
  for (
    let parentIndex = elementAncestry.length - 1;
    parentIndex >= 0;
    parentIndex--
  ) {
    const parent = elementAncestry[parentIndex];
    if (isElementADialog(parent)) {
      return parent;
    }
  }
  return null;
};

const isThereAnotherDialogInTheFollowingSiblings = (
  element: Element
): boolean => {
  let nextElement = element.nextElementSibling;
  while (nextElement) {
    if (isElementADialog(nextElement)) {
      return true;
    } else {
      nextElement = nextElement.nextElementSibling;
    }
  }
  return false;
};

function OnboardingStepDisplayer({ step }: Props) {
  const [
    elementToHighlight,
    setElementToHighlight,
  ] = React.useState<?HTMLElement>(null);
  const [
    hideBehindOtherDialog,
    setHideBehindOtherDialog,
  ] = React.useState<boolean>(false);
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

  // Material UI dialogs are displayed at z-index 1300 and out of the root
  // React element. So the highlighter and the tooltip visibility can only be
  // tuned via their z index.
  // When the element to highlight is on a dialog, the highlighter and
  // the tooltip must be at a similar yet higher z-index. But MUI handles
  // multiple dialogs by setting the latest opened dialog root html element
  // below the previous one. So the highlighter and the tooltip will be visible
  // through the latest dialog. So we have to "manually" hide them when we detect
  // the element to highlight is both on a dialog and that there's another dialog
  // opened above it.
  const hideIfBehindOtherDialog = React.useCallback(
    () => {
      if (!elementToHighlight) return;
      setHideBehindOtherDialog(false);
      const rootDialog = getElementToHighlightRootDialog(elementToHighlight);
      if (!rootDialog) {
        // if the element to highlight in not on a dialog, the highlighter
        // is on a z index close to element to highlight. So it will be hidden
        // behind a dialog if there's one, so no need to force-hide it.
        return;
      }
      if (isThereAnotherDialogInTheFollowingSiblings(rootDialog)) {
        setHideBehindOtherDialog(true);
      }
    },
    [elementToHighlight]
  );
  useInterval(hideIfBehindOtherDialog, HIDE_QUERY_FREQUENCY);

  React.useEffect(
    () => {
      setElementToHighlight(null);
      setHideBehindOtherDialog(false);
    },
    [elementToHighlightId]
  );

  if (!elementToHighlight || hideBehindOtherDialog) return null;
  return (
    <>
      <OnboardingElementHighlighter element={elementToHighlight} />
      {tooltip && (
        <OnboardingTooltipDisplayer
          anchorElement={elementToHighlight}
          tooltip={tooltip}
          buttonLabel={
            step.nextStepTrigger && step.nextStepTrigger.clickOnButton
              ? step.nextStepTrigger.clickOnButton
              : undefined
          }
        />
      )}
    </>
  );
}

export default OnboardingStepDisplayer;
