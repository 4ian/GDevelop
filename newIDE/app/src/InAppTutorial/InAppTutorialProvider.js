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

export const FLING_GAME_IN_APP_TUTORIAL_ID = 'flingGame';

const InAppTutorialProvider = (props: Props) => {
  const [tutorial, setTutorial] = React.useState<InAppTutorial | null>(null);
  const [fetchingError, setFetchingError] = React.useState<string | null>(null);
  const [startStepIndex, setStartStepIndex] = React.useState<number>(0);
  const [startProjectData, setStartProjectData] = React.useState<{
    [key: string]: string,
  }>({});
  const [
    inAppTutorialShortHeaders,
    setInAppTutorialShortHeaders,
  ] = React.useState<?Array<InAppTutorialShortHeader>>(null);

  const startTutorial = async ({
    tutorialId,
    initialStepIndex,
    initialProjectData,
  }: {|
    tutorialId: string,
    initialStepIndex: number,
    initialProjectData: { [key: string]: string },
  |}) => {
    if (tutorialId === onboardingTutorial.id) {
      setStartStepIndex(initialStepIndex);
      setStartProjectData(initialProjectData);
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
    setStartStepIndex(initialStepIndex);
    setStartProjectData(initialProjectData);
    setTutorial(inAppTutorial);
    setCurrentlyRunningInAppTutorial(tutorialId);
  };

  const endTutorial = () => {
    setTutorial(null);
    setCurrentlyRunningInAppTutorial(null);
  };

  const loadInAppTutorials = React.useCallback(async () => {
    setFetchingError(null);
    try {
      const fetchedInAppTutorialShortHeaders = await fetchInAppTutorialShortHeaders();
      setInAppTutorialShortHeaders(fetchedInAppTutorialShortHeaders);
    } catch (error) {
      console.error('An error occurred when fetching in app tutorials:', error);
      setFetchingError('fetching-error');
    }
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
        startProjectData,
        endTutorial,
        startStepIndex,
        inAppTutorialsFetchingError: fetchingError,
        fetchInAppTutorials: loadInAppTutorials,
      }}
    >
      {props.children}
    </InAppTutorialContext.Provider>
  );
};

export default InAppTutorialProvider;
