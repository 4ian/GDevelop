// @flow
import * as React from 'react';
import { useDebounce } from '../Utils/UseDebounce';
import { useInterval } from '../Utils/UseInterval';
import OnboardingContext, {
  type OnboardingFlowStep,
} from './OnboardingContext';
type Props = {| children: React.Node |};

const flow: Array<OnboardingFlowStep> = [
  {
    id: 'ClickOnNewObjectButton',
    elementToHighlightId: '#add-new-object-button',
    nextStepTrigger: { presenceOfElement: '#new-object-dialog' },
    tooltip: { content: "let's create an object", placement: 'left' },
  },
  {
    id: 'ClickOnSearchBar',
    elementToHighlightId: '#asset-store-search-bar',
    nextStepTrigger: { elementIsFilled: true },
    tooltip: { content: 'Search an object' },
  },
  {
    id: 'WaitForUserToSelectAsset',
    nextStepTrigger: { presenceOfElement: '#add-asset-button' },
  },
  {
    id: 'AddAsset',
    elementToHighlightId: '#add-asset-button',
    isTriggerFlickering: true,
    nextStepTrigger: { presenceOfElement: '#object-item-0' },
    tooltip: { content: 'Add this asset to your project' },
    mapProjectData: {
      firstObject: 'lastProjectObjectName',
    },
  },
  {
    id: 'CloseAssetStore',
    elementToHighlightId: '#new-object-dialog #close-button',
    nextStepTrigger: { absenceOfElement: '#new-object-dialog' },
    tooltip: { content: "Alright, let's close this now" },
  },
  {
    id: 'DragObjectToScene',
    elementToHighlightId: '#object-item-0',
    nextStepTrigger: { instanceDraggedOnScene: 'firstObject' },
    tooltip: {
      content: 'Now drag {firstObject} to the scene',
      placement: 'left',
    },
  },
  {
    id: 'OpenBehaviors',
    elementToHighlightId: '#object-item-0',
    nextStepTrigger: { presenceOfElement: '#object-editor-dialog' },
    tooltip: {
      content: 'Here, right-click on it and click “Edit behaviors”',
      placement: 'left',
    },
  },
  {
    id: 'OpenBehaviorTab',
    elementToHighlightId: '#behaviors-tab',
    nextStepTrigger: { presenceOfElement: '#add-behavior-button' },
    tooltip: {
      content: 'See the behaviors of your object here.',
      placement: 'bottom',
    },
  },
  {
    id: 'AddBehavior',
    elementToHighlightId: '#add-behavior-button',
    nextStepTrigger: {
      presenceOfElement:
        '#behavior-item-TopDownMovementBehavior--TopDownMovementBehavior',
    },
    tooltip: {
      content: 'Let’s add a behavior!',
      placement: 'bottom',
    },
  },
  {
    id: 'SelectTopDownBehavior',
    elementToHighlightId:
      '#behavior-item-TopDownMovementBehavior--TopDownMovementBehavior',
    nextStepTrigger: {
      presenceOfElement: '#behavior-parameters-TopDownMovement',
    },
    tooltip: {
      content: 'Add the "Top down movement" behavior.',
      placement: 'bottom',
    },
  },
  {
    id: 'ApplyBehavior',
    elementToHighlightId: '#object-editor-dialog #apply-button',
    nextStepTrigger: {
      presenceOfElement: '#object-item-1',
    },
    tooltip: {
      content:
        "The parameters above help you customise the behavior, but let's ignore them for now.",
      placement: 'top',
    },
  },
];

const interpolateText = (text: string, data: { [key: string]: string }) => {
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

const OnboardingProvider = (props: Props) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [project, setProject] = React.useState<?gdProject>(null);
  const [data, setData] = React.useState<{ [key: string]: string }>({});
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
      const { nextStepTrigger, mapProjectData } = currentStep;
      if (!nextStepTrigger) return;
      let shouldGoToNextStep = false;
      if (
        nextStepTrigger.presenceOfElement &&
        document.querySelector(nextStepTrigger.presenceOfElement)
      ) {
        shouldGoToNextStep = true;
      } else if (
        nextStepTrigger.absenceOfElement &&
        !document.querySelector(nextStepTrigger.absenceOfElement)
      ) {
        shouldGoToNextStep = true;
      }
      if (shouldGoToNextStep && mapProjectData) {
        Object.entries(mapProjectData).forEach(([key, dataAccessor]) => {
          if (dataAccessor === 'lastProjectObjectName') {
            if (!project || project.getLayoutsCount() === 0) return;
            const layout = project.getLayoutAt(0);
            setData(currentData => ({
              ...currentData,
              [key]: layout.getObjectAt(layout.getObjectsCount() - 1).getName(),
            }));
          }
        });
      }

      if (shouldGoToNextStep) setCurrentStepIndex(currentStepIndex + 1);
    },
    [currentStep, currentStepIndex, project]
  );

  const handleDomMutation = useDebounce(watchDomForNextStepTrigger, 200);

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
  const formattedStep = {
    ...flow[currentStepIndex],
    tooltip: stepTooltip
      ? {
          ...stepTooltip,
          content: interpolateText(stepTooltip.content, data),
        }
      : undefined,
  };

  return (
    <OnboardingContext.Provider
      value={{
        flow: null,
        currentStep: formattedStep,
        setProject,
      }}
    >
      {props.children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
