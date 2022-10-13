// @flow
import * as React from 'react';
import { useDebounce } from '../Utils/UseDebounce';
import { useInterval } from '../Utils/UseInterval';
import InAppTutorialContext, {
  type InAppTutorial,
  type InAppTutorialFlowStep,
  type EditorIdentifier,
} from './InAppTutorialContext';
import InAppTutorialStepDisplayer from './InAppTutorialStepDisplayer';
type Props = {| children: React.Node |};

const inAppTutorial: InAppTutorial = {
  editorSwitches: {
    ClickOnNewObjectButton1: 'Scene',
  },
  flow: [
    {
      id: 'ClickOnNewObjectButton1',
      elementToHighlightId: '#add-new-object-button',
      nextStepTrigger: { presenceOfElement: '#new-object-dialog' },
      tooltip: {
        placement: 'left',
        title: "Let's create an **object**",
        description:
          '👉 Everything you see in a game is an **object**: your character, the enemies, coins and potions, platforms or trees, ...',
      },
    },
    {
      id: 'OpenAssetTab',
      elementToHighlightId: '#asset-store-tab',
      nextStepTrigger: { presenceOfElement: '#asset-store' },
      tooltip: {
        description: "Let's choose an object from the asset store.",
        placement: 'bottom',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'ClickOnSearchBar',
      elementToHighlightId: '#asset-store-search-bar',
      nextStepTrigger: { elementIsFilled: true },
      tooltip: {
        title: 'Choose an asset to represent your main character!',
        description: 'Tip: search for “wizard”.',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'WaitForUserToSelectAsset',
      nextStepTrigger: { presenceOfElement: '#add-asset-button' },
      isOnClosableDialog: true,
    },
    {
      id: 'AddAsset',
      elementToHighlightId: '#add-asset-button',
      isTriggerFlickering: true,
      nextStepTrigger: { presenceOfElement: '#object-item-0' },
      tooltip: { description: 'Add this asset to your project.' },
      mapProjectData: {
        firstObject: 'lastProjectObjectName',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseAssetStore',
      elementToHighlightId: '#new-object-dialog #close-button',
      nextStepTrigger: { absenceOfElement: '#new-object-dialog' },
      tooltip: {
        description:
          "Great! Our game now has an **object**, let's see what we can do with it.",
      },
    },
    {
      id: 'DragObjectToScene',
      elementToHighlightId: '#object-item-0',
      nextStepTrigger: { instanceDraggedOnScene: 'firstObject' },
      tooltip: {
        description: 'Drag {firstObject} from the menu to the canvas.',
        placement: 'left',
      },
    },
    {
      id: 'OpenBehaviors',
      elementToHighlightId: '#object-item-0',
      nextStepTrigger: { presenceOfElement: '#object-editor-dialog' },
      tooltip: {
        title: "Let's make our character move! 🛹",
        description: 'Here, right-click on it and click “Edit **behaviors**”',
        placement: 'left',
      },
    },
    {
      id: 'OpenBehaviorTab',
      elementToHighlightId: '#behaviors-tab',
      nextStepTrigger: { presenceOfElement: '#add-behavior-button' },
      tooltip: {
        description: 'See the **behaviors** of your object here.',
        placement: 'bottom',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'AddBehavior',
      elementToHighlightId: '#add-behavior-button',
      nextStepTrigger: {
        presenceOfElement:
          '#behavior-item-TopDownMovementBehavior--TopDownMovementBehavior',
      },
      tooltip: {
        title: 'Let’s add a **behavior**!',
        description:
          '👉 Behaviors add features to objects in a matter of clicks. They are very powerful!',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'SelectTopDownBehavior',
      elementToHighlightId:
        '#behavior-item-TopDownMovementBehavior--TopDownMovementBehavior',
      nextStepTrigger: {
        presenceOfElement: '#behavior-parameters-TopDownMovement',
      },
      tooltip: {
        description: 'Add the "Top down movement" **behavior**.',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'ApplyBehavior',
      elementToHighlightId: '#object-editor-dialog #apply-button',
      nextStepTrigger: {
        absenceOfElement: '#object-editor-dialog',
      },
      tooltip: {
        description:
          "The parameters above help you customise the **behavior**, but let's ignore them for now.",
        placement: 'top',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'LaunchPreview1',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: { previewLaunched: true },
      tooltip: {
        title: "Let's play! 🎮",
        description:
          'Click on "**Preview**" and move your character with the **arrow keys**!',
        placement: 'bottom',
      },
    },
    {
      id: 'WaitForUserToHavePlayed',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: {
        clickOnButton: "I'm done",
      },
      tooltip: {
        description:
          "Once you're done testing, close the **preview** and come back here.",
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewObjectButton2',
      elementToHighlightId: '#add-new-object-button',
      nextStepTrigger: { presenceOfElement: '#new-object-dialog' },
      tooltip: {
        placement: 'left',
        title: "Let's now add another **object** that {firstObject} can collect!",
      },
    },
  ],
};
const { flow } = inAppTutorial;

const interpolateText = (text?: string, data: { [key: string]: string }) => {
  if (!text) return undefined;
  const placeholderReplacingRegex = /{(\w+)}/g;
  const match = text.matchAll(placeholderReplacingRegex);
  let formattedText = text;
  [...match].forEach(match => {
    const keyWithBrackets = match[0];
    const key = match[1];
    if (Object.keys(data).includes(key)) {
      formattedText = formattedText.replace(keyWithBrackets, data[key]);
    }
  });
  return formattedText;
};

const isStepDone = (step: InAppTutorialFlowStep): boolean => {
  const { nextStepTrigger } = step;
  if (!nextStepTrigger) return false;
  if (
    nextStepTrigger.presenceOfElement &&
    document.querySelector(nextStepTrigger.presenceOfElement)
  ) {
    return true;
  } else if (
    nextStepTrigger.absenceOfElement &&
    !document.querySelector(nextStepTrigger.absenceOfElement)
  ) {
    return true;
  }
  return false;
};

const InAppTutorialProvider = (props: Props) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [project, setProject] = React.useState<?gdProject>(null);
  const [data, setData] = React.useState<{ [key: string]: string }>({});
  const currentStepFallbackStepIndex = React.useRef<number>(0);
  const [
    expectedEditor,
    setExpectedEditor,
  ] = React.useState<EditorIdentifier | null>(null);
  const [
    currentEditor,
    setCurrentEditor,
  ] = React.useState<EditorIdentifier | null>(null);
  const [
    watchElementInputValue,
    setWatchElementInputValue,
  ] = React.useState<?string>(null);
  const [watchSceneInstances, setWatchSceneInstances] = React.useState<?string>(
    null
  );
  const domObserverRef = React.useRef<?MutationObserver>(null);

  const currentStep = flow[currentStepIndex];
  const { isTriggerFlickering } = currentStep;

  const watchDomForNextStepTrigger = React.useCallback(
    () => {
      console.log('MUTATION');
      // Find the next mandatory (not-skippable) step (It can be the current step).
      let indexOfNextMandatoryStep = currentStepIndex;
      while (flow[indexOfNextMandatoryStep].skippable) {
        indexOfNextMandatoryStep += 1;
      }

      let shouldGoToStepAtIndex = undefined;
      // Browse skippable steps in reverse orders to directly go to the
      // furthest step if possible.
      for (
        let stepIndex = indexOfNextMandatoryStep;
        stepIndex >= currentStepIndex;
        stepIndex--
      ) {
        const isThisStepAlreadyDone = isStepDone(flow[stepIndex]);
        if (isThisStepAlreadyDone) {
          shouldGoToStepAtIndex = stepIndex + 1;
          break;
        }
      }
      if (shouldGoToStepAtIndex === undefined) return;

      // If a change of step is going to happen, first record the data for
      // the current step that is about to be closed.
      const { mapProjectData } = flow[currentStepIndex];

      if (mapProjectData) {
        Object.entries(mapProjectData).forEach(([key, dataAccessor]) => {
          if (dataAccessor === 'lastProjectObjectName') {
            if (!project || project.getLayoutsCount() === 0) return;
            const layout = project.getLayoutAt(0);
            const layoutObjectsCount = layout.getObjectsCount();
            if (layoutObjectsCount === 0) {
              throw new Error(
                `No object was found in layer after step ${currentStepIndex} of flow`
              );
            }
            setData(currentData => ({
              ...currentData,
              [key]: layout.getObjectAt(layout.getObjectsCount() - 1).getName(),
            }));
          }
        });
      }

      // Check if we can go directly to next mandatory (not-skippable) step.
      let nextStepIndex = currentStepIndex + 1;
      while (flow[nextStepIndex].skippable && nextStepIndex < flow.length - 1) {
        if (isStepDone(flow[nextStepIndex])) nextStepIndex += 1;
        else break;
      }

      // Change step
      setCurrentStepIndex(nextStepIndex);
    },
    [currentStepIndex, project]
  );

  const handleDomMutation = useDebounce(watchDomForNextStepTrigger, 200);

  const onPreviewLaunch = () => {
    if (!currentStep) return;
    const { nextStepTrigger } = currentStep;
    if (nextStepTrigger && nextStepTrigger.previewLaunched) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  React.useEffect(
    () => {
      const appContainer = document.querySelector('body');
      if (!appContainer) return;
      const observer = new MutationObserver(handleDomMutation);
      observer.observe(appContainer, {
        childList: true,
        attributes: true,
        subtree: true,
        characterData: true,
      });
      domObserverRef.current = observer;
      return () => {
        if (domObserverRef.current) {
          domObserverRef.current.disconnect();
          domObserverRef.current = null;
        }
      };
    },
    [handleDomMutation]
  );

  React.useEffect(
    () => {
      if (!currentStep) return;
      const { nextStepTrigger, elementToHighlightId } = currentStep;
      if (nextStepTrigger && nextStepTrigger.elementIsFilled) {
        if (!elementToHighlightId) return;
        setWatchElementInputValue(elementToHighlightId);
      } else if (nextStepTrigger && nextStepTrigger.instanceDraggedOnScene) {
        const objectKey = nextStepTrigger.instanceDraggedOnScene;
        const objectName = data[objectKey];
        if (!objectName) return;
        setWatchSceneInstances(objectName);
      }
    },
    [currentStep, data]
  );

  React.useEffect(
    () => {
      const { id, isOnClosableDialog } = flow[currentStepIndex];
      if (id && inAppTutorial.editorSwitches.hasOwnProperty(id)) {
        setExpectedEditor(inAppTutorial.editorSwitches[id]);
      }
      if (!isOnClosableDialog) {
        currentStepFallbackStepIndex.current = currentStepIndex;
      }
    },
    [currentStepIndex]
  );

  const watchInputBeingFilled = React.useCallback(
    () => {
      if (!watchElementInputValue) return;
      const elementToWatch = document.querySelector(watchElementInputValue);

      if (
        elementToWatch &&
        // Flow errors on missing value prop in generic type HTMLElement but this
        // line cannot break.
        // $FlowFixMe
        elementToWatch.value
      ) {
        setCurrentStepIndex(currentStepIndex + 1);
        setWatchElementInputValue(null);
      }
    },
    [currentStepIndex, watchElementInputValue]
  );

  const watchSceneInstanceChanges = React.useCallback(
    () => {
      if (!watchSceneInstances) return;
      if (!project || project.getLayoutsCount() === 0) return;
      const layout = project.getLayoutAt(0);
      const instances = layout.getInitialInstances();
      if (instances.hasInstancesOfObject(watchSceneInstances)) {
        setCurrentStepIndex(currentStepIndex + 1);
        setWatchSceneInstances(null);
      }
    },
    [project, currentStepIndex, watchSceneInstances]
  );

  useInterval(watchInputBeingFilled, watchElementInputValue ? 1000 : null);
  useInterval(watchSceneInstanceChanges, watchSceneInstances ? 500 : null);
  useInterval(watchDomForNextStepTrigger, isTriggerFlickering ? 500 : null);

  console.log(currentStepIndex);

  const stepTooltip = flow[currentStepIndex].tooltip;
  const formattedStep: InAppTutorialFlowStep = {
    ...flow[currentStepIndex],
    tooltip: stepTooltip
      ? {
          ...stepTooltip,
          title: interpolateText(stepTooltip.title, data),
          description: interpolateText(stepTooltip.description, data),
        }
      : undefined,
  };

  const isWrongEditorOpened = currentEditor !== expectedEditor;

  return (
    <InAppTutorialContext.Provider
      value={{
        flow: null,
        currentStep: formattedStep,
        setProject,
        setCurrentEditor,
        goToNextStep: () => setCurrentStepIndex(currentStepIndex + 1),
        onPreviewLaunch,
      }}
    >
      {props.children}
      <InAppTutorialStepDisplayer
        step={formattedStep}
        expectedEditor={isWrongEditorOpened ? expectedEditor : null}
        goToFallbackStep={() => {
          setCurrentStepIndex(currentStepFallbackStepIndex.current);
        }}
      />
    </InAppTutorialContext.Provider>
  );
};

export default InAppTutorialProvider;
