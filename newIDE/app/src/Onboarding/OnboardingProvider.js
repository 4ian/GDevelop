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
    nextStepTrigger: { presenceOfElement: '#object-item-0' },
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
  const [
    watchElementInputValue,
    setWatchElementInputValue,
  ] = React.useState<?string>(null);
  const handleDomMutation = useDebounce(
    React.useCallback(
      () => {
        const { nextStepTrigger } = flow[currentStepIndex];
        if (!nextStepTrigger) return;
        if (
          nextStepTrigger.presenceOfElement &&
          document.querySelector(nextStepTrigger.presenceOfElement)
        ) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else if (
          nextStepTrigger.absenceOfElement &&
          !document.querySelector(nextStepTrigger.absenceOfElement)
        ) {
          setCurrentStepIndex(currentStepIndex + 1);
        }
      },
      [currentStepIndex]
    ),
    200
  );
  const domObserverRef = React.useRef<?MutationObserver>(null);

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
      const currentStep = flow[currentStepIndex];
      if (!currentStep) return;
      const { nextStepTrigger, elementToHighlightId } = currentStep;
      if (!elementToHighlightId) return;
      if (nextStepTrigger && nextStepTrigger.elementIsFilled) {
        setWatchElementInputValue(elementToHighlightId);
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

  useInterval(watchInputBeingFilled, watchElementInputValue ? 1000 : null);

  return (
    <OnboardingContext.Provider
      value={{
        flow: null,
        currentStep: flow[currentStepIndex],
      }}
    >
      {props.children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
