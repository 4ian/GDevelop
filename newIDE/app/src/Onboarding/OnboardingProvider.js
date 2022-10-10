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
  },
];

const OnboardingProvider = (props: Props) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const handleDomMutation = useDebounce(
    React.useCallback(
      () => {
        const { nextStepTrigger } = flow[currentStepIndex];
        if (!nextStepTrigger) return;
        if (document.querySelector(nextStepTrigger.presenceOfElement)) {
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
      const appContainer = document.querySelector('#root');
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
