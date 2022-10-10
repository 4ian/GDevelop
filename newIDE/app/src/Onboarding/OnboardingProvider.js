// @flow
import * as React from 'react';
import { useDebounce } from '../Utils/UseDebounce';
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
  },
];

const OnboardingProvider = (props: Props) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
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

  // This handler should be used when listening for input events but
  // it doesn't seem to work with React.
  const handleInput = React.useCallback(
    (event: KeyboardEvent | TouchEvent) => {
      const { target } = event;
      if (!(target instanceof window.HTMLInputElement)) {
        return;
      }
      if (target.value) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
      return target.value;
    },
    [currentStepIndex]
  );

  React.useEffect(
    () => {
      const { nextStepTrigger, elementToHighlightId } = flow[currentStepIndex];
      if (!elementToHighlightId) return;
      const elementToWatch = document.querySelector(elementToHighlightId);
      if (!elementToWatch) return;
      if (nextStepTrigger && nextStepTrigger.elementIsFilled) {
        elementToWatch.addEventListener('keyup', handleInput);
        elementToWatch.addEventListener('touchend', handleInput);
        return () => {
          elementToWatch.removeEventListener('keyup', handleInput);
          elementToWatch.removeEventListener('touchend', handleInput);
        };
      }
    },
    [currentStepIndex, handleInput]
  );

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
