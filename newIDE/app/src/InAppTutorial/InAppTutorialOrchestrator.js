// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { I18n as I18nType } from '@lingui/core';
import { useDebounce } from '../Utils/UseDebounce';
import { useInterval } from '../Utils/UseInterval';
import {
  type InAppTutorial,
  type InAppTutorialFlowStep,
  type InAppTutorialFlowFormattedStep,
  type InAppTutorialFlowStepTrigger,
  type TranslatedText,
  type EditorIdentifier,
  isMiniTutorial,
} from '../Utils/GDevelopServices/InAppTutorial';
import {
  createOrEnsureBadgeForUser,
  getTutorialCompletedAchievementId,
} from '../Utils/GDevelopServices/Badge';
import InAppTutorialDialog from './InAppTutorialDialog';
import InAppTutorialStepDisplayer from './InAppTutorialStepDisplayer';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import { sendInAppTutorialProgress } from '../Utils/Analytics/EventSender';
import { getInstanceCountInLayoutForObject } from '../Utils/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';
import {
  getMuiCheckboxValue,
  isMuiCheckbox,
} from '../UI/MaterialUISpecificUtil';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../Profile/AuthenticatedUserContext';
import { useScreenType } from '../UI/Responsive/ScreenTypeMeasurer';
import { retryIfFailed } from '../Utils/RetryIfFailed';

const textInterpolationProjectDataAccessors = {
  instancesCount: 'instancesCount:',
};
const selectorInterpolationProjectDataAccessors = {
  objectInObjectsList: 'objectInObjectsList:',
  sceneInProjectManager: 'sceneInProjectManager:',
  objectInObjectOrResourceSelector: 'objectInObjectOrResourceSelector:',
  editorTab: 'editorTab:',
};
const legacyItemInObjectListDomSelectorPattern = /#object-item-[0-9]{1,2}$/;

const getPhasesStartIndices = (endIndices: Array<number>): Array<number> =>
  endIndices.map((_, i) => {
    return i === 0 ? 0 : endIndices[i - 1] + 1;
  });

const interpolateText = (
  text: string,
  data: { [key: string]: string },
  project: ?gdProject
) => {
  const placeholderReplacingRegex = /\$\(([\w:]+)\)/g;
  const match = text.matchAll(placeholderReplacingRegex);
  let formattedText = text;
  [...match].forEach(match => {
    let replacement;
    const instructionWithBrackets = match[0];
    const instruction = match[1];
    if (
      instruction.startsWith(
        textInterpolationProjectDataAccessors.instancesCount
      )
    ) {
      const key = instruction.split(':')[1];
      const objectName = data[key];
      if (objectName && project && project.getLayoutsCount() > 0) {
        const layout = project.getLayoutAt(0);
        replacement = getInstanceCountInLayoutForObject(
          layout.getInitialInstances(),
          objectName
        ).toString();
      }
    }
    if (!replacement && Object.keys(data).includes(instruction)) {
      // If the instruction is a key in the data, use it
      replacement = data[instruction];
    }
    if (replacement) {
      formattedText = formattedText.replace(
        instructionWithBrackets,
        replacement
      );
    }
  });
  return formattedText;
};

const translateAndInterpolateText = ({
  text,
  data,
  i18n,
  project,
}: {|
  text?: TranslatedText,
  data: { [key: string]: string },
  i18n: I18nType,
  project: ?gdProject,
|}) => {
  if (!text) return undefined;
  let translatedText;
  if (text.messageByLocale) {
    translatedText = selectMessageByLocale(i18n, text.messageByLocale);
  } else {
    translatedText = i18n._(text.messageDescriptor, data);
  }

  // Something went wrong with the translation, let's hide the text.
  if (typeof translatedText !== 'string') return '';

  return interpolateText(translatedText, data, project);
};

const interpolateExpectedEditor = (
  expectedEditor: {| editor: EditorIdentifier, scene?: string |} | null,
  data: { [key: string]: string }
): {| editor: EditorIdentifier, scene?: string |} | null => {
  if (!expectedEditor) return null;
  return {
    ...expectedEditor,
    scene: expectedEditor.scene ? data[expectedEditor.scene] : undefined,
  };
};

const interpolateEditorTabActiveTrigger = (
  trigger: string,
  data: { [key: string]: string }
): string => {
  const [sceneKey, editorType] = trigger.split(':');
  if (!editorType) {
    throw new Error(`There might be missing a ":" in the trigger ${trigger}`);
  }
  if (editorType === 'Home') {
    return `button[id="tab-start-page-button"][data-active="true"]`;
  }
  const sceneNameFilter = sceneKey ? `[data-scene="${data[sceneKey]}"]` : '';
  return `button[id^="tab"][data-active="true"][data-type="${
    editorType === 'Scene' ? 'layout' : 'layout-events'
  }"]${sceneNameFilter}`;
};

const countObjectsInScene = ({
  project,
  sceneName,
}: {|
  project: gdProject,
  sceneName: string,
|}): ?number => {
  if (project.getLayoutsCount() === 0) return;

  const layout = project.hasLayoutNamed(sceneName)
    ? project.getLayout(sceneName)
    : project.getLayoutAt(0);

  return layout.getObjectsCount();
};

export const getEditorTabSelector = ({
  editor,
  sceneName,
}: {|
  editor: EditorIdentifier,
  sceneName?: string,
|}): string => {
  if (editor === 'Home') {
    return 'button[id="tab-start-page-button"]';
  }
  const sceneNameFilter = sceneName ? `[data-scene="${sceneName}"]` : '';

  return `button[id^="tab"][data-type="${
    editor === 'Scene' ? 'layout' : 'layout-events'
  }"]${sceneNameFilter}`;
};

const interpolateElementId = (
  elementId: string,
  data: { [key: string]: string }
): string => {
  if (
    elementId.startsWith(selectorInterpolationProjectDataAccessors.editorTab)
  ) {
    const splittedElementId = elementId.split(':');
    const sceneKey = splittedElementId[1];
    // $FlowFixMe - We're confident the data is reliable
    const editorType: EditorIdentifier = splittedElementId[2];
    if (!editorType) {
      throw new Error(
        `There might be missing a ":" in the element id ${elementId}`
      );
    }
    return getEditorTabSelector({
      editor: editorType,
      sceneName: data[sceneKey],
    });
  } else if (
    elementId.startsWith(
      selectorInterpolationProjectDataAccessors.objectInObjectsList
    )
  ) {
    const splittedElementId = elementId.split(':');
    const objectKey = splittedElementId[1];
    return `#scene-editor[data-active] #objects-list div[data-object-name="${
      data[objectKey]
    }"]`;
  } else if (
    elementId.startsWith(
      selectorInterpolationProjectDataAccessors.sceneInProjectManager
    )
  ) {
    const splittedElementId = elementId.split(':');
    const sceneKey = splittedElementId[1];
    return `div[role="presentation"][data-open="true"] #project-manager [id^="scene-item"][data-scene="${
      data[sceneKey]
    }"]`;
  } else if (
    elementId.startsWith(
      selectorInterpolationProjectDataAccessors.objectInObjectOrResourceSelector
    )
  ) {
    const splittedElementId = elementId.split(':');
    const objectKey = splittedElementId[1];
    return `#instruction-or-object-selector div[data-object-name="${
      data[objectKey]
    }"]`;
  }

  return elementId;
};

const containsProjectDataToDisplay = (text?: TranslatedText): boolean => {
  if (!text) return false;
  if (text.messageByLocale) {
    return Object.values(text.messageByLocale).some(localizedText =>
      // $FlowFixMe - known error where Flow returns mixed for object value https://github.com/facebook/flow/issues/2221
      localizedText.includes(
        `$(${textInterpolationProjectDataAccessors.instancesCount}`
      )
    );
  } else {
    return (
      (typeof text.messageDescriptor === 'string' &&
        text.messageDescriptor.includes(
          `$(${textInterpolationProjectDataAccessors.instancesCount}`
        )) ||
      (typeof text.messageDescriptor === 'object' &&
        Object.values(text.messageDescriptor).some(
          value =>
            typeof value === 'string' &&
            value.includes(
              `$(${textInterpolationProjectDataAccessors.instancesCount}`
            )
        ))
    );
  }
};

const isDomBasedTriggerComplete = (
  trigger?: ?InAppTutorialFlowStepTrigger,
  data: { [key: string]: string }
): boolean => {
  if (!trigger) return false;
  if (
    trigger.presenceOfElement &&
    !trigger.presenceOfElement.match(
      legacyItemInObjectListDomSelectorPattern
    ) &&
    document.querySelector(
      interpolateElementId(trigger.presenceOfElement, data)
    )
  ) {
    return true;
  } else if (
    trigger.absenceOfElement &&
    !document.querySelector(
      interpolateElementId(trigger.absenceOfElement, data)
    )
  ) {
    return true;
  } else if (
    trigger.editorIsActive &&
    document.querySelector(
      interpolateEditorTabActiveTrigger(trigger.editorIsActive, data)
    )
  ) {
    return true;
  }
  return false;
};

const getInputValue = (element: HTMLElement): any => {
  if (isMuiCheckbox(element)) {
    return getMuiCheckboxValue(element);
  }
  if (element.tagName === 'TEXTAREA') {
    return element.textContent;
  }
  // Flow errors on missing value prop in generic type HTMLElement but this
  // line cannot break.
  // $FlowFixMe
  return element.value;
};

const gatherProjectDataOnMultipleSteps = ({
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
      Object.entries(mapProjectData).forEach(
        // $FlowFixMe - Object.entries does not keep value type
        ([key, dataAccessor]: [string, string]) => {
          if (dataAccessor === 'projectLastSceneName') {
            if (!project) return;
            if (project.getLayoutsCount() === 0) {
              throw new Error(
                `No layout was found in project after step ${index} of flow`
              );
            }
            newData[key] = project
              .getLayoutAt(project.getLayoutsCount() - 1)
              .getName();
          } else if (dataAccessor.startsWith('sceneLastObjectName')) {
            if (!project || project.getLayoutsCount() === 0) return;
            const layoutKey = dataAccessor.split(':')[1];
            const layoutName = layoutKey ? data[layoutKey] : undefined;
            const layout =
              layoutName && project.hasLayoutNamed(layoutName)
                ? project.getLayout(layoutName)
                : project.getLayoutAt(0);
            const layoutObjectsCount = layout.getObjectsCount();
            if (layoutObjectsCount === 0) {
              throw new Error(
                `No object was found in layout after step ${index} of flow`
              );
            }
            newData[key] = layout
              .getObjectAt(layout.getObjectsCount() - 1)
              .getName();
          }
        }
      );
    }
  }
  return newData;
};

const useGiveTrivialBadgeWhenTutorialIsFinished = ({
  authenticatedUser,
  displayEndDialog,
  tutorial,
}: {
  authenticatedUser: AuthenticatedUser,
  displayEndDialog: boolean,
  tutorial: InAppTutorial,
}) => {
  // Destructure the user data to avoid the effect to run at every change of the user
  // which is unrelated to badges or the user profile.
  const {
    badges,
    onBadgesChanged,
    profile,
    getAuthorizationHeader,
  } = authenticatedUser;

  React.useEffect(
    () => {
      (async () => {
        if (!profile || !displayEndDialog) return;

        try {
          // Give a (trivial) badge when a tutorial is finished.
          await retryIfFailed({ times: 3 }, () =>
            createOrEnsureBadgeForUser(
              { badges, onBadgesChanged, profile, getAuthorizationHeader },
              getTutorialCompletedAchievementId(tutorial.id)
            )
          );
        } catch (error) {
          console.error(
            `Couldn't create completion badge for tutorial ${tutorial.id}.`,
            error
          );
        }
      })();
    },
    [
      displayEndDialog,
      badges,
      onBadgesChanged,
      profile,
      getAuthorizationHeader,
      tutorial.id,
    ]
  );
};

type Props = {|
  tutorial: InAppTutorial,
  startStepIndex: number,
  startProjectData: { [key: string]: string },
  endTutorial: ({|
    shouldCloseProject: boolean,
    shouldWarnAboutUnsavedChanges: boolean,
  |}) => void,
  project: ?gdProject,
  currentEditor: EditorIdentifier | null,
  currentSceneName: string | null,
|};

export type InAppTutorialOrchestratorInterface = {|
  onPreviewLaunch: () => void,
  getProgress: () => {|
    step: number,
    progress: Array<number>,
    projectData: {| [key: string]: string |},
  |},
  changeData: (oldName: string, newName: string) => void,
|};

const InAppTutorialOrchestrator = React.forwardRef<
  Props,
  InAppTutorialOrchestratorInterface
>(
  (
    {
      tutorial,
      endTutorial,
      project,
      currentEditor,
      currentSceneName,
      startStepIndex,
      startProjectData,
    },
    ref
  ) => {
    const forceUpdate = useForceUpdate();
    const [
      wrongEditorInfoOpen,
      setWrongEditorInfoOpen,
    ] = React.useState<boolean>(false);
    const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(
      startStepIndex
    );
    const [
      endIndicesPerPhase,
      setEndIndicesPerPhase,
    ] = React.useState<?Array<number>>(null);
    const [data, setData] = React.useState<{| [key: string]: string |}>(
      startProjectData
    );
    const objectCountBySceneRef = React.useRef<{|
      [sceneName: string]: number,
    |}>({});
    const [displayEndDialog, setDisplayEndDialog] = React.useState<boolean>(
      false
    );
    const currentStepFallbackStepIndex = React.useRef<number>(0);
    const [expectedEditor, setExpectedEditor] = React.useState<{|
      editor: EditorIdentifier,
      scene?: string,
    |} | null>(null);
    const [
      elementWithValueToWatchIfChanged,
      setElementWithValueToWatchIfChanged,
    ] = React.useState<?string>(null);
    const inputInitialValueRef = React.useRef<?string>(null);
    const [
      elementWithValueToWatchIfEquals,
      setElementWithValueToWatchIfEquals,
    ] = React.useState<?string>(null);
    const inputExpectedValueRef = React.useRef<?string>(null);
    const [
      objectSceneInstancesToWatch,
      setObjectSceneInstancesToWatch,
    ] = React.useState<?{|
      sceneName: ?string,
      objectName: string,
      count?: number,
    |}>(null);
    const [
      sceneObjectCountToWatch,
      setSceneObjectCountToWatch,
    ] = React.useState<boolean>(false);
    const domObserverRef = React.useRef<?MutationObserver>(null);
    const [
      shouldWatchProjectChanges,
      setShouldWatchProjectChanges,
    ] = React.useState<boolean>(false);
    const preferences = React.useContext(PreferencesContext);
    const authenticatedUser = React.useContext(AuthenticatedUserContext);

    const { flow, endDialog, editorSwitches, id: tutorialId } = tutorial;
    const stepCount = flow.length;
    const currentStep = flow[currentStepIndex];

    const changeStep = React.useCallback(
      (stepIndex: number) => {
        setCurrentStepIndex(stepIndex);
        sendInAppTutorialProgress({
          tutorialId: tutorialId,
          step: stepIndex,
          isCompleted: stepIndex >= stepCount - 1,
        });
      },
      [tutorialId, stepCount]
    );

    // Reset current step index on tutorial change.
    React.useEffect(
      () => {
        changeStep(startStepIndex);
        for (let index = startStepIndex; index >= 0; index--) {
          if (!tutorial.flow[index].isOnClosableDialog) {
            currentStepFallbackStepIndex.current = index;
            break;
          }
        }
        // Find the last editor switch to set the expected editor and scene.
        let newExpectedEditor = { editor: 'Home' };
        for (let index = startStepIndex; index >= 0; index--) {
          if (
            tutorial.flow[index].id &&
            tutorial.editorSwitches.hasOwnProperty(tutorial.flow[index].id)
          ) {
            newExpectedEditor =
              tutorial.editorSwitches[tutorial.flow[index].id];
            break;
          }
        }
        setExpectedEditor(newExpectedEditor);
      },
      [tutorial, changeStep, startStepIndex]
    );

    const goToStep = React.useCallback(
      ({
        stepIndex,
        gatherData,
      }: {
        stepIndex: number,
        gatherData?: boolean,
      }) => {
        if (stepIndex >= stepCount) {
          setDisplayEndDialog(true);
          return;
        }

        let nextStepIndex = stepIndex;

        // Check if we can go directly to next mandatory (not-skippable) and not deprecated step.
        while (nextStepIndex < stepCount - 1) {
          if (
            flow[nextStepIndex] &&
            (flow[nextStepIndex].deprecated ||
              (flow[nextStepIndex].skippable &&
                isDomBasedTriggerComplete(
                  flow[nextStepIndex].nextStepTrigger,
                  data
                )))
          )
            nextStepIndex += 1;
          else break;
        }
        if (gatherData) {
          const newData = gatherProjectDataOnMultipleSteps({
            flow,
            startIndex: currentStepIndex,
            endIndex: nextStepIndex - 1,
            data,
            project,
          });
          setData(newData);
        }

        changeStep(nextStepIndex);
      },
      [flow, changeStep, stepCount, data, project, currentStepIndex]
    );

    // Compute phases start positions on flow change.
    React.useEffect(
      () => {
        const indices = [];
        for (
          let flowStepIndex = 0;
          flowStepIndex < tutorial.flow.length;
          flowStepIndex++
        ) {
          if (tutorial.flow[flowStepIndex].isCheckpoint) {
            indices.push(flowStepIndex);
          }
        }
        indices.push(tutorial.flow.length - 1); // Last phase ends at last flow step.
        setEndIndicesPerPhase(indices);
      },
      [tutorial.flow]
    );

    const computeProgress = React.useCallback(
      (): Array<number> => {
        if (!endIndicesPerPhase) return [0];
        const startIndicesPerPhase = getPhasesStartIndices(endIndicesPerPhase);

        return endIndicesPerPhase.map((endIndex, i) => {
          if (currentStepIndex >= endIndex) {
            return 100;
          }
          const startIndex = startIndicesPerPhase[i];
          if (currentStepIndex < startIndex) {
            return 0;
          }
          return Math.floor(
            ((currentStepIndex - startIndex) / (endIndex - startIndex)) * 100
          );
        });
      },
      [currentStepIndex, endIndicesPerPhase]
    );

    const hasCurrentSceneObjectsCountIncreased = React.useCallback(
      (): boolean => {
        if (!project || project.getLayoutsCount() === 0 || !currentSceneName)
          return false;
        const count = countObjectsInScene({
          project,
          sceneName: currentSceneName,
        });
        const initialCount = objectCountBySceneRef.current[currentSceneName];
        return (
          typeof initialCount === 'number' &&
          typeof count === 'number' &&
          count > initialCount
        );
      },
      [project, currentSceneName]
    );

    const getProgress = () => {
      return {
        step: currentStepIndex,
        progress: computeProgress(),
        projectData: data,
      };
    };

    const watchDomForNextStepTrigger = React.useCallback(
      () => {
        // Find the next mandatory (not-skippable) step (It can be the current step).
        let indexOfNextMandatoryStep = currentStepIndex;
        while (flow[indexOfNextMandatoryStep].skippable) {
          indexOfNextMandatoryStep += 1;
        }

        let shouldGoToStepAtIndex: number | null = null;
        // Browse skippable steps in reverse orders to directly go to the
        // furthest step if possible.
        // TODO: Add support for not-dom based triggers
        for (
          let stepIndex = indexOfNextMandatoryStep;
          stepIndex >= currentStepIndex;
          stepIndex--
        ) {
          const isThisStepAlreadyDone = isDomBasedTriggerComplete(
            flow[stepIndex].nextStepTrigger,
            data
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
            // TODO: Add support for all triggers types
            if (
              isDomBasedTriggerComplete(shortcutStep.trigger, data) ||
              (shortcutStep.trigger &&
                (shortcutStep.trigger.objectAddedInLayout ||
                  (shortcutStep.trigger.presenceOfElement &&
                    shortcutStep.trigger.presenceOfElement.match(
                      legacyItemInObjectListDomSelectorPattern
                    ))) &&
                hasCurrentSceneObjectsCountIncreased())
            ) {
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
          if (shouldGoToStepAtIndex === null) return;
        }

        goToStep({ stepIndex: shouldGoToStepAtIndex, gatherData: true });
      },
      [
        currentStepIndex,
        goToStep,
        data,
        flow,
        hasCurrentSceneObjectsCountIncreased,
      ]
    );

    const handleDomMutation = useDebounce(watchDomForNextStepTrigger, 200);

    const goToNextStep = React.useCallback(
      (gatherData?: boolean) => {
        goToStep({ stepIndex: currentStepIndex + 1, gatherData });
      },
      [currentStepIndex, goToStep]
    );

    const changeData = (oldName: string, newName: string) => {
      let foundKey: string | null = null;
      Object.entries(data).forEach(([key, value]) => {
        if (value === oldName) {
          foundKey = key;
          return;
        }
      });
      if (foundKey) {
        data[foundKey] = newName;
      }
    };

    React.useImperativeHandle(ref, () => ({
      onPreviewLaunch,
      getProgress,
      changeData,
    }));

    const onPreviewLaunch = React.useCallback(
      () => {
        if (!currentStep) return;
        const { nextStepTrigger } = currentStep;
        if (nextStepTrigger && nextStepTrigger.previewLaunched) {
          goToNextStep();
        }
      },
      [goToNextStep, currentStep]
    );

    // Set up mutation observer to be able to detect any change in the dom.
    React.useEffect(
      () => {
        const appContainer = document.querySelector('body'); // We could have only watch the React root node but Material UI created dialog out of this node.
        if (!appContainer) return;
        const observer = new MutationObserver(handleDomMutation);
        observer.observe(appContainer, {
          childList: true,
          attributes: false,
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

    // Methods to run on each step change.
    React.useEffect(
      () => {
        if (!currentStep) return;
        const { id, isOnClosableDialog } = currentStep;
        // Set expected editor on each step change
        if (id && editorSwitches.hasOwnProperty(id)) {
          setExpectedEditor(editorSwitches[id]);
        }
        // Set fallback step index to the new step index if it is not on a closable dialog.
        if (!isOnClosableDialog) {
          currentStepFallbackStepIndex.current = currentStepIndex;
        }
        // At each step start, reset change watching logics.
        setElementWithValueToWatchIfChanged(null);
        setElementWithValueToWatchIfEquals(null);
        setObjectSceneInstancesToWatch(null);
        setSceneObjectCountToWatch(false);
        setShouldWatchProjectChanges(false);
        // If index out of bounds, display end dialog.
        if (currentStepIndex >= stepCount) {
          setDisplayEndDialog(true);
        }
      },
      [currentStep, currentStepIndex, stepCount, editorSwitches]
    );

    // Update some refs on each step change and on current scene change.
    React.useEffect(
      () => {
        if (!currentStep || !currentSceneName || !project) return;
        const count = countObjectsInScene({
          project,
          sceneName: currentSceneName,
        });
        if (typeof count !== 'number') return;
        objectCountBySceneRef.current[currentSceneName] = count;
      },
      [currentStep, currentSceneName, project]
    );

    // Set up watchers if the next step trigger is not dom-based.
    React.useEffect(
      () => {
        if (!currentStep) return;
        const { nextStepTrigger, elementToHighlightId } = currentStep;
        if (nextStepTrigger && nextStepTrigger.valueEquals) {
          if (!elementToHighlightId) return;
          inputExpectedValueRef.current = nextStepTrigger.valueEquals;
          setElementWithValueToWatchIfEquals(elementToHighlightId);
        } else if (nextStepTrigger && nextStepTrigger.valueHasChanged) {
          if (!elementToHighlightId) return;
          const elementToWatch = document.querySelector(elementToHighlightId);

          if (elementToWatch) {
            inputInitialValueRef.current = getInputValue(elementToWatch);
          }
          setElementWithValueToWatchIfChanged(elementToHighlightId);
        } else if (nextStepTrigger && nextStepTrigger.instanceAddedOnScene) {
          const [
            objectKey,
            sceneKey,
          ] = nextStepTrigger.instanceAddedOnScene.split(':');
          const objectName = data[objectKey];
          if (!objectName) return;
          const sceneName = sceneKey ? data[sceneKey] : undefined;
          setObjectSceneInstancesToWatch({
            objectName,
            sceneName,
            count: nextStepTrigger.instancesCount,
          });
        } else if (
          nextStepTrigger &&
          (nextStepTrigger.objectAddedInLayout ||
            (nextStepTrigger.presenceOfElement &&
              nextStepTrigger.presenceOfElement.match(
                legacyItemInObjectListDomSelectorPattern
              )))
        ) {
          setSceneObjectCountToWatch(true);
        }
      },
      [currentStep, data]
    );

    // Detect in tooltip texts if project changes should be watched
    React.useEffect(
      () => {
        if (!currentStep) return;
        const { tooltip } = currentStep;
        if (!tooltip) return;
        if (
          [tooltip.description, tooltip.title].some(translatedText =>
            containsProjectDataToDisplay(translatedText)
          )
        ) {
          setShouldWatchProjectChanges(true);
        }
      },
      [currentStep]
    );

    const watchInputChanges = React.useCallback(
      () => {
        if (!elementWithValueToWatchIfChanged) return;
        const elementToWatch = document.querySelector(
          elementWithValueToWatchIfChanged
        );
        const inputInitialValue = inputInitialValueRef.current;

        if (
          elementToWatch &&
          getInputValue(elementToWatch) !== inputInitialValue
        ) {
          goToNextStep();
        }
      },
      [goToNextStep, elementWithValueToWatchIfChanged]
    );

    const watchInputEquals = React.useCallback(
      () => {
        if (!elementWithValueToWatchIfEquals) return;
        const elementToWatch = document.querySelector(
          elementWithValueToWatchIfEquals
        );
        const inputExpectedValue = inputExpectedValueRef.current;
        if (!inputExpectedValue) return;

        // We trim all spaces to not be picky about the user input inside expressions.
        // Ex: "1 + 1" === "1+1"
        if (
          elementToWatch &&
          getInputValue(elementToWatch).replace(/\s/g, '') ===
            inputExpectedValue.replace(/\s/g, '')
        ) {
          goToNextStep();
        }
      },
      [goToNextStep, elementWithValueToWatchIfEquals]
    );

    const watchSceneInstanceChanges = React.useCallback(
      () => {
        if (!objectSceneInstancesToWatch) return;
        if (!project || project.getLayoutsCount() === 0) return;
        const {
          objectName,
          sceneName: layoutName,
          count,
        } = objectSceneInstancesToWatch;
        const layout =
          layoutName && project.hasLayoutNamed(layoutName)
            ? project.getLayout(layoutName)
            : project.getLayoutAt(0);
        if (!count) {
          // If no count is provided, we just check if there is at least one instance.
          const instances = layout.getInitialInstances();
          if (instances.hasInstancesOfObject(objectName)) {
            goToNextStep();
          }
        } else {
          // Otherwise, we check if there is the expected number of instances.
          const instancesCount = getInstanceCountInLayoutForObject(
            layout.getInitialInstances(),
            objectName
          );
          if (instancesCount >= count) goToNextStep();
        }
      },
      [project, goToNextStep, objectSceneInstancesToWatch]
    );

    const watchSceneObjects = React.useCallback(
      () => {
        if (!sceneObjectCountToWatch) return;
        if (hasCurrentSceneObjectsCountIncreased()) {
          goToNextStep(true);
        }
      },
      [
        hasCurrentSceneObjectsCountIncreased,
        goToNextStep,
        sceneObjectCountToWatch,
      ]
    );

    useInterval(forceUpdate, shouldWatchProjectChanges ? 500 : null);
    useInterval(
      watchInputChanges,
      elementWithValueToWatchIfChanged ? 1000 : null
    );
    useInterval(
      watchInputEquals,
      elementWithValueToWatchIfEquals ? 1000 : null
    );
    useInterval(
      watchSceneInstanceChanges,
      objectSceneInstancesToWatch ? 500 : null
    );
    useInterval(watchSceneObjects, sceneObjectCountToWatch ? 1000 : null);
    useInterval(
      watchDomForNextStepTrigger,
      currentStep && currentStep.isTriggerFlickering ? 500 : null
    );

    const isRunningMiniTutorial = React.useMemo(
      () => isMiniTutorial(tutorial.id),
      [tutorial.id]
    );

    const isTouchScreen = useScreenType() === 'touch';

    const renderStepDisplayer = (i18n: I18nType) => {
      if (!currentStep) return null;
      const stepTooltip = currentStep.tooltip;
      let formattedTooltip;
      if (stepTooltip) {
        const title = translateAndInterpolateText({
          text: stepTooltip.title,
          data,
          i18n,
          project,
        });
        const description = translateAndInterpolateText({
          text:
            isTouchScreen && stepTooltip.touchDescription
              ? stepTooltip.touchDescription
              : stepTooltip.description,
          data,
          i18n,
          project,
        });
        formattedTooltip = {
          ...stepTooltip,
          title,
          description,
        };
      }

      let formattedStepTrigger;
      const stepTrigger = currentStep.nextStepTrigger;
      if (stepTrigger && stepTrigger.clickOnTooltipButton) {
        const formattedButtonLabel = translateAndInterpolateText({
          text: stepTrigger.clickOnTooltipButton,
          data,
          i18n,
          project,
        });
        formattedStepTrigger = formattedButtonLabel
          ? {
              clickOnTooltipButton: formattedButtonLabel,
            }
          : undefined;
      } else {
        formattedStepTrigger = stepTrigger;
      }
      const formattedStep: InAppTutorialFlowFormattedStep = {
        ...currentStep,
        tooltip: formattedTooltip,
        nextStepTrigger: formattedStepTrigger,
      };
      if (currentStep.elementToHighlightId) {
        formattedStep.elementToHighlightId = interpolateElementId(
          currentStep.elementToHighlightId,
          data
        );
      }

      let currentPhaseIndex = 0;
      if (endIndicesPerPhase) {
        const startIndices = getPhasesStartIndices(endIndicesPerPhase);
        currentPhaseIndex = endIndicesPerPhase
          .map((endIndex, i) => {
            return (
              currentStepIndex <= endIndex &&
              currentStepIndex >= startIndices[i]
            );
          })
          .indexOf(true);
      }
      return (
        <InAppTutorialStepDisplayer
          step={formattedStep}
          expectedEditor={
            wrongEditorInfoOpen
              ? interpolateExpectedEditor(expectedEditor, data)
              : null
          }
          goToFallbackStep={() => {
            changeStep(currentStepFallbackStepIndex.current);
          }}
          endTutorial={() =>
            endTutorial({
              // Don't close the project if it's a mini tutorial, so that the user can continue playing with the game.
              shouldCloseProject: !isRunningMiniTutorial,
              // Don't warn about unsaved changes if it's a mini tutorial.
              shouldWarnAboutUnsavedChanges: !isRunningMiniTutorial,
            })
          }
          progress={computeProgress()[currentPhaseIndex]}
          goToNextStep={goToNextStep}
        />
      );
    };

    const checkIfWrongEditor = useDebounce(
      () => {
        setWrongEditorInfoOpen(
          !!expectedEditor &&
            (expectedEditor.editor !== currentEditor ||
              (!!expectedEditor.scene &&
                data[expectedEditor.scene] !== currentSceneName))
        );
      },
      wrongEditorInfoOpen ? 0 : 1000
    );

    React.useEffect(
      () => {
        checkIfWrongEditor();
      },
      [checkIfWrongEditor, currentEditor, currentSceneName]
    );

    useGiveTrivialBadgeWhenTutorialIsFinished({
      authenticatedUser,
      tutorial,
      displayEndDialog,
    });

    return (
      <I18n>
        {({ i18n }) => (
          <>
            {renderStepDisplayer(i18n)}
            {displayEndDialog && (
              <InAppTutorialDialog
                isLastStep
                dialogContent={endDialog}
                endTutorial={() => {
                  setDisplayEndDialog(false);
                  if (isRunningMiniTutorial) {
                    // If running a mini tutorial, we save the progress to indicate that the user has finished this lesson.
                    preferences.saveTutorialProgress({
                      tutorialId: tutorial.id,
                      userId: authenticatedUser.profile
                        ? authenticatedUser.profile.id
                        : undefined,
                      ...getProgress(),
                      // We do not specify a storage provider, as we don't need to reload the project.
                    });
                  }
                  endTutorial({
                    shouldCloseProject: false,
                    shouldWarnAboutUnsavedChanges: !isRunningMiniTutorial,
                  });
                }}
              />
            )}
          </>
        )}
      </I18n>
    );
  }
);

export default InAppTutorialOrchestrator;
