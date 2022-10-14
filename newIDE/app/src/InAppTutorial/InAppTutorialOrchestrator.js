// @flow
import * as React from 'react';
import { useDebounce } from '../Utils/UseDebounce';
import { useInterval } from '../Utils/UseInterval';
import {
  type InAppTutorial,
  type InAppTutorialFlowStep,
  type InAppTutorialFlowStepTrigger,
  type EditorIdentifier,
} from './InAppTutorialContext';
import InAppTutorialEndDialog from './InAppTutorialEndDialog';
import InAppTutorialStepDisplayer from './InAppTutorialStepDisplayer';

const interpolateText = (text?: string, data: { [key: string]: string }) => {
  if (!text) return undefined;
  const placeholderReplacingRegex = /{(\w+)}/g;
  const match = text.matchAll(placeholderReplacingRegex);
  let formattedText = text;
  [...match].forEach(match => {
    const keyWithBrackets = match[0];
    const key = match[1];
    if (Object.keys(data).includes(key)) {
      formattedText = formattedText.replace(keyWithBrackets, data[key]);
    }
  });
  return formattedText;
};

const isStepDone = (
  nextStepTrigger?: ?InAppTutorialFlowStepTrigger
): boolean => {
  if (!nextStepTrigger) return false;
  if (
    nextStepTrigger.presenceOfElement &&
    document.querySelector(nextStepTrigger.presenceOfElement)
  ) {
    return true;
  } else if (
    nextStepTrigger.absenceOfElement &&
    !document.querySelector(nextStepTrigger.absenceOfElement)
  ) {
    return true;
  }
  return false;
};

const gatherProjectData = ({
  flow,
  startIndex,
  endIndex,
  data,
  project,
}: {
  flow: Array<InAppTutorialFlowStep>,
  startIndex: number,
  endIndex: number,
  data: { [key: string]: string },
  project: ?gdProject,
}): { [key: string]: string } => {
  if (!project) return data;

  let newData = { ...data };
  for (let index = startIndex; index <= endIndex; index++) {
    const { mapProjectData } = flow[index];

    if (mapProjectData) {
      Object.entries(mapProjectData).forEach(([key, dataAccessor]) => {
        if (dataAccessor === 'lastProjectObjectName') {
          if (!project || project.getLayoutsCount() === 0) return;
          const layout = project.getLayoutAt(0);
          const layoutObjectsCount = layout.getObjectsCount();
          if (layoutObjectsCount === 0) {
            throw new Error(
              `No object was found in layer after step ${index} of flow`
            );
          }
          newData[key] = layout
            .getObjectAt(layout.getObjectsCount() - 1)
            .getName();
        }
      });
    }
  }
  return newData;
};

type Props = {|
  tutorial: InAppTutorial,
  onFlowRunning: boolean => void,
  project: ?gdProject,
  currentEditor: EditorIdentifier | null,
|};

export type InAppTutorialOrchestratorInterface = {|
  onPreviewLaunch: () => void,
  goToNextStep: () => void,
|};

const InAppTutorialOrchestrator = React.forwardRef<
  Props,
  InAppTutorialOrchestratorInterface
>(({ tutorial, onFlowRunning, project, currentEditor }, ref) => {
  const [wrongEditorInfoOpen, setWrongEditorInfoOpen] = React.useState<boolean>(
    false
  );
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [data, setData] = React.useState<{ [key: string]: string }>({});
  const [displayEndDialog, setDisplayEndDialog] = React.useState<boolean>(
    false
  );
  const currentStepFallbackStepIndex = React.useRef<number>(0);
  const [
    expectedEditor,
    setExpectedEditor,
  ] = React.useState<EditorIdentifier | null>(null);
  const [
    watchElementInputValue,
    setWatchElementInputValue,
  ] = React.useState<?string>(null);
  const [watchSceneInstances, setWatchSceneInstances] = React.useState<?string>(
    null
  );
  const domObserverRef = React.useRef<?MutationObserver>(null);

  React.useEffect(
    () => {
      setCurrentStepIndex(0);
    },
    [tutorial]
  );

  const { flow, endDialog, editorSwitches } = tutorial;
  const currentStep = flow[currentStepIndex];

  const goToStep = React.useCallback(
    (stepIndex: number) => {
      if (stepIndex >= flow.length) {
        setDisplayEndDialog(true);
        return;
      }

      let nextStepIndex = stepIndex;

      // Check if we can go directly to next mandatory (not-skippable) step.
      while (flow[nextStepIndex].skippable && nextStepIndex < flow.length - 1) {
        if (isStepDone(flow[nextStepIndex].nextStepTrigger)) nextStepIndex += 1;
        else break;
      }

      setCurrentStepIndex(nextStepIndex);
    },
    [flow]
  );

  const watchDomForNextStepTrigger = React.useCallback(
    () => {
      console.log('MUTATION');
      // Find the next mandatory (not-skippable) step (It can be the current step).
      let indexOfNextMandatoryStep = currentStepIndex;
      while (flow[indexOfNextMandatoryStep].skippable) {
        indexOfNextMandatoryStep += 1;
      }

      let shouldGoToStepAtIndex: number | null = null;
      // Browse skippable steps in reverse orders to directly go to the
      // furthest step if possible.
      for (
        let stepIndex = indexOfNextMandatoryStep;
        stepIndex >= currentStepIndex;
        stepIndex--
      ) {
        const isThisStepAlreadyDone = isStepDone(
          flow[stepIndex].nextStepTrigger
        );
        if (isThisStepAlreadyDone) {
          shouldGoToStepAtIndex = stepIndex + 1;
          break;
        }
      }
      if (shouldGoToStepAtIndex === null) {
        // No trigger has been detected for the next mandatory step or the in-between
        // skippable steps.
        // Let's now check that, if there's a shortcut, it may have been triggered.
        const { shortcuts } = flow[currentStepIndex];
        if (!shortcuts) return;
        for (let shortcutStep of shortcuts) {
          // Find the first shortcut in the list that can be triggered.
          if (isStepDone(shortcutStep.trigger)) {
            shouldGoToStepAtIndex = flow.findIndex(
              step => step.id === shortcutStep.stepId
            );
            if (shouldGoToStepAtIndex < 0) {
              console.warn(
                `Step with id ${
                  shortcutStep.stepId
                } could not be found. Shortcut not taken.`
              );
              return;
            }
            break;
          }
        }
        if (shouldGoToStepAtIndex == null) return;
      }

      // If a change of step is going to happen, first record the data for
      // all the steps that are about to be closed.
      const newData = gatherProjectData({
        flow,
        startIndex: currentStepIndex,
        endIndex: shouldGoToStepAtIndex - 1,
        data,
        project,
      });

      setData(newData);

      goToStep(shouldGoToStepAtIndex);
    },
    [currentStepIndex, project, goToStep, data, flow]
  );

  const handleDomMutation = useDebounce(watchDomForNextStepTrigger, 200);

  const onPreviewLaunch = () => {
    if (!currentStep) return;
    const { nextStepTrigger } = currentStep;
    if (nextStepTrigger && nextStepTrigger.previewLaunched) {
      goToStep(currentStepIndex + 1);
    }
  };

  const goToNextStep = React.useCallback(
    () => {
      goToStep(currentStepIndex + 1);
    },
    [currentStepIndex, goToStep]
  );

  React.useImperativeHandle(ref, () => ({ onPreviewLaunch, goToNextStep }));

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
      if (!currentStep) return;
      const { id, isOnClosableDialog } = currentStep;
      if (id && editorSwitches.hasOwnProperty(id)) {
        setExpectedEditor(editorSwitches[id]);
      }
      if (!isOnClosableDialog) {
        currentStepFallbackStepIndex.current = currentStepIndex;
      }
      // At each step start, reset change watching logics.
      setWatchElementInputValue(null);
      setWatchSceneInstances(null);
      if (currentStepIndex >= flow.length) {
        setDisplayEndDialog(true);
      }
    },
    [currentStep, currentStepIndex, flow.length, editorSwitches]
  );

  React.useEffect(
    () => {
      if (!currentStep) return;
      const { nextStepTrigger, elementToHighlightId } = currentStep;
      if (nextStepTrigger && nextStepTrigger.elementIsFilled) {
        if (!elementToHighlightId) return;
        setWatchElementInputValue(elementToHighlightId);
      } else if (nextStepTrigger && nextStepTrigger.instanceDraggedOnScene) {
        const objectKey = nextStepTrigger.instanceDraggedOnScene;
        const objectName = data[objectKey];
        if (!objectName) return;
        setWatchSceneInstances(objectName);
      }
    },
    [currentStep, data]
  );

  const watchInputBeingFilled = React.useCallback(
    () => {
      console.log('WATCH INPUT');
      if (!watchElementInputValue) return;
      const elementToWatch = document.querySelector(watchElementInputValue);

      if (
        elementToWatch &&
        // Flow errors on missing value prop in generic type HTMLElement but this
        // line cannot break.
        // $FlowFixMe
        elementToWatch.value
      ) {
        goToStep(currentStepIndex + 1);
      }
    },
    [currentStepIndex, goToStep, watchElementInputValue]
  );

  const watchSceneInstanceChanges = React.useCallback(
    () => {
      console.log('WATCH INSTANCE');
      if (!watchSceneInstances) return;
      if (!project || project.getLayoutsCount() === 0) return;
      const layout = project.getLayoutAt(0);
      const instances = layout.getInitialInstances();
      if (instances.hasInstancesOfObject(watchSceneInstances)) {
        goToStep(currentStepIndex + 1);
      }
    },
    [project, currentStepIndex, goToStep, watchSceneInstances]
  );

  useInterval(watchInputBeingFilled, watchElementInputValue ? 1000 : null);
  useInterval(watchSceneInstanceChanges, watchSceneInstances ? 500 : null);
  useInterval(
    watchDomForNextStepTrigger,
    currentStep && currentStep.isTriggerFlickering ? 500 : null
  );

  console.log(currentStepIndex);

  const renderStepDisplayer = () => {
    if (!currentStep) return null;
    const stepTooltip = currentStep.tooltip;
    const formattedStep: InAppTutorialFlowStep = {
      ...flow[currentStepIndex],
      tooltip: stepTooltip
        ? {
            ...stepTooltip,
            title: interpolateText(stepTooltip.title, data),
            description: interpolateText(stepTooltip.description, data),
          }
        : undefined,
    };
    return (
      <InAppTutorialStepDisplayer
        step={formattedStep}
        expectedEditor={wrongEditorInfoOpen ? expectedEditor : null}
        goToFallbackStep={() => {
          setCurrentStepIndex(currentStepFallbackStepIndex.current);
        }}
      />
    );
  };

  const checkIfWrongEditor = useDebounce(
    () => {
      console.log('salut');
      setWrongEditorInfoOpen(expectedEditor !== currentEditor);
    },
    wrongEditorInfoOpen ? 0 : 1000
  );

  React.useEffect(
    () => {
      checkIfWrongEditor();
    },
    [checkIfWrongEditor, currentEditor]
  );

  return (
    <>
      {renderStepDisplayer()}
      {displayEndDialog && (
        <InAppTutorialEndDialog
          endDialog={endDialog}
          onClose={() => {
            setDisplayEndDialog(false);
            onFlowRunning(false);
          }}
        />
      )}
    </>
  );
});

export default InAppTutorialOrchestrator;
