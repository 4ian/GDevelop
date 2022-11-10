// @flow
import * as React from 'react';
import InAppTutorialContext, {
  type InAppTutorial,
} from './InAppTutorialContext';
import onboardingTutorial from './Tutorials/OnboardingTutorial';
import { setCurrentlyRunningInAppTutorial } from '../Utils/Analytics/EventSender';
import {
  fetchInAppTutorial,
  fetchInAppTutorialShortHeaders,
  type InAppTutorialShortHeader,
} from '../Utils/GDevelopServices/InAppTutorial';

type Props = {| children: React.Node |};

const InAppTutorialProvider = (props: Props) => {
  const flingTutorial = require('./Tutorials/flingGame.json');
  const [tutorial, setTutorial] = React.useState<InAppTutorial | null>(flingTutorial);
  const [
    inAppTutorialShortHeaders,
    setInAppTutorialShortHeaders,
  ] = React.useState<?Array<InAppTutorialShortHeader>>(null);

  const startTutorial = async (tutorialId: string) => {
    if (tutorialId === onboardingTutorial.id) {
      setTutorial(onboardingTutorial);
      setCurrentlyRunningInAppTutorial(tutorialId);
      return;
    }

    if (!inAppTutorialShortHeaders) return;

    const inAppTutorialShortHeader = inAppTutorialShortHeaders.find(
      shortHeader => shortHeader.id === tutorialId
    );

    if (!inAppTutorialShortHeader) return;

    const inAppTutorial = await fetchInAppTutorial(inAppTutorialShortHeader);
    setTutorial(inAppTutorial);
    setCurrentlyRunningInAppTutorial(tutorialId);
  };

  const endTutorial = () => {
    setTutorial(null);
    setCurrentlyRunningInAppTutorial(null);
  };

  const loadInAppTutorials = React.useCallback(async () => {
    const fetchedInAppTutorialShortHeaders = await fetchInAppTutorialShortHeaders();
    setInAppTutorialShortHeaders(fetchedInAppTutorialShortHeaders);
  }, []);

  // Preload the in-app tutorial short headers when the app loads.
  React.useEffect(
    () => {
      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching in-app tutorials...');
        loadInAppTutorials();
      }, 1000);
      return () => clearTimeout(timeoutId);
    },
    [loadInAppTutorials]
  );

  return (
    <InAppTutorialContext.Provider
      value={{
        inAppTutorialShortHeaders,
        currentlyRunningInAppTutorial: tutorial,
        startTutorial,
        endTutorial,
      }}
    >
      {props.children}
    </InAppTutorialContext.Provider>
  );
};

export default InAppTutorialProvider;
