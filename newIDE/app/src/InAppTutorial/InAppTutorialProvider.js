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

type Props = {| children: React.Node |};

const InAppTutorialProvider = (props: Props) => {
  const [isFlowRunning, setIsFlowRunning] = React.useState<boolean>(true);
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
      setIsFlowRunning(true);
    }
  };

  const onPreviewLaunch = () => {
    if (orchestratorRef.current) orchestratorRef.current.onPreviewLaunch();
  };

  const goToNextStep = () => {
    if (orchestratorRef.current) orchestratorRef.current.goToNextStep();
  };

  return (
    <InAppTutorialContext.Provider
      value={{
        flow: null,
        setProject,
        setCurrentEditor,
        goToNextStep,
        onPreviewLaunch,
        isFlowRunning,
        startTutorial,
      }}
    >
      {props.children}
      {tutorial && isFlowRunning && (
        <InAppTutorialOrchestrator
          ref={orchestratorRef}
          tutorial={tutorial}
          onFlowRunning={setIsFlowRunning}
          project={project}
          currentEditor={currentEditor}
        />
      )}
    </InAppTutorialContext.Provider>
  );
};

export default InAppTutorialProvider;
