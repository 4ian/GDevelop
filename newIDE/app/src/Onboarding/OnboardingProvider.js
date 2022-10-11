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
  },
  {
    id: 'ClickOnSearchBar',
    elementToHighlightId: '#asset-store-search-bar',
    nextStepTrigger: { elementIsFilled: true },
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
    mapProjectData: {
      FirstObject: 'lastProjectObjectName',
    },
  },
  {
    id: 'CloseAssetStore',
    elementToHighlightId: '#new-object-dialog #close-button',
    nextStepTrigger: { absenceOfElement: '#new-object-dialog' },
  },
  {
    id: 'DragObjectToScene',
    elementToHighlightId: '#object-item-0',
    nextStepTrigger: { presenceOfElement: '#object-item-1' },
  },
];

const OnboardingProvider = (props: Props) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [project, setProject] = React.useState<?gdProject>(null);
  const [data, setData] = React.useState<{ [key: string]: string }>({});
  const [
    watchElementInputValue,
    setWatchElementInputValue,
  ] = React.useState<?string>(null);
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
      if (!elementToHighlightId) return;
      if (nextStepTrigger && nextStepTrigger.elementIsFilled) {
        setWatchElementInputValue(elementToHighlightId);
      }
    },
    [currentStep]
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

  useInterval(watchInputBeingFilled, watchElementInputValue ? 1000 : null);
  useInterval(watchDomForNextStepTrigger, isTriggerFlickering ? 500 : null);

  console.log(currentStepIndex);

  return (
    <OnboardingContext.Provider
      value={{
        flow: null,
        currentStep: flow[currentStepIndex],
        setProject,
      }}
    >
      {props.children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
