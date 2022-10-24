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

type Props = {| children: React.Node |};


const InAppTutorialProvider = (props: Props) => {
  const [
    isInAppTutorialRunning,
    setIsInAppTutorialRunning,
  ] = React.useState<boolean>(false);
  const [tutorial, setTutorial] = React.useState<?InAppTutorial>(null);
  const [project, setProject] = React.useState<?gdProject>(null);
  const [
    currentEditor,
    setCurrentEditor,
  ] = React.useState<EditorIdentifier | null>(null);
  const orchestratorRef = React.useRef<?InAppTutorialOrchestratorInterface>(
    null
  );

  const startTutorial = (tutorialId: string) => {
    if (tutorialId === onboardingTutorial.id) {
      setTutorial(onboardingTutorial);
      setCurrentlyRunningInAppTutorial(tutorialId);
      setIsInAppTutorialRunning(true);
    }
  };

  const onPreviewLaunch = () => {
    if (orchestratorRef.current) orchestratorRef.current.onPreviewLaunch();
  };

  const goToNextStep = () => {
    if (orchestratorRef.current) orchestratorRef.current.goToNextStep();
  };

  const endTutorial = () => {
    setCurrentlyRunningInAppTutorial(null);
    setIsInAppTutorialRunning(false);
  };

  return (
    <InAppTutorialContext.Provider
      value={{
        flow: null,
        setProject,
        setCurrentEditor,
        goToNextStep,
        onPreviewLaunch,
        isInAppTutorialRunning,
        startTutorial,
      }}
    >
      {props.children}
      {tutorial && isInAppTutorialRunning && (
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
