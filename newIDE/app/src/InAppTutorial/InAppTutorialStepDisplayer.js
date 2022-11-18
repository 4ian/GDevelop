// @flow
import React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { useInterval } from '../Utils/UseInterval';
import { getElementAncestry } from './HTMLUtils';
import {
  type InAppTutorialFlowFormattedStep,
  type InAppTutorialFormattedTooltip,
  type EditorIdentifier,
} from './InAppTutorialContext';
import InAppTutorialElementHighlighter from './InAppTutorialElementHighlighter';
import InAppTutorialTooltipDisplayer from './InAppTutorialTooltipDisplayer';
import { isElementADialog } from '../UI/MaterialUISpecificUtil';

const styles = {
  avatarContainer: {
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
  link: { cursor: 'pointer' },
  avatarImage: { cursor: 'pointer' },
};

const ELEMENT_QUERY_FREQUENCY = 500;
const HIDE_QUERY_FREQUENCY = 1000;

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

const isThereAnOpenDialogInTheFollowingSiblings = (
  element: Element
): boolean => {
  let nextElement = element.nextElementSibling;
  while (nextElement) {
    if (isElementADialog(nextElement, { isVisible: true })) {
      return true;
    } else {
      nextElement = nextElement.nextElementSibling;
    }
  }
  return false;
};

const getWrongEditorTooltip = (
  i18n: I18nType,
  expectedEditor: {| editor: EditorIdentifier, scene?: string |} | null
): InAppTutorialFormattedTooltip | null => {
  if (!expectedEditor) return null;
  // TODO: handle external event, external layout, resources and extension editors
  const translatedExpectedEditor =
    expectedEditor.editor === 'Scene'
      ? i18n._(t`the scene editor`)
      : expectedEditor.editor === 'Home'
      ? i18n._(t`the home page`)
      : i18n._(t`the events sheet`);

  const sceneMention = expectedEditor.scene
    ? ` for scene "${expectedEditor.scene}"`
    : '';

  return {
    title: i18n._(t`You're leaving the game tutorial`),
    placement: 'top',
    description: i18n._(
      t`Go back to ${translatedExpectedEditor}${sceneMention} to keep creating your game.`
    ),
  };
};

type Props = {|
  step: InAppTutorialFlowFormattedStep,
  expectedEditor: {| editor: EditorIdentifier, scene?: string |} | null,
  goToFallbackStep: () => void,
  endTutorial: () => void,
  progress: number,
  goToNextStep: () => void,
|};

function InAppTutorialStepDisplayer({
  step: { elementToHighlightId, tooltip, nextStepTrigger },
  expectedEditor,
  goToFallbackStep,
  endTutorial,
  progress,
  goToNextStep,
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
      if (isThereAnOpenDialogInTheFollowingSiblings(rootDialog)) {
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

  const renderHighlighter = () => {
    if (
      // hide highlighter if
      expectedEditor || // the user is on the wrong editor
      !elementToHighlight || // there's no element to highlight
      hideBehindOtherDialog // the element to highlight is on a dialog hidden behind another one
    )
      return null;
    return <InAppTutorialElementHighlighter element={elementToHighlight} />;
  };

  const renderTooltip = (i18n: I18nType) => {
    if (tooltip && !expectedEditor) {
      const anchorElement = tooltip.standalone
        ? assistantImage
        : elementToHighlight || null;
      if (!anchorElement) return null;
      return (
        <InAppTutorialTooltipDisplayer
          endTutorial={endTutorial}
          anchorElement={anchorElement}
          tooltip={tooltip}
          progress={progress}
          goToNextStep={goToNextStep}
          buttonLabel={
            nextStepTrigger && nextStepTrigger.clickOnTooltipButton
              ? nextStepTrigger.clickOnTooltipButton
              : undefined
          }
        />
      );
    }
    const wrongEditorTooltip = getWrongEditorTooltip(i18n, expectedEditor);
    if (wrongEditorTooltip && assistantImage) {
      return (
        <InAppTutorialTooltipDisplayer
          endTutorial={endTutorial}
          anchorElement={assistantImage}
          tooltip={wrongEditorTooltip}
          progress={progress}
          goToNextStep={goToNextStep}
        />
      );
    }
    return null;
  };

  return (
    <I18n>
      {({ i18n }) => {
        const displayRedHero =
          expectedEditor || (tooltip && tooltip.standalone);
        return (
          <>
            <div
              style={{
                ...styles.avatarContainer,
                visibility: displayRedHero ? 'visible' : 'hidden',
              }}
              ref={defineAssistantImage}
            >
              <img
                alt="GDevelop mascot red hero"
                src="res/hero60.png"
                width={60}
                height={60}
                style={styles.avatarImage}
              />
            </div>
            {renderHighlighter()}
            {renderTooltip(i18n)}
          </>
        );
      }}
    </I18n>
  );
}

export default InAppTutorialStepDisplayer;
