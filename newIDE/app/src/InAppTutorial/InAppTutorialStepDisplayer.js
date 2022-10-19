// @flow
import React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { useInterval } from '../Utils/UseInterval';
import { getElementAncestry } from './HTMLUtils';
import {
  type InAppTutorialFlowFormattedStep,
  type EditorIdentifier,
} from './InAppTutorialContext';
import InAppTutorialElementHighlighter from './InAppTutorialElementHighlighter';
import InAppTutorialTooltipDisplayer from './InAppTutorialTooltipDisplayer';

type Props = {|
  step: InAppTutorialFlowFormattedStep,
  expectedEditor: EditorIdentifier | null,
  goToFallbackStep: () => void,
|};

const styles = {
  redHeroImage: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    zIndex: 5, // Scene editor mosaic z-index is 4
    display: 'flex',
    visibility: 'hidden',
    boxShadow:
      '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)', // Same as used by Material UI for the Paper component
    borderRadius: 30,
  },
};

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

function InAppTutorialStepDisplayer({
  step: { elementToHighlightId, tooltip, nextStepTrigger },
  expectedEditor,
  goToFallbackStep,
}: Props) {
  const [
    elementToHighlight,
    setElementToHighlight,
  ] = React.useState<?HTMLElement>(null);
  const [
    hideBehindOtherDialog,
    setHideBehindOtherDialog,
  ] = React.useState<boolean>(false);
  const [assistantImage, setAssistantImage] = React.useState<?HTMLDivElement>(
    null
  );

  const defineAssistantImage = React.useCallback(node => {
    if (node) {
      setAssistantImage(node);
    }
  }, []);

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

  React.useEffect(
    () => {
      // If the element is missing and we are on the right editor, go back
      // to fallback step after a delay.
      if (elementToHighlightId && !elementToHighlight && !expectedEditor) {
        const timeoutId = setTimeout(goToFallbackStep, 1000);
        return () => clearTimeout(timeoutId);
      }
    },
    [elementToHighlightId, elementToHighlight, goToFallbackStep, expectedEditor]
  );

  const getWrongEditorTooltip = (i18n: I18nType) => {
    if (!expectedEditor) return null;
    const translatedExpectedEditor =
      expectedEditor === 'Scene'
        ? i18n._(t`the scene editor`)
        : expectedEditor === 'Home'
        ? i18n._(t`the home page`)
        : i18n._(t`the events sheet`);
    return {
      title: i18n._(t`Oops, it looks like you're lost!`),
      description: i18n._(
        t`Go back to ${translatedExpectedEditor} using the tabs at the top of the editor`
      ),
      placement: 'top',
    };
  };

  if (!elementToHighlight || hideBehindOtherDialog) return null;

  return (
    <I18n>
      {({ i18n }) => {
        const wrongEditorTooltip = getWrongEditorTooltip(i18n);
        return (
          <>
            <div
              style={{
                ...styles.redHeroImage,
                visibility: wrongEditorTooltip ? 'visible' : 'hidden',
              }}
              ref={defineAssistantImage}
            >
              <img
                alt="GDevelop mascot red hero"
                src="res/hero60.png"
                width={60}
                height={60}
              />
            </div>
            {!wrongEditorTooltip && (
              <InAppTutorialElementHighlighter element={elementToHighlight} />
            )}
            {tooltip && !wrongEditorTooltip && (
              <InAppTutorialTooltipDisplayer
                anchorElement={elementToHighlight}
                tooltip={tooltip}
                buttonLabel={
                  nextStepTrigger && nextStepTrigger.clickOnButton
                    ? nextStepTrigger.clickOnButton
                    : undefined
                }
              />
            )}
            {wrongEditorTooltip && assistantImage && (
              <InAppTutorialTooltipDisplayer
                anchorElement={assistantImage}
                tooltip={wrongEditorTooltip}
              />
            )}
          </>
        );
      }}
    </I18n>
  );
}

export default InAppTutorialStepDisplayer;
