// @flow
import * as React from 'react';
import { useDebounce } from '../Utils/UseDebounce';
import OnboardingContext from './OnboardingContext';
type Props = {| children: React.Node |};

const OnboardingProvider = (props: Props) => {
  const handleDomMutation = useDebounce(
    React.useCallback(() => {
      console.log('DOM change');
    }, []),
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
        currentStep: { elementToHighlightId: '#add-new-object-button' },
      }}
    >
      {props.children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
