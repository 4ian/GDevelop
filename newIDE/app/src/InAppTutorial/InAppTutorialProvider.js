// @flow
import * as React from 'react';
import { useDebounce } from '../Utils/UseDebounce';
import { useInterval } from '../Utils/UseInterval';
import InAppTutorialContext, {
  type InAppTutorial,
  type InAppTutorialFlowStep,
  type InAppTutorialFlowStepTrigger,
  type EditorIdentifier,
} from './InAppTutorialContext';
import InAppTutorialStepDisplayer from './InAppTutorialStepDisplayer';
type Props = {| children: React.Node |};

const inAppTutorial: InAppTutorial = {
  editorSwitches: {
    ClickOnNewObjectButton1: 'Scene',
    ClickOnNewEvent: 'EventsSheet',
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
        title:
          "Let's now add another **object** that {firstObject} can collect!",
      },
    },
    {
      id: 'OpenAssetTab2',
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
      id: 'ClickOnSearchBar2',
      elementToHighlightId: '#asset-store-search-bar',
      nextStepTrigger: { elementIsFilled: true },
      tooltip: {
        description: 'Search for “coin” (or a potion, food, ...).',
      },
      isOnClosableDialog: true,
      shortcuts: [
        {
          stepId: 'CloseAssetStore2',
          trigger: { presenceOfElement: '#object-item-1' },
        },
      ],
    },
    {
      id: 'WaitForUserToSelectAsset2',
      nextStepTrigger: { presenceOfElement: '#add-asset-button' },
      isOnClosableDialog: true,
    },
    {
      id: 'AddAsset2',
      elementToHighlightId: '#add-asset-button',
      isTriggerFlickering: true,
      nextStepTrigger: { presenceOfElement: '#object-item-1' },
      mapProjectData: {
        secondObject: 'lastProjectObjectName',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseAssetStore2',
      elementToHighlightId: '#new-object-dialog #close-button',
      nextStepTrigger: { absenceOfElement: '#new-object-dialog' },
      tooltip: {
        description:
          "Great! Our game now has 2 **objects**, let's see what we can do with them.",
      },
    },
    {
      id: 'DragObjectToScene',
      elementToHighlightId: '#object-item-1',
      nextStepTrigger: { instanceDraggedOnScene: 'secondObject' },
      tooltip: {
        description:
          'Place a few {secondObject} in the scene by dragging them to the canvas.',
        placement: 'left',
      },
    },
    {
      id: 'SwitchToEventsSheet',
      elementToHighlightId: '[id^=tab-layout-events]',
      nextStepTrigger: { presenceOfElement: '#add-event-button' },
      tooltip: {
        description:
          "Now let's make {firstObject} collect the {secondObject}! Go to the **events** tab of the **scene**.",
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewEvent',
      elementToHighlightId: '#add-event-button',
      nextStepTrigger: { presenceOfElement: '#add-condition-button' },
      tooltip: {
        title: 'Let’s add an **event**!',
        description: '👉 **Events** are the logic to your game.',
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewCondition',
      elementToHighlightId: '#add-condition-button',
      nextStepTrigger: { presenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description:
          '**Events** are made of a condition and an action:\n\nCondition: "**If** {firstObject} touches the {secondObject}..."\n\nAction: "... **then** the {secondObject} disappears"\n\n**Click "Add condition**"',
        placement: 'bottom',
      },
    },
    {
      id: 'ChooseObject',
      elementToHighlightId: '#instruction-editor-dialog #object-item-0',
      nextStepTrigger: { presenceOfElement: '#object-instruction-selector' },
      tooltip: {
        description: 'Choose {firstObject}',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'ChooseCondition',
      elementToHighlightId: '#instruction-item-CollisionNP',
      nextStepTrigger: {
        presenceOfElement: '#instruction-parameters-container',
      },
      tooltip: {
        description: 'Then the condition we want to use: **"Collision"**.',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'SetParameter',
      elementToHighlightId: '#parameter-1-object-selector',
      nextStepTrigger: { elementIsFilled: true },
      tooltip: {
        description: 'Finally, select the target **object** ({secondObject}).',
        placement: 'top',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseInstructionEditor',
      elementToHighlightId: '#instruction-editor-dialog #ok-button',
      nextStepTrigger: { absenceOfElement: '#instruction-editor-dialog' },
    },
    {
      id: 'ClickOnNewAction',
      elementToHighlightId: '#add-action-button',
      nextStepTrigger: { presenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description:
          "Let's add **what happens when the condition is met**: make {secondObject} disappear.",
        placement: 'bottom',
      },
    },
    {
      id: 'ChooseObject2',
      elementToHighlightId: '#instruction-editor-dialog #object-item-1',
      nextStepTrigger: { presenceOfElement: '#object-instruction-selector' },
      tooltip: {
        description: 'Choose {secondObject}',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'ChooseAction',
      elementToHighlightId: '#instruction-item-Delete',
      nextStepTrigger: {
        presenceOfElement: '#instruction-parameters-container',
      },
      tooltip: {
        description:
          'Then choose the **action** {secondObject} will receive : "Delete", as we want to remove it.',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseInstructionEditor2',
      elementToHighlightId: '#instruction-editor-dialog #ok-button',
      nextStepTrigger: { absenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description: 'Nothing more is needed!',
        placement: 'top',
      },
    },
    {
      id: 'LaunchPreview2',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: { previewLaunched: true },
      tooltip: {
        title: "Let's see how it works! 🎮",
        placement: 'bottom',
      },
    },
    {
      id: 'WaitForUserToHavePlayed2',
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

const isStepDone = (
  nextStepTrigger?: ?InAppTutorialFlowStepTrigger
): boolean => {
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

const gatherProjectData = ({
  flow,
  startIndex,
  endIndex,
  data,
  project,
}: {
  flow: Array<InAppTutorialFlowStep>,
  startIndex: number,
  endIndex: number,
  data: { [key: string]: string },
  project: ?gdProject,
}): { [key: string]: string } => {
  if (!project) return data;

  let newData = { ...data };
  for (let index = startIndex; index <= endIndex; index++) {
    const { mapProjectData } = flow[index];

    if (mapProjectData) {
      Object.entries(mapProjectData).forEach(([key, dataAccessor]) => {
        if (dataAccessor === 'lastProjectObjectName') {
          if (!project || project.getLayoutsCount() === 0) return;
          const layout = project.getLayoutAt(0);
          const layoutObjectsCount = layout.getObjectsCount();
          if (layoutObjectsCount === 0) {
            throw new Error(
              `No object was found in layer after step ${index} of flow`
            );
          }
          newData[key] = layout
            .getObjectAt(layout.getObjectsCount() - 1)
            .getName();
        }
      });
    }
  }
  return newData;
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

  const goToStep = React.useCallback((stepIndex: number) => {
    // TODO: Better handle end of flow
    if (!flow[stepIndex]) return;
    let nextStepIndex = stepIndex;

    // Check if we can go directly to next mandatory (not-skippable) step.
    while (flow[nextStepIndex].skippable && nextStepIndex < flow.length - 1) {
      if (isStepDone(flow[nextStepIndex].nextStepTrigger)) nextStepIndex += 1;
      else break;
    }

    setCurrentStepIndex(nextStepIndex);
  }, []);

  const watchDomForNextStepTrigger = React.useCallback(
    () => {
      console.log('MUTATION');
      // Find the next mandatory (not-skippable) step (It can be the current step).
      let indexOfNextMandatoryStep = currentStepIndex;
      // TODO: Better handle end of flow
      if (!flow[indexOfNextMandatoryStep]) return;
      while (flow[indexOfNextMandatoryStep].skippable) {
        indexOfNextMandatoryStep += 1;
      }

      let shouldGoToStepAtIndex: number | null = null;
      // Browse skippable steps in reverse orders to directly go to the
      // furthest step if possible.
      for (
        let stepIndex = indexOfNextMandatoryStep;
        stepIndex >= currentStepIndex;
        stepIndex--
      ) {
        const isThisStepAlreadyDone = isStepDone(
          flow[stepIndex].nextStepTrigger
        );
        if (isThisStepAlreadyDone) {
          shouldGoToStepAtIndex = stepIndex + 1;
          break;
        }
      }
      if (shouldGoToStepAtIndex === null) {
        // No trigger has been detected for the next mandatory step or the in-between
        // skippable steps.
        // Let's now check that, if there's a shortcut, it may have been triggered.
        const { shortcuts } = flow[currentStepIndex];
        if (!shortcuts) return;
        for (let shortcutStep of shortcuts) {
          // Find the first shortcut in the list that can be triggered.
          if (isStepDone(shortcutStep.trigger)) {
            shouldGoToStepAtIndex = flow.findIndex(
              step => step.id === shortcutStep.stepId
            );
            if (shouldGoToStepAtIndex < 0) {
              console.warn(
                `Step with id ${
                  shortcutStep.stepId
                } could not be found. Shortcut not taken.`
              );
              return;
            }
            break;
          }
        }
      }

      // If a change of step is going to happen, first record the data for
      // all the steps that are about to be closed.
      const newData = gatherProjectData({
        flow,
        startIndex: currentStepIndex,
        // $FlowFixMe - shouldGoToStepAtIndex cannot be null at this point.
        endIndex: shouldGoToStepAtIndex - 1,
        data,
        project,
      });

      setData(newData);

      // $FlowFixMe - shouldGoToStepAtIndex cannot be null at this point.
      goToStep(shouldGoToStepAtIndex);
    },
    [currentStepIndex, project, goToStep, data]
  );

  const handleDomMutation = useDebounce(watchDomForNextStepTrigger, 200);

  const onPreviewLaunch = () => {
    if (!currentStep) return;
    const { nextStepTrigger } = currentStep;
    if (nextStepTrigger && nextStepTrigger.previewLaunched) {
      goToStep(currentStepIndex + 1);
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
      const { id, isOnClosableDialog } = flow[currentStepIndex];
      if (id && inAppTutorial.editorSwitches.hasOwnProperty(id)) {
        setExpectedEditor(inAppTutorial.editorSwitches[id]);
      }
      if (!isOnClosableDialog) {
        currentStepFallbackStepIndex.current = currentStepIndex;
      }
      // At each step start, reset change watching logics.
      setWatchElementInputValue(null);
      setWatchSceneInstances(null);
    },
    [currentStepIndex]
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
        goToStep(currentStepIndex + 1);
      }
    },
    [currentStepIndex, goToStep, watchElementInputValue]
  );

  const watchSceneInstanceChanges = React.useCallback(
    () => {
      if (!watchSceneInstances) return;
      if (!project || project.getLayoutsCount() === 0) return;
      const layout = project.getLayoutAt(0);
      const instances = layout.getInitialInstances();
      if (instances.hasInstancesOfObject(watchSceneInstances)) {
        goToStep(currentStepIndex + 1);
      }
    },
    [project, currentStepIndex, goToStep, watchSceneInstances]
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
