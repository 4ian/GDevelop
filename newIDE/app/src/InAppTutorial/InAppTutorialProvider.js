// @flow
import * as React from 'react';
import InAppTutorialContext from './InAppTutorialContext';
import { setCurrentlyRunningInAppTutorial } from '../Utils/Analytics/EventSender';
import {
  fetchInAppTutorial,
  fetchInAppTutorialShortHeaders,
  type InAppTutorialShortHeader,
  type InAppTutorial,
} from '../Utils/GDevelopServices/InAppTutorial';
import { IN_APP_TUTORIALS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';

type Props = {| children: React.Node |};

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

  const getInAppTutorialShortHeader = React.useCallback(
    (tutorialId: string) => {
      if (!inAppTutorialShortHeaders) return null;
      const inAppTutorialShortHeader = inAppTutorialShortHeaders.find(
        shortHeader => shortHeader.id === tutorialId
      );
      return inAppTutorialShortHeader;
    },
    [inAppTutorialShortHeaders]
  );

  const startTutorial = async ({
    tutorialId,
    initialStepIndex,
    initialProjectData,
  }: {|
    tutorialId: string,
    initialStepIndex: number,
    initialProjectData: { [key: string]: string },
  |}) => {
    if (!inAppTutorialShortHeaders) return;

    const inAppTutorialShortHeader = getInAppTutorialShortHeader(tutorialId);

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
      }, IN_APP_TUTORIALS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [loadInAppTutorials]
  );

  return (
    <InAppTutorialContext.Provider
      value={{
        inAppTutorialShortHeaders,
        getInAppTutorialShortHeader,
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
