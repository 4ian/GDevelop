// @flow
import * as React from 'react';
import InAppTutorialContext, {
  type InAppTutorial,
  type EditorIdentifier,
} from './InAppTutorialContext';
import InAppTutorialOrchestrator, {
  type InAppTutorialOrchestratorInterface,
} from './InAppTutorialOrchestrator';
import onboardingTutorial from './Tutorials/OnboardingTutorial';
import { setCurrentlyRunningInAppTutorial } from '../Utils/Analytics/EventSender';
import {
  fetchInAppTutorial,
  fetchInAppTutorialShortHeaders,
  type InAppTutorialShortHeader,
} from '../Utils/GDevelopServices/InAppTutorial';

type Props = {| children: React.Node |};

const InAppTutorialProvider = (props: Props) => {
  const flingTutorial = require('./Tutorials/flingGame.json')
  const [tutorial, setTutorial] = React.useState<?InAppTutorial>(flingTutorial);
  const [project, setProject] = React.useState<?gdProject>(null);
  const [
    currentEditor,
    setCurrentEditor,
  ] = React.useState<EditorIdentifier | null>(null);
  const orchestratorRef = React.useRef<?InAppTutorialOrchestratorInterface>(
    null
  );
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

  const onPreviewLaunch = () => {
    if (orchestratorRef.current) orchestratorRef.current.onPreviewLaunch();
  };

  const goToNextStep = () => {
    if (orchestratorRef.current) orchestratorRef.current.goToNextStep();
  };

  const endTutorial = () => {
    setTutorial(null);
    setCurrentlyRunningInAppTutorial(null);
  };

  const getProgress = () => {
    if (!orchestratorRef.current)
      return { step: 0, progress: 0, projectData: {} };
    return orchestratorRef.current.getProgress();
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
        flow: null,
        setProject,
        setCurrentEditor,
        goToNextStep,
        onPreviewLaunch,
        currentlyRunningInAppTutorial: tutorial ? tutorial.id : null,
        startTutorial,
        inAppTutorialShortHeaders,
        getProgress,
      }}
    >
      {props.children}
      {tutorial && (
        <InAppTutorialOrchestrator
          ref={orchestratorRef}
          tutorial={tutorial}
          endTutorial={endTutorial}
          project={project}
          currentEditor={currentEditor}
        />
      )}
    </InAppTutorialContext.Provider>
  );
};

export default InAppTutorialProvider;
